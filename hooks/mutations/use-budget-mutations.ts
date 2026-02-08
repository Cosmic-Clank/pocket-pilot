import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { saveBudget, deleteBudget, type SaveBudgetParams, type SaveBudgetResult } from "@/services/budget-service";
import { BUDGETS_QUERY_KEY } from "../queries/use-budgets";

/**
 * Mutation hook for adding a new budget
 * Automatically invalidates budgets query on success
 */
export function useAddBudget(): UseMutationResult<SaveBudgetResult, Error, SaveBudgetParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: SaveBudgetParams) => {
			return await saveBudget(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate budgets to trigger refetch
				queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
			}
		},
	});
}

/**
 * Mutation hook for deleting a budget
 * Automatically invalidates budgets query on success
 */
export function useDeleteBudget(): UseMutationResult<SaveBudgetResult, Error, string> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (budgetId: string) => {
			return await deleteBudget(budgetId);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate budgets to trigger refetch
				queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY });
			}
		},
	});
}
