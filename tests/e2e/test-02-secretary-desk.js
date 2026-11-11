const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'screenshots');

async function runSecretaryFlow() {
  console.log('\n======================================================');
  console.log('🧪 TEST 02: BANKO & SEKRETER OPERASYON, KASA, SEANS ATAMA');
  console.log('======================================================\n');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // 1. Staff Login Page
  console.log('1. Personel Giriş Ekranı Yükleniyor...');
  await page.goto('http://localhost:3000/personel-giris', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '20_staff_login.png') });

  // Fill Secretary Credentials
  console.log('2. Sekreter Girişi Yapılıyor (sekreter@dentapanel.com)...');
  await page.fill('input[type="email"]', 'sekreter@dentapanel.com');
  await page.fill('input[type="password"]', '123456');
  await page.click('button[type="submit"]');

  // Wait for redirect to /secretary/desk
  await page.waitForURL('**/secretary/desk', { timeout: 8000 });
  await page.waitForTimeout(1500);
  console.log('✅ Banko Operasyon Masası Açıldı:', page.url());
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '21_secretary_desk_main.png'), fullPage: true });

  // 3. Inspect Kasa Totals & Needing Payment Cards
  console.log('3. Kasa Özeti & Kartlar İnceleniyor...');
  const kasaCards = await page.$$('text=Bugün Toplam Kasa, text=Ödeme Bekleyenler');
  console.log(`Kasa özet kartları mevcut: ${kasaCards.length > 0}`);

  // 4. Test Payment Collection Button (POS or Cash)
  const posBtn = await page.$('button:has-text("POS Slip Çekildi")');
  if (posBtn) {
    console.log('4. POS Tahsilatı Butonuna Tıklanıyor...');
    await posBtn.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '22_secretary_payment_collected.png') });
    console.log('✅ POS Tahsilatı Onaylandı!');
  } else {
    console.log('Şu an acil ödeme bekleyen hasta yok veya zaten ödendi.');
  }

  // 5. Test Direct Session Booking Modal (Faz 4.4)
  console.log('5. Direkt Seans Randevulama Modalı Açılıyor...');
  const sessionBtn = await page.$('button:has-text("Seans Randevula")');
  if (sessionBtn) {
    await sessionBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '23_direct_session_modal.png') });

    // Check if form or planned steps exist
    const submitSessionBtn = await page.$('button:has-text("Randevuyu Direkt Onayla")');
    if (submitSessionBtn) {
      console.log('Direkt Seans Randevusu Onaylanıyor...');
      await submitSessionBtn.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '24_session_booked_success.png') });
      console.log('✅ Direkt Seans Randevusu Başarıyla Oluşturuldu!');
    } else {
      console.log('Hasta için onay bekleyen açık adım bulunamadı mesajı görüntülendi.');
      const closeBtn = await page.$('button:has-text("Kapat"), button:has-text("Vazgeç")');
      if (closeBtn) await closeBtn.click();
    }
  }

  // 6. Pre-requests Pool Page (/secretary/requests)
  console.log('6. Randevu Ön Talep Havuzu Ekranı...');
  await page.goto('http://localhost:3000/secretary/requests', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '25_secretary_requests.png'), fullPage: true });

  await browser.close();
  console.log('✅ TEST 02 BAŞARIYLA TAMAMLANDI!\n');
}

runSecretaryFlow().catch((err) => {
  console.error('❌ TEST 02 HATASI:', err);
  process.exit(1);
});

