import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Routes that require authentication
const protectedRoutes = ['/dashboard'];
// Routes only for unauthenticated users
const authRoutes = ['/signin', '/signup'];
// Public routes that anyone can access
const publicRoutes = ['/', '/privacy'];

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const { pathname } = req.nextUrl;

	const supabase = createMiddlewareClient({ req, res });
	const { data } = await supabase.auth.getSession();
	const { session } = data;

	const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
	const isAuthRoute = authRoutes.some((route) => pathname === route);
	const isPublicRoute = publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

	// Logged-in user visiting auth pages or landing → redirect to dashboard
	if (session && (isAuthRoute || pathname === '/')) {
		return NextResponse.redirect(new URL('/dashboard', req.url));
	}

	// Unauthenticated user visiting protected routes → allow through
	// The AuthProvider in the dashboard layout handles client-side auth:
	// - It picks up Supabase magic link tokens from the URL hash
	// - It redirects to /signin if no tokens and no session are found

	return res;
}

export const config = {
	matcher: [
		/*
		 * Match all paths except for:
		 * 1. /api/ routes
		 * 2. /_next/ (Next.js internals)
		 * 3. /_proxy/ (special page for OG tags proxying)
		 * 4. /_static (inside /public)
		 * 5. /_vercel (Vercel internals)
		 * 6. /favicon.ico, /sitemap.xml, robots.txt (static files)
		 */
		'/((?!api/|_next/|_proxy/|_static|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};
