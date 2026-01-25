import { Modal, View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { type BudgetRecord } from "@/services/budget-service";
import { type TransactionRecord } from "@/services/transaction-service";
import { CATEGORY_ICON_MAP } from "@/constants/config";

interface BudgetAlertModalProps {
	visible: boolean;
	onClose: () => void;
	budgets: BudgetRecord[];
	transactions: TransactionRecord[];
}

interface BudgetStatus {
	category: string;
	budgetAmount: number;
	spent: number;
	percentUsed: number;
	remaining: number;
	icon: string;
	status: "safe" | "warning" | "danger";
}

export function BudgetAlertModal({ visible, onClose, budgets, transactions }: BudgetAlertModalProps) {
	const computeBudgetStatuses = (): BudgetStatus[] => {
		const now = new Date();
		const currentMonth = now.getMonth();
		const currentYear = now.getFullYear();

		const monthExpenses = transactions.filter((tx) => {
			const txDate = new Date(tx.transaction_date);
			return tx.type.toLowerCase() === "expense" && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
		});

		const categorySpending = new Map<string, number>();
		monthExpenses.forEach((tx) => {
			const cat = tx.category || "other";
			categorySpending.set(cat, (categorySpending.get(cat) || 0) + tx.amount);
		});

		const statuses: BudgetStatus[] = budgets.map((budget) => {
			const spent = categorySpending.get(budget.category) || 0;
			const percentUsed = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
			const remaining = budget.amount - spent;

			let status: "safe" | "warning" | "danger" = "safe";
			if (percentUsed >= 100) status = "danger";
			else if (percentUsed >= 85) status = "warning";

			return {
				category: budget.category,
				budgetAmount: budget.amount,
				spent,
				percentUsed,
				remaining,
				icon: CATEGORY_ICON_MAP[budget.category] || "tag",
				status,
			};
		});

		statuses.sort((a, b) => b.percentUsed - a.percentUsed);
		return statuses;
	};

	const budgetStatuses = computeBudgetStatuses();
	const alertCount = budgetStatuses.filter((b) => b.status === "warning" || b.status === "danger").length;

	const getStatusColor = (status: "safe" | "warning" | "danger") => {
		switch (status) {
			case "danger":
				return "#EF4444";
			case "warning":
				return "#F59E0B";
			case "safe":
				return "#10B981";
		}
	};

	const getStatusText = (status: "safe" | "warning" | "danger") => {
		switch (status) {
			case "danger":
				return "Over Budget";
			case "warning":
				return "Almost There";
			case "safe":
				return "On Track";
		}
	};

	return (
		<Modal visible={visible} animationType='fade' transparent statusBarTranslucent>
			<View style={styles.overlay}>
				<View style={styles.modal}>
					{/* Header */}
					<LinearGradient colors={["#F59E0B", "#D97706"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
						<View style={styles.headerTop}>
							<View style={styles.headerLeft}>
								<View style={styles.iconCircle}>
									<Feather name='alert-triangle' size={24} color='#FFFFFF' />
								</View>
								<View>
									<ThemedText style={styles.headerTitle}>Budget Alerts</ThemedText>
									<ThemedText style={styles.headerSubtitle}>{alertCount > 0 ? `${alertCount} ${alertCount === 1 ? "alert" : "alerts"} need attention` : "All budgets on track"}</ThemedText>
								</View>
							</View>
							<Pressable onPress={onClose} hitSlop={12}>
								<Feather name='x' size={24} color='#FFFFFF' />
							</Pressable>
						</View>
					</LinearGradient>

					{/* Content */}
					<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
						{budgetStatuses.length === 0 ? (
							<View style={styles.emptyState}>
								<Feather name='check-circle' size={48} color='#10B981' />
								<ThemedText style={styles.emptyTitle}>No Budgets Set</ThemedText>
								<ThemedText style={styles.emptySubtitle}>Add budgets to track your spending</ThemedText>
							</View>
						) : (
							budgetStatuses.map((budget, index) => (
								<View key={index} style={styles.budgetCard}>
									<View style={styles.budgetHeader}>
										<View style={styles.budgetLeft}>
											<View style={[styles.budgetIcon, { backgroundColor: `${getStatusColor(budget.status)}20` }]}>
												<Feather name={budget.icon as any} size={20} color={getStatusColor(budget.status)} />
											</View>
											<View>
												<ThemedText style={styles.budgetCategory}>{budget.category.charAt(0).toUpperCase() + budget.category.slice(1)}</ThemedText>
												<ThemedText style={styles.budgetBudget}>${budget.budgetAmount.toFixed(0)} budget</ThemedText>
											</View>
										</View>
										<View style={styles.budgetRight}>
											<View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(budget.status)}20` }]}>
												<ThemedText style={[styles.statusText, { color: getStatusColor(budget.status) }]}>{getStatusText(budget.status)}</ThemedText>
											</View>
										</View>
									</View>

									<View style={styles.budgetStats}>
										<View style={styles.statRow}>
											<ThemedText style={styles.statLabel}>Spent</ThemedText>
											<ThemedText style={[styles.statValue, { color: getStatusColor(budget.status) }]}>${budget.spent.toFixed(0)}</ThemedText>
										</View>
										<View style={styles.statRow}>
											<ThemedText style={styles.statLabel}>Remaining</ThemedText>
											<ThemedText style={styles.statValue}>${Math.max(0, budget.remaining).toFixed(0)}</ThemedText>
										</View>
									</View>

									<View style={styles.progressContainer}>
										<View style={styles.progressBar}>
											<View
												style={[
													styles.progressFill,
													{
														width: `${Math.min(100, budget.percentUsed)}%`,
														backgroundColor: getStatusColor(budget.status),
													},
												]}
											/>
										</View>
										<ThemedText style={[styles.progressText, { color: getStatusColor(budget.status) }]}>{budget.percentUsed.toFixed(0)}%</ThemedText>
									</View>

									{budget.status === "danger" && (
										<View style={styles.alertBox}>
											<Feather name='alert-circle' size={16} color='#EF4444' />
											<ThemedText style={styles.alertText}>You've exceeded this budget by ${(budget.spent - budget.budgetAmount).toFixed(0)}</ThemedText>
										</View>
									)}

									{budget.status === "warning" && (
										<View style={[styles.alertBox, { backgroundColor: "#FEF3C7" }]}>
											<Feather name='info' size={16} color='#F59E0B' />
											<ThemedText style={[styles.alertText, { color: "#92400E" }]}>Only ${budget.remaining.toFixed(0)} left in this budget</ThemedText>
										</View>
									)}
								</View>
							))
						)}

						<View style={{ height: 20 }} />
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	modal: {
		width: "100%",
		maxWidth: 450,
		maxHeight: "80%",
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		overflow: "hidden",
	},
	header: {
		padding: 20,
		paddingBottom: 24,
	},
	headerTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	headerLeft: {
		flexDirection: "row",
		gap: 12,
		flex: 1,
	},
	iconCircle: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#FFFFFF",
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 13,
		color: "rgba(255, 255, 255, 0.9)",
	},
	content: {
		padding: 20,
	},
	emptyState: {
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#111827",
		marginTop: 16,
	},
	emptySubtitle: {
		fontSize: 14,
		color: "#6B7280",
		marginTop: 4,
	},
	budgetCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 16,
		padding: 16,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	budgetHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 16,
	},
	budgetLeft: {
		flexDirection: "row",
		gap: 12,
		flex: 1,
	},
	budgetIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	budgetCategory: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},
	budgetBudget: {
		fontSize: 13,
		color: "#6B7280",
		marginTop: 2,
	},
	budgetRight: {
		alignItems: "flex-end",
	},
	statusBadge: {
		paddingHorizontal: 10,
		paddingVertical: 4,
		borderRadius: 12,
	},
	statusText: {
		fontSize: 12,
		fontWeight: "600",
	},
	budgetStats: {
		flexDirection: "row",
		gap: 20,
		marginBottom: 12,
	},
	statRow: {
		flex: 1,
	},
	statLabel: {
		fontSize: 12,
		color: "#6B7280",
		marginBottom: 4,
	},
	statValue: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
	},
	progressContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	progressBar: {
		flex: 1,
		height: 8,
		backgroundColor: "#E5E7EB",
		borderRadius: 4,
		overflow: "hidden",
	},
	progressFill: {
		height: 8,
		borderRadius: 4,
	},
	progressText: {
		fontSize: 14,
		fontWeight: "700",
		minWidth: 45,
		textAlign: "right",
	},
	alertBox: {
		flexDirection: "row",
		gap: 8,
		backgroundColor: "#FEE2E2",
		padding: 10,
		borderRadius: 8,
		marginTop: 12,
		alignItems: "center",
	},
	alertText: {
		fontSize: 12,
		color: "#991B1B",
		flex: 1,
		fontWeight: "500",
	},
});
