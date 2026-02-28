import { NextRequest, NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function GET() {
	return await checkAuth(async (user: any) => {
		try {
			const data = await prisma.goals.findMany({
				where: { user_id: user.id },
				orderBy: { created_at: 'desc' },
				select: {
					id: true,
					name: true,
					target_amount: true,
					current_amount: true,
					category: true,
					deadline: true,
					created_at: true,
					updated_at: true,
				},
			});
			return NextResponse.json(data);
		} catch (error) {
			return NextResponse.json({ message: messages.request.failed, error: String(error) }, { status: 500 });
		}
	});
}

// app/api/goals/route.ts

export async function DELETE(request: NextRequest) {
	const { id } = await request.json();
	return await checkAuth(async (user: any) => {
		if (!id) return NextResponse.json(messages.request.invalid, { status: 400 });

		try {
			const goal = await prisma.goals.findFirst({
				where: { id, user_id: user.id },
				select: { id: true, name: true, current_amount: true },
			});

			if (!goal) return NextResponse.json({ message: 'Goal not found.' }, { status: 404 });

			await prisma.goals.delete({ where: { id: goal.id } });

			return NextResponse.json(
				{
					message: 'deleted',
					deletedGoalId: goal.id,
					preservedContributionHistory: true,
				},
				{ status: 200 }
			);
		} catch (error) {
			return NextResponse.json({ message: messages.request.failed, error: String(error) }, { status: 500 });
		}
	});
}

export async function PUT(request: NextRequest) {
	const { id, name, target_amount, current_amount, category, deadline } = await request.json();
	return await checkAuth(async () => {
		if (!id) {
			return NextResponse.json(messages.request.invalid, { status: 400 });
		}
		try {
			await prisma.goals.update({
				data: { name, target_amount, current_amount, category, deadline },
				where: { id },
			});
			return NextResponse.json('updated', { status: 200 });
		} catch (error) {
			return NextResponse.json({ message: messages.request.failed, error: String(error) }, { status: 500 });
		}
	});
}
