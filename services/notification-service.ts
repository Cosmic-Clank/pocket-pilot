import { API_CONFIG, getApiUrl } from "@/constants/config";
import { type BudgetRecord } from "@/services/budget-service";
import { type TransactionRecord } from "@/services/transaction-service";
import { getRecentTransactionsForInsights } from "@/utils/notification-utils";

export interface AiSavingsTip {
	title: string;
	suggestion: string;
	rationale: string;
	estimated_monthly_savings?: number;
	action_items: string[];
}

export interface InvestIdeaSuggestion {
	symbol: string;
	company: string;
	price: number;
	changePct: number;
	thesis: string;
	badge: string;
	badgeColor: string;
}

const SAVE_MONEY_URL = getApiUrl(API_CONFIG.ENDPOINTS.AI_SAVE_MONEY);
const INVEST_IDEA_URL = getApiUrl(API_CONFIG.ENDPOINTS.AI_INVEST_IDEA);

export async function fetchAiSavingsTip(transactions: TransactionRecord[], budgets: BudgetRecord[], savingsGoal = 5000): Promise<AiSavingsTip> {
	const recent = getRecentTransactionsForInsights(transactions, 8);

	const payload = {
		transactions: recent,
		budgets,
		savings_goal: savingsGoal,
	};

	const response = await fetch(SAVE_MONEY_URL, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(payload),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Save-money insight failed: ${text || response.status}`);
	}

	return (await response.json()) as AiSavingsTip;
}

export async function fetchInvestIdea(): Promise<InvestIdeaSuggestion> {
	const response = await fetch(INVEST_IDEA_URL, { method: "GET" });

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Invest idea failed: ${text || response.status}`);
	}

	return (await response.json()) as InvestIdeaSuggestion;
}
