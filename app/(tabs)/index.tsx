import { StyleSheet, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useMemo } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FinancialOverviewCard } from "@/components/home/financial-overview-card";
import { SalaryDayCard } from "@/components/home/salary-day-card";
import { MonthlyBudgets } from "@/components/savings/monthly-budgets";
import { CurrentSavingsCard } from "@/components/savings/current-savings-card";
import { InsightsSection } from "@/components/home/insights-section";
import { NotificationModal } from "@/components/home/notification-modal";
import { BudgetAlertModal } from "@/components/home/budget-alert-modal";
import { SavingsTipModal } from "@/components/home/savings-tip-modal";
import { computeBudgetUsage, computeSavingsProgress } from "@/utils/notification-utils";
import { useTransactions } from "@/hooks/queries/use-transactions";
import { useBudgets } from "@/hooks/queries/use-budgets";
import { useProfile } from "@/hooks/queries/use-profile";
import { useAiSavingsTip, useAiInvestIdea } from "@/hooks/queries/use-ai-notifications";

export default function HomeScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [showNotifications, setShowNotifications] = useState(false);
	const [showBudgetAlert, setShowBudgetAlert] = useState(false);
	const [showSavingsTip, setShowSavingsTip] = useState(false);

	// Fetch core data with React Query
	const { data: transactions = [], isLoading: transactionsLoading } = useTransactions();
	const { data: budgets = [], isLoading: budgetsLoading } = useBudgets();
	const { data: profile, isLoading: profileLoading } = useProfile();

	// Get savings goal from profile
	const savingsGoal = profile?.monthly_saving_goal ?? 5000;

	// Fetch AI recommendations (depends on transactions and budgets)
	const {
		data: savingsTip,
		isLoading: savingsTipLoading,
		error: savingsTipError,
	} = useAiSavingsTip(transactions, budgets, savingsGoal, transactions.length > 0);

	const {
		data: investIdea,
		isLoading: investIdeaLoading,
		error: investIdeaError,
	} = useAiInvestIdea();

	// Compute stats from data
	const budgetUsage = useMemo(() => {
		if (budgets.length === 0 && transactions.length === 0) return null;
		const budgetStats = computeBudgetUsage(budgets, transactions);
		return {
			percent: Math.round(budgetStats.percentUsed),
			spent: budgetStats.spent,
			total: budgetStats.totalBudget,
		};
	}, [budgets, transactions]);

	const savingsProgress = useMemo(() => {
		if (transactions.length === 0) return null;
		const savingsStats = computeSavingsProgress(transactions, budgets, savingsGoal);
		return {
			percent: Math.round(savingsStats.progressPercent),
			saved: savingsStats.currentSavings,
		};
	}, [transactions, budgets, savingsGoal]);

	// Overall loading state
	const notifLoading = transactionsLoading || budgetsLoading || profileLoading || savingsTipLoading || investIdeaLoading;
	const notifError = savingsTipError?.message || investIdeaError?.message || null;

	return (
		<View style={styles.container}>
			<ThemedScrollView style={styles.scrollView}>
				{/* Header with Gradient */}
				<LinearGradient colors={["#155DFC", "#432DD7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 20 }]}>
					<View style={styles.headerContent}>
						<View>
							<ThemedText style={styles.welcomeText}>Welcome {profile?.display_name ? profile.display_name.charAt(0).toUpperCase() + profile.display_name.slice(1) + "!" : 'Back'}</ThemedText>
							<ThemedText style={styles.subtitleText}>Here is your financial overview</ThemedText>
						</View>
						<Pressable style={styles.notificationButton} onPress={() => setShowNotifications(true)}>
							<Feather name='bell' size={24} color='#FFFFFF' />
							<View style={styles.notificationBadge}>
								<ThemedText style={styles.badgeText}></ThemedText>
							</View>
						</Pressable>
					</View>
				</LinearGradient>

				{/* Financial Overview Card */}
				<FinancialOverviewCard />

				{/* Salary Day Card */}
				<SalaryDayCard onSalaryAdded={() => {}} />

				{/* Monthly Spending Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<ThemedText style={styles.sectionTitle}>Monthly Spending</ThemedText>
						<Pressable onPress={() => router.navigate("/savings")}>
							<ThemedText style={styles.viewAllText}>View All</ThemedText>
						</Pressable>
					</View>
					<View style={styles.spendingContainer}>
						<MonthlyBudgets onAddBudgetPress={() => {}} showHeader={false} limit={3} />
					</View>
				</View>

				{/* Savings Progress Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<ThemedText style={styles.sectionTitle}>Savings Progress</ThemedText>
						<Pressable onPress={() => router.navigate("/savings")}>
							<ThemedText style={styles.viewAllText}>View All</ThemedText>
						</Pressable>
					</View>
					<View style={styles.savingsContainer}>
						<CurrentSavingsCard />
					</View>
				</View>

				{/* Insights Section */}
				<InsightsSection onBudgetAlertPress={() => setShowBudgetAlert(true)} onSavingsTipPress={() => setShowSavingsTip(true)} />
			</ThemedScrollView>
		<NotificationModal visible={showNotifications} onClose={() => setShowNotifications(false)} loading={notifLoading} error={notifError} budgetUsage={budgetUsage} savingsProgress={savingsProgress} investIdea={investIdea ?? null} savingsTip={savingsTip ?? null} savingsGoal={savingsGoal} />
		<BudgetAlertModal visible={showBudgetAlert} onClose={() => setShowBudgetAlert(false)} budgets={budgets} transactions={transactions} />
		<SavingsTipModal visible={showSavingsTip} onClose={() => setShowSavingsTip(false)} loading={notifLoading} tip={savingsTip ?? null} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	header: {
		paddingHorizontal: 20,
		paddingBottom: 80,
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
	},
	headerContent: {
		paddingTop: 10,
		paddingBottom: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
	},
	welcomeText: {
		fontSize: 24,
		fontWeight: "700",
		color: "#FFFFFF",
		marginBottom: 4,
	},
	subtitleText: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
	},
	notificationButton: {
		position: "relative",
	},
	notificationBadge: {
		position: "absolute",
		top: -2,
		right: -2,
		backgroundColor: "#EF4444",
		borderRadius: 10,
		width: 10,
		height: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	badgeText: {
		fontSize: 11,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	scrollView: {
		flex: 1,
	},
	section: {
		marginTop: 32,
	},
	sectionHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 20,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000000",
	},
	viewAllText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#155DFC",
	},
	spendingContainer: {
		paddingHorizontal: 20,
	},
	savingsContainer: {
		paddingHorizontal: 20,
	},
});
