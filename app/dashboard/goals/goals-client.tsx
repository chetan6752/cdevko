'use client';

import { useState } from 'react';

import { Flag, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

import { useUser } from 'components/context/auth-provider';
import { Button } from 'components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { Label } from 'components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'components/ui/select';

import { apiUrls } from 'lib/apiUrls';
import { formatCurrency } from 'lib/formatter';

const goalCategories = ['Emergency Fund', 'Travel', 'Education', 'Home', 'Vehicle', 'Retirement', 'Business', 'Other'];

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
				body: JSON.stringify({ ...form, current_amount: '0' }),
			});
			if (!res.ok) {
				const { message } = await res.json().catch(() => ({ message: 'Failed to save goal' }));
				alert(message || 'Failed to save goal');
				return;
			}
			setOpen(false);
			setForm({ name: '', target_amount: '', category: goalCategories[0], deadline: '' });
			onSuccess();
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button size="sm" className="gap-2">
					<Flag className="h-4 w-4" />
					Add Goal
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>New Financial Goal</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="grid gap-4 pt-2">
					<div className="grid gap-2">
						<Label htmlFor="name">Goal Name</Label>
						<Input
							id="name"
							required
							placeholder="e.g. Emergency Fund"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="target">Target Amount</Label>
						<Input
							id="target"
							required
							type="number"
							min="1"
							placeholder="e.g. 50000"
							value={form.target_amount}
							onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="category">Category</Label>
						<Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
							<SelectTrigger id="category">
								<SelectValue />
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

function ContributeModal({ goal, onSuccess }: { goal: any; onSuccess: () => void }) {
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [amount, setAmount] = useState('');

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

	const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<button
					className="rounded p-1 text-muted-foreground transition-colors hover:text-emerald-600 focus:outline-none"
					title="Contribute to goal"
					aria-label="Contribute to goal"
				>
					<PlusCircle className="h-4 w-4" />
				</button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[380px]">
				<DialogHeader>
					<DialogTitle>Contribute to Goal</DialogTitle>
				</DialogHeader>
				<p className="text-sm text-muted-foreground">
					<span className="font-semibold text-card-foreground">{goal.name}</span>
					{' -- '}
					{remaining > 0 ? `${remaining.toLocaleString()} remaining to target` : 'Target already reached!'}
				</p>
				<form onSubmit={handleSubmit} className="grid gap-4 pt-1">
					<div className="grid gap-2">
						<Label htmlFor="contribute-amount">Amount to Save</Label>
						<Input
							id="contribute-amount"
							required
							type="number"
							min="1"
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

export default function GoalsClient() {
	const user = useUser();
	const { mutate: globalMutate } = useSWRConfig();
	const { data: rawGoals, isLoading, mutate: mutateGoals } = useSWR<any[]>(apiUrls.goals.getGoals());
	const goals: any[] = Array.isArray(rawGoals) ? rawGoals : [];

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

			// Deep cache invalidation:
			// 1. Revalidate goals list.
			mutateGoals();
			// 2. Revalidate user record.
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
					{goals.map((goal: any) => {
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
										{/* Added flex-1 and gap-3 to give the name more breathing room */}
										<p className="truncate font-medium text-card-foreground" title={goal.name}>
											{goal.name}
										</p>
										<p className="text-xs text-muted-foreground">{goal.category}</p>
									</div>
									<div className="flex shrink-0 items-center gap-1.5">
										{/* Increased gap for touch-friendly targets */}
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
											currency: user.currency,
											locale: user.locale,
										})}{' '}
										<span className="text-xs">saved</span>
									</span>
									<span className="font-semibold text-card-foreground">
										{formatCurrency({
											value: Number(goal.target_amount),
											currency: user.currency,
											locale: user.locale,
										})}
									</span>
								</div>
								<p className="mt-2 text-xs text-muted-foreground">
									Deadline:{' '}
									{new Date(goal.deadline).toLocaleDateString(user.locale || 'en', {
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
