import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchStockTrades } from "@/services/stock-trade-service";

export const STOCK_TRADES_QUERY_KEY = ["stockTrades"];

/**
 * Hook to fetch user's stock trades with React Query
 * Caches for 5 minutes
 */
export function useStockTrades(): UseQueryResult<any[], Error> {
	return useQuery({
		queryKey: STOCK_TRADES_QUERY_KEY,
		queryFn: async () => {
			const result = await fetchStockTrades();
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch stock trades");
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
	});
}
