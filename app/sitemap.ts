import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url:'',
			lastModified: new Date(),
		},
		{
			url: '',
			lastModified: new Date(),
		},
		{
			url: '/signin',
			lastModified: new Date(),
		},
		{
			url: '/siginup',
			lastModified: new Date(),
		},
		{
			url: '/expenses',
			lastModified: new Date(),
		},
		{
			url: '/income',
			lastModified: new Date(),
		},
		{
			url: '/investments',
			lastModified: new Date(),
		},
		{
			url: '/settings',
			lastModified: new Date(),
		},
	];
}
