import { NextRequest, NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';
import prisma from 'lib/prisma';

import messages from 'constants/messages';

export async function POST(request: NextRequest) {
	const { name, target_amount, current_amount = '0', category, deadline } = await request.json();
	return await checkAuth(async (user: any) => {
		try {
			await prisma.goals.create({
				data: { name, target_amount, current_amount, category, deadline, user_id: user.id },
			});
			return NextResponse.json('added', { status: 201 });
		} catch (error) {
			return NextResponse.json({ message: messages.request.failed, error: String(error) }, { status: 500 });
		}
	}, false);
}
