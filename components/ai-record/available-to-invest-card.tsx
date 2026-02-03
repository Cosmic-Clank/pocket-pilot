import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { fetchTransactions, calculateTotalBalanceAfterBudget, type TransactionRecord } from "@/services/transaction-service";
import { fetchBudgets } from "@/services/budget-service";
import { fetchProfile } from "@/services/profile-service";
import { fetchStockTrades } from "@/services/stock-trade-service";

export function AvailableToInvestCard() {
	const [loading, setLoading] = useState(true);
	const [availableAmount, setAvailableAmount] = useState(0);
	const [totalSavings, setTotalSavings] = useState(0);
	const [alreadyInvested, setAlreadyInvested] = useState(0);

	const loadFinancialData = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch all required data in parallel
			const [txResult, budgetResult, profileResult, tradesResult] = await Promise.all([fetchTransactions(), fetchBudgets(), fetchProfile(), fetchStockTrades()]);

			const transactions = (txResult.success ? txResult.data : []) as TransactionRecord[];
			const budgets = budgetResult.success ? budgetResult.data : [];

			// Calculate total balance after budgets
			const balanceData = calculateTotalBalanceAfterBudget(transactions, budgets);

			// Get emergency fund actual balance
			const emergencyFund = profileResult.success && profileResult.data ? profileResult.data.emergency_fund_amount || 0 : 0;

			// Calculate already invested (sum of buy trades)
			const trades = tradesResult.success ? tradesResult.data : [];
			const invested = trades.filter((t: any) => t.side === "buy").reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

			// Total savings = balance before budgets
			const savings = balanceData.totalIncome - balanceData.totalExpense;

			// Available to invest = balance after budgets - emergency fund
			const available = Math.max(0, balanceData.balanceAfterBudget - emergencyFund);

			setTotalSavings(savings);
			setAvailableAmount(available);
			setAlreadyInvested(invested);
			setLoading(false);
		} catch (error) {
			console.error("Failed to load financial data:", error);
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadFinancialData();
		}, [loadFinancialData]),
	);

	return (
		<LinearGradient colors={["#10B981", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
			<View style={styles.content}>
				<View style={styles.left}>
					<ThemedText style={styles.label}>Available to Invest</ThemedText>
					<ThemedText type='defaultSemiBold' style={styles.amount}>
						AED {loading ? "..." : availableAmount.toFixed(0)}
					</ThemedText>
				</View>
				<View style={styles.icon}>
					<MaterialCommunityIcons name='currency-usd' size={32} color='#FFFFFF' />
				</View>
			</View>
			<View style={styles.statsContainer}>
				<View style={styles.statItem}>
					<ThemedText style={styles.statLabel}>Total Savings</ThemedText>
					<ThemedText style={styles.statValue}>AED {loading ? "..." : totalSavings.toFixed(0)}</ThemedText>
				</View>
				<View style={styles.statItem}>
					<ThemedText style={styles.statLabel}>Already Invested</ThemedText>
					<ThemedText style={styles.statValue}>AED {loading ? "..." : alreadyInvested.toFixed(2)}</ThemedText>
				</View>
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		gap: 20,
	},
	loadingContainer: {
		paddingVertical: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	content: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	left: {
		flex: 1,
	},
	label: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
		marginBottom: 8,
	},
	amount: {
		fontSize: 28,
		color: "#FFFFFF",
	},
	icon: {
		width: 56,
		height: 56,
		borderRadius: 12,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	statsContainer: {
		flexDirection: "row",
		gap: 16,
	},
	statItem: {
		flex: 1,
	},
	statLabel: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.7)",
		marginBottom: 6,
	},
	statValue: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFFFFF",
	},
});
