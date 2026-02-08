import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchAiSavingsTip, fetchInvestIdea, type AiSavingsTip, type InvestIdeaSuggestion } from "@/services/notification-service";
import type { TransactionRecord } from "@/services/transaction-service";
import type { BudgetRecord } from "@/services/budget-service";

export const AI_SAVINGS_TIP_QUERY_KEY = ["aiSavingsTip"];
export const AI_INVEST_IDEA_QUERY_KEY = ["aiInvestIdea"];

/**
 * Hook to fetch AI-powered savings tip
 * Depends on transactions, budgets, and savings goal
 * Caches for 30 minutes
 */
export function useAiSavingsTip(
	transactions: TransactionRecord[],
	budgets: BudgetRecord[],
	savingsGoal: number = 5000,
	enabled: boolean = true,
): UseQueryResult<AiSavingsTip, Error> {
	return useQuery({
		queryKey: [...AI_SAVINGS_TIP_QUERY_KEY, transactions.length, budgets.length, savingsGoal],
		queryFn: async () => {
			return await fetchAiSavingsTip(transactions, budgets, savingsGoal);
		},
		staleTime: 30 * 60 * 1000, // 30 minutes
		gcTime: 60 * 60 * 1000, // 1 hour
		enabled: enabled && transactions.length > 0,
		retry: 1, // Only retry once since it's AI
	});
}

/**
 * Hook to fetch AI-powered investment idea suggestion
 * Caches for 1 hour (general market recommendation)
 */
export function useAiInvestIdea(enabled: boolean = true): UseQueryResult<InvestIdeaSuggestion, Error> {
	return useQuery({
		queryKey: AI_INVEST_IDEA_QUERY_KEY,
		queryFn: async () => {
			return await fetchInvestIdea();
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 2 * 60 * 60 * 1000, // 2 hours
		enabled,
		retry: 1, // Only retry once since it's AI
	});
}
