import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const getRedirectUrl = () => {
	// Use NEXT_PUBLIC_SITE_URL env var, fallback to localhost:3000
	const url = process?.env?.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
	// Ensure trailing slash for Supabase consistency
	return url.endsWith('/') ? url : `${url}/`;
};
