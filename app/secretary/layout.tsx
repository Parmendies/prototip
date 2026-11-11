import Link from 'next/link';
import { requireSecretaryOrAdmin } from '@/lib/auth/dal';
import { logoutStaffAction } from '@/app/(auth)/personel-giris/actions';
import { LogOut } from 'lucide-react';
import { SecretaryNav } from './_components/SecretaryNav';

export default async function SecretaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireSecretaryOrAdmin();

  return (
    <div className="min-h-screen bg-(--color-bg-base) flex flex-col">
      {/* Top Secretary Navigation Bar */}
      <header className="bg-white border-b border-(--color-border-subtle) px-6 py-3.5 sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/secretary/desk" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-(--color-primary) text-white font-black flex items-center justify-center text-sm shadow-(--shadow-glow-primary)">
                ✦
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-(--color-text-primary) block leading-tight">
                  Denta<span className="text-(--color-primary)">Panel</span> Banko
                </span>
                <span className="text-[10px] text-(--color-text-muted) uppercase font-semibold">
                  Resepsiyon & Kasa Masası
                </span>
              </div>
            </Link>

            <SecretaryNav variant="desktop" />
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-(--color-text-primary) block leading-tight">
                {staff.fullName}
              </span>
              <span className="text-[11px] font-semibold text-(--color-text-secondary) capitalize">
                {staff.role === 'secretary' ? 'Banko / Sekreter' : 'Klinik Yöneticisi'}
              </span>
            </div>

            <form action={logoutStaffAction}>
              <button
                type="submit"
                title="Çıkış Yap"
                className="min-h-[44px] px-3 py-2 rounded-xl text-(--color-text-secondary) hover:text-(--color-error) hover:bg-red-50 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-transparent hover:border-red-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <SecretaryNav variant="mobile" />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {children}
      </main>
    </div>
  );
}

