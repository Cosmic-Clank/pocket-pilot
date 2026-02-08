import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { calculateCurrentMonthBalanceAfterBudget } from "@/services/transaction-service";
import { API_CONFIG, getApiUrl } from "@/constants/config";
import type { TransactionRecord } from "@/services/transaction-service";
import type { BudgetRecord } from "@/services/budget-service";

export const TOP_PICKS_QUERY_KEY = ["topPicks"];

export type TopPick = {
	id: string;
	symbol: string;
	company: string;
	price: string;
	changePct: string;
	changeColor: string;
	badge: string;
	badgeColor: string;
	aiScore: string;
	thirtyDay: string;
	sevenDay: string;
	why: string;
	suggestedInvestment: string;
	sharesToBuy: string;
};

type TopPicksApiResponse = {
	picks?: TopPick[];
	data?: TopPick[];
};

/**
 * Hook to fetch AI-powered top picks for stocks
 * This is a HEAVY endpoint, so we cache for 30 minutes
 * Depends on transactions and budgets to calculate monthly balance
 */
export function useTopPicks(
	transactions: TransactionRecord[],
	budgets: BudgetRecord[],
	enabled: boolean = true,
): UseQueryResult<TopPick[], Error> {
	const monthlyBalance = calculateCurrentMonthBalanceAfterBudget(transactions, budgets);

	return useQuery({
		queryKey: [...TOP_PICKS_QUERY_KEY, monthlyBalance.balanceAfterBudget],
		queryFn: async () => {
			const payload = {
				monthly_balance_after_budget: monthlyBalance.balanceAfterBudget,
			};

			const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.TOP_PICKS), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Top picks request failed");
			}

			const body = (await response.json()) as TopPicksApiResponse;
			return body.picks ?? body.data ?? [];
		},
		staleTime: 30 * 60 * 1000, // 30 minutes - this is a heavy endpoint!
		gcTime: 60 * 60 * 1000, // 1 hour
		enabled: enabled && transactions.length > 0 && budgets.length >= 0, // Only run if we have data
	});
}
