const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

async function runMobileAudit() {
  console.log('\n======================================================');
  console.log('📱 TEST 04: MOBİL (390x844) DUYARLILIK & UI/UX İNCELEMESİ');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  // Mobile Context (iPhone 14 / 390x844)
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });

  const page = await mobileContext.newPage();

  // 1. Mobile Home
  console.log('1. Mobil Ana Sayfa...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '50_mobile_home.png') });

  // 2. Mobile Patient Login
  console.log('2. Mobil Hasta Girişi...');
  await page.goto('http://localhost:3000/giris', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '51_mobile_giris.png') });

  // 3. Mobile Check-in
  console.log('3. Mobil Kamera Check-in Ekranı...');
  await page.goto('http://localhost:3000/checkin', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '52_mobile_checkin.png') });

  // Login as Patient for Mobile Dashboard
  await page.goto('http://localhost:3000/giris', { waitUntil: 'networkidle' });
  await page.fill('input[type="tel"]', '05551112233');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(1000);
  const pinInput = await page.$('input[type="password"]');
  if (pinInput) {
    await pinInput.fill('1234');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/patient', { timeout: 8000 });
  }

  // 4. Mobile Patient Dashboard
  console.log('4. Mobil Hasta Portalı...');
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '53_mobile_patient_dashboard.png'), fullPage: true });

  // 5. Mobile Booking Wizard
  console.log('5. Mobil Randevu Sihirbazı...');
  await page.goto('http://localhost:3000/patient/book', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '54_mobile_booking.png'), fullPage: true });

  // 6. Mobile Secretary Desk
  console.log('6. Mobil Banko Masası...');
  const secContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const secPage = await secContext.newPage();
  await secPage.goto('http://localhost:3000/personel-giris', { waitUntil: 'networkidle' });
  await secPage.fill('input[type="email"]', 'sekreter@dentapanel.com');
  await secPage.fill('input[type="password"]', '123456');
  await secPage.click('button[type="submit"]');
  await secPage.waitForURL('**/secretary/desk', { timeout: 8000 });
  await secPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '55_mobile_secretary_desk.png'), fullPage: true });

  // 7. Mobile Doctor Examination
  console.log('7. Mobil Hekim FDI Muayene Ekranı...');
  const docContext = await browser.newContext({
    viewport: { width: 414, height: 896 },
    isMobile: true,
  });
  const docPage = await docContext.newPage();
  await docPage.goto('http://localhost:3000/personel-giris', { waitUntil: 'networkidle' });
  await docPage.fill('input[type="email"]', 'zeynep@dentapanel.com');
  await docPage.fill('input[type="password"]', '123456');
  await docPage.click('button[type="submit"]');
  await docPage.waitForURL('**/doctor/workspace', { timeout: 8000 });
  await docPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '56_mobile_doctor_workspace.png'), fullPage: true });

  const examLink = await docPage.$('a:has-text("Muayene Ekranı & FDI")');
  if (examLink) {
    await examLink.click();
    await docPage.waitForURL('**/doctor/examination/**', { timeout: 8000 });
    await docPage.screenshot({ path: path.join(SCREENSHOTS_DIR, '57_mobile_fdi_matrix.png'), fullPage: true });
    console.log('✅ Mobil FDI diş matrisi görüntülendi.');
  }

  await browser.close();
  console.log('✅ TEST 04 (MOBİL AUDIT) BAŞARIYLA TAMAMLANDI!\n');
}

runMobileAudit().catch((err) => {
  console.error('❌ TEST 04 HATASI:', err);
  process.exit(1);
});

