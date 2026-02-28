import LayoutHeader from 'components/layout/header';

import GoalsClient from './goals-client';

const title = 'FinTracker – Goals';
const description = 'Create goals, add money, and manage your savings progress.';
export const metadata = {
	title,

	description,
};
export default function GoalsPage() {
	return (
		<>
			<LayoutHeader title="goals" />

			<GoalsClient />
		</>
	);
}
