import { NextRequest, NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function POST(request: NextRequest) {
	const { id, amount } = await request.json();
	return await checkAuth(async (user: any) => {
		if (!id || !amount || Number(amount) <= 0) {
			return NextResponse.json(
				{ message: 'Invalid request: goal id and a positive amount are required.' },
				{ status: 400 }
			);
		}
		try {
			// 1. Fetch the goal to get its current amount and name
			const goal = await prisma.goals.findFirst({
				where: { id, user_id: user.id },
				select: { id: true, name: true, current_amount: true, target_amount: true },
			});

			if (!goal) {
				return NextResponse.json({ message: 'Goal not found.' }, { status: 404 });
			}

			const newCurrentAmount = (Number(goal.current_amount) + Number(amount)).toString();

			// 2. Update goal current_amount and create an expense atomically
			await prisma.$transaction([
				prisma.goals.update({
					where: { id },
					data: { current_amount: newCurrentAmount, updated_at: new Date() },
				}),
				// REMOVED 'await' HERE
				prisma.expenses.create({
					data: {
						name: `Saved for ${goal.name}`,
						price: String(amount),
						category: 'Goal Savings',
						notes: `GOAL_ID:${goal.id} | contribution`,
						date: new Date().toISOString().split('T')[0],
						paid_via: 'Goal',
						user_id: user.id,
					},
				}),
			]);

			return NextResponse.json({ message: 'Contribution saved', current_amount: newCurrentAmount }, { status: 200 });
		} catch (error) {
			return NextResponse.json({ message: messages.request.failed, error: String(error) }, { status: 500 });
		}
	}, false);
}
