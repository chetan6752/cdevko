import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
	const res = NextResponse.next();
	const url = req.nextUrl;

	// In local dev, treat all requests as coming from the 'app' subdomain
	// so that localhost:3000 routes correctly to the dashboard
	const currentHost = 'app';

	const supabase = createMiddlewareClient({ req, res });
	const { data } = await supabase.auth.getSession();
	const { session } = data;

	if (currentHost === 'app') {
		if (url.pathname === '/signin' || url.pathname === '/signup') {
			if (session) {
				url.pathname = '/';
				return NextResponse.redirect(url);
			}
			return res;
		}

		url.pathname = `/dashboard${url.pathname}`;
		return NextResponse.rewrite(url);
	}

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
		 * 6. /favicon.ico, /sitemap.xml (static files)
		 */
		'/((?!api/|_next/|_proxy/|_static|_vercel|favicon.ico|sitemap.xml).*)',
	],
};
