import { NextResponse } from 'next/server';

import prisma from 'lib/prisma';

export async function POST(req: Request) {
	try {
		const { amount, category, name } = await req.json();

		const MY_USER_ID = 'YOUR_USER_ID_HERE';

		const newExpense = await prisma.expenses.create({
			data: {
				name: name || 'Voice Entry',
				price: String(amount),
				category: category || 'Other',
				paid_via: 'Voice AI',
				date: new Date().toISOString().split('T')[0],
				user_id: MY_USER_ID,
			},
		});

		return NextResponse.json({
			success: true,
			message: `Successfully logged ${name} for ₹${amount}`,
		});
	} catch (error: any) {
		console.error('[MCP Error]:', error);
		return NextResponse.json({ error: 'Failed to log transaction' }, { status: 500 });
	}
}
