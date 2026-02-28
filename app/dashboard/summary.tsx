'use client';

import { Banknote, Briefcase, Flag, MoveDownRight, MoveUpRight, PiggyBank, PlayIcon, Wallet2 } from 'lucide-react';

import { useUser } from 'components/context/auth-provider';
import { useOverview } from 'components/context/overview-provider';
import CardLoader from 'components/loader/card';
import { Badge } from 'components/ui/badge';

import { formatCurrency } from 'lib/formatter';
import { cn } from 'lib/utils';

import SummaryCard from '../../components/card/summary-card';

const Info = ({ value }: { value: number }) => {
	const isUp = value > 0;
	const Icon = isUp ? MoveUpRight : MoveDownRight;
	return (
		<Badge
			variant="secondary"
			className={`absolute bg-transparent tabular-nums font-semibold bottom-[5px] right-[5px] h-[18px] px-1 text-[10px] text-muted-foreground ${cn(
				{
					'text-green-600': isUp,
					'text-red-600': !isUp,
				}
			)}`}
		>
			<Icon className="mr-[0.5] h-[0.65rem] w-[0.65rem]" />
			{value}%
		</Badge>
	);
};

export default function Summary() {
	const user = useUser();
	const { data, loading } = useOverview();

	const totalExpenses = data.expenses.reduce((acc: any, { price }: any) => Number(price) + acc, 0);
	const totalIncome = data.income.reduce((acc: any, { price }: any) => Number(price) + acc, 0);
	const totalInvesments = data.investments.reduce(
		(acc: any, { price, units }: any) => Number(price) * Number(units) + acc,
		0
	);
	const totalSubscriptions = data.subscriptions.reduce(
		(acc: any, { price, paid_dates }: any) => Number(price) * paid_dates.length + acc,
		0
	);
	const safeGoals = Array.isArray(data.goals) ? data.goals : [];
	const totalGoalsTarget = safeGoals.reduce((acc: any, { target_amount }: any) => Number(target_amount) + acc, 0);
	const totalGoalsCurrent = safeGoals.reduce((acc: any, { current_amount }: any) => Number(current_amount) + acc, 0);
	const goalsProgress = totalGoalsTarget > 0 ? Math.min(100, Math.round((totalGoalsCurrent / totalGoalsTarget) * 100)) : 0;
	const totalSpent = totalExpenses + totalInvesments + totalSubscriptions;
	const totalBalance = totalIncome - totalSpent;

	return (
		<>
			<h2 className="mb-4 font-semibold text-primary dark:text-white">Summary</h2>
			{loading ? (
				<CardLoader cards={5} />
			) : (
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5">
					<SummaryCard
						icon={Briefcase}
						title="total income"
						data={formatCurrency({ value: totalIncome, currency: user.currency, locale: user.locale })}
					/>
					<SummaryCard
						icon={Wallet2}
						title="available balance"
						data={formatCurrency({ value: totalBalance, currency: user.currency, locale: user.locale })}
					/>
					<SummaryCard
						icon={Banknote}
						title="total spent"
						tooltip="Total of expenses + investments + subscriptions"
						data={formatCurrency({ value: totalSpent, currency: user.currency, locale: user.locale })}
					/>
					<SummaryCard
						icon={PiggyBank}
						title="total investment"
						data={formatCurrency({ value: totalInvesments, currency: user.currency, locale: user.locale })}
					/>
					<SummaryCard
						icon={PlayIcon}
						title="total subscriptions"
						data={formatCurrency({ value: totalSubscriptions, currency: user.currency, locale: user.locale })}
					/>
					<SummaryCard
						icon={Flag}
						title="total goals"
						tooltip={`${goalsProgress}% saved across all goals`}
						data={
							<span className="text-base font-bold tabular-nums">
								{formatCurrency({ value: totalGoalsCurrent, currency: user.currency, locale: user.locale })}{' '}
								<span className="text-sm font-normal text-muted-foreground">/ {formatCurrency({ value: totalGoalsTarget, currency: user.currency, locale: user.locale })}</span>
							</span>
						}
						subData={
							<>
								<div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
									<div className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${goalsProgress}%` }} />
								</div>
								<p className="mt-1 text-xs text-muted-foreground">{goalsProgress}% saved overall</p>
							</>
						}
					/>
				</div>
			)}
		</>
	);
}
