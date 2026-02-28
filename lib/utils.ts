import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getRedirectUrl = () => {
	// Use NEXT_PUBLIC_SITE_URL first, then VERCEL_URL, then fallback to production URL
	const baseUrl =
		process?.env?.NEXT_PUBLIC_SITE_URL ||
		(process?.env?.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://dev-ko.vercel.app');
	// Redirect to /dashboard so auth tokens are received by the dashboard AuthProvider
	const url = baseUrl.endsWith('/') ? `${baseUrl}dashboard` : `${baseUrl}/dashboard`;
	return url;
};
