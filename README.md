# 🦷 DentaPanel — Akıllı Diş Kliniği Yönetim Platformu

Fiziksel diş kliniklerinin randevu, danışma QR check-in, kasa tahsilatı, sesli bekleme odası zili, FDI (11–48) diş muayenesi ve seans planlama süreçlerini sıfır SMS maliyeti ve sıfır Vercel bağımlılığı ile yöneten canlı ürün platformu.

> Detaylı adım adım kullanıcı akışları, şemalar ve rol işleyişleri için: **[DENTAPANEL_SISTEM_VE_USER_FLOW_DOKUMANI.md](./DENTAPANEL_SISTEM_VE_USER_FLOW_DOKUMANI.md)**

---

## 🌟 Öne Çıkan Özellikler

* **%100 SMS'siz Güvenlik:** Hasta girişi `Telefon + 4 Haneli PIN` ile çalışır; unutulan PIN bankodan tek tıkla sıfırlanır.
* **Sıfır Kaçak Kasa Kapısı:** Muayene ücreti bankoda POS veya nakit olarak tahsil edilmeden hasta hekimin bekleme odasına aktarılmaz.
* **Doğrudan Telefon Kamerasıyla QR Check-in (`/checkin`):** Tarayıcı kamera izni engeli yoktur; normal telefon kamerasıyla açılan sayfada tek butonla check-in yapılır.
* **30 Dk Erken Gelen Hasta Desteği:** Randevusundan önce gelen hasta engellenmez; bankoda ödeyip hekim ekranına `⏰ Erken Geldi` etiketiyle düşer.
* **Aynı Gün Koltukta Ek İşlem Kilidi (`[⚡ Koltukta Uygula]`):** Koltukta anlık yapılan işlemler bankoya kırmızı acil çıkış tahsilatı kilidi olarak yansır; para alınmadan randevu kapatılamaz.
* **Bankodan Direkt 2. Seans Randevusu Atama:** Muayeneden çıkan hastanın sonraki seansı sekreter tarafından doğrudan onaylı olarak takvime atanır; ön talep beklemez.
* **FDI 11–48 Diş Çizelgesi:** 4 kadranlı dokunmatik tuş matrisi ile 8 klinik diş durumunun (Sağlam, Çürük, Dolgulu, Kanal, İmplant, Kron, Eksik, Çekim) saniyeler içinde kaydedilmesi.
* **Web Audio Canlı Klinik Zili:** Harici ses dosyası indirmeden yeni hasta ödeme yaptığında hekim bilgisayarında melodik zil çalar (`🔊`).
* **Medula E-Reçete:** Sık kullanılan diş hekimi ilaçları (Augmentin, Apranax, Klorhex vb.) tek tıkla reçeteye eklenir ve hastanın mobil portalına anında yansır.

---

## 🚀 Hızlı Başlangıç

### Gereksinimler
* Node.js 20+
* `.env.local` içerisinde Supabase PostgreSQL bağlantı dizgisi

### 1. Bağımlılıkları Yükleyin
```bash
npm install
```

### 2. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```
Tarayıcınızdan `http://localhost:3000` adresine gidiniz.

### 3. Tüm E2E ve UI/UX Testlerini Çalıştırın
```bash
node tests/run-all-tests.js
```

---

## 🔑 Test Giriş Bilgileri

| Rol | Rota | Kimlik | Şifre / PIN |
| :--- | :--- | :--- | :--- |
| **Hasta 1 (Ahmet Yılmaz)** | `/giris` | `05551112233` | `1234` |
| **Hasta 2 (Ayşe Çelik)** | `/giris` | `05554445566` | `1234` |
| **Sekreter / Banko** | `/personel-giris` | `sekreter@dentapanel.com` | `123456` |
| **Dr. Dt. Zeynep Kaya (Protetik)** | `/personel-giris` | `zeynep@dentapanel.com` | `123456` |
| **Uzm. Dt. Mehmet Yılmaz (Çene Cerrahisi)** | `/personel-giris` | `mehmet@dentapanel.com` | `123456` |
| **Dt. Elif Demir (Genel Hekim)** | `/personel-giris` | `elif@dentapanel.com` | `123456` |

---

## 🐳 Docker ile Bağımsız Dağıtım (Railway / VPS)

```bash
docker build -t dentapanel .
docker run -p 3000:3000 --env-file .env.local dentapanel
```

---

## 📄 Lisans & Telif
DentaPanel © 2026 • Tüm Hakları Saklıdır.
