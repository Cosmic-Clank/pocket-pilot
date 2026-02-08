import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchBudgets, type BudgetRecord } from "@/services/budget-service";

export const BUDGETS_QUERY_KEY = ["budgets"];

/**
 * Hook to fetch budgets with React Query
 * Caches for 5 minutes
 */
export function useBudgets(): UseQueryResult<BudgetRecord[], Error> {
	return useQuery({
		queryKey: BUDGETS_QUERY_KEY,
		queryFn: async () => {
			const result = await fetchBudgets();
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch budgets");
			}
			return result.data;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 15 * 60 * 1000, // 15 minutes
	});
}
