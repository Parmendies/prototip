import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Hasta Korumalı Rotalar (/patient/*)
  if (pathname.startsWith('/patient')) {
    const patientCookie = request.cookies.get('dp_patient_session')?.value;
    if (!patientCookie) {
      const loginUrl = new URL('/giris', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Sekreter & Banko Korumalı Rotalar (/secretary/*)
  if (pathname.startsWith('/secretary')) {
    const staffCookie = request.cookies.get('dp_staff_session')?.value;
    if (!staffCookie) {
      const loginUrl = new URL('/personel-giris', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Hekim Korumalı Rotalar (/doctor/*) ve danışma kiosku (/kiosk: banko personeli tablette bir kez giriş yapar)
  if (pathname.startsWith('/doctor') || pathname.startsWith('/kiosk')) {
    const staffCookie = request.cookies.get('dp_staff_session')?.value;
    if (!staffCookie) {
      const loginUrl = new URL('/personel-giris', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/patient/:path*',
    '/secretary/:path*',
    '/doctor/:path*',
    '/kiosk/:path*',
  ],
};

