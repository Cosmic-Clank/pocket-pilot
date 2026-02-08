import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchTransactions, type TransactionRecord, type FetchTransactionsResult } from "@/services/transaction-service";

export const TRANSACTIONS_QUERY_KEY = ["transactions"];

/**
 * Hook to fetch transactions with React Query
 * Caches for 3 minutes
 */
export function useTransactions(): UseQueryResult<TransactionRecord[], Error> {
	return useQuery({
		queryKey: TRANSACTIONS_QUERY_KEY,
		queryFn: async () => {
			const result = await fetchTransactions();
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch transactions");
			}
			return result.data;
		},
		staleTime: 3 * 60 * 1000, // 3 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}
