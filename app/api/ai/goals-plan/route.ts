import { NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

type Milestone = {
	title: string;
	month: string;
	target_amount: number;
	note: string;
};

const formatMonth = (date: Date) =>
	new Intl.DateTimeFormat('en-IN', {
		month: 'short',
		year: 'numeric',
	}).format(date);

const buildFallbackPlan = ({
	goalName,
	remainingAmount,
	monthsLeft,
	monthlyIncome,
	monthlyExpense,
}: {
	goalName: string;
	remainingAmount: number;
	monthsLeft: number;
	monthlyIncome: number;
	monthlyExpense: number;
}) => {
	const suggestedMonthlySave = Math.ceil(remainingAmount / Math.max(1, monthsLeft));
	const disposableIncome = Math.max(0, monthlyIncome - monthlyExpense);
	const cushionAmount = Math.max(0, disposableIncome - suggestedMonthlySave);
	const milestoneOne = Math.round(remainingAmount * 0.33);
	const milestoneTwo = Math.round(remainingAmount * 0.66);
	const now = new Date();

	const milestones: Milestone[] = [
		{
			title: 'Kickoff phase',
			month: formatMonth(new Date(now.getFullYear(), now.getMonth() + Math.max(1, Math.floor(monthsLeft / 3)), 1)),
			target_amount: milestoneOne,
			note: 'Build momentum with automated transfer and avoid non-essential purchases.',
		},
		{
			title: 'Midpoint checkpoint',
			month: formatMonth(new Date(now.getFullYear(), now.getMonth() + Math.max(1, Math.floor((monthsLeft * 2) / 3)), 1)),
			target_amount: milestoneTwo,
			note: 'Review progress and increase contribution by 5-10% if possible.',
		},
		{
			title: 'Goal completion',
			month: formatMonth(new Date(now.getFullYear(), now.getMonth() + Math.max(1, monthsLeft), 1)),
			target_amount: remainingAmount,
			note: 'Complete final contribution and celebrate the milestone.',
		},
	];

	return {
		summary: `To complete ${goalName}, save around ${suggestedMonthlySave.toLocaleString('en-IN')} each month for the next ${monthsLeft} month(s).`,
		suggested_monthly_save: suggestedMonthlySave,
		time_horizon_months: monthsLeft,
		monthly_budget_split: {
			income: monthlyIncome,
			estimated_expenses: monthlyExpense,
			recommended_goal_contribution: suggestedMonthlySave,
			leftover_for_buffer: cushionAmount,
		},
		milestones,
		action_steps: [
			`Set up an automatic transfer of ${suggestedMonthlySave.toLocaleString('en-IN')} on salary day.`,
			'Pause or reduce one discretionary expense category and redirect savings to this goal.',
			'Review progress every month and adjust contributions after any income/expense changes.',
		],
	};
};

export async function POST(req: Request) {
	return checkAuth(async (user: any) => {
		try {
			const { goalId } = await req.json();
			if (!goalId) {
				return NextResponse.json({ message: 'Goal id is required.' }, { status: 400 });
			}

			const [goal, incomeRows, expenseRows] = await Promise.all([
				prisma.goals.findFirst({
					where: { id: goalId, user_id: user.id },
					select: {
						id: true,
						name: true,
						target_amount: true,
						current_amount: true,
						deadline: true,
						category: true,
					},
				}),
				prisma.income.findMany({ where: { user_id: user.id }, select: { price: true } }),
				prisma.expenses.findMany({ where: { user_id: user.id }, select: { price: true } }),
			]);

			if (!goal) {
				return NextResponse.json({ message: 'Goal not found.' }, { status: 404 });
			}

			const targetAmount = Number(goal.target_amount);
			const currentAmount = Number(goal.current_amount);
			const remainingAmount = Math.max(0, targetAmount - currentAmount);
			const deadlineDate = new Date(goal.deadline);
			const now = new Date();
			const monthsLeft = Math.max(
				1,
				(deadlineDate.getFullYear() - now.getFullYear()) * 12 + (deadlineDate.getMonth() - now.getMonth())
			);
			const monthlyIncome = incomeRows.reduce((acc, row) => acc + Number(row.price), 0);
			const monthlyExpense = expenseRows.reduce((acc, row) => acc + Number(row.price), 0);

			const fallbackPlan = buildFallbackPlan({
				goalName: goal.name,
				remainingAmount,
				monthsLeft,
				monthlyIncome,
				monthlyExpense,
			});

			const apiKey = process.env.GROQ_API_KEY;
			if (!apiKey || remainingAmount <= 0) {
				return NextResponse.json(fallbackPlan);
			}

			const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify({
					model: 'llama-3.3-70b-versatile',
					messages: [
						{
							role: 'system',
							content:
								'You are a financial goal planner. Return ONLY a JSON object with keys: summary, suggested_monthly_save, time_horizon_months, monthly_budget_split, milestones (array with title/month/target_amount/note), and action_steps (array). No markdown.',
						},
						{
							role: 'user',
							content: `Goal: ${JSON.stringify(goal)}\nRemaining Amount: ${remainingAmount}\nMonths Left: ${monthsLeft}\nMonthly Income Estimate: ${monthlyIncome}\nMonthly Expenses Estimate: ${monthlyExpense}`,
						},
					],
					response_format: { type: 'json_object' },
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error?.message || 'Groq API Error');
			}

			const aiContent = JSON.parse(data.choices?.[0]?.message?.content || '{}');
			return NextResponse.json({ ...fallbackPlan, ...aiContent });
		} catch (error: any) {
			console.error('[ai/goals-plan] Error:', error.message);
			return NextResponse.json({
				summary: 'AI planning is temporarily unavailable. Please try again shortly.',
				suggested_monthly_save: 0,
				time_horizon_months: 0,
				monthly_budget_split: {
					income: 0,
					estimated_expenses: 0,
					recommended_goal_contribution: 0,
					leftover_for_buffer: 0,
				},
				milestones: [],
				action_steps: ['Retry in a few minutes.'],
			});
		}
	});
}