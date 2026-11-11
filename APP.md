# 🦷 DentaPanel — Ürün Kapsamı ve İşleyiş Özeti (APP Spec)

**DentaPanel**, diş kliniklerinin ve ağız-diş sağlığı merkezlerinin günlük fiziksel operasyonunu dijitalleştiren; randevu ön talebinden QR check-in'e, banko kasa kapısından FDI diş kaydı ve seans bazlı tedavi planlamasına kadar sıfır kaçakla çalışan **canlı klinik yönetim sistemidir**.

---

## 1. Kapsam Kararları (Kesinleşmiş Ürün Sınırları)

- **Takvim Yönetimi:** Koltuk bazlı değil, doğrudan **hekim takvimine** ve işlem süresine göre çalışır.
- **Şikayet Girişi:** Görüntü/röntgen yükleme yoktur; yalnızca yazılı şikayet metni alınır.
- **Diş Kaydı (FDI 11–48):** 3D/grafik çizim yoktur; 4 kadranlı hızlı numara seçici ve metin tabanlı klinik durum/not tablosu kullanılır.
- **Ödeme Kanalı:** Tahsilatlar klinikte **fiziki POS veya Nakit** olarak bankodan onaylanır (Sanal POS bu sürümde yoktur). **Ödeme bir ön koşuldur**; tahsilat onaylanmadan hekim ekranına *"Bekleme Odasında"* bildirimi düşmez.
- **İletişim Kanalı:** WhatsApp ve ücretli SMS bağımlılığı yoktur; hasta girişleri kişisel **PIN** ile, tüm durum güncellemeleri ise **Uygulama İçi Canlı Bildirim** ekranları + sekreter telefon teyidi üzerinden yürür.
- **E-Reçete:** Sağlık Bakanlığı (Medula) entegrasyonu hastanenin mevcut HBYS tarafındadır; DentaPanel hastaya e-reçete referans numarasını ve ilaç kullanım özetini yansıtır.

---

## 2. Ayrıştırılmış Giriş Kapıları ve Roller

1. **Hasta Girişi (`/giris` & `/checkin`):**
   - **Telefon Numarası + 4 Haneli Kişisel PIN** ile hızlı ve KVKK uyumlu mobil giriş (unutulursa bankodaki sekreter tek tıkla sıfırlar).
   - 30 günlük güvenli oturum sayesinde klinikte QR okutulduğunda tekrar PIN sormadan tek tıkla check-in yapar.
2. **Personel Girişi (`/personel-giris`):**
   - Hasta ekranından tamamen izole kurumsal giriş (**E-posta + Şifre**).
   - **Sekreter / Banko (Yönetici):** Ön talepleri telefonla teyit edip onaylar, saat/hekim revize eder, manuel "Geldi" işaretler, POS/Nakit tahsilat onaylar, muayene çıkışında 2. seans randevusunu direkt atar ve hazır işlem/fiyat kataloğunu yönetir.
   - **Diş Hekimi:** Ödemesi alınan hastaları sesli bildirimle bekleme odasında görür, içeri çağırır, FDI (11–48) diş kaydı girer, hazır şablonlardan seans/fiyat planı çıkarır (veya aynı gün koltukta işlem başlatır) ve e-reçete özetini kaydeder.
3. **Danışma Kiosk / QR Standı (`/kiosk`):**
   - Hastanın kendi telefonunun normal kamerasıyla okutup `/checkin` sayfasına ulaştığı giriş noktası.

---

## 3. Uçtan Uca Canlı Operasyon Akışları

1. **Randevu Ön Talebi & Teyit:** Hasta web'den hekim ve boş saat seçip ön talep bırakır $\rightarrow$ Sekreter hastayı arar, onaylar (veya revize eder) $\rightarrow$ Hastanın uygulama içi ekranına anında **Onay Bildirimi** düşer.
2. **Doğrudan Kamera URL QR Check-in & Erken Geliş:** Hasta kliniğe geldiğinde telefonunun normal kamerasını danışmadaki QR koda tutar, açılan sayfada **[Geldim — Check-in Yap]** butonuna basar. *(30 dakikadan erken gelse bile engellenmez; ödemesini yapıp `Erken Geldi` etiketiyle bekleme listesine geçebilir).*
3. **Banko Tahsilat Kapısı & Sesli Hekim Zili:** Banko ekranında hasta *Ödeme Bekliyor* olarak parlar. Sekreter fiziki POS veya nakit tahsilatı alıp **[Tahsil Edildi]** dediği anda, içerideki **Hekim PC'de sesli zil çalar** ve hasta *Bekleme Odasında* listesine düşer.
4. **Muayene, Hızlı FDI & Şablonlu Seans Planı:** Hekim 4 kadranlı matristen diş durumunu seçer; hazır işlem chip'leriyle (*Kanal, Dolgu, Çekim vb.*) seans adımlarını ve net ücretlerini belirler.
5. **Aynı Gün Koltukta Ek İşlem (Saha Kuralı):** Hasta muayene koltuğundayken işlemi hemen o an yaptırmak isterse, hekim adımı **`[Bugün Koltukta Uygula]`** olarak işaretler; bankoya anında kırmızı **Acil Tahsilat Kilidi** düşer ve tahsilat onaylanmadan randevu kapatılamaz.
6. **Sonraki Seans Randevusu & Seans Ödemesi:** Çıkışta ister **Sekreter bankodan direkt onaylı** 2. seans randevusunu verir, ister hasta telefonundan seçer. Seans günü hasta geldiğinde QR okutur, bu kez o seansın ücretini bankoda öder ve işleme alınır.

---

## 📚 İlgili Teknik Dokümanlar
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Next.js 16 + Supabase PostgreSQL + Drizzle ORM + Realtime teknik mimarisi ve DB şeması.
- [DESİGN.md](./DESİGN.md) — Dental soft-minimalist renk paleti, tipografi ve rol bazlı ergonomi kuralları.
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — Faz 1'den Faz 6'ya detaylı geliştirme görev listesi.
