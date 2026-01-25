import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useState, useCallback } from "react";
import { fetchTransactions, calculateTotalBalance, type TransactionRecord } from "@/services/transaction-service";
import { useFocusEffect } from "@react-navigation/native";

export function FinancialOverviewCard() {
	const [totalBalance, setTotalBalance] = useState(0);
	const [income, setIncome] = useState(0);
	const [expenses, setExpenses] = useState(0);
	const [loading, setLoading] = useState(true);

	const loadFinancialData = useCallback(async () => {
		setLoading(true);
		const result = await fetchTransactions();

		if (result.success) {
			const transactions = result.data as TransactionRecord[];

			// Calculate total balance across all time
			const balanceData = calculateTotalBalance(transactions);

			setIncome(balanceData.income);
			setExpenses(balanceData.expenses);
			setTotalBalance(balanceData.balance);
		}

		setLoading(false);
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadFinancialData();
		}, [loadFinancialData]),
	);

	return (
		<View style={styles.card}>
			<ThemedText style={styles.cardLabel}>Total Balance</ThemedText>
			<ThemedText style={styles.balanceAmount}>{loading ? "..." : `$${totalBalance.toFixed(2)}`}</ThemedText>

			<View style={styles.statsRow}>
				<View style={styles.statItem}>
					<View style={styles.statHeader}>
						<Feather name='trending-up' size={16} color='#10B981' />
						<ThemedText style={styles.statLabel}>Income</ThemedText>
					</View>
					<ThemedText style={styles.incomeAmount}>{loading ? "..." : `$${income.toFixed(2)}`}</ThemedText>
				</View>

				<View style={styles.statItem}>
					<View style={styles.statHeader}>
						<Feather name='trending-down' size={16} color='#EF4444' />
						<ThemedText style={styles.statLabel}>Expenses</ThemedText>
					</View>
					<ThemedText style={styles.expenseAmount}>{loading ? "..." : `$${expenses.toFixed(2)}`}</ThemedText>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		padding: 24,
		marginHorizontal: 20,
		marginTop: -50,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	cardLabel: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 8,
	},
	balanceAmount: {
		fontSize: 32,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 24,
	},
	statsRow: {
		flexDirection: "row",
		gap: 24,
	},
	statItem: {
		flex: 1,
	},
	statHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 8,
	},
	statLabel: {
		fontSize: 13,
		color: "#6B7280",
	},
	incomeAmount: {
		fontSize: 20,
		fontWeight: "600",
		color: "#10B981",
	},
	expenseAmount: {
		fontSize: 20,
		fontWeight: "600",
		color: "#EF4444",
	},
});
