'use client';

import { AlertCircle, Target, Sparkles, TrendingDown, CheckCircle2, Wallet } from 'lucide-react';
import useSWR from 'swr';

import { useOverview } from 'components/context/overview-provider';
import { Card, CardContent, CardHeader } from 'components/ui/card';
import { Skeleton } from 'components/ui/skeleton';

type BudgetAdjustment = {
    category: string;
    new_limit: number;
    reason: string;
};

type AIRecommendation = {
    past_analysis: {
        total_potential_savings: number;
        leaks: string[];
    };
    future_plan: {
        target_monthly_savings: number;
        budget_adjustments: BudgetAdjustment[];
    };
    action_steps: string[];
};

function LoadingSkeleton() {
    return (
        <Card className="h-full shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <Skeleton className="h-5 w-56" />
                </div>
                <Skeleton className="mt-1 h-3 w-48" />
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-16 w-full rounded-lg" />
                    <Skeleton className="h-16 w-full rounded-lg" />
                </div>
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
            </CardContent>
        </Card>
    );
}

export default function AIRecommendationCoach() {
    const { data: overviewData, loading: overviewLoading } = useOverview();
    const expenses: any[] = overviewData?.expenses ?? [];
    const income: any[] = overviewData?.income ?? [];
    const goals: any[] = overviewData?.goals ?? [];

    const hasData = expenses.length > 0 || income.length > 0 || goals.length > 0;
    const cacheKey =
        !overviewLoading && hasData
            ? JSON.stringify({ tag: 'ai-recommendations', expenses, income, goals })
            : null;

    const {
        data: report,
        isLoading: aiLoading,
        error,
    } = useSWR<AIRecommendation>(
        cacheKey,
        () =>
            fetch('/api/ai/recommendations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expenses, income, goals }),
            }).then((r) => r.json()),
        { revalidateOnFocus: false, revalidateOnReconnect: false }
    );

    if (overviewLoading || aiLoading) return <LoadingSkeleton />;

    if (!hasData) {
        return (
            <Card className="h-full shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Proactive Wealth Coach</h3>
                    </div>
                    <p className="relative top-[-2px] text-sm font-normal text-muted-foreground">
                        Powered by Gemini · Behavioral Spending Analysis
                    </p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Add financial data to unlock your proactive budget adjustments and saving strategies.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (error || !report || !report.past_analysis) {
        return (
            <Card className="h-full shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40">
                <CardHeader className="pb-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <h3 className="font-medium">Proactive Wealth Coach</h3>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Recommendation engine is temporarily unavailable. Please try refreshing.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const formatCurrency = (amount: number) => 
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

    return (
        <Card className="h-full shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/40">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    <h3 className="font-medium">Proactive Wealth Coach</h3>
                </div>
                <p className="relative top-[-2px] text-sm font-normal text-muted-foreground">
                    Powered by Gemini · Behavioral Spending Analysis
                </p>
            </CardHeader>

            <CardContent className="space-y-6">
                
                {/* Top Level Stats: Past vs Future */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600 dark:text-rose-400">Lost Savings</p>
                        <p className="mt-1 text-xl font-bold text-rose-600 dark:text-rose-400">
                            {formatCurrency(report.past_analysis.total_potential_savings)}
                        </p>
                    </div>
                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Target Savings</p>
                        <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(report.future_plan.target_monthly_savings)}
                        </p>
                    </div>
                </div>

                {/* Past Money Leaks */}
                {report.past_analysis.leaks?.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <TrendingDown className="h-3.5 w-3.5 text-rose-500" />
                            Identified Money Leaks
                        </div>
                        <ul className="space-y-1.5">
                            {report.past_analysis.leaks.map((leak, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                    {leak}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Budget Adjustments */}
                {report.future_plan.budget_adjustments?.length > 0 && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Target className="h-3.5 w-3.5 text-blue-500" />
                            Smart Budget Adjustments
                        </div>
                        <div className="space-y-2">
                            {report.future_plan.budget_adjustments.map((adj, i) => (
                                <div key={i} className="flex flex-col gap-1 rounded-md bg-muted/50 p-2.5 text-sm">
                                    <div className="flex items-center justify-between font-medium">
                                        <span>{adj.category}</span>
                                        <span className="text-blue-600 dark:text-blue-400">Limit: {formatCurrency(adj.new_limit)}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{adj.reason}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Steps */}
                {report.action_steps?.length > 0 && (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                        <div className="flex items-start gap-2">
                            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <div className="w-full">
                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                                    Immediate Action Steps
                                </p>
                                <ul className="space-y-2">
                                    {report.action_steps.map((step, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm leading-snug">
                                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500/70" />
                                            <span>{step}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}