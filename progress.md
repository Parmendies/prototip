# 📋 DentaPanel — UI/UX Tasarım ve İyileştirme Takip Raporu (`progress.md`)

## 🏥 Proje Bağlamı
- **Uygulama:** Hasta tarafı randevu/klinik uygulaması (mobil öncelikli, Türkçe arayüz) + Danışma QR Kiosk + Banko/Sekreter Masası + Diş Hekimi Muayene Masası + Klinik Yönetim Paneli
- **Teknoloji:** Next.js 16.2.3 (App Router, Turbopack), React 19.2.4, TypeScript, Drizzle ORM, Postgres, Lucide React
- **Stil Sistemi:** Tailwind CSS v4 (`@theme inline`), CSS Variables, Glassmorphism
- **Ana Renk:** `#0f8a9d` (Dental Teal)
- **Tasarım Dili:** Sade, sakin, steril klinik güveni veren, bol boşluklu, soft-minimalist, light-first

---

## 🎯 14 Maddelik UI/UX Kontrol Listesi
Her sayfa incelenirken ve düzeltilirken bu 14 madde istisnasız kontrol edilecektir:
1. **[ ] Birincil eylem belirgin mi?** Aynı işi yapan mükerrer buton var mı? (varsa birini kaldır veya ayır)
2. **[ ] Eylem hiyerarşisi:** Tek bir primary buton, geri kalanlar secondary/ghost
3. **[ ] Yıkıcı eylemler (çıkış, silme, iptal):** Yanlışlıkla basılamayacak kadar uzakta, az vurgulu ve onay diyaloglu mu?
4. **[ ] Metin kontrastı WCAG AA (en az 4.5:1):** Gri, açık mavi ve açık sarı metinler koyulaştırıldı mı?
5. **[ ] İkon + metin butonlarda dikey ve yatay hizalama doğru mu?**
6. **[ ] Başlık ile aksiyon butonu aynı yükseklikte ve hizalı mı?**
7. **[ ] Sekmeler küçük ekranda (390px) sığıyor mu?** Sıkışıyorsa yatay kaydırılabilir (`overflow-x-auto no-scrollbar`) yapıldı mı?
8. **[ ] Sayaçlar:** `0` veya boş değerler gizleniyor mu?
9. **[ ] Boş durum (empty state):** Açıklayıcı metin, uygun ikon ve birincil aksiyon önerisi var mı?
10. **[ ] Yükleniyor ve hata durumları tasarlanmış mı?**
11. **[ ] Alt gezinmede aktif sekme görsel olarak belli mi?** (Dental Teal renk + dolgulu ikon + kalın etiket)
12. **[ ] Alt güvenli alan (`safe-area-inset-bottom`) ve üst bar boşlukları doğru mu?**
13. **[ ] Köşe yarıçapları ve boşluklar tokenlardan mı geliyor?** (Butonlar `rounded-xl`, Kartlar `rounded-2xl`)
14. **[ ] Yazı boyutları tipografi ölçeğinde ve dokunma alanları minimum 44×44 px mi?**

---

## 🎨 Tasarım Sistemi Ölçekleri & Standartları (Hedeflenen Tokenlar)

1. **Renk Paleti (Semantik Dental Tokens):**
   - `primary`: `#0f8a9d` (Dental Teal) | `primary-hover`: `#0b6b7a` | `primary-light`: `#38b2c6` | `primary-muted`: `#e6f5f8`
   - `secondary`: `#a8d5e5` (Dental Sky zemin / soft vurgu)
   - `background`: `#eef3f6` (Steril klinik buz grisi genel arka plan)
   - `surface`: `#ffffff` (Kart, form ve modal yüzeyleri)
   - `surface-elevated`: `#f6f9fb` (Girdi ve iç panel zeminleri)
   - `border`: `#cbd5e1` / subtle: `#e2e8f0`
   - `text-primary`: `#172130` (Yüksek kontrastlı ana metin)
   - `text-secondary`: `#475569` (Okunabilir alt metin - kontrastı güçlendirildi)
   - `text-muted`: `#64748b` (Yardımcı/placeholder metin - WCAG AA uyumlu)
   - `success`: `#059669` / muted: `#d1fae5`
   - `warning`: `#d97706` / muted: `#fef3c7`
   - `danger / error`: `#dc2626` / muted: `#fee2e2`

2. **Boşluk Ölçeği:**
   - 4px (`gap-1`, `p-1`), 8px (`gap-2`, `p-2`), 12px (`gap-3`, `p-3`), 16px (`gap-4`, `p-4`), 24px (`gap-6`, `p-6`), 32px (`gap-8`, `p-8`)

