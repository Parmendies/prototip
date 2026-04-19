'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { mockDoctors } from '@/app/_lib/mock-data';

export async function generateMedicalReport(formData: FormData) {
  try {
    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return { 
        success: false, 
        error: "Sunucu yapılandırma hatası: Gemini API Key bulunamadı. Lütfen Vercel dashboard'dan Environment Variables kısmına GEMINI_API_KEY ekleyin." 
      };
    }

    const complaint = formData.get('complaint') as string || '';
    const selectedTagsStr = formData.get('selectedTags') as string;
    const selectedTags = selectedTagsStr ? JSON.parse(selectedTagsStr) : [];
    const files = formData.getAll('files') as File[];

    let totalSize = 0;
    for (const file of files) {
      totalSize += file.size;
    }
    if (totalSize > 4 * 1024 * 1024) { // Vercel ~4.5mb payload limitine pay bırakıyoruz
      return {
        success: false,
        error: "Yüklediğiniz dosyaların toplam boyutu çok büyük. Vercel ücretsiz planı maksimum 4.5MB yüklemeye izin verir."
      };
    }

    const doctorsList = mockDoctors.map(d => `- ID: ${d.id} | ${d.title} ${d.firstName} ${d.lastName} | Uzmanlık: ${d.specialty}`).join('\n');

    let prompt = `Sen deneyimli bir tıbbi triyaj asistanısın. Hastanın şikayeti: "${complaint}". Belirttiği semptomlar: "${selectedTags.join(', ')}". `;
    
    if (files && files.length > 0) {
      prompt += `Ayrıca hastanın yüklediği tıbbi belgeleri de incele. `;
    }
    
    prompt += `
Hastanemizdeki mevcut doktorlar şunlardır:
${doctorsList}

Lütfen bu bilgilere göre tıbbi bir ön değerlendirme (aciliyet durumu dahil) yap ve hastanın hangi doktora görünmesi gerektiğine karar ver. 
Yanıtını SADECE aşağıdaki JSON formatında, tırnak işaretlerine vb. dikkat ederek temiz bir JSON olarak ver:
{
  "report": "Maksimum 3-4 cümlelik, profesyonel ama anlaşılır dille yazılmış tıbbi ön değerlendirme analizi.",
  "recommendedDoctorId": "Yukarıdaki listeden uygun gördüğün doktorun ID'si (örneğin dr-1)"
}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    // Daha önce terminalden ListModels ile gemini-2.5-flash desteklediği görülmüştü. Lütfen modeli değiştirmeyin.
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const parts: any[] = [{ text: prompt }];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64Data = Buffer.from(arrayBuffer).toString('base64');
      
      parts.push({
        inlineData: {
          data: base64Data,
          mimeType: file.type || 'application/pdf'
        }
      });
    }

    const result = await model.generateContent(parts);
    let textResult = result.response.text();
    
    // Markdown bloğu varsa temizle
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();

    // Check if valid JSON
    let parsedData;
    try {
      parsedData = JSON.parse(textResult);
    } catch(e) {
       console.error("Failed to parse JSON. Raw AI Output:", textResult);
       return { success: false, error: "AI yanıtı JSON formatında değildi." };
    }

    return { success: true, data: parsedData };
  } catch (error: any) {
    console.error("Gemini SDK Error:", error);
    let errorMessage = error.message || "Bilinmeyen bir AI hatası oluştu.";
    
    if (errorMessage.toLowerCase().includes("fetch failed") || errorMessage.toLowerCase().includes("timeout") || errorMessage.toLowerCase().includes("abort")) {
      errorMessage = "AI servisine erişilemedi veya Serverless Function süresi aşıldı (Vercel Hobby planında 10 veya 15 saniye limitli).";
    }

    return { success: false, error: errorMessage };
  }
}
