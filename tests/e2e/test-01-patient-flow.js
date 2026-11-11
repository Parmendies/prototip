const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function runPatientFlow() {
  console.log('\n======================================================');
  console.log('🧪 TEST 01: HASTA PORTALI, GİRİŞ, KİOSK & CHECK-IN AKIŞI');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 1. Homepage Audit
  console.log('1. Ana Sayfa Yükleniyor...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01_desktop_home.png') });

  // 2. Kiosk Audit
  console.log('2. Danışma QR Kiosk Ekranı Yükleniyor...');
  await page.goto('http://localhost:3000/kiosk', { waitUntil: 'networkidle' });
  await page.waitForSelector('svg'); // QR SVG
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02_kiosk_tablet.png') });

  // 3. Patient Login & PIN Verification
  console.log('3. Hasta Giriş Ekranı Test Ediliyor...');
  await page.goto('http://localhost:3000/giris', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_patient_login_phone.png') });

  // Enter Phone Number
  await page.fill('input[type="tel"]', '05551112233');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03_after_phone_fill.png') });
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);

  // Expect PIN Step
  const pinInput = await page.$('input[type="password"]');
  if (!pinInput) {
    const bodyText = await page.innerText('body');
    console.log('Body Text after phone submit:', bodyText);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_failed_phone_submit.png') });
    throw new Error('PIN giriş kutusu görünmedi!');
  }
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04_patient_login_pin.png') });

  console.log('4. 4 Haneli PIN Giriliyor...');
  await pinInput.fill('1234');
  await page.click('button[type="submit"]');

  // Wait for redirect to /patient
  await page.waitForURL('**/patient', { timeout: 8000 });
  await page.waitForTimeout(1000);
  console.log('✅ Hasta Portalı Başarıyla Açıldı:', page.url());
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05_patient_dashboard.png'), fullPage: true });

  // 5. Patient Profile & PIN Change
  console.log('5. Hasta Profil & PIN Güncelleme Ekranı...');
  await page.goto('http://localhost:3000/patient/profile', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06_patient_profile.png') });

  // 6. Patient Booking Wizard (/patient/book)
  console.log('6. Randevu Ön Talep Sihirbazı...');
  await page.goto('http://localhost:3000/patient/book', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07_patient_book_step1.png') });

  // Select Doctor
  const doctorCards = await page.$$('button:has-text("Randevu Seç"), div:has-text("Muayene Ücreti")');
  console.log(`Bulunan hekim kartı sayısı: ${doctorCards.length}`);
  
  // Find first select button
  const selectDoctorBtn = await page.$('button:has-text("Randevu Seç"), button:has-text("Seç")');
  if (selectDoctorBtn) {
    await selectDoctorBtn.click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '08_patient_book_step2.png') });

    // Step 2: Complaint
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('Arka azı dişimde yemek yerken keskin bir sızı hissediyorum.');
      const continueBtn = await page.$('button:has-text("Tarih ve Saat Seçimine İlerle")');
      if (continueBtn) {
        await continueBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '09_patient_book_step3.png') });
      }
    }
  }

  // 7. Check-in Page with Active Session
  console.log('7. Doğrudan Kamera QR Check-in Ekranı Test Ediliyor...');
  await page.goto('http://localhost:3000/checkin', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '10_checkin_page.png') });

  // Check if "Geldim - Check-in Yap" button exists
  const checkInBtn = await page.$('button:has-text("Check-in"), button:has-text("Geldim")');
  if (checkInBtn) {
    console.log('Check-in butonuna tıklanıyor...');
    await checkInBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '11_checkin_completed.png') });
  }

  await browser.close();
  console.log('✅ TEST 01 BAŞARIYLA TAMAMLANDI!\n');
}

runPatientFlow().catch((err) => {
  console.error('❌ TEST 01 HATASI:', err);
  process.exit(1);
});