3. **Radius Ölçeği:**
   - Buton & Girdi Radius'u: `12px` (`rounded-xl`)
   - Kart & Modal Radius'u: `16px`–`20px` (`rounded-2xl`)
   - Rozet (Badge / Pill): `9999px` (`rounded-full`)

4. **Tipografi Hiyerarşisi (Maksimum 5 Seviye):**
   - **Başlık-L:** `24px` (`text-2xl`), `font-bold`, `tracking-tight`
   - **Başlık-M:** `16px`–`18px` (`text-base` / `text-lg`), `font-semibold`
   - **Gövde (Body):** `14px` (`text-sm`), `leading-normal`
   - **Etiket (Label / Buton Metni):** `12px`–`13px` (`text-xs`), `font-medium` / `font-semibold`
   - **Küçük Metin (Yardımcı / Meta):** `11px` (`text-[11px]`), `text-muted`
   - *Sayısal Veriler:* Saatler, FDI diş kodları ve TL fiyatları için `tabular-nums` / `font-mono`

5. **Dokunma Alanı (Ergonomi & Erişilebilirlik):**
   - Mobilde tüm tıklanabilir elemanlar minimum **44×44 px**.

---

## 🧩 FAZ 1: Ortak Bileşenler Durumu (Öncelikli Aşama)

| Bileşen Dosyası | Durum | İncelenen Hatalar ve Planlanan Düzeltmeler |
| :--- | :--- | :--- |
| `app/_components/ui/Button.tsx` | Doğrulandı | Mor/pembe gölgeler temizlendi; Dental Teal tokenlarına bağlandı; dokunma alanları min 44px (`lg` için 48px) yapıldı. |
| `app/_components/ui/Card.tsx` | Doğrulandı | Sabit kart radius'u (`rounded-2xl`) ve iç boşluklar (`p-4` / `p-6`) sabitlendi; başlık ve aksiyon dikey ortalaması (`items-center`) sağlandı. |
| `app/_components/ui/Tabs.tsx` | Doğrulandı | Underline durumundaki `text-white` hatası `text-(--color-primary)` ile düzeltildi; mobilde yatay kaydırma (`overflow-x-auto no-scrollbar`) eklendi; `0` sayaçları otomatik gizlendi; dokunma yüksekliği 44px yapıldı. |
| `app/_components/ui/Badge.tsx` | Doğrulandı | Secondary badge açık renk metin kontrastı giderildi; klinik semantik renkleri (amber, sky, emerald, teal, red) WCAG AA ile hizalandı. |
| `app/_components/ui/Input.tsx` | Doğrulandı | Form elemanlarında min 44px dokunma yüksekliği; tutarlı odak halkası (`focus:ring-2 focus:ring-(--color-primary)`); etiket ve hata hiyerarşisi standardize edildi. |
| `app/_components/ui/Modal.tsx` | Doğrulandı | Başlık ve kapatma tuşu (`items-center`) hizalandı; kapatma butonu 44×44 px dokunma alanına kavuşturuldu; güvenli alan boşlukları tamamlandı. |
| `app/patient/_components/PatientBottomNav.tsx` | Doğrulandı | Safe-area-inset-bottom boşluğu garanti altına alındı; aktif sekmede Dental Teal zemin hapı + dolgulu ikon; butonlar min 48px dokunma alanına ayarlandı. |

---

## 📱 FAZ 2 - FAZ 6: Sayfa İnceleme ve Düzeltme Takip Tablosu

Durum Kodları: `Bekliyor` | `İncelendi` | `Düzeltildi` | `Doğrulandı`

### 1. Karşılama, Giriş ve Check-in Akışı (Entry & Auth)
| Sayfa / Route | Durum | Planlanan İnceleme & Düzeltmeler |
| :--- | :--- | :--- |
| `app/page.tsx` (Ana Karşılama) | Doğrulandı | Hasta portalı birincil odak kartı haline getirildi; dağınık amber/cyan tonları tokenlara bağlandı; butonlar min 44px dokunma alanına çıkarıldı; metin kontrastı güçlendirildi. |
| `app/(auth)/giris/page.tsx` (Hasta Giriş) | Doğrulandı | Telefon ve PIN kutuları 48-52px ferah dokunma alanına çıkarıldı; font-mono tabular-nums ile PIN ortalandı; personel linki dipnot olarak sadeleştirildi; hata kutusu ikonlu semantik renge bağlandı. |
| `app/(auth)/personel-giris/page.tsx` (Personel Giriş) | Doğrulandı | Form alanları ve test hesap butonları 44-48px ergonomik dokunma alanına kavuşturuldu; geri dönüş linki hizalandı; metin kontrastı WCAG AA seviyesine çekildi. |
| `app/checkin/page.tsx` (QR Hasta Check-in) | Doğrulandı | "GELDİM — CHECK-IN YAP" 56px dev tek primary buton odak yapıldı; erken geldi, ödeme bekleniyor ve bekleme odası semantik kartları güçlendirildi; inline form alanları standartlaştırıldı. |
| `app/kiosk/page.tsx` (Danışma Kiosk Standı) | Doğrulandı | Saat sayacı font-mono tabular-nums ile titreşimsiz kilitlendi; test butonu 44px dokunma alanına çıkarıldı; QR çerçevesi ve kontrastı optimize edildi. |

