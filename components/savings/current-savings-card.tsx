import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useState, useCallback } from "react";
import { fetchTransactions, calculateCurrentMonthBalanceAfterBudget, type TransactionRecord } from "@/services/transaction-service";
import { fetchBudgets } from "@/services/budget-service";
import { fetchProfile } from "@/services/profile-service";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "@react-navigation/native";

export function CurrentSavingsCard() {
	const [currentSavings, setCurrentSavings] = useState(0);
	const [savingsGoal, setSavingsGoal] = useState<number | null>(null);
	const [loading, setLoading] = useState(true);

	const progressPercentage = savingsGoal ? Math.max(0, Math.min(100, (currentSavings / savingsGoal) * 100)) : 0;

	const loadSavings = useCallback(async () => {
		setLoading(true);
		const [txResult, budgetResult, profileResult] = await Promise.all([fetchTransactions(), fetchBudgets(), fetchProfile()]);

		if (txResult.success) {
			const transactions = (txResult.data || []) as TransactionRecord[];
			const budgets = budgetResult.success ? budgetResult.data : [];

			// Calculate current month savings after budget allocations
			const savingsData = calculateCurrentMonthBalanceAfterBudget(transactions, budgets);

			setCurrentSavings(savingsData.balanceAfterBudget);
		}

		// Set savings goal from profile
		if (profileResult.success && profileResult.data?.monthly_saving_goal) {
			setSavingsGoal(profileResult.data.monthly_saving_goal);
		}

		setLoading(false);
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadSavings();
		}, [loadSavings]),
	);

	return (
		<LinearGradient colors={["#00C950", "#009966"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.savingsCard}>
			<View style={styles.savingsContent}>
				<View style={styles.savingsLeft}>
					<ThemedText style={styles.savingsLabel}>Current Monthly Savings {"\n"} (After Budget)</ThemedText>
					<ThemedText type='defaultSemiBold' style={styles.savingsAmount}>
						{loading ? "..." : `AED ${currentSavings.toFixed(2)}`}
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
			<ThemedText style={styles.progressText}>{loading ? "..." : `${Math.round(progressPercentage)}% of your AED ${savingsGoal ? savingsGoal.toLocaleString() : "0"} goal`}</ThemedText>
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
