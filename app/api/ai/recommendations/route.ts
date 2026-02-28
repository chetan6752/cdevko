import { NextResponse } from "next/server";
import { checkAuth } from "lib/auth"; 

export async function POST(req: Request) {
  return await checkAuth(async (user: any) => {
    try {
      const { expenses, income, goals } = await req.json();
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) throw new Error("GROQ_API_KEY missing");

      const url = "https://api.groq.com/openai/v1/chat/completions";

      const payload = {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are "DevKo AI Advisor", an aggressive but empathetic financial planner. Analyze the user's spending behavior. 
            Identify past money leaks (where they overspent based on standard ratios) and create a strict future budget plan to hit their stated goals.
            Return ONLY a valid JSON object. No markdown, no backticks, no extra text.
            Format exactly like this: 
            { 
              "past_analysis": {
                "total_potential_savings": 2500,
                "leaks": ["You spent highly on dining out.", "High unused subscription costs."]
              },
              "future_plan": {
                "target_monthly_savings": 5000,
                "budget_adjustments": [
                  {"category": "Food & Dining", "new_limit": 3000, "reason": "Cutting this gets you 3 months closer to your 10-year goal."}
                ]
              },
              "action_steps": ["Cancel Netflix to save ₹500", "Automate ₹2000 SIP transfer on the 1st of every month."]
            }`
          },
          {
            role: "user",
            content: `Income: ${JSON.stringify(income)}\nExpenses: ${JSON.stringify(expenses)}\nGoals: ${JSON.stringify(goals)}`
          }
        ],
        response_format: { type: "json_object" } 
      };

      const response = await fetch(url, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || "Groq API Error");

      // Parse the JSON safely
      const aiContent = data.choices[0].message.content;
      return NextResponse.json(JSON.parse(aiContent));

    } catch (error: any) {
      console.error("[ai/recommendations] Error:", error.message);
      return NextResponse.json({ 
        past_analysis: { total_potential_savings: 0, leaks: ["Analysis unavailable."] },
        future_plan: { target_monthly_savings: 0, budget_adjustments: [] },
        action_steps: ["Service temporarily offline."]
      }, { status: 500 });
    }
  });
}