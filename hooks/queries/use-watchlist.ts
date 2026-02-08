import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchWatchlist, type WatchlistRecord } from "@/services/stock-watchlist-service";

export const WATCHLIST_QUERY_KEY = ["watchlist"];

/**
 * Hook to fetch user's stock watchlist with React Query
 * Caches for 5 minutes
 */
export function useWatchlist(): UseQueryResult<WatchlistRecord[], Error> {
	return useQuery({
		queryKey: WATCHLIST_QUERY_KEY,
		queryFn: async () => {
			const result = await fetchWatchlist();
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch watchlist");
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
	});
}
