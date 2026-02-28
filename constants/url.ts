import { getRangeDateForFilter } from './date';
import { views } from './table';

const siteUrl =
	process.env.NEXT_PUBLIC_SITE_URL ||
	(process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
const home = siteUrl.replace(/^https?:\/\//, '');

const url = {
	homeWithoutApp: home,
	home: siteUrl,
	api: siteUrl,
	serverApi: siteUrl,
	app: {
		signin: '/signin',
		signup: '/signup',
		overview: '/',
	},
	twitter: '',
	github: '',
};

export const getApiUrl = (filterKey: string, apiPath: string, categories: string[] = [], isNotRange = false) => {
	if (isNotRange) {
		return `/api/${apiPath}`;
	}

	if (filterKey === views.all.key) {
		return `/api/${apiPath}?categories=${categories?.join(',')}`;
	}

	const [start, end] = getRangeDateForFilter(filterKey);
	return `/api/${apiPath}?from=${start}&to=${end}&categories=${categories?.join(',')}`;
};

export default url;
