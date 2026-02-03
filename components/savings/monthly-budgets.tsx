import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { fetchBudgets, type BudgetRecord } from "@/services/budget-service";
import { fetchTransactions, type TransactionRecord } from "@/services/transaction-service";
import { CATEGORY_ICON_MAP } from "@/constants/config";
import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";

interface MonthlyBudgetsProps {
	onAddBudgetPress: () => void;
	showHeader?: boolean;
	limit?: number;
}

export function MonthlyBudgets({ onAddBudgetPress, showHeader = true, limit }: MonthlyBudgetsProps) {
	const [budgets, setBudgets] = useState<BudgetRecord[]>([]);
	const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
	const [loading, setLoading] = useState(true);

	const loadBudgetData = useCallback(async () => {
		setLoading(true);

		// Fetch transactions for calculating spent amounts
		const transactionsResult = await fetchTransactions();
		if (transactionsResult.success) {
			setTransactions(transactionsResult.data);
		}

		// Fetch budgets
		const budgetsResult = await fetchBudgets();
		if (budgetsResult.success) {
			setBudgets(budgetsResult.data);
		}

		setLoading(false);
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadBudgetData();
		}, [loadBudgetData]),
	);
	// Helper function to calculate spent amount for a budget category in current month
	const getSpentAmount = (category: string): number => {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		return transactions
			.filter((tx) => {
				const txDate = new Date(tx.transaction_date);
				return tx.type === "expense" && tx.category.toLowerCase() === category.toLowerCase() && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
			})
			.reduce((sum, tx) => sum + tx.amount, 0);
	};

	// Helper function to get progress color based on percentage
	const getProgressColor = (percentage: number): string => {
		if (percentage >= 90) return "#EF4444"; // Red
		if (percentage >= 75) return "#FB923C"; // Orange
		return "#FBBF24"; // Yellow
	};

	return (
		<View>
			{/* Monthly Budget Section */}
			{showHeader && (
				<View style={styles.budgetHeader}>
					<ThemedText style={styles.budgetTitle}>Monthly Budget</ThemedText>
					<ThemedButton title='+ Add Budget' variant='primary' style={styles.addBudgetBtn} onPress={onAddBudgetPress} />
				</View>
			)}

			{/* Budget Items - Dynamic Rendering */}
			{loading ? (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size='large' color='#155DFC' />
				</View>
			) : budgets.length === 0 ? (
				<ThemedText style={styles.emptyBudgetText}>No budgets set yet. Create your first budget!</ThemedText>
			) : (
				(limit ? budgets.slice(0, limit) : budgets).map((budget) => {
					const spentAmount = getSpentAmount(budget.category);
					const budgetAmount = typeof budget.amount === "string" ? parseFloat(budget.amount) : budget.amount;
					const percentage = Math.min(100, (spentAmount / budgetAmount) * 100);
					const progressColor = getProgressColor(percentage);
					const categoryLabel = budget.category.charAt(0).toUpperCase() + budget.category.slice(1);
					const iconName = (CATEGORY_ICON_MAP[budget.category] as any) || "tag";

					return (
						<View key={budget.id} style={styles.budgetItemCard}>
							<View style={styles.budgetItem}>
								<View style={styles.budgetItemLeft}>
									<View style={styles.budgetIcon}>
										<Feather name={iconName} size={20} color='#155DFC' />
									</View>
									<View>
										<ThemedText style={styles.budgetName}>{categoryLabel}</ThemedText>
										<ThemedText style={styles.budgetAmount}>
											AED {spentAmount.toFixed(2)} of AED {budgetAmount.toFixed(2)}
										</ThemedText>
									</View>
								</View>
								<ThemedText style={styles.budgetPercent}>{Math.round(percentage)}%</ThemedText>
							</View>
							<View style={styles.budgetProgressBar}>
								<View style={[styles.budgetProgressFill, { width: `${percentage}%`, backgroundColor: progressColor }]} />
							</View>

							{percentage >= 90 && (
								<View style={styles.warningBox}>
									<ThemedText style={styles.warningText}>You're near your budget limit</ThemedText>
								</View>
							)}
						</View>
					);
				})
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	budgetHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
		marginTop: 24,
	},
	budgetTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
	},
	addBudgetBtn: {
		paddingVertical: 8,
		paddingHorizontal: 18,
	},
	budgetItemCard: {
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 16,
	},
	budgetItem: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	budgetItemLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	budgetIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	budgetName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000000",
		marginBottom: 2,
	},
	budgetAmount: {
		fontSize: 12,
		color: "#6B7280",
	},
	budgetPercent: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000000",
	},
	budgetProgressBar: {
		height: 12,
		backgroundColor: "#E5E7EB",
		borderRadius: 999,
		overflow: "hidden",
		marginBottom: 16,
	},
	budgetProgressFill: {
		height: 12,
		borderRadius: 999,
	},
	warningBox: {
		padding: 12,
		backgroundColor: "#FEE2E2",
		borderRadius: 8,
		marginTop: 8,
	},
	warningText: {
		fontSize: 12,
		color: "#DC2626",
		fontWeight: "500",
	},
	emptyBudgetText: {
		fontSize: 14,
		color: "#6B7280",
		textAlign: "center",
		paddingVertical: 24,
		fontStyle: "italic",
	},
	loadingContainer: {
		paddingVertical: 40,
		alignItems: "center",
		justifyContent: "center",
	},
});
