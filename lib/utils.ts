import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getRedirectUrl = () => {
	// Use NEXT_PUBLIC_SITE_URL env var, fallback to production URL
	const url = process?.env?.NEXT_PUBLIC_SITE_URL || 'https://dev-ko.vercel.app';
	// Ensure trailing slash for Supabase consistency
	return url.endsWith('/') ? url : `${url}/`;
};
