# 🎨 DentaPanel — Arayüz ve Tasarım Sistemi Rehberi (Dental Design System)

Bu proje, kullanıcıyı yormayan **soft-minimalist**, **light-first** ve klinik ferahlığını yansıtan temiz bir arayüz felsefesiyle geliştirilmektedir. Mevcut temel tasarım kuralları (köşe yumuşatmaları, tipografik hiyerarşi ve yumuşak renkli gölgeler) korunarak **Diş Kliniği (Dental Clinical)** kimliğine ve sahadaki hız ihtiyacına uyarlanmıştır.

---

## 🌈 1. Dental Renk Paleti (Color Tokens)

Klasik sert hastane renkleri veya siyah gölgeler yerine; steril, güven veren **Klinik Turkuaz-Mavi (Dental Teal-Blue)** ve göz yormayan açık buz grisi zemin kullanılır:

| Token / Rol | Renk Kodu | CSS Değişkeni (`@theme`) | Kullanım Amacı |
| :--- | :--- | :--- | :--- |
| **Primary (Dental Teal)** | `#0f8a9d` | `--color-primary` | Ana aksiyon butonları, aktif sekmeler, odak halkaları, diş hekimliği vurguları. |
| **Primary Hover / Dark** | `#0b6b7a` | `--color-primary-dark` | Buton hover ve basılı (active) durumları. |
| **Primary Muted** | `#e6f5f8` | `--color-primary-muted` | Aktif menü arka planı, seçili FDI diş tuşu zemini, hafif bilgi kutuları. |
| **Secondary (Dental Sky)** | `#a8d5e5` | `--color-secondary` | Yumuşak arka plan geçişleri, ikon zeminleri, renkli soft gölge tabanı. |
| **Neutral Base BG** | `#eef3f6` | `--color-bg-base` | Sayfa genel arka planı (steril klinik buz grisi — beyaz kartları net ayırır). |
| **Surface (Card)** | `#ffffff` | `--color-bg-surface` | Kartlar, tablolar, modallar ve form yüzeyleri. |
| **Text (Main)** | `#172130` | `--color-text-primary` | Başlıklar, hasta adları, tutarlar ve birincil okunabilir metinler. |
| **Text (Secondary)** | `#5b6b7f` | `--color-text-secondary` | Alt başlıklar, klinik notlar, tablo açıklamaları. |
| **Text (Muted)** | `#9aa5b4` | `--color-text-muted` | Yardımcı metinler, placeholderlar, pasif saat dilimleri. |

### 🚦 Klinik Operasyon Durum Renkleri (Semantic Status Palette)

Banko ve Hekim ekranlarında uzaktan tek bakışta anlaşılabilirlik için her randevu/ödeme aşamasının sabit bir rengi vardır:

| Klinik Durumu | Vurgu Rengi | Zemin Rengi | Nerede Görünür? |
| :--- | :--- | :--- | :--- |
| **Ön Talep (`pending_approval`)** | `#d97706` (Amber) | `#fef3c7` | Sekreter Ön Talep Havuzu (Telefon onayı bekliyor) |
| **QR Okuttu / Ödeme Bekliyor** | `#ea580c` (Turuncu) | `#ffedd5` | Canlı Banko Masasında parlama efektiyle en üstte |
| **Ödendi / Bekleme Odasında** | `#059669` (Zümrüt) | `#d1fae5` | Hekim Bekleme Odası listesi + Banko onay satırı |
| **Erken Geldi Etiketi (>30 dk)** | `#0284c7` (Gök Mavisi) | `#e0f2fe` | Bekleme listesinde `Erken Geldi • 14:00` bilgi rozeti |
| **Muayenede / Koltukta** | `#0f8a9d` (Dental Teal) | `#e6f5f8` | Hekim aktif muayene kartı & Banko durum takibi |
| **Koltukta Ek İşlem Tahsilatı** | `#dc2626` (Mercan Kırmızı)| `#fee2e2` | Bankoda acil tahsilat kilidi (`⚡ Ek İşlem Ödemesi`) |

---

## 📐 2. Temel Tasarım Prensipleri (Korunan Kurallar)