### 2. Hasta Portalı (Patient Portal — Mobile First)
| Sayfa / Route | Durum | Planlanan İnceleme & Düzeltmeler |
| :--- | :--- | :--- |
| `app/patient/page.tsx` (Hasta Paneli / Randevularım) | Doğrulandı | Mükerrer randevu butonları temizlendi; sekmeler `Tabs` ortak bileşenine bağlandı; sayaçlarda `(0)` gizlendi; durum rozetleri `Badge` bileşeniyle birleştirildi; çıkış modalı `Modal` ile güvenli hale getirildi; butonlar min 44px dokunma alanına çıkarıldı. |
| `app/patient/appointments/page.tsx` (Randevular Yönlendirme) | Doğrulandı | `/patient` paneline temiz yönlendirme davranışı korundu ve doğrulandı. |
| `app/patient/book/page.tsx` (Randevu Ön Talebi) | Doğrulandı | Slot seçim butonları min 44px dokunma konforuna kavuşturuldu; hekim seçim kartları radyo-seçim vurgusuna kavuştu; şikayet ve hızlı etiketler ferahlatıldı; ileri/geri buton hiyerarşisi netleştirildi. |
| `app/patient/profile/page.tsx` (Profil & PIN Değiştirme) | Doğrulandı | PIN form inputları 48px font-mono tabular-nums yapıldı; oturumu kapat butonu tek tık yerine iki aşamalı `Modal` onay diyaloguna bağlandı; tıbbi alerji kartı kırmızı semantik renge kavuşturuldu. |

### 3. Banko & Sekreter Masası (Secretary Desk)
| Sayfa / Route | Durum | Planlanan İnceleme & Düzeltmeler |
| :--- | :--- | :--- |
| `app/secretary/desk/page.tsx` (Canlı Banko Masası) | Doğrulandı | Kasa ve randevu tablosu durum rozetleri `Badge` bileşenine bağlandı; masaüstü ve mobil buton dokunma alanları 36-44px seviyesine çekildi; 2. Seans modalı form girdileri min 44px ve odak halkaları ile modernize edildi; sayaçlar netleştirildi. |
| `app/secretary/requests/page.tsx` (Ön Talep Havuzu) | Doğrulandı | "Teyit Edildi — Onayla" tek primary ve "İptal Et" danger buton hiyerarşisi 44px dokunma alanıyla netleştirildi; boş durum ferahlatıldı; telefon arama linki ve hasta şikayeti metin kontrastı (WCAG AA) güçlendirildi. |

### 4. Diş Hekimi Muayene Alanı (Doctor Module)
| Sayfa / Route | Durum | Planlanan İnceleme & Düzeltmeler |
| :--- | :--- | :--- |
| `app/doctor/workspace/page.tsx` (Hekim Çalışma Alanı) | Doğrulandı | Koltuktaki aktif hasta kartı, bekleme odası sırası, sesli çağrı zili ve "Muayeneyi Başlat" butonları min 44px dokunma alanına çıkarıldı; sayaçlar ve kontrast güçlendirildi. |
| `app/doctor/patients/page.tsx` (Hasta Listesi) | Doğrulandı | Arama kutusu min 44px ferah dokunma alanına ve focus ring'e kavuştu; tablo başlık kontrastı WCAG AA seviyesine çekildi; alerji uyarısı semantik kırmızı badge yapıldı; "Dosyayı Aç" linki min 38-40px yapıldı. |
| `app/doctor/patients/[id]/page.tsx` (Hasta Dosyası & Geçmişi) | Doğrulandı | Geri butonu 44x44px; sekmeler yatay kaydırılabilir yapıldı ve 0 sayaçları gizlendi; tıbbi uyarı kartı kırmızı semantik kartla belirginleştirildi; "Muayeneyi Aç" butonu min 38px yapıldı. |
| `app/doctor/examination/[id]/page.tsx` (Koltukta Muayene & FDI Diş) | Doğrulandı | Geri dönüş butonu 44x44px, sekme butonları min 44px dokunma alanına çıkarıldı; muayeneyi tamamla butonu min 44px primary yapıldı; FDI diş durumları ve fiyat kutusu `font-mono tabular-nums` ile kilitlendi. |
| `app/doctor/calendar/page.tsx` (Hekim Takvimi) | Doğrulandı | Randevu saat blokları tabular-nums font-mono yapıldı; durum rozetleri `Badge` ortak bileşeniyle standardize edildi; gün ve hafta değiştirme butonları 40-44px dokunma konforuna kavuşturuldu. |
| `app/doctor/profile/page.tsx` (Hekim Profil & Ayarlar) | Doğrulandı | Profil formu girdi alanları min 44px, focus halkaları tutarlı hale getirildi; kaydet butonu primary olarak ayrıştırıldı; muayene ücreti font-mono tabular-nums ile netleştirildi. |

