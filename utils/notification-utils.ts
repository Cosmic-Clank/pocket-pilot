import { calculateCurrentMonthBalanceAfterBudget, type TransactionRecord } from "@/services/transaction-service";
import { type BudgetRecord } from "@/services/budget-service";

export interface BudgetUsage {
	percentUsed: number;
	totalBudget: number;
	spent: number;
}

export interface SavingsProgress {
	currentSavings: number;
	progressPercent: number;
}

export function computeBudgetUsage(budgets: BudgetRecord[], transactions: TransactionRecord[]): BudgetUsage {
	const totalBudget = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

	// Current month expenses only
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();
	const monthExpenses = transactions
		.filter((tx) => tx.type.toLowerCase() === "expense")
		.filter((tx) => {
			const date = new Date(tx.transaction_date);
			return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
		})
		.reduce((sum, tx) => sum + (tx.amount || 0), 0);

	const percentUsed = totalBudget === 0 ? 0 : Math.min(100, Math.max(0, (monthExpenses / totalBudget) * 100));

	return {
		percentUsed,
		totalBudget,
		spent: monthExpenses,
	};
}

export function computeSavingsProgress(transactions: TransactionRecord[], budgets: BudgetRecord[], savingsGoal: number): SavingsProgress {
	const goal = savingsGoal > 0 ? savingsGoal : 5000;
	const savingsData = calculateCurrentMonthBalanceAfterBudget(transactions, budgets);
	const progressPercent = Math.max(0, Math.min(100, (savingsData.balanceAfterBudget / goal) * 100));

	return {
		currentSavings: savingsData.balanceAfterBudget,
		progressPercent,
	};
}

export function getRecentTransactionsForInsights(transactions: TransactionRecord[], limit = 8): TransactionRecord[] {
	const sorted = [...transactions].sort((a, b) => {
		const aDate = new Date(a.transaction_date).getTime();
		const bDate = new Date(b.transaction_date).getTime();
		return bDate - aDate;
	});

	return sorted.slice(0, limit);
}
