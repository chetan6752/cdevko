'use client';

import { useEffect, useMemo, useState } from 'react';

import { ChevronDown, Flag, Lightbulb, PlusCircle, Sparkles, Target, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

import { useUser } from 'components/context/auth-provider';
import { Button } from 'components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';
import { Skeleton } from 'components/ui/skeleton';

import { apiUrls } from 'lib/apiUrls';
import { formatCurrency } from 'lib/formatter';

const goalCategories = ['Emergency Fund', 'Travel', 'Education', 'Home', 'Vehicle', 'Retirement', 'Business', 'Other'];

type Goal = {
    id: string;
    name: string;
    target_amount: string;
    current_amount: string;
    category: string;
    deadline: string;
};

type GoalPlan = {
    summary: string;
    suggested_monthly_save: number;
    time_horizon_months: number;
    monthly_budget_split: {
        income: number;
        estimated_expenses: number;
        recommended_goal_contribution: number;
        leftover_for_buffer: number;
    };
    milestones: Array<{
        title: string;
        month: string;
        target_amount: number;
        note: string;
        recommendations: Array<{
            title: string;
            description: string;
        }>;
    }>;
    action_steps: string[];
};

function ProgressBar({ value }: { value: number }) {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div className="h-2 rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${clamped}%` }} />
        </div>
    );
}

