import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { fetchStockTrades } from "@/services/stock-trade-service";
import { API_CONFIG } from "@/constants/config";

interface PriceResponseItem {
	price: number;
	change: number;
	changePercent: number;
}

interface HoldingRow {
	symbol: string;
	shares: number;
	costBasis: number;
	currentPrice: number;
	currentValue: number;
	pnl: number;
	pnlPercent: number;
}

const NETWORK_ERROR_MESSAGE = "Network error. Please refresh.";

function isHtmlResponse(response: Response, text?: string): boolean {
	const contentType = response.headers.get("content-type");
	if (contentType?.toLowerCase().includes("text/html")) {
		return true;
	}
	return text ? /<!doctype html|<html/i.test(text) : false;
}

export function PortfolioSection() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [holdings, setHoldings] = useState<HoldingRow[]>([]);
	const [totals, setTotals] = useState({ value: 0, cost: 0, pnl: 0, pnlPercent: 0 });

	const loadPortfolio = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const tradesRes = await fetchStockTrades();
			if (!tradesRes.success) {
				throw new Error(tradesRes.error || "Failed to load trades");
			}

			const trades = tradesRes.data || [];
			if (!trades.length) {
				setHoldings([]);
				setTotals({ value: 0, cost: 0, pnl: 0, pnlPercent: 0 });
				return;
			}

			const symbolMap: Record<string, { shares: number; cost: number }> = {};
			for (const t of trades) {
				const symbol = t.symbol?.toUpperCase?.() || "";
				if (!symbol) continue;
				if (!symbolMap[symbol]) {
					symbolMap[symbol] = { shares: 0, cost: 0 };
				}

				if (t.side === "buy") {
					symbolMap[symbol].shares += t.shares || 0;
					symbolMap[symbol].cost += t.amount || 0;
				} else if (t.side === "sell") {
					symbolMap[symbol].shares -= t.shares || 0;
					symbolMap[symbol].cost -= t.amount || 0;
				}
			}

			const symbols = Object.keys(symbolMap).filter((s) => symbolMap[s].shares > 0);
			if (!symbols.length) {
				setHoldings([]);
				setTotals({ value: 0, cost: 0, pnl: 0, pnlPercent: 0 });
				return;
			}

			const priceRes = await fetch(`${API_CONFIG.BASE_URL}/api/stock/batch-prices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symbols }),
			});

			if (!priceRes.ok) {
				const text = await priceRes.text();
				if (isHtmlResponse(priceRes, text)) {
					throw new Error(NETWORK_ERROR_MESSAGE);
				}
				throw new Error("Failed to fetch prices");
			}

			if (isHtmlResponse(priceRes)) {
				throw new Error(NETWORK_ERROR_MESSAGE);
			}

			const priceData = (await priceRes.json()) as Record<string, PriceResponseItem>;

			const rows: HoldingRow[] = symbols.map((symbol) => {
				const { shares, cost } = symbolMap[symbol];
				const price = priceData?.[symbol]?.price ?? 0;
				const currentValue = shares * price;
				const pnl = currentValue - cost;
				const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;

				return {
					symbol,
					shares,
					costBasis: cost,
					currentPrice: price,
					currentValue,
					pnl,
					pnlPercent,
				};
			});

			const totalsNext = rows.reduce(
				(acc, row) => {
					acc.value += row.currentValue;
					acc.cost += row.costBasis;
					acc.pnl += row.pnl;
					return acc;
				},
				{ value: 0, cost: 0, pnl: 0, pnlPercent: 0 },
			);
			totalsNext.pnlPercent = totalsNext.cost > 0 ? (totalsNext.pnl / totalsNext.cost) * 100 : 0;

			setHoldings(rows.sort((a, b) => b.currentValue - a.currentValue));
			setTotals(totalsNext);
		} catch (err) {
			console.error("Portfolio load error:", err);
			setError(err instanceof Error ? err.message : "Failed to load portfolio");
			setHoldings([]);
			setTotals({ value: 0, cost: 0, pnl: 0, pnlPercent: 0 });
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadPortfolio();
		}, [loadPortfolio]),
	);

	const insight = useMemo(() => {
		if (!holdings.length) return "No active positions yet. Start with small buys to build your portfolio.";
		const top = holdings[0];
		if (totals.pnl > 0) {
			return `${top.symbol} is your largest holding. Lock gains if P/L crosses ${(totals.pnlPercent + 5).toFixed(1)}% or add on pullbacks.`;
		}
		return `${top.symbol} leads your exposure. Consider dollar-cost averaging if you still like the thesis.`;
	}, [holdings, totals.pnl, totals.pnlPercent]);

	if (loading) {
		return (
			<View style={styles.card}>
				<ActivityIndicator size='small' color='#432DD7' />
			</View>
		);
	}

	if (error) {
		return (
			<View style={styles.card}>
				<ThemedText style={styles.errorText}>{error}</ThemedText>
			</View>
		);
	}

	if (!holdings.length) {
		return (
			<View style={styles.card}>
				<ThemedText style={styles.title}>Your Portfolio</ThemedText>
				<ThemedText style={styles.subtitle}>No holdings yet. Invest via Top Picks to see your portfolio here.</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.card}>
			<View style={styles.headerRow}>
				<View>
					<ThemedText style={styles.title}>Your Portfolio</ThemedText>
					<ThemedText style={styles.subtitle}>Live snapshot of your positions</ThemedText>
				</View>
				<View style={styles.chip}>
					<Feather name={totals.pnl >= 0 ? "trending-up" : "trending-down"} size={14} color={totals.pnl >= 0 ? "#10B981" : "#EF4444"} />
					<ThemedText style={[styles.chipText, { color: totals.pnl >= 0 ? "#10B981" : "#EF4444" }]}>
						{totals.pnl >= 0 ? "+" : ""}
						{totals.pnlPercent.toFixed(2)}%
					</ThemedText>
				</View>
			</View>

			<View style={styles.statRow}>
				<View style={styles.statBox}>
					<ThemedText style={styles.statLabel}>Total Value</ThemedText>
					<ThemedText style={styles.statValue}>${totals.value.toFixed(0)}</ThemedText>
				</View>
				<View style={styles.statBox}>
					<ThemedText style={styles.statLabel}>P/L</ThemedText>
					<ThemedText style={[styles.statValue, { color: totals.pnl >= 0 ? "#10B981" : "#EF4444" }]}>
						{totals.pnl >= 0 ? "+" : ""}${totals.pnl.toFixed(0)}
					</ThemedText>
				</View>
			</View>

			{holdings.slice(0, 3).map((h) => (
				<View key={h.symbol} style={styles.holdingRow}>
					<View style={styles.holdingLeft}>
						<ThemedText style={styles.holdingSymbol}>{h.symbol}</ThemedText>
						<ThemedText style={styles.holdingShares}>{h.shares.toFixed(2)} shares</ThemedText>
					</View>
					<View style={styles.holdingRight}>
						<ThemedText style={styles.holdingValue}>${h.currentValue.toFixed(0)}</ThemedText>
						<View style={styles.holdingPnlRow}>
							<Feather name={h.pnl >= 0 ? "trending-up" : "trending-down"} size={12} color={h.pnl >= 0 ? "#10B981" : "#EF4444"} />
							<ThemedText style={[styles.holdingPnl, { color: h.pnl >= 0 ? "#10B981" : "#EF4444" }]}>
								{h.pnl >= 0 ? "+" : ""}
								{h.pnlPercent.toFixed(1)}%
							</ThemedText>
						</View>
					</View>
				</View>
			))}

			<View style={styles.insightBox}>
				<Feather name='info' size={16} color='#432DD7' />
				<ThemedText style={styles.insightText}>{insight}</ThemedText>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#F9FAFB",
		borderRadius: 14,
		padding: 16,
		marginBottom: 20,
		marginHorizontal: 30,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		gap: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "700",
		color: "#000000",
	},
	subtitle: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 2,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	chip: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 6,
		paddingHorizontal: 10,
		backgroundColor: "#EEF2FF",
		borderRadius: 10,
	},
	chipText: {
		fontSize: 12,
		fontWeight: "700",
	},
	statRow: {
		flexDirection: "row",
		gap: 12,
	},
	statBox: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		borderRadius: 10,
		padding: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		gap: 4,
	},
	statLabel: {
		fontSize: 11,
		color: "#6B7280",
		fontWeight: "600",
	},
	statValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
	},
	holdingRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	holdingLeft: {
		gap: 2,
	},
	holdingRight: {
		alignItems: "flex-end",
		gap: 4,
	},
	holdingSymbol: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000000",
	},
	holdingShares: {
		fontSize: 12,
		color: "#6B7280",
	},
	holdingValue: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000000",
	},
	holdingPnlRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	holdingPnl: {
		fontSize: 12,
		fontWeight: "700",
	},
	insightBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		padding: 10,
		backgroundColor: "#EEF2FF",
		borderRadius: 10,
	},
	insightText: {
		fontSize: 12,
		color: "#312E81",
		flex: 1,
		lineHeight: 16,
	},
	errorText: {
		fontSize: 13,
		color: "#B91C1C",
	},
});
