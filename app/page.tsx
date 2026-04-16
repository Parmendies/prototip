import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MediPanel — Akıllı Hastane Yönetim Sistemi',
  description: 'Hastane yöneticisi, doktor veya hasta olarak sisteme giriş yapın.',
};

const roles = [
  {
    id: 'admin',
    href: '/admin/dashboard',
    emoji: '🏥',
    label: 'Hastane Yönetimi',
    description: 'Departman, personel ve tüm operasyonları yönetin',
    gradient: 'from-[hsl(172,66%,40%)] to-[hsl(172,66%,28%)]',
    glow: 'hsl(172,66%,50%,0.25)',
    badge: 'Admin Paneli',
    badgeColor: 'bg-(--color-primary-muted) text-(--color-primary)',
    features: ['Dashboard & İstatistikler', 'Personel Yönetimi', 'Departman & Oda Düzenleme'],
  },
  {
    id: 'doctor',
    href: '/doctor/calendar',
    emoji: '👨‍⚕️',
    label: 'Doktor Paneli',
    description: 'Takviminizi, hastalarınızı ve randevularınızı yönetin',
    gradient: 'from-[hsl(258,60%,55%)] to-[hsl(258,60%,40%)]',
    glow: 'hsl(258,60%,60%,0.25)',
    badge: 'Doktor Paneli',
    badgeColor: 'bg-(--color-secondary-muted) text-(--color-secondary)',
    features: ['Günlük & Haftalık Takvim', 'Hasta Dosyaları', 'Online Görüşme'],
  },
  {
    id: 'patient',
    href: '/patient/book',
    emoji: '🧑‍🤝‍🧑',
    label: 'Hasta Portalı',
    description: 'Randevu alın, belgelerinizi yükleyin, takibinizi yapın',
    gradient: 'from-[hsl(38,92%,50%)] to-[hsl(38,92%,38%)]',
    glow: 'hsl(38,92%,55%,0.25)',
    badge: 'Hasta Portalı',
    badgeColor: 'bg-(--color-accent-muted) text-(--color-accent)',
    features: ['Randevu Al', 'Randevularım', 'Aile Üyeleri'],
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(172,66%,50%) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-8"
          style={{ background: 'radial-gradient(circle, hsl(258,60%,60%) 0%, transparent 70%)' }}
        />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(var(--color-text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-text-primary) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-(--color-primary) to-(--color-secondary) flex items-center justify-center text-lg shadow-(--shadow-glow-primary)">
            +
          </div>
          <span className="text-lg font-bold tracking-tight text-(--color-text-primary)">
            Medi<span className="text-(--color-primary)">Panel</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-(--color-success-muted) text-(--color-success) font-medium">
            ● Sistem Aktif
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-5xl mx-auto w-full animate-slide-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-(--color-primary-muted) border border-primary/20 mb-6 text-sm text-(--color-primary) font-medium">
          <span>✦</span>
          <span>Multi-Tenant Akıllı Sağlık Platformu</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-(--color-text-primary) leading-tight mb-4">
          Hastane Yönetimini
          <br />
          <span className="gradient-text">Bir Üst Seviyeye</span> Taşıyın
        </h1>

        <p className="text-(--color-text-secondary) text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
          Doktor takvimleri, hasta randevuları ve hastane operasyonlarını tek bir akıllı platformda yönetin.
          AI destekli randevu sistemi ve sosyal medya entegrasyonu ile fark yaratın.
        </p>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          {roles.map((role) => (
            <Link
              key={role.id}
              href={role.href}
              id={`role-card-${role.id}`}
              className="group relative rounded-2xl border border-(--color-border-subtle) bg-(--color-bg-surface) p-6 text-left transition-all duration-300 hover:border-(--color-border) hover:-translate-y-1"
              style={{
                ['--glow' as string]: role.glow,
              }}
            >
              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(ellipse at center, ${role.glow} 0%, transparent 70%)` }}
              />

              <div className="relative">
                {/* Badge */}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${role.badgeColor}`}>
                  {role.badge}
                </span>

                {/* Emoji */}
                <div className="text-4xl mb-3">{role.emoji}</div>

                {/* Title */}
                <h2 className="text-base font-semibold text-(--color-text-primary) mb-1.5">
                  {role.label}
                </h2>
                <p className="text-sm text-(--color-text-muted) mb-4 leading-relaxed">
                  {role.description}
                </p>

                {/* Features */}
                <ul className="space-y-1.5 mb-5">
                  {role.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-(--color-text-secondary)">
                      <span className="text-(--color-primary) shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="flex items-center gap-2 text-sm font-medium text-(--color-primary) group-hover:gap-3 transition-all duration-200">
                  <span>Giriş Yap</span>
                  <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-(--color-text-muted)">
        MediPanel v1.0 — MVP Prototipi &copy; 2026
      </footer>
    </main>
  );
}
