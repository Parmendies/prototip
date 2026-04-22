'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockDoctors, mockDepartments } from '@/app/_lib/mock-data';

// Bekleme yardımcısı
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Yeniden denenebilir hata mı?
function isRetryableError(error: any): boolean {
  const message = (error?.message || '').toLowerCase();
  const status = error?.status ?? error?.statusCode ?? error?.httpStatus;

  return (
    status === 503 ||
    status === 429 ||
    message.includes('503') ||
    message.includes('service unavailable') ||
    message.includes('overloaded') ||
    message.includes('high demand') ||
    message.includes('429') ||
    message.includes('rate limit') ||
    message.includes('quota')
  );
}

// Gemini isteğini retry + exponential backoff ile çalıştır
async function generateWithRetry(
  model: ReturnType<InstanceType<typeof GoogleGenerativeAI>['getGenerativeModel']>,
  parts: any[],
  maxRetries = 4
) {
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(parts);
    } catch (error: any) {
      lastError = error;

      const shouldRetry = isRetryableError(error);

      console.warn(
        `[Gemini] Deneme ${attempt + 1}/${maxRetries + 1} başarısız.`,
        `Hata: ${error?.message}`,
        shouldRetry ? '→ Yeniden denenecek.' : '→ Tekrar edilmez, çıkılıyor.'
      );

      if (!shouldRetry || attempt === maxRetries) break;

      // Exponential backoff: 2s, 4s, 8s, 16s
      const waitMs = Math.pow(2, attempt + 1) * 1000;
      console.info(`[Gemini] ${waitMs / 1000}s bekleniyor...`);
      await sleep(waitMs);
    }
  }

  throw lastError;
}

export async function generateMedicalReport(formData: FormData) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return {
        success: false,
        error:
          "Sunucu yapılandırma hatası: Gemini API Key bulunamadı. Lütfen Vercel dashboard'dan Environment Variables kısmına GEMINI_API_KEY ekleyin.",
      };
    }

    const complaint = (formData.get('complaint') as string) || '';
    const selectedTagsStr = formData.get('selectedTags') as string;
    const selectedTags = selectedTagsStr ? JSON.parse(selectedTagsStr) : [];
    const files = formData.getAll('files') as File[];

    // En azından şikayet, semptom veya dosya olmalı
    if (complaint.trim() === '' && selectedTags.length === 0 && files.length === 0) {
      return {
        success: false,
        error: 'Lütfen şikayetinizi yazın, semptom seçin veya tıbbi belge yükleyin.',
      };
    }

    let totalSize = 0;
    for (const file of files) totalSize += file.size;

    if (totalSize > 4 * 1024 * 1024) {
      return {
        success: false,
        error:
          'Yüklediğiniz dosyaların toplam boyutu çok büyük. Vercel ücretsiz planı maksimum 4.5MB yüklemeye izin verir.',
      };
    }

    const doctorsList = mockDoctors
      .map(
        (d) =>
          `- ID: ${d.id} | ${d.title} ${d.firstName} ${d.lastName} | Uzmanlık: ${d.specialty} | Departman: ${d.departmentId}`
      )
      .join('\n');

    const departmentsList = mockDepartments
      .map(
        (d) =>
          `- ID: ${d.id} | ${d.name} | Açıklama: ${d.description} | Etiketler: ${d.tags.join(', ')}`
      )
      .join('\n');

    let prompt = `Sen deneyimli bir tıbbi triyaj asistanısın. `;
    
    if (complaint.trim() || selectedTags.length > 0) {
      prompt += `Hastanın şikayeti: "${complaint || 'Belirtilmemiş'}". Belirttiği semptomlar: "${selectedTags.join(', ') || 'Belirtilmemiş'}". `;
    }
    
    if (files.length > 0) {
      prompt += `Ayrıca hastanın yüklediği tıbbi belgeleri de incele. `;
    }

    prompt += `
Hastanemizdeki mevcut doktorlar şunlardır:
${doctorsList}

Hastanemizdeki mevcut departmanlar şunlardır:
${departmentsList}

Lütfen bu bilgilere göre tıbbi bir ön değerlendirme (aciliyet durumu dahil) yap ve hastanın hangi doktora görünmesi gerektiğine karar ver. 

ÖNEMLİ: Eğer mevcut doktorlar arasında hastanın vakasıyla doğrudan ilgilenebilecek uygun bir doktor YOKSA, "recommendedDoctorId" alanını null yap ve bunun yerine "recommendedDepartment" alanına uygun departman adını belirt.

Yanıtını SADECE aşağıdaki JSON formatında, tırnak işaretlerine vb. dikkat ederek temiz bir JSON olarak ver:
{
  "report": "Maksimum 3-4 cümlelik, profesyonel ama anlaşılır dille yazılmış tıbbi ön değerlendirme analizi.",
  "recommendedDoctorId": "Mevcut doktorlar arasından uygun olanın ID'si (örneğin doc-1), veya uygun doktor yoksa null",
  "recommendedDepartment": "Uygun doktor bulunamadığında, hastanın vakasıyla doğrudan ilgilenmesi gereken departman adı (örneğin Nefroloji). Uygun doktor varsa null."
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const parts: any[] = [{ text: prompt }];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf',
        },
      });
    }

    // Retry destekli istek
    const result = await generateWithRetry(model, parts);
    let textResult = result.response.text();

    // Markdown bloğu varsa temizle
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData;
    try {
      parsedData = JSON.parse(textResult);
    } catch (e) {
      console.error('Failed to parse JSON. Raw AI Output:', textResult);
      return { success: false, error: 'AI yanıtı JSON formatında değildi.' };
    }

    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error('Gemini SDK Error:', error);

    const message = (error?.message || '').toLowerCase();
    const status = error?.status ?? error?.statusCode ?? error?.httpStatus;

    let errorMessage: string;

    if (
      status === 503 ||
      message.includes('503') ||
      message.includes('service unavailable') ||
      message.includes('high demand') ||
      message.includes('overloaded')
    ) {
      errorMessage =
        'Gemini API şu an yoğun talep altında ve birden fazla denemeden sonra yanıt vermedi. Lütfen birkaç dakika bekleyip tekrar deneyin.';
    } else if (
      status === 429 ||
      message.includes('429') ||
      message.includes('rate limit') ||
      message.includes('quota')
    ) {
      errorMessage =
        'Gemini API kota sınırına ulaşıldı. Ücretsiz planda günlük/dakikalık limit dolmuş olabilir.';
    } else if (
      message.includes('fetch failed') ||
      message.includes('timeout') ||
      message.includes('abort')
    ) {
      errorMessage =
        'AI servisine erişilemedi veya Serverless Function süresi aşıldı (Vercel Hobby planında 10–15 saniye limitli).';
    } else {
      errorMessage = error.message || 'Bilinmeyen bir AI hatası oluştu.';
    }

    return { success: false, error: errorMessage };
  }
}