function AddGoalModal({ onSuccess }: { onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        target_amount: '',
        category: goalCategories[0],
        deadline: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(apiUrls.goals.add, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            
            if (!res.ok) {
                toast.error('Failed to add goal');
                return;
            }
            
            toast.success('Goal added successfully');
            setOpen(false);
            setForm({ name: '', target_amount: '', category: goalCategories[0], deadline: '' });
            onSuccess();
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Goal
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Goal</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Goal Name</Label>
                        <Input
                            id="name"
                            required
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="target_amount">Target Amount</Label>
                        <Input
                            id="target_amount"
                            required
                            type="number"
                            min="1"
                            value={form.target_amount}
                            onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={form.category} onValueChange={(val) => setForm({ ...form, category: val })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                {goalCategories.map((c) => (
                                    <SelectItem key={c} value={c}>
                                        {c}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="deadline">Deadline</Label>
                        <Input
                            id="deadline"
                            required
                            type="date"
                            value={form.deadline}
                            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                        />
                    </div>
                    <Button type="submit" disabled={loading} className="mt-2">
                        {loading ? 'Saving...' : 'Save Goal'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ContributeModal({ goal, onSuccess }: { goal: Goal; onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');

    const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || Number(amount) <= 0) return;
        setLoading(true);
        try {
            const res = await fetch(apiUrls.goals.contribute, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: goal.id, amount: Number(amount) }),
            });
            if (!res.ok) {
                const { message } = await res.json().catch(() => ({ message: 'Failed to save contribution' }));
                alert(message || 'Failed to save contribution');
                return;
            }
            setOpen(false);
            setAmount('');
            onSuccess();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Contribute
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Contribute to {goal.name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="contribute-amount">Amount to Save</Label>
                        <Input
                            id="contribute-amount"
                            required
                            type="number"
                            min="1"
                            max={remaining}
                            placeholder="e.g. 1000"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        This will also create an expense entry under Goal Savings to keep your Available Balance accurate.
                    </p>
                    <Button type="submit" disabled={loading || remaining <= 0} className="mt-1">
                        {loading ? 'Saving...' : 'Save Contribution'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function GoalAIPlanner({ goals, user }: { goals: Goal[]; user: any }) {
    const [selectedGoalId, setSelectedGoalId] = useState('');
    const [activeMilestoneIndex, setActiveMilestoneIndex] = useState<number | null>(null);

    useEffect(() => {
        if (!goals.length) {
            setSelectedGoalId('');
            return;
        }
        if (!selectedGoalId || !goals.some((goal) => goal.id === selectedGoalId)) {
            setSelectedGoalId(goals[0].id);
            setActiveMilestoneIndex(null);
        }
    }, [goals, selectedGoalId]);

    const selectedGoal = useMemo(() => goals.find((goal) => goal.id === selectedGoalId), [goals, selectedGoalId]);

    const { data: plan, isLoading } = useSWR<GoalPlan>(
        selectedGoalId ? `${apiUrls.goals.planning}?goalId=${selectedGoalId}` : null,
        () =>
            fetch(apiUrls.goals.planning, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goalId: selectedGoalId }),
            }).then((res) => res.json()),
        { revalidateOnFocus: false }
    );

    if (!goals.length) return null;

    return (
        <div className="mb-6 rounded-xl border border-blue-500/30 bg-blue-500/5 p-5">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                    <h3 className="flex items-center gap-2 text-base font-semibold text-card-foreground">
                        <Sparkles className="h-4 w-4 text-blue-500" />
                        AI Goal Planning
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        Get a full month-wise plan and action checklist for your selected goal.
                    </p>
                </div>
                <div className="w-full md:w-[280px]">
                    <Select
                        value={selectedGoalId}
                        onValueChange={(value) => {
                            setSelectedGoalId(value);
                            setActiveMilestoneIndex(null);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Choose goal" />
                        </SelectTrigger>
                        <SelectContent>
                            {goals.map((goal) => (
                                <SelectItem key={goal.id} value={goal.id}>
                                    {goal.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            ) : !plan ? (
                <p className="text-sm text-muted-foreground">Unable to load your AI plan at the moment.</p>
            ) : (
                <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-card-foreground">{plan.summary}</p>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border bg-card p-3">
                            <p className="text-xs uppercase text-muted-foreground">Monthly Save</p>
                            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                                {formatCurrency({
                                    value: Number(plan.suggested_monthly_save || 0),
                                    currency: user?.currency,
                                    locale: user?.locale,
                                })}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <p className="text-xs uppercase text-muted-foreground">Time Horizon</p>
                            <p className="text-lg font-semibold">{plan.time_horizon_months} months</p>
                        </div>
                        <div className="rounded-lg border bg-card p-3">
                            <p className="text-xs uppercase text-muted-foreground">Goal Remaining</p>
                            <p className="text-lg font-semibold">
                                {formatCurrency({
                                    value: selectedGoal
                                        ? Math.max(0, Number(selectedGoal.target_amount) - Number(selectedGoal.current_amount))
                                        : 0,
                                    currency: user?.currency,
                                    locale: user?.locale,
                                })}
                            </p>
                        </div>
                    </div>

                    {plan.milestones?.length ? (
                        <div className="rounded-lg border bg-card p-4">
                            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Target className="h-3.5 w-3.5" />
                                Milestone Plan
                            </p>
                            <ul className="space-y-3">
                                {plan.milestones.map((milestone, index) => {
                                    const isActive = activeMilestoneIndex === index;
                                    return (
                                        <li key={`${milestone.title}-${index}`} className="rounded-md bg-muted/40 p-3">
                                            <button
                                                type="button"
                                                onClick={() => setActiveMilestoneIndex(isActive ? null : index)}
                                                className="w-full text-left"
                                            >
                                                <div className="mb-1 flex items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-medium">{milestone.title}</p>
                                                        <span className="text-xs text-muted-foreground">{milestone.month}</span>
                                                    </div>
                                                    <ChevronDown
                                                        className={`h-4 w-4 text-muted-foreground transition-transform ${isActive ? 'rotate-180' : ''}`}
                                                    />
                                                </div>
                                                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatCurrency({
                                                        value: Number(milestone.target_amount || 0),
                                                        currency: user?.currency,
                                                        locale: user?.locale,
                                                    })}
                                                </p>
                                                <p className="mt-1 text-xs text-muted-foreground">{milestone.note}</p>
                                            </button>

                                            {isActive && milestone.recommendations?.length ? (
                                                <div className="mt-3 space-y-2 rounded-md border border-blue-500/20 bg-blue-500/5 p-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                                                        How to achieve this milestone
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {milestone.recommendations.map((advice, adviceIndex) => (
                                                            <li key={`${advice.title}-${adviceIndex}`} className="text-sm">
                                                                <p className="font-medium text-card-foreground">{advice.title}</p>
                                                                <p className="text-xs text-muted-foreground">{advice.description}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <p className="text-[11px] text-muted-foreground">
                                                        These are AI suggestions. Match risk level and product suitability before investing.
                                                    </p>
                                                </div>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ) : null}

                    {plan.action_steps?.length ? (
                        <div className="rounded-lg border bg-card p-4">
                            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Lightbulb className="h-3.5 w-3.5" />
                                Action Steps
                            </p>
                            <ul className="space-y-2">
                                {plan.action_steps.map((step, idx) => (
                                    <li key={`${step}-${idx}`} className="text-sm text-card-foreground">
                                        • {step}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default function GoalsClient() {
    const user = useUser();
    const { mutate: globalMutate } = useSWRConfig();
    const { data: rawGoals, isLoading, mutate: mutateGoals } = useSWR<Goal[]>(apiUrls.goals.getGoals());
    const goals: Goal[] = Array.isArray(rawGoals) ? rawGoals : [];

    const handleContributionSuccess = async () => {
        await mutateGoals();
        globalMutate((key: unknown) => typeof key === 'string' && key.startsWith('/api/expenses'));
        globalMutate('/api/user');
    };

    const handleDelete = async (id: string, goalName: string) => {
        try {
            const res = await fetch(apiUrls.goals.modify, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                console.error('[handleDelete] Goal deletion failed:', body);
                toast.error(body?.message || 'Failed to delete goal. Please try again.');
                return;
            }

            const body = await res.json().catch(() => ({}));

            toast.success(`"${goalName}" deleted.`, {
                description: body?.preservedContributionHistory
                    ? 'Goal contribution expenses are preserved in your expense history.'
                    : 'Goal deleted successfully.',
                duration: 4000,
            });

            mutateGoals();
            globalMutate('/api/user');
        } catch (err) {
            console.error('[handleDelete] Unexpected error:', err);
            toast.error('An unexpected error occurred. Please try again.');
        }
    };

    return (
        <div className="w-full overflow-x-auto p-4 pt-3">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="font-semibold text-primary dark:text-white">
                    Your Goals <span className="ml-1 text-sm font-normal text-muted-foreground">({goals.length})</span>
                </h2>
                <AddGoalModal onSuccess={() => mutateGoals()} />
            </div>

            {!isLoading && goals.length > 0 ? <GoalAIPlanner goals={goals} user={user} /> : null}

            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-36 animate-pulse rounded-xl bg-muted" />
                    ))}
                </div>
            ) : goals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
                    <Flag className="mb-4 h-12 w-12 opacity-30" />
                    <p className="text-lg font-medium">No goals yet</p>
                    <p className="mt-1 text-sm">Add your first financial goal to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {goals.map((goal) => {
                        const progress =
                            Number(goal.target_amount) > 0
                                ? Math.min(100, Math.round((Number(goal.current_amount) / Number(goal.target_amount)) * 100))
                                : 0;
                        const isComplete = progress >= 100;
                        return (
                            <div
                                key={goal.id}
                                className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                            >
                                <div className="mb-1 flex items-start justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium text-card-foreground" title={goal.name}>
                                            {goal.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{goal.category}</p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1.5">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                                isComplete
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                                            }`}
                                        >
                                            {progress}%
                                        </span>
                                        <ContributeModal goal={goal} onSuccess={handleContributionSuccess} />
                                        <button
                                            onClick={() => handleDelete(goal.id, goal.name)}
                                            className="rounded-md p-1.5 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive focus:outline-none"
                                            title="Delete goal"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <ProgressBar value={progress} />
                                <div className="mt-3 flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        {formatCurrency({
                                            value: Number(goal.current_amount),
                                            currency: user?.currency,
                                            locale: user?.locale,
                                        })}
                                    </span>
                                </div>
                                <p className="mt-2 text-xs text-muted-foreground">
                                    Deadline:{' '}
                                    {new Date(goal.deadline).toLocaleDateString(user?.locale || 'en', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}