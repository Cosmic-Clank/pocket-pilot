import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useState, useCallback } from "react";
import { fetchTransactions, type TransactionRecord } from "@/services/transaction-service";
import { useFocusEffect } from "@react-navigation/native";

export function CurrentSavingsCard() {
	const [currentSavings, setCurrentSavings] = useState(0);
	const [loading, setLoading] = useState(true);

	const savingsGoal = 5000;
	const progressPercentage = Math.max(0, Math.min(100, (currentSavings / savingsGoal) * 100));

	const loadSavings = useCallback(async () => {
		setLoading(true);
		const result = await fetchTransactions();

		if (result.success) {
			// Calculate current month savings: SUM(income) - SUM(expense)
			const now = new Date();
			const currentMonth = now.getMonth();
			const currentYear = now.getFullYear();

			const thisMonthTransactions = result.data.filter((tx) => {
				const txDate = new Date(tx.transaction_date);
				return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
			});

			const income = thisMonthTransactions.filter((tx) => tx.type === "income").reduce((sum, tx) => sum + tx.amount, 0);

			const expenses = thisMonthTransactions.filter((tx) => tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);

			setCurrentSavings(income - expenses);
		}

		setLoading(false);
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadSavings();
		}, [loadSavings])
	);

	return (
		<LinearGradient colors={["#00C950", "#009966"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.savingsCard}>
			<View style={styles.savingsContent}>
				<View style={styles.savingsLeft}>
					<ThemedText style={styles.savingsLabel}>Current Savings</ThemedText>
					<ThemedText type='defaultSemiBold' style={styles.savingsAmount}>
						{loading ? "..." : `$${currentSavings.toFixed(2)}`}
					</ThemedText>
				</View>
				<View style={styles.savingsIcon}>
					<MaterialCommunityIcons name='piggy-bank-outline' size={32} color='#FFFFFF' />
				</View>
			</View>
			<View style={styles.progressBarContainer}>
				<View style={styles.progressBar}>
					<View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
				</View>
			</View>
			<ThemedText style={styles.progressText}>{loading ? "..." : `${Math.round(progressPercentage)}% of your $${savingsGoal.toLocaleString()} goal`}</ThemedText>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	savingsCard: {
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		gap: 24,
	},
	savingsContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	savingsLeft: {
		flex: 1,
	},
	savingsLabel: {
		fontSize: 14,
		color: "#ffffffd1",
		marginBottom: 4,
	},
	savingsAmount: {
		fontSize: 22,
		color: "#FFFFFF",
	},
	savingsIcon: {
		width: 56,
		height: 56,
		borderRadius: 12,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	progressBarContainer: {
		gap: 8,
	},
	progressBar: {
		height: 12,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: 12,
		backgroundColor: "#FFFFFF",
		borderRadius: 4,
	},
	progressText: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.9)",
	},
});
