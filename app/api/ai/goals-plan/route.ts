import { NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

export const dynamic = 'force-dynamic';

type MilestoneRecommendation = {
	title: string;
	description: string;
};

type Milestone = {
	title: string;
	month: string;
	target_amount: number;
	note: string;
	recommendations: MilestoneRecommendation[];
};

type GoalPlan = {
	summary: string;
	suggested_monthly_save: number;
	time_horizon_months: number;
	monthly_budget_split: {
		income: number;
		estimated_expenses: number;
		recommended_goal_contribution: number;
		leftover_for_buffer: number;
	};
	milestones: Milestone[];
	action_steps: string[];
};

const formatMonth = (date: Date) =>
	new Intl.DateTimeFormat('en-IN', {
		month: 'short',
		year: 'numeric',
	}).format(date);

const buildDefaultRecommendations = ({
	monthlyAmount,
	monthsLeft,
}: {
	monthlyAmount: number;
	monthsLeft: number;
}): MilestoneRecommendation[] => {
	const hasLongerHorizon = monthsLeft >= 12;
	return [
		{
			title: 'SIP in Liquid/Ultra Short Debt Fund',
			description: `Start a monthly SIP of around ₹${monthlyAmount.toLocaleString('en-IN')} for low-volatility accumulation.`,
		},
		{
			title: hasLongerHorizon ? 'Balanced Mutual Fund SIP' : 'Recurring Deposit / Short FD',
			description: hasLongerHorizon
				? 'For longer horizons, allocate a smaller portion to a balanced or hybrid mutual fund for growth potential.'
				: 'For short horizons, prefer safer capital-preservation options like RD or short fixed deposits.',
		},
		{
			title: 'Auto-transfer to Goal Wallet',
			description: 'On salary day, auto-transfer this month target so spending decisions do not interrupt progress.',
		},
	];
};

const buildMonthlyMilestones = ({
	monthsLeft,
	remainingAmount,
	suggestedMonthlySave,
}: {
	monthsLeft: number;
	remainingAmount: number;
	suggestedMonthlySave: number;
}) => {
	const now = new Date();
	let cumulativeTarget = 0;

	return Array.from({ length: monthsLeft }).map((_, index) => {
		const monthIndex = index + 1;
		const monthDate = new Date(now.getFullYear(), now.getMonth() + monthIndex, 1);
		cumulativeTarget = Math.min(remainingAmount, cumulativeTarget + suggestedMonthlySave);

		return {
			title: `Month ${monthIndex}`,
			month: formatMonth(monthDate),
			target_amount: cumulativeTarget,
			note:
				monthIndex === monthsLeft
					? 'Final push month: complete the remaining amount and lock the goal.'
					: 'Save this month target and review your progress before next month.',
			recommendations: buildDefaultRecommendations({ monthlyAmount: suggestedMonthlySave, monthsLeft }),
		};
	});
};

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
}): GoalPlan => {
	const suggestedMonthlySave = Math.ceil(remainingAmount / Math.max(1, monthsLeft));
	const disposableIncome = Math.max(0, monthlyIncome - monthlyExpense);
	const cushionAmount = Math.max(0, disposableIncome - suggestedMonthlySave);
	const milestones = buildMonthlyMilestones({ monthsLeft, remainingAmount, suggestedMonthlySave });

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
			'Create a monthly review reminder to check if you met your goal contribution target.',
			'Redirect bonus/incentive income into this goal to reduce your completion timeline.',
		],
	};
};

const normalizeRecommendations = (
	recommendations: any,
	fallbackRecommendations: MilestoneRecommendation[]
): MilestoneRecommendation[] => {
	if (!Array.isArray(recommendations) || !recommendations.length) return fallbackRecommendations;

	const normalized = recommendations
		.map((item: any) => ({
			title: typeof item?.title === 'string' && item.title.trim() ? item.title : '',
			description: typeof item?.description === 'string' && item.description.trim() ? item.description : '',
		}))
		.filter((item: MilestoneRecommendation) => item.title && item.description);

	return normalized.length ? normalized : fallbackRecommendations;
};

const normalizeAIPlan = (plan: any, fallbackPlan: GoalPlan): GoalPlan => {
	const aiMilestones = Array.isArray(plan?.milestones) ? plan.milestones : [];
	const normalizedMilestones =
		aiMilestones.length >= fallbackPlan.time_horizon_months
			? aiMilestones.slice(0, fallbackPlan.time_horizon_months).map((milestone: any, index: number) => ({
					title: milestone?.title || `Month ${index + 1}`,
					month: milestone?.month || fallbackPlan.milestones[index]?.month,
					target_amount:
						typeof milestone?.target_amount === 'number'
							? milestone.target_amount
							: fallbackPlan.milestones[index]?.target_amount,
					note: milestone?.note || fallbackPlan.milestones[index]?.note,
					recommendations: normalizeRecommendations(
						milestone?.recommendations,
						fallbackPlan.milestones[index]?.recommendations || []
					),
			  }))
			: fallbackPlan.milestones;

	return {
		summary: typeof plan?.summary === 'string' && plan.summary.trim() ? plan.summary : fallbackPlan.summary,
		suggested_monthly_save:
			typeof plan?.suggested_monthly_save === 'number' && plan.suggested_monthly_save > 0
				? plan.suggested_monthly_save
				: fallbackPlan.suggested_monthly_save,
		time_horizon_months: fallbackPlan.time_horizon_months,
		monthly_budget_split: {
			income:
				typeof plan?.monthly_budget_split?.income === 'number'
					? plan.monthly_budget_split.income
					: fallbackPlan.monthly_budget_split.income,
			estimated_expenses:
				typeof plan?.monthly_budget_split?.estimated_expenses === 'number'
					? plan.monthly_budget_split.estimated_expenses
					: fallbackPlan.monthly_budget_split.estimated_expenses,
			recommended_goal_contribution:
				typeof plan?.monthly_budget_split?.recommended_goal_contribution === 'number'
					? plan.monthly_budget_split.recommended_goal_contribution
					: fallbackPlan.monthly_budget_split.recommended_goal_contribution,
			leftover_for_buffer:
				typeof plan?.monthly_budget_split?.leftover_for_buffer === 'number'
					? plan.monthly_budget_split.leftover_for_buffer
					: fallbackPlan.monthly_budget_split.leftover_for_buffer,
		},
		milestones: normalizedMilestones,
		action_steps:
			Array.isArray(plan?.action_steps) && plan.action_steps.length >= 3
				? plan.action_steps
				: fallbackPlan.action_steps,
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
								'You are a financial goal planner. Return ONLY a JSON object with keys: summary, suggested_monthly_save, time_horizon_months, monthly_budget_split, milestones, and action_steps. IMPORTANT: milestones must be month-wise with one entry for EACH month of time_horizon_months. Each milestone must have title, month, target_amount, note, and recommendations (array of actionable options with title and description). Recommendations should include practical options like SIP, mutual funds, ETFs, and safer alternatives depending on timeline/risk. Include at least 3 action_steps. No markdown.',
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
			return NextResponse.json(normalizeAIPlan(aiContent, fallbackPlan));
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