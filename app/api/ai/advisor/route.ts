import { NextResponse } from 'next/server';

import { checkAuth } from 'lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
	return await checkAuth(async (user: any) => {
		try {
			const { expenses, income, goals } = await req.json();
			const apiKey = process.env.GROQ_API_KEY;

			if (!apiKey) throw new Error('GROQ_API_KEY missing');

			const url = 'https://api.groq.com/openai/v1/chat/completions';

			const payload = {
				model: 'llama-3.3-70b-versatile', // Fast, free, and smart
				messages: [
					{
						role: 'system',
						content: `You are "DevKo AI Advisor". Return ONLY a valid JSON object. No markdown, no backticks, no extra text.
            Format: { "score": 85, "analysis": ["insight 1", "insight 2"], "tip": "action tip", "explanation": "why" }`,
					},
					{
						role: 'user',
						content: `Income: ${JSON.stringify(income)}\nExpenses: ${JSON.stringify(expenses)}\nGoals: ${JSON.stringify(goals)}`,
					},
				],
				response_format: { type: 'json_object' }, // Forces Groq to return perfect JSON
			};

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${apiKey}`,
				},
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (!response.ok) throw new Error(data.error?.message || 'Groq API Error');

			// Parse the JSON safely
			const aiContent = data.choices[0].message.content;
			return NextResponse.json(JSON.parse(aiContent));
		} catch (error: any) {
			console.error('[ai/advisor] Error:', error.message);
			return NextResponse.json(
				{
					score: 0,
					analysis: ['Analysis currently unavailable.'],
					tip: 'Switching to backup AI servers...',
					explanation: error.message,
				},
				{ status: 500 }
			);
		}
	});
}
