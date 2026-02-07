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

const NETWORK_ERROR_MESSAGE = "Network error. Please refresh.";

function isHtmlErrorResponse(response: Response, text: string): boolean {
	const contentType = response.headers.get("content-type");
	if (contentType?.toLowerCase().includes("text/html")) {
		return true;
	}
	return /<!doctype html|<html/i.test(text);
}

function buildApiError(prefix: string, response: Response, text: string): Error {
	if (isHtmlErrorResponse(response, text)) {
		return new Error(NETWORK_ERROR_MESSAGE);
	}
	return new Error(`${prefix}: ${text || response.status}`);
}

export async function fetchAiSavingsTip(transactions: TransactionRecord[], budgets: BudgetRecord[], savingsGoal = 5000): Promise<AiSavingsTip> {
	const recent = getRecentTransactionsForInsights(transactions, 20);

	const payload = {
		transactions: recent,
		budgets,
		savings_goal: savingsGoal,
	};

	try {
		const response = await fetch(SAVE_MONEY_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(payload),
		});

		if (!response.ok) {
			const text = await response.text();
			throw buildApiError("Save-money insight failed", response, text);
		}

		return (await response.json()) as AiSavingsTip;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === NETWORK_ERROR_MESSAGE) {
				throw error;
			}
			if (/network|failed to fetch/i.test(error.message)) {
				throw new Error(NETWORK_ERROR_MESSAGE);
			}
			throw error;
		}
		throw new Error(NETWORK_ERROR_MESSAGE);
	}
}

export async function fetchInvestIdea(): Promise<InvestIdeaSuggestion> {
	try {
		const response = await fetch(INVEST_IDEA_URL, { method: "GET" });

		if (!response.ok) {
			const text = await response.text();
			throw buildApiError("Invest idea failed", response, text);
		}

		return (await response.json()) as InvestIdeaSuggestion;
	} catch (error) {
		if (error instanceof Error) {
			if (error.message === NETWORK_ERROR_MESSAGE) {
				throw error;
			}
			if (/network|failed to fetch/i.test(error.message)) {
				throw new Error(NETWORK_ERROR_MESSAGE);
			}
			throw error;
		}
		throw new Error(NETWORK_ERROR_MESSAGE);
	}
}