### 5. Klinik Yönetim & Admin Paneli
| Sayfa / Route | Durum | Planlanan İnceleme & Düzeltmeler |
| :--- | :--- | :--- |
| `app/admin/dashboard/page.tsx` (Admin Dashboard) | Doğrulandı | İstatistik kartları ikon ve sayı hizalamaları düzeltildi; sayılar font-mono tabular-nums yapıldı; grafikler ve aktivite listesi responsive (mobilde tek kolon, masaüstünde 3 kolon) hale getirildi; tablo başlık kontrastı güçlendirildi. |
| `app/admin/hospital-setup/page.tsx` (Klinik Kurulumu) | Doğrulandı | Stepper butonları min 44px ve mobilde kaydırılabilir yapıldı; form ve önizleme responsive sütunlara bölündü; çalışma saatleri checkbox ve select alanları dokunma konforuna kavuşturuldu. |
| `app/admin/departments/page.tsx` (Bölümler) | Doğrulandı | Departman ekle butonu min 44px tek primary odak yapıldı; kart içi düzenle/sil butonları mobilde dokunulabilir min 36px yapıldı; grid mobilde tek kolona uyarlanarak taşmalar önlendi. |
| `app/admin/rooms/page.tsx` (Odalar/Ünitler) | Doğrulandı | Müsaitlik özet kartları responsive yapıldı; "Oda Ekle" butonu min 44px primary yapıldı; oda seçim kartları min 96px dokunma konforu ve semantik durum renkleriyle standardize edildi. |
| `app/admin/staff/page.tsx` (Personel Listesi) | Doğrulandı | Doktor ve sekreter sekmelerinde sayaçlar düzeltildi; arama kutusu min 44px yapıldı; doktor kartlarındaki deneyim/puan kutuları tabular-nums font-mono yapıldı; düzenle butonları ve modal girdileri standardize edildi. |
| `app/admin/meta/page.tsx` (Meta Entegrasyonu) | Doğrulandı | Bağlantı durumu semantik yeşil kartla güçlendirildi; bağlantıyı kes butonu kırmızı hover ile ayrıldı; ayarları kaydet butonu min 44px primary yapıldı; canlı sohbet logları kontrast ve tipografi açısından optimize edildi. |

---

## 🎯 Uygulama Adımları
1. **Adım 1:** `app/globals.css` tasarım tokenları (renk, dokunma alanı, boşluk) güncellenecek.
2. **Adım 2:** Ortak UI bileşenleri (`Button`, `Card`, `Tabs`, `Badge`, `Input`, `Modal`, `PatientBottomNav`) kontrol listesine göre güncellenecek.
3. **Adım 3:** Giriş, Karşılama & Check-in akışı (`/`, `/giris`, `/personel-giris`, `/checkin`, `/kiosk`) güncellenecek.
4. **Adım 4:** Hasta Portalı sayfaları (`/patient`, `/patient/book`, `/patient/profile`) güncellenecek.
5. **Adım 5:** Sekreter Masası (`/secretary/desk`, `/secretary/requests`) güncellenecek.
6. **Adım 6:** Diş Hekimi Modülü (`/doctor/*`) güncellenecek.
7. **Adım 7:** Admin Modülü (`/admin/*`) güncellenecek.
8. **Adım 8:** Mobil (390px) & Masaüstü (1280px) testleri, derleme (`npm run build`) ve doğrulama tamamlanacak.
