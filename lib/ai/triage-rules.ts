// Yapay zekâ erişilemediğinde (kota, kesinti, zaman aşımı) devreye giren
// anahtar kelime tabanlı yedek yönlendirme. Bilinçli olarak temkinlidir:
// tanıdığı bir ifade yoksa öneri üretmez (null), hasta hekimini kendisi seçer.

import type { TriageDoctor, TriageResult, TriageUrgency } from './triage';

type Rule = {
  department: string;
  /** Şikayet metninde aranan ifadeler (küçük harf, Türkçe) */
  keywords: string[];
  /** Hekim branş metninde aranan ifadeler; ilk eşleşen hekim önerilir */
  branchHints: string[];
};

// Sıra önemlidir: daha özgül bölümler önce gelir, eşit puanda üstteki kazanır.
const RULES: Rule[] = [
  {
    department: 'Çocuk Diş Hekimliği (Pedodonti)',
    keywords: ['çocuğum', 'çocugum', 'oğlum', 'kızım', 'süt diş', 'bebeğim', 'yaşındaki'],
    branchHints: ['pedodonti', 'çocuk'],
  },
  {
    department: 'Ağız, Diş ve Çene Cerrahisi',
    keywords: ['20 yaş', 'yirmi yaş', 'yirmilik', 'gömülü', 'çekim', 'çektir', 'implant', 'çene', 'kist', 'apse', 'şişlik', 'şişti', 'kırıldı', 'darbe'],
    branchHints: ['cerrah'],
  },
  {
    department: 'Ortodonti',
    keywords: ['tel tak', 'diş teli', 'braket', 'çapraşık', 'şeffaf plak', 'kapanış', 'ortodonti'],
    branchHints: ['ortodonti'],
  },
  {
    department: 'Endodonti (Kanal Tedavisi)',
    keywords: ['ağrı', 'agri', 'sızla', 'sızı', 'zonkl', 'kanal', 'çürük', 'çürüm', 'dolgu', 'soğuk', 'sıcak'],
    branchHints: ['endodonti', 'kanal'],
  },
  {
    department: 'Diş Eti Tedavisi (Periodontoloji)',
    keywords: ['diş eti', 'dişeti', 'kanama', 'diş taşı', 'ağız kokusu', 'sallan'],
    branchHints: ['periodon', 'diş eti'],
  },
  {
    department: 'Protez ve Estetik Diş Hekimliği',
    keywords: ['protez', 'kaplama', 'zirkon', 'lamina', 'beyazlat', 'estetik', 'gülüş', 'köprü', 'damak'],
    branchHints: ['protez', 'estetik'],
  },
  {
    department: 'Genel Diş Hekimliği',
    keywords: ['kontrol', 'muayene', 'temizlik', 'check'],
    branchHints: ['genel'],
  },
];

const GENERAL_HINTS = ['genel'];

// Metin ağız/diş ile ilgili hiçbir ifade içermiyorsa ("dizim ağrıyor" gibi) öneri üretilmez
const DENTAL_ANCHORS = ['diş', 'ağız', 'ağz', 'çene', 'damak', 'dolgu', 'kanal', 'implant', 'protez', 'braket', 'kaplama', 'zirkon', 'lamina', 'beyazlat', 'gülüş', 'kontrol', 'muayene'];

const URGENT = ['nefes', 'yutam', 'yutkun', 'durmayan kanama', 'kanama durm', 'kaza', 'darbe', 'düştüm', 'yüzüm şiş', 'yanağım şiş', 'ateşim'];
const SOON = ['şiddetli', 'dayanılmaz', 'uyutmuyor', 'uyuyam', 'apse', 'şişlik', 'şişti', 'iltihap'];

const lower = (s: string) => s.toLocaleLowerCase('tr');
const hasAny = (text: string, terms: string[]) => terms.some((t) => text.includes(t));
const findByBranch = (doctors: TriageDoctor[], hints: string[]) =>
  doctors.find((d) => hasAny(lower(d.branch), hints));

export function triageByRules(complaint: string, doctors: TriageDoctor[]): TriageResult | null {
  const text = lower(complaint);
  if (!hasAny(text, DENTAL_ANCHORS)) return null;

  let best: Rule | null = null;
  let bestScore = 0;
  for (const rule of RULES) {
    const score = rule.keywords.filter((k) => text.includes(k)).length;
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }
  if (!best) return null;

  // Klinikte o branşta hekim yoksa genel diş hekimine yönlendir
  const specialist = findByBranch(doctors, best.branchHints);
  const doctor = specialist ?? findByBranch(doctors, GENERAL_HINTS);
  if (!doctor) return null;

  const urgency: TriageUrgency = hasAny(text, URGENT) ? 'urgent' : hasAny(text, SOON) ? 'soon' : 'routine';

  return {
    doctorId: doctor.id,
    department: best.department,
    reason: specialist
      ? `Yazdığınız şikayetlerle genellikle ${best.department} bölümü ilgilenir. Kesin değerlendirmeyi hekiminiz muayenede yapacaktır.`
      : `Bu tür şikayetler için ilk değerlendirmeyi genel diş hekimimiz yapar; gerekirse sizi ilgili bölüme (${best.department}) yönlendirir.`,
    urgency,
    source: 'rules',
  };
}
