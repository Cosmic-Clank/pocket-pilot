import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { executeTrade, type ExecuteTradeParams, type ExecuteTradeResult } from "@/services/stock-trade-service";
import { STOCK_TRADES_QUERY_KEY } from "../queries/use-stock-trades";
import { TRANSACTIONS_QUERY_KEY } from "../queries/use-transactions";

/**
 * Mutation hook for executing a stock trade (buy/sell)
 * Automatically invalidates stock trades and transactions queries on success
 */
export function useExecuteTrade(): UseMutationResult<ExecuteTradeResult, Error, ExecuteTradeParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: ExecuteTradeParams) => {
			return await executeTrade(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate both stock trades and transactions
				queryClient.invalidateQueries({ queryKey: STOCK_TRADES_QUERY_KEY });
				queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
			}
		},
	});
}
