import { NextResponse } from 'next/server';

import prisma from 'lib/prisma';

export async function POST(req: Request) {
	try {
		const body = await req.json();
		console.log('[MCP Payload Received]:', body);

		if (!body.amount || !body.category || !body.userEmail) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// 1. Try to find the exact user (ignoring uppercase/lowercase issues)
		let user = await prisma.users.findFirst({
			where: {
				email: {
					equals: body.userEmail,
					mode: 'insensitive', // This fixes case-matching bugs!
				},
			},
		});

		// 2. THE DEMO SAVER: If the email doesn't match Vercel's DB, grab the first user available.
		if (!user) {
			console.warn(`[Fallback Triggered]: Email ${body.userEmail} not found. Grabbing first user for demo.`);
			user = await prisma.users.findFirst();
		}

		// 3. If it's STILL null, it means your Vercel database has literally 0 users in it.
		if (!user) {
			return NextResponse.json(
				{
					error: 'Vercel database is empty! Go to your live website and sign up first.',
				},
				{ status: 404 }
			);
		}

		const newExpense = await prisma.expenses.create({
			data: {
				name: body.name || 'Voice Entry',
				price: String(body.amount),
				category: body.category || 'Other',
				paid_via: 'Voice AI',
				date: new Date().toISOString().split('T')[0],
				user_id: user.id,
			},
		});

		return NextResponse.json({
			success: true,
			message: `Successfully logged ${body.name} for ₹${body.amount}`,
		});
	} catch (error: any) {
		console.error('[MCP Critical Error]:', error);
		return NextResponse.json({ error: 'Failed to log transaction', details: error.message }, { status: 500 });
	}
}
