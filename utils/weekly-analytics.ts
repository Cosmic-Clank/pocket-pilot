import { type TransactionRecord } from "@/services/transaction-service";
import { CATEGORY_ICON_MAP } from "@/constants/config";

export interface CategoryBreakdown {
	category: string;
	amount: number;
	percentage: number;
	transactionCount: number;
	icon: string;
	color: string;
}

export interface DailySpending {
	date: string;
	dayName: string;
	amount: number;
	transactionCount: number;
}

export interface WeeklyStats {
	totalSpending: number;
	totalIncome: number;
	netCashflow: number;
	categories: CategoryBreakdown[];
	dailyBreakdown: DailySpending[];
	topCategory: CategoryBreakdown | null;
	transactionCount: number;
	averageDailySpending: number;
	weekOverWeekChange: number;
}

const CATEGORY_COLORS: Record<string, string> = {
	transport: "#3B82F6",
	entertainment: "#EC4899",
	groceries: "#10B981",
	food: "#F59E0B",
	shopping: "#8B5CF6",
	bills: "#EF4444",
	health: "#06B6D4",
	education: "#6366F1",
	stock: "#14B8A6",
	other: "#6B7280",
};

function getLastWeekTransactions(transactions: TransactionRecord[]): TransactionRecord[] {
	const now = new Date();
	const weekStart = new Date(now);
	weekStart.setDate(now.getDate() - 7);
	weekStart.setHours(0, 0, 0, 0);

	return transactions.filter((tx) => {
		const txDate = new Date(tx.transaction_date);
		return txDate >= weekStart && txDate <= now;
	});
}

function getPreviousWeekTransactions(transactions: TransactionRecord[]): TransactionRecord[] {
	const now = new Date();
	const prevWeekEnd = new Date(now);
	prevWeekEnd.setDate(now.getDate() - 7);
	prevWeekEnd.setHours(23, 59, 59, 999);

	const prevWeekStart = new Date(prevWeekEnd);
	prevWeekStart.setDate(prevWeekEnd.getDate() - 7);
	prevWeekStart.setHours(0, 0, 0, 0);

	return transactions.filter((tx) => {
		const txDate = new Date(tx.transaction_date);
		return txDate >= prevWeekStart && txDate <= prevWeekEnd;
	});
}

function computeCategoryBreakdown(weekTransactions: TransactionRecord[]): CategoryBreakdown[] {
	const expenses = weekTransactions.filter((tx) => tx.type.toLowerCase() === "expense");
	const totalSpending = expenses.reduce((sum, tx) => sum + tx.amount, 0);

	const categoryMap = new Map<string, { amount: number; count: number }>();

	expenses.forEach((tx) => {
		const cat = tx.category || "other";
		const existing = categoryMap.get(cat) || { amount: 0, count: 0 };
		categoryMap.set(cat, {
			amount: existing.amount + tx.amount,
			count: existing.count + 1,
		});
	});

	const breakdown: CategoryBreakdown[] = [];
	categoryMap.forEach((value, category) => {
		breakdown.push({
			category,
			amount: value.amount,
			percentage: totalSpending > 0 ? (value.amount / totalSpending) * 100 : 0,
			transactionCount: value.count,
			icon: CATEGORY_ICON_MAP[category] || "tag",
			color: CATEGORY_COLORS[category] || CATEGORY_COLORS.other,
		});
	});

	breakdown.sort((a, b) => b.amount - a.amount);
	return breakdown;
}

function computeDailyBreakdown(weekTransactions: TransactionRecord[]): DailySpending[] {
	const now = new Date();
	const dailyMap = new Map<string, { amount: number; count: number }>();

	const expenses = weekTransactions.filter((tx) => tx.type.toLowerCase() === "expense");

	expenses.forEach((tx) => {
		const txDate = new Date(tx.transaction_date);
		const dateKey = txDate.toISOString().split("T")[0];
		const existing = dailyMap.get(dateKey) || { amount: 0, count: 0 };
		dailyMap.set(dateKey, {
			amount: existing.amount + tx.amount,
			count: existing.count + 1,
		});
	});

	const daily: DailySpending[] = [];
	for (let i = 6; i >= 0; i--) {
		const date = new Date(now);
		date.setDate(now.getDate() - i);
		date.setHours(0, 0, 0, 0);

		const dateKey = date.toISOString().split("T")[0];
		const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		const dayName = dayNames[date.getDay()];

		const data = dailyMap.get(dateKey) || { amount: 0, count: 0 };
		daily.push({
			date: dateKey,
			dayName,
			amount: data.amount,
			transactionCount: data.count,
		});
	}

	return daily;
}

export function computeWeeklyStats(transactions: TransactionRecord[]): WeeklyStats {
	const weekTransactions = getLastWeekTransactions(transactions);
	const prevWeekTransactions = getPreviousWeekTransactions(transactions);

	const expenses = weekTransactions.filter((tx) => tx.type.toLowerCase() === "expense");
	const income = weekTransactions.filter((tx) => tx.type.toLowerCase() === "income");

	const totalSpending = expenses.reduce((sum, tx) => sum + tx.amount, 0);
	const totalIncome = income.reduce((sum, tx) => sum + tx.amount, 0);

	const prevWeekSpending = prevWeekTransactions.filter((tx) => tx.type.toLowerCase() === "expense").reduce((sum, tx) => sum + tx.amount, 0);

	const weekOverWeekChange = prevWeekSpending > 0 ? ((totalSpending - prevWeekSpending) / prevWeekSpending) * 100 : 0;

	const categories = computeCategoryBreakdown(weekTransactions);
	const dailyBreakdown = computeDailyBreakdown(weekTransactions);

	const averageDailySpending = totalSpending / 7;

	return {
		totalSpending,
		totalIncome,
		netCashflow: totalIncome - totalSpending,
		categories,
		dailyBreakdown,
		topCategory: categories.length > 0 ? categories[0] : null,
		transactionCount: weekTransactions.length,
		averageDailySpending,
		weekOverWeekChange,
	};
}
