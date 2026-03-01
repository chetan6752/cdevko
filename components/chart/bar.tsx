'use client';

import { useMemo } from 'react';

import { BarChart } from '@tremor/react';

import { useUser } from 'components/context/auth-provider';
import { useOverview } from 'components/context/overview-provider';
import ChartLoader from 'components/loader/chart';

import { formatCurrency, formatDate } from 'lib/formatter';

type ExpenseDatum = {
	date: string;
	price: string | number;
	category: string;
};

type ChartDatum = {
	date: string;
	dateSortKey: string;
	[key: string]: string | number;
};

const dateStyle = { day: '2-digit', month: 'short', year: '2-digit' };

const customTooltip = ({ payload, active, user }: { payload?: any; active?: boolean; user: any }) => {
	if (!active || !payload?.length) return null;
	return (
		<div className="w-60 rounded-tremor-default border border-tremor-border bg-tremor-background p-2 text-tremor-default shadow-tremor-dropdown">
			{payload.map((item: any, idx: number) => (
				<div className="flex items-center justify-between" key={idx}>
					<span className="mr-3 capitalize text-black">{item.dataKey}</span>
					<span className="text-black">
						{formatCurrency({ value: item.value, currency: user.currency, locale: user.locale })}
					</span>
				</div>
			))}
		</div>
	);
};

export default function ExpesenseChart() {
	const user = useUser();
	const { data, loading } = useOverview();

	const categoriesData = useMemo(() => {
		return Array.from(new Set((data.expenses as ExpenseDatum[]).map((expense) => expense.category))).sort();
	}, [data.expenses]);

	const chartData = useMemo<ChartDatum[]>(() => {
		const groupedByDate = (data.expenses as ExpenseDatum[]).reduce(
			(acc, expense) => {
				const dateSortKey = new Date(expense.date).toISOString().split('T')[0];
				if (!acc[dateSortKey]) {
					acc[dateSortKey] = {
						dateSortKey,
						date: formatDate({ date: dateSortKey, locale: user.locale, dateStyle }),
					};
				}

				acc[dateSortKey][expense.category] =
					Number(acc[dateSortKey][expense.category] ?? 0) + Number(expense.price);

				return acc;
			},
			{} as Record<string, ChartDatum>
		);

		return Object.values(groupedByDate)
			.sort((a, b) => a.dateSortKey.localeCompare(b.dateSortKey))
			.map(({ dateSortKey, ...datum }) => datum as ChartDatum);
	}, [data.expenses, user.locale]);

	const maxYAxisValue = useMemo(() => {
		if (!chartData.length || !categoriesData.length) return undefined;
		return Math.max(
			...chartData.map((datum) =>
				categoriesData.reduce((total, category) => total + Number(datum[category] ?? 0), 0)
			)
		);
	}, [chartData, categoriesData]);

	if (loading) {
		return <ChartLoader className="h-[340px]" type="bar" />;
	}

	if (!chartData.length) {
		return <p className="flex h-80 items-center justify-center text-sm">No data</p>;
	}

	return (
		<BarChart
			className="-mt-4 h-96"
			data={chartData}
			index="date"
			categories={categoriesData}
			valueFormatter={(value) => {
				return formatCurrency({ value, currency: user.currency, locale: user.locale });
			}}
			yAxisWidth={84}
			maxValue={maxYAxisValue}
			customTooltip={(props) => customTooltip({ ...props, user })}
			showLegend
			showGridLines
			stack={false}
		/>
	);
}