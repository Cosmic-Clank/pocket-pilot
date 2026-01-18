import { supabase } from "@/utils/supabase";

export interface SaveBudgetParams {
	category: string;
	amount: string;
}

export interface SaveBudgetResult {
	success: boolean;
	message: string;
	error?: string;
}

export interface BudgetRecord {
	id: string;
	category: string;
	amount: number;
	created_at?: string;
	user_id?: string;
}

export interface FetchBudgetsResult {
	success: boolean;
	data: BudgetRecord[];
	error?: string;
}

/**
 * Saves a new budget to Supabase
 */
export async function saveBudget(params: SaveBudgetParams): Promise<SaveBudgetResult> {
	try {
		// Get current user
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to save budgets",
			};
		}

		const userId = authData.user.id;

		// Validate category
		if (!params.category || params.category.trim() === "") {
			return {
				success: false,
				message: "Invalid category",
				error: "Please select a category",
			};
		}

		// Parse and validate amount
		const parsedAmount = parseFloat(params.amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			return {
				success: false,
				message: "Invalid amount",
				error: "Amount must be a valid positive number",
			};
		}

		// Insert budget
		const { error: insertError } = await supabase.from("budgets").insert([
			{
				user_id: userId,
				category: params.category,
				amount: parsedAmount,
			},
		]);

		if (insertError) {
			console.error("Insert error:", insertError);
			return {
				success: false,
				message: "Failed to save budget",
				error: insertError.message,
			};
		}

		return {
			success: true,
			message: "Budget saved successfully",
		};
	} catch (error) {
		console.error("Save budget error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Fetches all budgets for the current user
 */
export async function fetchBudgets(): Promise<FetchBudgetsResult> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				data: [],
				error: "Please log in to view budgets",
			};
		}

		const userId = authData.user.id;
		const { data, error } = await supabase.from("budgets").select("*").eq("user_id", userId).order("created_at", { ascending: false });

		if (error) {
			console.error("Fetch budgets error:", error);
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
		console.error("Fetch budgets unexpected error:", error);
		return {
			success: false,
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Deletes a budget by ID
 */
export async function deleteBudget(budgetId: string): Promise<SaveBudgetResult> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in",
			};
		}

		const userId = authData.user.id;
		const { error } = await supabase.from("budgets").delete().eq("id", budgetId).eq("user_id", userId);

		if (error) {
			console.error("Delete error:", error);
			return {
				success: false,
				message: "Failed to delete budget",
				error: error.message,
			};
		}

		return {
			success: true,
			message: "Budget deleted successfully",
		};
	} catch (error) {
		console.error("Delete budget error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
