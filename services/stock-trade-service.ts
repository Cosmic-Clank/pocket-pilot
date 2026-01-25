import { supabase } from "@/utils/supabase";

export interface ExecuteTradeParams {
	symbol: string;
	side: "buy" | "sell";
	amount: number;
	priceAtTrade: number;
	shares: number;
	note?: string;
	source?: string;
}

export interface ExecuteTradeResult {
	success: boolean;
	message: string;
	error?: string;
	tradeId?: string;
	transactionId?: string;
}

/**
 * Execute a stock trade - creates both a stock_trades record and a transaction record
 */
export async function executeTrade(params: ExecuteTradeParams): Promise<ExecuteTradeResult> {
	try {
		// Get current user
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to execute trades",
			};
		}

		const userId = authData.user.id;

		// Validate inputs
		if (params.amount <= 0) {
			return {
				success: false,
				message: "Invalid amount",
				error: "Amount must be greater than zero",
			};
		}

		if (params.shares <= 0) {
			return {
				success: false,
				message: "Invalid shares",
				error: "Shares must be greater than zero",
			};
		}

		if (!params.symbol || params.symbol.trim() === "") {
			return {
				success: false,
				message: "Invalid symbol",
				error: "Stock symbol is required",
			};
		}

		// Insert into stock_trades table
		const { data: tradeData, error: tradeError } = await supabase
			.from("stock_trades")
			.insert([
				{
					user_id: userId,
					symbol: params.symbol,
					side: params.side,
					amount: params.amount,
					price_at_trade: params.priceAtTrade,
					shares: params.shares,
					source: params.source || "manual",
					note: params.note || null,
					traded_at: new Date().toISOString(),
				},
			])
			.select("id")
			.single();

		if (tradeError) {
			console.error("Stock trade insert error:", tradeError);
			return {
				success: false,
				message: "Failed to record trade",
				error: tradeError.message,
			};
		}

		// Create corresponding transaction record (expense for buy, income for sell)
		const transactionType = params.side === "buy" ? "expense" : "income";
		const transactionTitle = `${params.side === "buy" ? "Bought" : "Sold"} ${params.shares.toFixed(2)} shares of ${params.symbol}`;

		const { data: transactionData, error: transactionError } = await supabase
			.from("transactions")
			.insert([
				{
					user_id: userId,
					title: transactionTitle,
					amount: params.amount,
					category: "stock",
					type: transactionType,
					transaction_date: new Date().toISOString(),
					notes: params.note || `Stock ${params.side} via AI recommendation`,
					receipt_url: null,
					vendor: params.symbol,
					ocr_confidence: null,
				},
			])
			.select("id")
			.single();

		if (transactionError) {
			console.error("Transaction insert error:", transactionError);
			// Trade was created but transaction failed - log this
			console.warn(`Trade ${tradeData.id} created but transaction failed to record`);
			return {
				success: false,
				message: "Trade recorded but failed to create transaction",
				error: transactionError.message,
				tradeId: tradeData.id,
			};
		}

		return {
			success: true,
			message: `Successfully ${params.side === "buy" ? "purchased" : "sold"} ${params.shares.toFixed(2)} shares of ${params.symbol}`,
			tradeId: tradeData.id,
			transactionId: transactionData.id,
		};
	} catch (error) {
		console.error("Execute trade error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}

/**
 * Fetch all stock trades for the current user
 */
export async function fetchStockTrades() {
	try {
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				data: [],
				error: "Please log in to view trades",
			};
		}

		const userId = authData.user.id;
		const { data, error } = await supabase.from("stock_trades").select("*").eq("user_id", userId).order("traded_at", { ascending: false });

		if (error) {
			console.error("Fetch trades error:", error);
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
		console.error("Fetch trades unexpected error:", error);
		return {
			success: false,
			data: [],
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
