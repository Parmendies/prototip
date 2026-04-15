# 🎨 Tasarım Rehberi (Design Guide)

Bu proje, kullanıcıyı yormayan **soft-minimalist** bir yaklaşım ve temiz bir arayüz felsefesiyle geliştirilmiştir. Aşağıdaki renk paleti ve tasarım kuralları, projenin görsel bütünlüğünü korumak için belirlenmiştir.

## 🌈 Renk Paleti (Color Palette)

| Renk             | Kod       | Kullanım Amacı                                   | Örnek Görünüm                                                   |
| :--------------- | :-------- | :----------------------------------------------- | :-------------------------------------------------------------- |
| **Primary**      | `#3278ff` | Ana aksiyon butonları, linkler, vurgular.        | ![#3278ff](https://via.placeholder.com/15/3278ff/000000?text=+) |
| **Secondary**    | `#aec7e5` | Yumuşak arka plan geçişleri, ikon zeminleri.     | ![#aec7e5](https://via.placeholder.com/15/aec7e5/000000?text=+) |
| **Neutral BG**   | `#e9e9e9` | Sayfa genel arka planı, border renkleri.         | ![#e9e9e9](https://via.placeholder.com/15/e9e9e9/000000?text=+) |
| **Text (Main)**  | `#172130` | Başlıklar, okunabilir uzun metinler.             | ![#172130](https://via.placeholder.com/15/172130/000000?text=+) |
| **Text (Muted)** | `#b9babd` | Yardımcı metinler, placeholderlar, alt bilgiler. | ![#b9babd](https://via.placeholder.com/15/b9babd/000000?text=+) |

---

## 📐 Tasarım Prensipleri

### 1. Köşe Yumuşatma (Border Radius)

Minimalist ve soft bir görünüm için keskin köşelerden kaçınılmalıdır.

- **Küçük bileşenler (input, button):** `8px`
- **Kartlar ve büyük alanlar:** `16px` - `24px`

### 2. Tipografi

- **Ana Font:** Inter, Poppins veya Montserrat gibi modern sans-serif aileleri tercih edilmelidir.
- **Hiyerarşi:** Başlıklarda `#172130` rengi ve `bold` font ağırlığı; açıklamalarda `#b9babd` rengi ve `regular` ağırlık kullanılmalıdır.

### 3. Gölgeler (Shadows)

Siyah gölgeler yerine, projenin ana veya ikincil rengini içeren çok hafif (blur değeri yüksek) gölgeler tercih edilmelidir:

- `box-shadow: 0 10px 30px rgba(174, 199, 229, 0.3);`

---

## 🛠 Uygulama (Implementation)

### Tailwind CSS Konfigürasyonu

Eğer Tailwind kullanıyorsanız, `tailwind.config.js` dosyanıza şu şekilde ekleyebilirsiniz:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#3278ff",
        secondary: "#aec7e5",
        neutralBg: "#e9e9e9",
        mainText: "#172130",
        mutedText: "#b9babd",
      },
    },
  },
};
```
