'use client';

import { createContext, useContext } from 'react';

import { format } from 'date-fns';
import useSWR from 'swr';

import { apiUrls } from 'lib/apiUrls';

import { dateFormat } from 'constants/date';

import { useDate } from './datepicker-provider';

type OverviewContextValue = {
	data: Data;
	loading: boolean;
};

const OverviewContext = createContext<OverviewContextValue | undefined>(undefined);

interface Data {
	expenses: Array<any>;
	income: Array<any>;
	subscriptions: Array<any>;
	investments: Array<any>;
	goals: Array<any>;
	mutate: {
		mutateExpenses: () => Promise<any>;
	};
}

export const OverviewContextProvider = (props: any) => {
	const { date } = useDate();
	const from = format(date.from || date.to, dateFormat);
	const to = format(date.to || date.from, dateFormat);
	const { children, ...others } = props;
	const {
		data: expensesData = [],
		isLoading: isExpenseLoading,
		mutate: mutateExpenses,
	} = useSWR(apiUrls.expenses.getExpenses({ from, to }));
	const { data: investmentsData = [], isLoading: isInvestmentsLoading } = useSWR(
		apiUrls.investments.getInvestments({ from, to })
	);
	const { data: incomeData = [], isLoading: isIncomeLoading } = useSWR(apiUrls.income.getIncome({ from, to }));
	const { data: subscriptionsData = [], isLoading: isSubscriptionsLoading } = useSWR(
		apiUrls.subscriptions.getSubscriptions({ from, to })
	);
	const { data: rawGoalsData, isLoading: isGoalsLoading } = useSWR(apiUrls.goals.getGoals());
	const goalsData = Array.isArray(rawGoalsData) ? rawGoalsData : [];

	const data = {
		expenses: expensesData,
		investments: investmentsData,
		income: incomeData,
		subscriptions: subscriptionsData,
		goals: goalsData,
		mutate: {
			mutateExpenses,
		},
	};
	const loading =
		isExpenseLoading || isInvestmentsLoading || isIncomeLoading || isSubscriptionsLoading || isGoalsLoading;

	return (
		<OverviewContext.Provider value={{ loading, data }} {...others}>
			{children}
		</OverviewContext.Provider>
	);
};

export const useOverview = () => {
	const context = useContext(OverviewContext);
	if (!context) {
		throw new Error('useOverview must be used within an OverviewContextProvider.');
	}
	return context;
};
