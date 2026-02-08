import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { saveExpense, type SaveExpenseParams, type SaveExpenseResult } from "@/services/transaction-service";
import { TRANSACTIONS_QUERY_KEY } from "../queries/use-transactions";

/**
 * Mutation hook for adding a new expense transaction
 * Automatically invalidates transactions query on success
 */
export function useAddTransaction(): UseMutationResult<SaveExpenseResult, Error, SaveExpenseParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: SaveExpenseParams) => {
			return await saveExpense(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate transactions to trigger refetch
				queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
			}
		},
	});
}
