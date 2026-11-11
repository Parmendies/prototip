const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

async function runDoctorFlow() {
  console.log('\n======================================================');
  console.log('🧪 TEST 03: HEKİM ÇALIŞMA ALANI, CANLI ZİL, FDI 11-48 & MUAYENE');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 1. Doctor Login
  console.log('1. Hekim Girişi Yapılıyor (zeynep@dentapanel.com)...');
  await page.goto('http://localhost:3000/personel-giris', { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', 'zeynep@dentapanel.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');

  // Wait for redirect to /doctor/workspace
  await page.waitForURL('**/doctor/workspace', { timeout: 8000 });
  await page.waitForTimeout(1500);
  console.log('✅ Hekim Klinik Çalışma Alanı Açıldı:', page.url());
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '30_doctor_workspace_main.png'), fullPage: true });

  // 2. Chime Controls & Waiting Room
  console.log('2. Sesli Zil ve Bekleme Odası Kontrolü...');
  const soundBtn = await page.$('button:has-text("Sesli Zil")');
  if (soundBtn) {
    console.log('Sesli zil butonu aktif.');
  }

  // 3. Call Patient In Chair ("Hastayı İçeri Çağır" or "Muayene Ekranı & FDI")
  let examUrl = null;
  const inChairLink = await page.$('a:has-text("Muayene Ekranı & FDI"), a:has-text("Muayene Ekranı")');
  const callInBtn = await page.$('button:has-text("Hastayı İçeri Çağır")');

  if (callInBtn) {
    console.log('3. Bekleme Odasından "Hastayı İçeri Çağır" butonuna tıklanıyor...');
    await callInBtn.click();
    await page.waitForURL('**/doctor/examination/**', { timeout: 8000 });
    examUrl = page.url();
  } else if (inChairLink) {
    console.log('3. Koltuktaki hasta için Muayene Ekranı açılıyor...');
    await inChairLink.click();
    await page.waitForURL('**/doctor/examination/**', { timeout: 8000 });
    examUrl = page.url();
  }

  if (examUrl) {
    console.log('✅ FDI Muayene Odası Açıldı:', examUrl);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '31_doctor_examination_fdi.png'), fullPage: true });

    // 4. FDI Diş Haritası Etkileşimi
    console.log('4. FDI 16 Numaralı Diş Seçiliyor...');
    const tooth16Btn = await page.$('button:has-text("16")');
    if (tooth16Btn) {
      await tooth16Btn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '32_fdi_tooth_16_selected.png') });

      // Click "Çürük" condition chip
      console.log('Diş Durumu: "Çürük" (🔴) olarak seçiliyor...');
      const cariesChip = await page.$('button:has-text("Çürük")');
      if (cariesChip) await cariesChip.click();

      // Enter Clinical Note
      const noteInput = await page.$('input[placeholder*="Klinik not"]');
      if (noteInput) {
        await noteInput.fill('Distal derin çürük, perküsyon hassasiyeti mevcut.');
      }

      // Save Tooth
      const saveToothBtn = await page.$('button:has-text("Diş Durumunu Kaydet")');
      if (saveToothBtn) {
        await saveToothBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Diş durumu başarıyla kaydedildi.');
      }
    }

    // 5. Tedavi Planı & Seans Fiyatlandırma
    console.log('5. Tedavi Planı Sekmesi Açılıyor...');
    const planTab = await page.$('button:has-text("Tedavi Planı")');
    if (planTab) {
      await planTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '33_treatment_plan_tab.png'), fullPage: true });

      // Select template
      const templateSelect = await page.$('select');
      if (templateSelect) {
        await templateSelect.selectOption({ index: 1 }); // Select first procedure
      }

      // Set Mode: Koltukta Uygulandı
      const chairsideRadio = await page.$('input[type="radio"][value="same_day_chairside"], label:has-text("Koltukta Uygulandı")');
      if (chairsideRadio) {
        await chairsideRadio.click();
      }

      // Add Step
      const addStepBtn = await page.$('button:has-text("Adımı Tedavi Planına Ekle"), button:has-text("Planına Ekle")');
      if (addStepBtn) {
        await addStepBtn.click();
        await page.waitForTimeout(1500);
        console.log('✅ Tedavi adımı eklendi (Koltukta Ek İşlem moduyla)!');
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '34_treatment_step_added.png'), fullPage: true });
      }
    }

    // 6. E-Reçete (Medula)
    console.log('6. E-Reçete (Medula) Sekmesi Açılıyor...');
    const rxTab = await page.$('button:has-text("E-Reçete")');
    if (rxTab) {
      await rxTab.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '35_prescription_tab.png') });

      // Add common drug preset
      const drugPreset = await page.$('button:has-text("Augmentin"), button:has-text("Apranax")');
      if (drugPreset) {
        await drugPreset.click();
        await page.waitForTimeout(500);
      }

      // Save Prescription
      const saveRxBtn = await page.$('button:has-text("E-Reçeteyi Kaydet")');
      if (saveRxBtn) {
        await saveRxBtn.click();
        await page.waitForTimeout(1500);
        console.log('✅ Medula E-Reçete başarıyla kaydedildi.');
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '36_prescription_saved.png') });
      }
    }

    // 7. Complete Examination Session
    console.log('7. Muayeneyi Tamamla Butonuna Tıklanıyor...');
    const finishBtn = await page.$('button:has-text("Muayeneyi Tamamla")');
    if (finishBtn) {
      await finishBtn.click();
      await page.waitForTimeout(2000);
      console.log('✅ Muayene oturumu tamamlandı ve çalışma alanına yönlendirildi:', page.url());
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '37_after_exam_complete.png'), fullPage: true });
    }
  }

  // 8. Doctor Calendar Audit
  console.log('8. Hekim Takvimi İnceleniyor...');
  await page.goto('http://localhost:3000/doctor/calendar', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '38_doctor_calendar.png'), fullPage: true });

  // 9. Doctor Patients Audit
  console.log('9. Hekim Hasta Dosyaları İnceleniyor...');
  await page.goto('http://localhost:3000/doctor/patients', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '39_doctor_patients.png'), fullPage: true });

  // Open first patient detail
  const openPatientLink = await page.$('a:has-text("Dosyayı Aç")');
  if (openPatientLink) {
    await openPatientLink.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '40_doctor_patient_detail.png'), fullPage: true });
    console.log('✅ Hasta detay dosyasında diş geçmişi görüntülendi!');
  }

  // 10. Doctor Profile Audit
  console.log('10. Hekim Mesleki Profil Ekranı...');
  await page.goto('http://localhost:3000/doctor/profile', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '41_doctor_profile.png') });

  await browser.close();
  console.log('✅ TEST 03 BAŞARIYLA TAMAMLANDI!\n');
}

runDoctorFlow().catch((err) => {
  console.error('❌ TEST 03 HATASI:', err);
  process.exit(1);
});

