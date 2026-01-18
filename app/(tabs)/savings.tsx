import { StyleSheet, View, ScrollView, Pressable, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useCallback } from "react";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { StatusBar } from "expo-status-bar";
import { fetchTransactions, type TransactionRecord } from "@/services/transaction-service";
import { useFocusEffect } from "@react-navigation/native";

export default function SavingsScreen() {
	const insets = useSafeAreaInsets();
	const [autoInvest, setAutoInvest] = useState(false);
	const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
	const [currentSavings, setCurrentSavings] = useState(0);
	const [loading, setLoading] = useState(true);

	const savingsGoal = 5000;
	const progressPercentage = Math.max(0, Math.min(100, (currentSavings / savingsGoal) * 100));

	const loadTransactions = useCallback(async () => {
		setLoading(true);
		const result = await fetchTransactions();

		if (result.success) {
			setTransactions(result.data);

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
			loadTransactions();
		}, [loadTransactions])
	);

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Savings
				</ThemedText>
			</View>

			{/* Recent Expenses Header */}
			<View style={styles.sectionHeader}>
				<ThemedText style={styles.sectionTitle}>Recent Expenses</ThemedText>
				<ThemedButton title='+ Add' variant='outline' style={styles.addButton} />
			</View>

			{/* Current Savings Card */}
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
			{/* Auto-Invest Section */}
			<View style={styles.autoInvestContainer}>
				<View style={styles.trendingIcon}>
					<Feather name='trending-up' size={24} color='#155DFC' />
				</View>
				<View style={styles.autoInvestLeft}>
					<ThemedText style={styles.autoInvestTitle}>Auto-Invest to Emergency Fund</ThemedText>
					<ThemedText style={styles.autoInvestStatus}>Not active</ThemedText>
				</View>
				<Switch value={autoInvest} onValueChange={setAutoInvest} trackColor={{ false: "#E5E7EB", true: "#86EFAC" }} thumbColor={autoInvest ? "#10B981" : "#9CA3AF"} />
			</View>

			{/* Emergency Fund Tip */}
			<View style={styles.tipBox}>
				<View style={styles.tipIcon}>
					<Feather name='alert-circle' size={24} color='#F59E0B' />
				</View>
				<View style={styles.tipContent}>
					<ThemedText style={styles.tipTitle}>Emergency Fund Tip</ThemedText>
					<ThemedText style={styles.tipText}>Aim to save 3-6 months of expenses for financial security</ThemedText>
				</View>
			</View>

			{/* Educational Investment Options */}
			<View style={styles.investmentHeader}>
				<Feather name='book-open' size={24} color='#9810FA' />
				<ThemedText style={styles.investmentTitle}>Educational Investment Options</ThemedText>
			</View>

			{/* Educational Purpose Only Card */}
			<View style={styles.educationCard}>
				<View style={styles.tipIcon}>
					<Ionicons name='sparkles-outline' size={24} color='#7C3AED' />
				</View>
				<View style={styles.tipContent}>
					<ThemedText style={styles.investmentCardTitle}>Educational Purpose Only</ThemedText>
					<ThemedText style={styles.investmentCardDesc}>These recommendations are for educational purposes based on your income ($5,200/month) and savings. Always consult a financial advisor before investing.</ThemedText>
				</View>
			</View>

			{/* Vanguard S&P 500 ETF Card */}
			<View style={styles.investmentCard}>
				<View style={styles.investmentHeaderRow}>
					<LinearGradient colors={["#AD46FF", "#4F39F6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.investmentCardIcon}>
						<Feather name='trending-up' size={24} color='#FFFFFF' />
					</LinearGradient>
					<View style={styles.investmentTextCol}>
						<ThemedText style={styles.investmentCardTitle}>Vanguard S&P 500 ETF (VOO)</ThemedText>
						<ThemedText style={styles.investmentCardDesc}>Tracks the S&P 500 index with low expense ratio</ThemedText>
						<View style={styles.tags}>
							<View style={styles.tag}>
								<ThemedText style={styles.tagText}>Index Fund</ThemedText>
							</View>
							<View style={[styles.tag, { backgroundColor: "#FEFCE8" }]}>
								<ThemedText style={[styles.tagText, { color: "#A65F00" }]}>Low to Medium Risk</ThemedText>
							</View>
						</View>
					</View>
				</View>

				<View style={styles.details}>
					<View style={[styles.detailItem, styles.detailBox]}>
						<ThemedText style={styles.detailLabel}>Expected Return</ThemedText>
						<ThemedText style={styles.detailValue}>8-10% annually</ThemedText>
					</View>
					<View style={[styles.detailItem, styles.detailBox]}>
						<ThemedText style={styles.detailLabel}>Min. Investment</ThemedText>
						<ThemedText style={styles.detailValue}>$50</ThemedText>
					</View>
				</View>

				<View style={styles.whyBox}>
					<ThemedText style={styles.whyTitle}>Why this option?</ThemedText>
					<ThemedText style={styles.whyText}>Based on your monthly surplus of $3,410 and moderate risk tolerance</ThemedText>
				</View>
			</View>

			{/* Total Bond Market Index Fund Card */}
			<View style={styles.investmentCard}>
				<View style={styles.investmentHeaderRow}>
					<LinearGradient colors={["#AD46FF", "#4F39F6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.investmentCardIcon}>
						<Feather name='trending-up' size={24} color='#FFFFFF' />
					</LinearGradient>
					<View style={styles.investmentTextCol}>
						<ThemedText style={styles.investmentCardTitle}>Total Bond Market Index Fund</ThemedText>
						<ThemedText style={styles.investmentCardDesc}>Diversified portfolio of U.S. investment-grade bonds</ThemedText>
						<View style={styles.tags}>
							<View style={styles.tag}>
								<ThemedText style={styles.tagText}>Bond ETF</ThemedText>
							</View>
							<View style={[styles.tag, { backgroundColor: "#F0FDF4" }]}>
								<ThemedText style={[styles.tagText, { color: "#008236" }]}>Low Risk</ThemedText>
							</View>
						</View>
					</View>
				</View>

				<View style={styles.details}>
					<View style={styles.detailItem}>
						<ThemedText style={styles.detailLabel}>Expected Return</ThemedText>
						<ThemedText style={styles.detailValue}>3-5% annually</ThemedText>
					</View>
					<View style={styles.detailItem}>
						<ThemedText style={styles.detailLabel}>Min. Investment</ThemedText>
						<ThemedText style={styles.detailValue}>$100</ThemedText>
					</View>
				</View>

				<View style={styles.whyBox}>
					<ThemedText style={styles.whyTitle}>Why this option?</ThemedText>
					<ThemedText style={styles.whyText}>Provides stable returns and reduces overall portfolio risk</ThemedText>
				</View>
			</View>

			{/* Monthly Budget Section */}
			<View style={styles.budgetHeader}>
				<ThemedText style={styles.budgetTitle}>Monthly Budget</ThemedText>
				<ThemedButton title='+ Add Budget' variant='primary' style={styles.addBudgetBtn} />
			</View>

			{/* Budget Items */}
			<View style={styles.budgetItemCard}>
				<View style={styles.budgetItem}>
					<View style={styles.budgetItemLeft}>
						<View style={styles.budgetIcon}>
							<Feather name='coffee' size={20} color='#155DFC' />
						</View>
						<View>
							<ThemedText style={styles.budgetName}>Food</ThemedText>
							<ThemedText style={styles.budgetAmount}>$680.00 of $800.00</ThemedText>
						</View>
					</View>
					<ThemedText style={styles.budgetPercent}>85%</ThemedText>
				</View>
				<View style={styles.budgetProgressBar}>
					<View style={[styles.budgetProgressFill, { width: "85%", backgroundColor: "#FBBF24" }]} />
				</View>
			</View>

			<View style={styles.budgetItemCard}>
				<View style={styles.budgetItem}>
					<View style={styles.budgetItemLeft}>
						<View style={styles.budgetIcon}>
							<Feather name='truck' size={20} color='#155DFC' />
						</View>
						<View>
							<ThemedText style={styles.budgetName}>Transport</ThemedText>
							<ThemedText style={styles.budgetAmount}>$450.00 of $500.00</ThemedText>
						</View>
					</View>
					<ThemedText style={styles.budgetPercent}>90%</ThemedText>
				</View>
				<View style={styles.budgetProgressBar}>
					<View style={[styles.budgetProgressFill, { width: "90%", backgroundColor: "#FB923C" }]} />
				</View>

				<View style={styles.warningBox}>
					<ThemedText style={styles.warningText}>You're near your budget limit</ThemedText>
				</View>
			</View>
			<View style={{ height: 60 }} />

			<StatusBar style='dark' backgroundColor='#fff' />
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 30,
		backgroundColor: "#FFFFFF",
	},

	header: {
		marginBottom: 32,
		marginTop: 32,
	},
	title: {
		fontSize: 28,
		color: "#000000",
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
	},
	addLink: {
		fontSize: 14,
		color: "#155DFC",
		fontWeight: "600",
	},
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
	trendingIcon: {
		width: 50,
		height: 50,
		borderRadius: 16,
		backgroundColor: "#EFF6FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
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
	autoInvestContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 16,
		backgroundColor: "#F9FAFB",
		borderRadius: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	autoInvestLeft: {
		flex: 1,
	},
	autoInvestTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000000",
		marginBottom: 2,
	},
	autoInvestStatus: {
		fontSize: 12,
		color: "#6B7280",
	},
	tipBox: {
		flexDirection: "row",
		padding: 16,
		backgroundColor: "#FFFBEB",
		borderRadius: 12,
		borderWidth: 1,
		borderLeftWidth: 1,
		borderLeftColor: "#FEE685",
		borderColor: "#FEE685",
		marginBottom: 24,
		gap: 12,
	},
	tipIcon: {
		marginTop: 2,
	},
	tipContent: {
		flex: 1,
	},
	tipTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#92400E",
		marginBottom: 4,
	},
	tipText: {
		fontSize: 13,
		color: "#B45309",
		lineHeight: 18,
	},
	investmentHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 16,
	},
	investmentIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	investmentTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
	},
	educationCard: {
		padding: 22,
		flexDirection: "row",
		gap: 12,
		backgroundColor: "#FAF5FF",
		borderRadius: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E9D4FF",
	},
	investmentCard: {
		padding: 22,
		backgroundColor: "#fafdff",
		borderRadius: 16,
		marginBottom: 16,
		gap: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	educationIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 8,
	},
	investmentCardIcon: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	investmentHeaderRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 8,
	},
	investmentTextCol: {
		flex: 1,
		gap: 4,
	},
	investmentCardTitle: {
		fontSize: 14,
		color: "#101828",
		marginBottom: 4,
	},
	investmentCardDesc: {
		fontSize: 13,
		color: "#4A5565",
		paddingRight: 12,
		lineHeight: 18,
	},
	tags: {
		flexDirection: "row",
		gap: 8,
		marginTop: 4,
	},
	tag: {
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: "#EFF6FF",
		borderRadius: 12,
	},
	tagText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#1447E6",
	},
	details: {
		flexDirection: "row",
		gap: 14,
		marginTop: 8,
	},
	detailItem: {
		flex: 1,
	},
	detailBox: {
		backgroundColor: "#F9FAFB",
		borderRadius: 12,
		paddingVertical: 12,
		paddingHorizontal: 12,
	},
	detailLabel: {
		fontSize: 13,
		color: "#6B7280",
		marginBottom: 6,
		fontWeight: "600",
	},
	detailValue: {
		fontSize: 20,
		fontWeight: "700",
		color: "#111827",
	},
	whyBox: {
		marginTop: 12,
		backgroundColor: "#FAF5FF",
		borderRadius: 14,
		padding: 14,
	},
	whyTitle: {
		fontSize: 12,
		color: "#59168B",
		marginBottom: 6,
	},
	whyText: {
		fontSize: 13,
		color: "#8200DB",
		lineHeight: 18,
	},
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
	addButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
});
