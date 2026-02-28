'use client';

import { AlertCircle, Lightbulb, Sparkles, TrendingUp } from 'lucide-react';
import useSWR from 'swr';

import { useOverview } from 'components/context/overview-provider';
import { Card, CardContent, CardHeader } from 'components/ui/card';
import { Skeleton } from 'components/ui/skeleton';

type AIReport = {
	score: number;
	analysis: string[];
	tip: string;
	explanation: string;
};

/** Animated SVG arc ring showing the financial health score (0-100). */
function ScoreRing({ score }: { score: number }) {
	const radius = 40;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;
	const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

	return (
		<div className="relative flex items-center justify-center">
			<svg width="100" height="100" className="-rotate-90" aria-hidden="true">
				<circle
					cx="50"
					cy="50"
					r={radius}
					fill="none"
					stroke="currentColor"
					strokeWidth="8"
					className="text-muted/30"
				/>
				<circle
					cx="50"
					cy="50"
					r={radius}
					fill="none"
					stroke={color}
					strokeWidth="8"
					strokeLinecap="round"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					style={{ transition: 'stroke-dashoffset 1.2s ease' }}
				/>
			</svg>
			<span className="absolute text-2xl font-bold tabular-nums" style={{ color }}>
				{score}
			</span>
		</div>
	);
}

function LoadingSkeleton() {
	return (
		<Card className="h-full shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40">
			<CardHeader className="pb-2">
				<div className="flex items-center gap-2">
					<Skeleton className="h-5 w-5 rounded-full" />
					<Skeleton className="h-5 w-44" />
				</div>
				<Skeleton className="mt-1 h-3 w-56" />
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="flex justify-center">
					<Skeleton className="h-24 w-24 rounded-full" />
				</div>
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-3 w-5/6" />
				<Skeleton className="h-3 w-4/6" />
				<Skeleton className="h-16 w-full rounded-lg" />
			</CardContent>
		</Card>
	);
}

export default function AIHealthCoach() {
	const { data: overviewData, loading: overviewLoading } = useOverview();
	const expenses: any[] = overviewData?.expenses ?? [];
	const income: any[] = overviewData?.income ?? [];
	const goals: any[] = overviewData?.goals ?? [];

	// Only fire the AI request once overview data has loaded and there is
	// something meaningful to analyse. The key is serialised so SWR
	// re-fetches only when the underlying financial data actually changes.
	const hasData = expenses.length > 0 || income.length > 0 || goals.length > 0;
	const cacheKey =
		!overviewLoading && hasData
			? JSON.stringify({ tag: 'ai-advisor', expenses, income, goals })
			: null;

	const {
		data: report,
		isLoading: aiLoading,
		error,
	} = useSWR<AIReport>(
		cacheKey,
		() =>
			fetch('/api/ai/advisor', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ expenses, income, goals }),
			}).then((r) => r.json()),
		{ revalidateOnFocus: false, revalidateOnReconnect: false }
	);

	if (overviewLoading || aiLoading) return <LoadingSkeleton />;

	// Empty state — user hasn't added any data yet
	if (!hasData) {
		return (
			<Card className="h-full shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2">
						<Sparkles className="h-5 w-5 text-emerald-500" />
						<h3 className="font-medium">DevKo AI Advisor</h3>
					</div>
					<p className="relative top-[-2px] text-sm font-normal text-muted-foreground">
						Powered by Gemini · Live financial health analysis
					</p>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						Add income, expenses, or goals to receive a personalised financial health score.
					</p>
				</CardContent>
			</Card>
		);
	}

	// API / parse error
	if (error || !report || report.score === undefined) {
		return (
			<Card className="h-full shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40">
				<CardHeader className="pb-2">
					<div className="flex items-center gap-2 text-muted-foreground">
						<AlertCircle className="h-5 w-5" />
						<h3 className="font-medium">DevKo AI Advisor</h3>
					</div>
				</CardHeader>
				<CardContent>
					<p className="text-sm text-muted-foreground">
						AI analysis is temporarily unavailable. Please try refreshing the page.
					</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/40">
			<CardHeader className="pb-2">
				<div className="flex items-center gap-2">
					<Sparkles className="h-5 w-5 text-emerald-500" />
					<h3 className="font-medium">DevKo AI Advisor</h3>
				</div>
				<p className="relative top-[-2px] text-sm font-normal text-muted-foreground">
					Powered by Gemini · Live financial health analysis
				</p>
			</CardHeader>

			<CardContent className="space-y-5">
				{/* Health Score Ring */}
				<div className="flex flex-col items-center gap-1 pt-1">
					<ScoreRing score={report.score} />
					<p className="text-xs text-muted-foreground">Financial Health Score</p>
				</div>

				{/* Brief explanation */}
				{report.explanation && (
					<p className="text-sm text-muted-foreground leading-relaxed">{report.explanation}</p>
				)}

				{/* Spending pattern analysis */}
				{report.analysis?.length > 0 && (
					<div className="space-y-2">
						<div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							<TrendingUp className="h-3.5 w-3.5" />
							Spending Patterns
						</div>
						<ul className="space-y-1.5">
							{report.analysis.map((item, i) => (
								<li key={i} className="flex items-start gap-2 text-sm">
									<span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
									{item}
								</li>
							))}
						</ul>
					</div>
				)}

				{/* Goal acceleration tip */}
				{report.tip && (
					<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
						<div className="flex items-start gap-2">
							<Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
							<div>
								<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
									Goal Tip
								</p>
								<p className="text-sm leading-relaxed">{report.tip}</p>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
