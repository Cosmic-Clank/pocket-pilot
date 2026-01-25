import { supabase } from "@/utils/supabase";

export interface WatchlistRecord {
	id: string;
	user_id: string;
	symbol: string;
	company: string | null;
	note: string | null;
	added_from: string | null;
	created_at: string;
	updated_at: string;
}

export interface AddToWatchlistParams {
	symbol: string;
	company?: string;
	note?: string;
	addedFrom?: string;
}

export interface FetchWatchlistResult {
	success: boolean;
	data: WatchlistRecord[];
	error?: string;
}

export interface AddWatchlistResult {
	success: boolean;
	message: string;
	error?: string;
	data?: WatchlistRecord;
}

export interface RemoveWatchlistResult {
	success: boolean;
	message: string;
	error?: string;
}

/**
 * Fetches all watchlist stocks for the current user
 */
export async function fetchWatchlist(): Promise<FetchWatchlistResult> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				data: [],
				error: "Please log in to view watchlist",
			};
		}

		const userId = authData.user.id;
		const { data, error } = await supabase.from("stock_watchlist").select("*").eq("user_id", userId).order("created_at", { ascending: false });

		if (error) {
			console.error("Fetch watchlist error:", error);
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
		console.error("Fetch watchlist unexpected error:", error);
		return {
			success: false,
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Adds a stock to the watchlist
 */
export async function addToWatchlist(params: AddToWatchlistParams): Promise<AddWatchlistResult> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to add to watchlist",
			};
		}

		const userId = authData.user.id;

		// Validate symbol
		if (!params.symbol || params.symbol.trim() === "") {
			return {
				success: false,
				message: "Invalid symbol",
				error: "Stock symbol is required",
			};
		}

		// Insert into watchlist (upsert to handle duplicates)
		const { data, error: insertError } = await supabase
			.from("stock_watchlist")
			.upsert(
				{
					user_id: userId,
					symbol: params.symbol.toUpperCase(),
					company: params.company || null,
					note: params.note || null,
					added_from: params.addedFrom || "manual",
					updated_at: new Date().toISOString(),
				},
				{
					onConflict: "user_id,symbol",
				},
			)
			.select()
			.single();

		if (insertError) {
			console.error("Add to watchlist error:", insertError);
			return {
				success: false,
				message: "Failed to add to watchlist",
				error: insertError.message,
			};
		}

		return {
			success: true,
			message: "Added to watchlist",
			data: data as WatchlistRecord,
		};
	} catch (error) {
		console.error("Add to watchlist unexpected error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Removes a stock from the watchlist by ID
 */
export async function removeFromWatchlist(watchlistId: string): Promise<RemoveWatchlistResult> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to remove from watchlist",
			};
		}

		const userId = authData.user.id;

		// Delete from watchlist (ensure user owns this record)
		const { error: deleteError } = await supabase.from("stock_watchlist").delete().eq("id", watchlistId).eq("user_id", userId);

		if (deleteError) {
			console.error("Remove from watchlist error:", deleteError);
			return {
				success: false,
				message: "Failed to remove from watchlist",
				error: deleteError.message,
			};
		}

		return {
			success: true,
			message: "Removed from watchlist",
		};
	} catch (error) {
		console.error("Remove from watchlist unexpected error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Checks if a symbol is already in the watchlist
 */
export async function isInWatchlist(symbol: string): Promise<boolean> {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return false;
		}

		const userId = authData.user.id;
		const { data, error } = await supabase.from("stock_watchlist").select("id").eq("user_id", userId).eq("symbol", symbol.toUpperCase()).single();

		if (error || !data) {
			return false;
		}

		return true;
	} catch (error) {
		console.error("Check watchlist error:", error);
		return false;
	}
}
