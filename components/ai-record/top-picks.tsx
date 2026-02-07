import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedAlert } from "@/components/themed-alert";
import { API_CONFIG, getApiUrl } from "@/constants/config";
import { calculateCurrentMonthBalanceAfterBudget, fetchTransactions } from "@/services/transaction-service";
import { fetchBudgets } from "@/services/budget-service";
import { executeTrade } from "@/services/stock-trade-service";
import { addToWatchlist, isInWatchlist } from "@/services/stock-watchlist-service";
import { useFocusEffect } from "expo-router";

type TopPick = {
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

export function TopPicksSection() {
	const [loading, setLoading] = useState(true);
	const [picks, setPicks] = useState<TopPick[]>([]);
	const [error, setError] = useState<string | null>(null);

	useFocusEffect(
		useCallback(() => {
			let isMounted = true;

			const loadTopPicks = async () => {
				try {
					setLoading(true);
					setError(null);

					// Pull the latest financial context from Supabase before requesting picks
					const [txResult, budgetResult] = await Promise.all([fetchTransactions(), fetchBudgets()]);

					if (!txResult.success || !budgetResult.success) {
						const firstError = txResult.error || budgetResult.error || "Failed to load financial data";
						throw new Error(firstError);
					}

					const monthlyBalance = calculateCurrentMonthBalanceAfterBudget(txResult.data, budgetResult.data);
					console.log("Monthly balance after budget:", monthlyBalance);

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
					const apiPicks = body.picks ?? body.data ?? [];

					if (isMounted) {
						setPicks(apiPicks);
					}
				} catch (err) {
					console.error("Top picks fetch failed:", err);
					if (isMounted) {
						const message = err instanceof Error ? err.message : "Failed to load recommendations";
						setError(message);
						setPicks([]);
					}
				} finally {
					if (isMounted) {
						setLoading(false);
					}
				}
			};

			loadTopPicks();

			return () => {
				isMounted = false;
			};
		}, []),
	);

	return (
		<View>
			<View style={styles.sectionContainer}>
				<ThemedText style={styles.sectionTitle}>Top Picks for You</ThemedText>
			</View>
			<ThemedText style={styles.subtitle}>AI analyzed various stocks and found these rising opportunities that match your savings and budgets</ThemedText>

			{error ? (
				<View style={styles.errorBox}>
					<ThemedText style={styles.errorText}>{"Network Error, please try again later."}</ThemedText>
				</View>
			) : null}

			{loading ? (
				<View style={styles.loadingBox}>
					<ActivityIndicator size='small' color='#432DD7' />
				</View>
			) : (
				picks.map((pick) => <StockCard key={pick.id} pick={pick} />)
			)}
		</View>
	);
}

type StockCardProps = {
	pick: TopPick;
};

function StockCard({ pick }: StockCardProps) {
	const [investing, setInvesting] = useState(false);
	const [addingToWatchlist, setAddingToWatchlist] = useState(false);
	const [inWatchlist, setInWatchlist] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({ title: "", message: "" });

	// Check if already in watchlist on mount
	useEffect(() => {
		const checkWatchlist = async () => {
			const isIn = await isInWatchlist(pick.symbol);
			setInWatchlist(isIn);
		};
		checkWatchlist();
	}, [pick.symbol]);

	const handleInvest = async () => {
		try {
			setInvesting(true);

			// Parse values from string formats
			const amount = parseFloat(pick.suggestedInvestment.replace(/[$,]/g, ""));
			const price = parseFloat(pick.price.replace(/[$,]/g, ""));
			const shares = parseFloat(pick.sharesToBuy.split(" ")[0]);

			if (isNaN(amount) || isNaN(price) || isNaN(shares)) {
				throw new Error("Invalid investment data");
			}

			const result = await executeTrade({
				symbol: pick.symbol,
				side: "buy",
				amount,
				priceAtTrade: price,
				shares,
				source: "ai-recommendation",
				note: `AI-recommended investment: ${pick.why}`,
			});

			if (result.success) {
				setAlertContent({
					title: "Investment Successful",
					message: result.message,
				});
			} else {
				setAlertContent({
					title: "Investment Failed",
					message: result.error || result.message,
				});
			}
			setAlertVisible(true);
		} catch (error) {
			console.error("Investment error:", error);
			setAlertContent({
				title: "Error",
				message: error instanceof Error ? error.message : "Failed to process investment",
			});
			setAlertVisible(true);
		} finally {
			setInvesting(false);
		}
	};

	const handleAddToWatchlist = async () => {
		try {
			setAddingToWatchlist(true);

			const result = await addToWatchlist({
				symbol: pick.symbol,
				company: pick.company,
				note: `AI Score: ${pick.aiScore} - ${pick.badge}`,
				addedFrom: "ai-recommendation",
			});

			if (result.success) {
				setInWatchlist(true);
				setAlertContent({
					title: "Added to Watchlist",
					message: `${pick.symbol} has been added to your watchlist`,
				});
			} else {
				setAlertContent({
					title: "Failed",
					message: result.error || result.message,
				});
			}
			setAlertVisible(true);
		} catch (error) {
			console.error("Add to watchlist error:", error);
			setAlertContent({
				title: "Error",
				message: error instanceof Error ? error.message : "Failed to add to watchlist",
			});
			setAlertVisible(true);
		} finally {
			setAddingToWatchlist(false);
		}
	};

	return (
		<View style={styles.card}>
			<View style={styles.cardHeader}>
				<View style={styles.headerContent}>
					<View style={styles.nameRow}>
						<ThemedText style={styles.name}>{pick.symbol}</ThemedText>
						<View style={[styles.badge, { backgroundColor: pick.badgeColor }]}>
							<ThemedText style={styles.badgeText}>{pick.badge}</ThemedText>
						</View>
					</View>
					<ThemedText style={styles.company}>{pick.company}</ThemedText>
				</View>
				<View style={styles.priceSection}>
					<View style={styles.priceRow}>
						<View>
							<ThemedText style={styles.priceLabel}>Price</ThemedText>
							<ThemedText style={styles.price}>{pick.price}</ThemedText>
						</View>
						<View style={styles.changeTag}>
							<Feather name='trending-up' size={12} color={pick.changeColor} />
						</View>
					</View>
				</View>
			</View>

			<View style={styles.scoreRow}>
				<View style={styles.scoreItem}>
					<ThemedText style={styles.scoreLabel}>AI Score</ThemedText>
					<ThemedText style={styles.scoreValue}>{pick.aiScore}</ThemedText>
				</View>
				<View style={styles.scoreItem}>
					<ThemedText style={styles.scoreLabel}>30-Day</ThemedText>
					<ThemedText style={styles.scoreValue}>{pick.thirtyDay}</ThemedText>
				</View>
				<View style={styles.scoreItem}>
					<ThemedText style={styles.scoreLabel}>7-Day</ThemedText>
					<ThemedText style={styles.scoreValue}>{pick.sevenDay}</ThemedText>
				</View>
			</View>

			<View style={styles.whyBox}>
				<MaterialCommunityIcons name='lightbulb-question-outline' size={18} color='#9810FA' />
				<ThemedText style={styles.whyTitle}>Why this recommendation?</ThemedText>
			</View>
			<ThemedText style={styles.whyText}>{pick.why}</ThemedText>

			<View style={styles.investRow}>
				<View>
					<ThemedText style={styles.investLabel}>Suggested Investment</ThemedText>
					<ThemedText style={styles.investValue}>{pick.suggestedInvestment}</ThemedText>
				</View>
				<View>
					<ThemedText style={styles.investLabel}>Shares to Buy</ThemedText>
					<ThemedText style={styles.investValue}>{pick.sharesToBuy}</ThemedText>
				</View>
			</View>

			<ThemedButton title={`AED Invest ${pick.suggestedInvestment}`} variant='primary' style={styles.investButton} onPress={handleInvest} loading={investing} disabled={investing} />
			<ThemedButton title={inWatchlist ? "✓ Added to Watchlist" : "Add to Watchlist"} variant='outline' style={[styles.watchlistButton, inWatchlist && styles.watchlistButtonAdded]} onPress={handleAddToWatchlist} loading={addingToWatchlist} disabled={addingToWatchlist || inWatchlist} />

			<ThemedAlert visible={alertVisible} title={alertContent.title} message={alertContent.message} onDismiss={() => setAlertVisible(false)} />
		</View>
	);
}

const styles = StyleSheet.create({
	sectionContainer: {
		marginBottom: 16,
		paddingHorizontal: 30,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: 16,
		lineHeight: 18,
		paddingHorizontal: 30,
	},
	loadingBox: {
		paddingHorizontal: 30,
		paddingVertical: 20,
		alignItems: "center",
	},
	errorBox: {
		paddingHorizontal: 30,
		paddingVertical: 12,
		backgroundColor: "#FEF2F2",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#FECACA",
		marginBottom: 12,
		marginHorizontal: 30,
	},
	errorText: {
		color: "#B91C1C",
		fontSize: 12,
		fontWeight: "600",
	},
	card: {
		backgroundColor: "#FAFDFF",
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		marginHorizontal: 30,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 10,
		alignItems: "flex-start",
	},
	headerContent: {
		flex: 1,
	},
	priceSection: {
		alignItems: "flex-end",
		marginLeft: 12,
	},
	priceLabel: {
		fontSize: 10,
		color: "#9CA3AF",
		fontWeight: "500",
		marginBottom: 2,
	},
	priceRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 6,
	},
	price: {
		fontSize: 16,
		fontWeight: "700",
		color: "#000000",
	},
	changeTag: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
		paddingVertical: 3,
		paddingHorizontal: 6,
		backgroundColor: "#F3F4F6",
		borderRadius: 5,
	},
	changeTagText: {
		fontSize: 11,
		fontWeight: "600",
	},
	nameRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 2,
	},
	name: {
		fontSize: 13,
		fontWeight: "700",
		color: "#000000",
	},
	badge: {
		paddingVertical: 3,
		paddingHorizontal: 8,
		borderRadius: 5,
	},
	badgeText: {
		fontSize: 10,
		fontWeight: "600",
		color: "#FFFFFF",
	},
	company: {
		fontSize: 11,
		color: "#6B7280",
	},
	scoreRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 10,
	},
	scoreItem: {
		flex: 1,
		backgroundColor: "#F9FAFB",
		borderRadius: 8,
		padding: 8,
		alignItems: "center",
	},
	scoreLabel: {
		fontSize: 10,
		color: "#9CA3AF",
		marginBottom: 2,
		fontWeight: "500",
	},
	scoreValue: {
		fontSize: 13,
		fontWeight: "700",
		color: "#111827",
	},
	whyBox: {
		flexDirection: "row",
		gap: 6,
		alignItems: "center",
		marginBottom: 4,
	},
	whyTitle: {
		fontSize: 11,
		color: "#7C3AED",
		fontWeight: "600",
	},
	whyText: {
		fontSize: 12,
		color: "#8B5CF6",
		lineHeight: 16,
		marginBottom: 10,
	},
	investRow: {
		flexDirection: "row",
		gap: 16,
		marginBottom: 10,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: "#E5E7EB",
	},
	investLabel: {
		fontSize: 11,
		color: "#9CA3AF",
		marginBottom: 2,
		fontWeight: "500",
	},
	investValue: {
		fontSize: 14,
		fontWeight: "700",
		color: "#111827",
	},
	investButton: {
		marginBottom: 8,
	},
	watchlistButton: {
		marginBottom: 0,
	},
	watchlistButtonAdded: {
		backgroundColor: "#F0FDF4",
		borderColor: "#BBF7D0",
	},
});
