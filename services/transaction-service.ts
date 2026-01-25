import { supabase } from "@/utils/supabase";
import type { ImagePickerAsset } from "expo-image-picker";

export interface SaveExpenseParams {
	title: string;
	amount: string;
	category: string;
	type: string;
	date: Date;
	notes?: string;
	receiptAsset?: ImagePickerAsset | null;
}

export interface SaveExpenseResult {
	success: boolean;
	message: string;
	error?: string;
}

export interface TransactionRecord {
	id: string;
	title: string;
	amount: number;
	category: string;
	type: string;
	transaction_date: string;
	notes?: string | null;
	receipt_url?: string | null;
	vendor?: string | null;
	ocr_confidence?: number | null;
	created_at?: string;
}

export interface FetchTransactionsResult {
	success: boolean;
	data: TransactionRecord[];
	error?: string;
}

/**
 * Uploads receipt to Supabase storage and returns public URL
 */
async function uploadReceipt(userId: string, asset: ImagePickerAsset): Promise<string | null> {
	try {
		const fileName = asset.fileName || `receipt-${Date.now()}.jpg`;
		const bucket = "receipts";
		const filePath = `${userId}/${fileName}`;

		// Use base64 from asset if available
		if (!asset.base64) {
			console.error("No base64 data available from image picker");
			return null;
		}

		// Decode base64 to bytes
		const binaryString = atob(asset.base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Upload to storage
		const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, bytes, {
			contentType: asset.mimeType || "image/jpeg",
			upsert: true,
		});

		if (uploadError) {
			console.error("Upload error:", uploadError);
			return null;
		}

		// Get public URL
		const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
		return data?.publicUrl || null;
	} catch (error) {
		console.error("Receipt upload failed:", error);
		return null;
	}
}

/**
 * Saves expense transaction to Supabase
 */
export async function saveExpense(params: SaveExpenseParams): Promise<SaveExpenseResult> {
	try {
		// Get current user
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to save expenses",
			};
		}

		const userId = authData.user.id;

		// Parse amount
		const parsedAmount = parseFloat(params.amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			return {
				success: false,
				message: "Invalid amount",
				error: "Amount must be a valid positive number",
			};
		}

		// Upload receipt if provided
		let receiptUrl: string | null = null;
		if (params.receiptAsset) {
			receiptUrl = await uploadReceipt(userId, params.receiptAsset);
		}

		// Insert transaction
		const { error: insertError } = await supabase.from("transactions").insert([
			{
				user_id: userId,
				title: params.title,
				amount: parsedAmount,
				category: params.category,
				type: params.type,
				transaction_date: params.date.toISOString(),
				notes: params.notes || null,
				receipt_url: receiptUrl,
				vendor: null,
				ocr_confidence: null,
			},
		]);

		if (insertError) {
			console.error("Insert error:", insertError);
			return {
				success: false,
				message: "Failed to save expense",
				error: insertError.message,
			};
		}

		return {
			success: true,
			message: "Expense saved successfully",
		};
	} catch (error) {
		console.error("Save expense error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Fetches all transactions for the current user
 */
export async function fetchTransactions(): Promise<FetchTransactionsResult> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				data: [],
				error: "Please log in to view transactions",
			};
		}

		const userId = authData.user.id;
		const { data, error } = await supabase.from("transactions").select("*").eq("user_id", userId).order("transaction_date", { ascending: false });

		if (error) {
			console.error("Fetch transactions error:", error);
			return {
				success: false,
				data: [],
				error: error.message,
			};
		}

		return {
			success: true,
			data: data ?? [],
		};
	} catch (error) {
		console.error("Fetch transactions unexpected error:", error);
		return {
			success: false,
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

export interface BalanceDataAfterBudget {
	balanceAfterBudget: number;
	totalIncome: number;
	totalExpense: number;
	totalBudgets: number;
}

/**
 * Calculate total balance across all time AFTER accounting for budget allocations
 * Returns balance after budgets (income - expenses - budgets), total income, total expenses, and total budgets
 */
export function calculateTotalBalanceAfterBudget(transactions: TransactionRecord[], budgets: Array<{ amount: number }>): BalanceDataAfterBudget {
	const income = transactions.filter((t) => t.type.toLowerCase() === "income").reduce((sum, t) => sum + (t.amount || 0), 0);

	const expenses = transactions.filter((t) => t.type.toLowerCase() === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);

	const totalBudgets = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

	return {
		balanceAfterBudget: income - expenses - totalBudgets,
		totalIncome: income,
		totalExpense: expenses,
		totalBudgets,
	};
}

/**
 * Calculate current month balance AFTER accounting for budget allocations
 * Returns balance after budgets (income - expenses - budgets), total income, total expenses, and total budgets for current month
 */
export function calculateCurrentMonthBalanceAfterBudget(transactions: TransactionRecord[], budgets: Array<{ amount: number }>): BalanceDataAfterBudget {
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	const currentMonthTransactions = transactions.filter((tx) => {
		const txDate = new Date(tx.transaction_date);
		return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
	});

	const income = currentMonthTransactions.filter((t) => t.type.toLowerCase() === "income").reduce((sum, t) => sum + (t.amount || 0), 0);

	const expenses = currentMonthTransactions.filter((t) => t.type.toLowerCase() === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);

	const totalBudgets = budgets.reduce((sum, b) => sum + (b.amount || 0), 0);

	return {
		balanceAfterBudget: income - expenses - totalBudgets,
		totalIncome: income,
		totalExpense: expenses,
		totalBudgets,
	};
}

export interface BalanceData {
	balance: number;
	income: number;
	expenses: number;
}

/**
 * Calculate total balance across all time
 * Returns balance (income - expenses), total income, and total expenses
 */
export function calculateTotalBalance(transactions: TransactionRecord[]): BalanceData {
	const income = transactions.filter((t) => t.type.toLowerCase() === "income").reduce((sum, t) => sum + (t.amount || 0), 0);

	const expenses = transactions.filter((t) => t.type.toLowerCase() === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);

	return {
		balance: income - expenses,
		income,
		expenses,
	};
}

/**
 * Calculate current month balance
 * Returns balance (income - expenses), total income, and total expenses for current month
 */
export function calculateCurrentMonthBalance(transactions: TransactionRecord[]): BalanceData {
	const now = new Date();
	const currentMonth = now.getMonth();
	const currentYear = now.getFullYear();

	const currentMonthTransactions = transactions.filter((tx) => {
		const txDate = new Date(tx.transaction_date);
		return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
	});

	const income = currentMonthTransactions.filter((t) => t.type.toLowerCase() === "income").reduce((sum, t) => sum + (t.amount || 0), 0);

	const expenses = currentMonthTransactions.filter((t) => t.type.toLowerCase() === "expense").reduce((sum, t) => sum + (t.amount || 0), 0);

	return {
		balance: income - expenses,
		income,
		expenses,
	};
}
