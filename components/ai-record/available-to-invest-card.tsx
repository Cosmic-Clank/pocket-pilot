import { View, StyleSheet, ActivityIndicator } from "react-native";
import { useMemo } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useStockTrades } from "@/hooks/queries/use-stock-trades";
import { calculateCurrentMonthBalanceAfterBudget, type TransactionRecord } from "@/services/transaction-service";

export function AvailableToInvestCard() {
	const { data: transactions = [], isLoading: txLoading } = useTransactions();
	const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
	const { data: trades = [], isLoading: tradesLoading } = useStockTrades();

	const loading = txLoading || budgetsLoading || tradesLoading;

	const { availableAmount, alreadyInvested } = useMemo(() => {
		// Calculate total balance after budgets
		const balanceData = calculateCurrentMonthBalanceAfterBudget(transactions, budgets);


		// Calculate already invested (sum of buy trades)
		const invested = trades.filter((t: any) => t.side === "buy").reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

		// Total savings = balance before budgets
		return {
			availableAmount: balanceData.balanceAfterBudget,
			alreadyInvested: invested,
		};
	}, [transactions, budgets, trades]);

	return (
		<LinearGradient colors={["#10B981", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
			<View style={styles.content}>
				<View style={styles.left}>
					<ThemedText style={styles.label}>Monthly Saving (after budgets)</ThemedText>
					<ThemedText type='defaultSemiBold' style={styles.amount}>
						AED {loading ? "..." : availableAmount.toFixed(0)}
					</ThemedText>
				</View>
				<View style={styles.icon}>
					<MaterialCommunityIcons name='piggy-bank-outline' size={32} color='#FFFFFF' />
				</View>
			</View>
			<View style={styles.statsContainer}>

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
