import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import {
	addToWatchlist,
	removeFromWatchlist,
	type AddToWatchlistParams,
	type AddWatchlistResult,
	type RemoveWatchlistResult,
} from "@/services/stock-watchlist-service";
import { WATCHLIST_QUERY_KEY } from "../queries/use-watchlist";

/**
 * Mutation hook for adding a stock to watchlist
 * Automatically invalidates watchlist query on success
 */
export function useAddToWatchlist(): UseMutationResult<AddWatchlistResult, Error, AddToWatchlistParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: AddToWatchlistParams) => {
			return await addToWatchlist(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate watchlist to trigger refetch
				queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEY });
			}
		},
	});
}

/**
 * Mutation hook for removing a stock from watchlist
 * Automatically invalidates watchlist query on success
 */
export function useRemoveFromWatchlist(): UseMutationResult<RemoveWatchlistResult, Error, string> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (symbol: string) => {
			return await removeFromWatchlist(symbol);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate watchlist to trigger refetch
				queryClient.invalidateQueries({ queryKey: WATCHLIST_QUERY_KEY });
			}
		},
	});
}