### 1. Köşe Yumuşatma (Border Radius)
Minimalist ve soft görünüm için keskin (`0px`–`4px`) köşelerden kaçınılır:
- **Küçük bileşenler (`input`, `button`, `select`, FDI diş tuşları, işlem chip'leri):** `8px` – `12px` (`rounded-lg` / `rounded-xl`)
- **Kartlar, hasta panelleri ve modallar:** `16px` – `24px` (`rounded-2xl` / `rounded-3xl`)

### 2. Tipografi ve Sayısal Hizalama
- **Ana Font:** `Geist Sans` / `Inter` (modern, yüksek okunaklı sans-serif).
- **Hiyerarşi:** Başlıklarda `#172130` ve `semibold`/`bold` ağırlık; açıklamalarda `#5b6b7f` ve `#9aa5b4`.
- **Sayısal Veriler (`tabular-nums`):** Saat dilimleri (`14:30`), FDI diş numaraları (`11`–`48`), 4 haneli PIN kutuları ve TL tutarları (`2.500 ₺`) hizalı okunması için mutlaka `tabular-nums` (veya `--font-mono`) ile yazılır.

### 3. Gölgeler ve Cam Yüzeyler (Soft Shadows & Glass)
Sert siyah gölgeler yerine, dental mavi/turkuaz tonunu içeren yüksek blur değerli yumuşak gölgeler kullanılır:
- **Standart Kart Gölgesi:** `0 10px 30px rgba(15, 138, 157, 0.07)`
- **Yüzen Eleman / Aktif Vurgu:** `0 12px 32px rgba(168, 213, 229, 0.35)`
- **Glassmorphism (`.glass`):** Üst barlar ve mobil alt navigasyonda `backdrop-filter: blur(12px)` ve yarı saydam beyaz zemin (`rgba(255, 255, 255, 0.78)`).

---

## 🦷 3. Rol Bazlı Ekran ve Ergonomi Kuralları

### A. Hasta Ekranları (`/giris`, `/checkin`, `/patient/*`) — *Mobile-First*
- Hastaların %95'i kendi cep telefonundan girer; tüm hasta sayfaları `max-w-md mx-auto` mobil konteyner ergonomisiyle tasarlanır.
- Buton ve dokunma alanları minimum **`48px`** yüksekliğindedir (yaşlı veya ağrılı hastanın tek başparmakla hatasız tıklayabilmesi için).
- `/checkin` ekranında karmaşık menüler yer almaz; yalnızca randevu özeti, ödenecek tutar bilgisi ve tek bir dev **[Geldim — Check-in Yap]** aksiyonu bulunur.

### B. Sekreter / Banko Ekranları (`/secretary/*`) — *Masaüstü Operasyon Merkezi*
- Geniş ekran (`1280px+`) yerleşimi: Sol dar sabit navigasyon, üstte canlı kasa/bekleyen sayaçları, ortada iki sütunlu operasyon masası (**Sol/Üst:** QR Okutan & Ödeme Bekleyenler + Koltukta Ek İşlem Uyarıları, **Sağ/Alt:** Günün Randevu Akışı & Ön Talepler).
- Sekreter sayfa değiştirmeden sağdan açılan çekmece (`Drawer` / `Modal`) ile tahsilat onaylayabilir veya muayeneden çıkan hastaya **tek tıkla 2. seans randevusu** atayabilir.

### C. Diş Hekimi Ekranları (`/doctor/*`) — *Eldiven & Hızlı Giriş Ergonomisi*
- **Üst Durum Çubuğu:** Canlı bağlantı durumu (`● Canlı Bağlantı Aktif`) ve tarayıcı ses kilidini açan **`[🔊 Sesli Zil Aktif]`** anahtarı.
- **Grafiksiz Hızlı FDI (11–48) Seçici:** 3D çizim yoktur; ancak açılır menüde 32 dişi kaydırarak aramak yerine, ekranda **4 Kadranlı Hızlı Numara Tuş Matrisi** (`Üst Sağ 18–11 | Üst Sol 21–28` / `Alt Sağ 48–41 | Alt Sol 31–38`) bulunur. Hekim `36` tuşuna, ardından `[Çürük]` chip'ine basıp 2 saniyede kaydı ekler.
- **Hazır İşlem & Fiyat Şablonları:** Tedavi planı alanında kliniğin tanımlı işlemleri (`[Kanal Tedavisi • 3.000 ₺]`, `[Kompozit Dolgu • 1.500 ₺]`, `[Diş Taşı • 1.200 ₺]`) tek tıkla eklenir; fiyat kutusu düzenlenebilir gelir ve yanında **`[Sonraki Seans]` / `[Bugün Koltukta Yap]`** seçimi yer alır.

### D. Ayrıştırılmış Giriş Kapıları
- **Hasta Giriş Sayfası (`/giris`):** Sıcak, sade, güven veren karşılama; yalnızca telefon numarası ve 4 haneli PIN kutuları (Personel menüsü veya rol seçici kartlar kesinlikle görünmez).
- **Personel Giriş Sayfası (`/personel-giris`):** Kurumsal, sade klinik çalışanı ekranı (E-posta + Şifre).
