import { NextResponse } from 'next/server';

import prisma from 'lib/prisma';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		console.log('[MCP Payload Received]:', body);

		// 1. We now expect ChatGPT to send the user's email too!
		if (!body.amount || !body.category || !body.userEmail) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// 2. Look up the ACTUAL user dynamically using their email
		const user = await prisma.users.findFirst({
			where: { email: body.userEmail },
		});

		if (!user) {
			return NextResponse.json({ error: 'User not found in DevKo database' }, { status: 404 });
		}

		// 3. Save the expense using the dynamic user.id
		const newExpense = await prisma.expenses.create({
			data: {
				name: body.name || 'Voice Entry',
				price: String(body.amount),
				category: body.category || 'Other',
				paid_via: 'Voice AI',
				date: new Date().toISOString().split('T')[0],
				user_id: user.id, // <-- DYNAMIC ID HERE!
			},
		});

		return NextResponse.json({ success: true, message: `Logged for ${user.email}` });
	} catch (error: any) {
		return NextResponse.json({ error: 'Failed to log transaction', details: error.message }, { status: 500 });
	}
}
