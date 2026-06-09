import { NextResponse, type NextRequest } from 'next/server';
import { COOKIE_KEYS, ROLES, ROUTES } from '@/constants';

// Paths that are accessible without authentication.
const PUBLIC_PATHS = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.PRIVACY, ROUTES.TERMS];

// Paths that are public AND should remain accessible even to logged-in users.
// (i.e. the marketing site, privacy policy, terms — never bounce these to the dashboard)
const ALWAYS_PUBLIC_PATHS = [ROUTES.HOME, ROUTES.PRIVACY, ROUTES.TERMS];

const isPublic = (path: string) => PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));
const isAlwaysPublic = (path: string) =>
  ALWAYS_PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Root marketing page is always public — let it through without any auth checks.
  if (isAlwaysPublic(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_KEYS.AUTH_TOKEN)?.value;
  const role = req.cookies.get(COOKIE_KEYS.AUTH_ROLE)?.value;

  // Block dashboard routes when not authenticated.
  const isCompany = pathname.startsWith(ROUTES.COMPANY.ROOT);
  const isAdmin = pathname.startsWith(ROUTES.ADMIN.ROOT);

  if ((isCompany || isAdmin) && !token) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.LOGIN;
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAdmin && role !== ROLES.SUPER_ADMIN) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.COMPANY.DASHBOARD;
    return NextResponse.redirect(url);
  }

  if (isCompany && role !== ROLES.COMPANY_ADMIN) {
    const url = req.nextUrl.clone();
    url.pathname = ROUTES.ADMIN.DASHBOARD;
    return NextResponse.redirect(url);
  }

  // If already authenticated and visiting login/register, push to the right dashboard.
  if (token && isPublic(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = role === ROLES.SUPER_ADMIN ? ROUTES.ADMIN.DASHBOARD : ROUTES.COMPANY.DASHBOARD;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/.*).*)'],
};
