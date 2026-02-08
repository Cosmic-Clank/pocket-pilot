import { StyleSheet, View, Switch } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider, BottomSheetModal } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useRef } from "react";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { AddBudgetBottomSheet } from "@/components/budget/add-budget-bottom-sheet";
import { AddEmergencyFundBottomSheet } from "@/components/emergency-fund/add-emergency-fund-bottom-sheet";
import { useUpdateEmergencyFundAutoInvest } from "@/hooks/mutations/use-profile-mutations";
import { CurrentSavingsCard } from "@/components/savings/current-savings-card";
import { MonthlyBudgets } from "@/components/savings/monthly-budgets";
import { EmergencyFundBalanceCard } from "@/components/emergency-fund/emergency-fund-balance-card";
import { EmergencyFundTransactionBottomSheet } from "@/components/emergency-fund/emergency-fund-transaction-bottom-sheet";
import { TopPicksSection } from "@/components/ai-record/top-picks";
import { useProfile } from "@/hooks/queries/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_QUERY_KEY } from "@/hooks/queries/use-profile";

export default function SavingsScreen() {
	const insets = useSafeAreaInsets();
	const queryClient = useQueryClient();
	const [transactionType, setTransactionType] = useState<"deposit" | "withdraw">("deposit");
	const addBudgetModalRef = useRef<BottomSheetModal>(null);
	const emergencyFundModalRef = useRef<BottomSheetModal>(null);
	const emergencyFundTransactionModalRef = useRef<BottomSheetModal>(null);

	// Fetch profile using React Query
	const { data: profile, isLoading: loading } = useProfile();

	// Use React Query mutation for emergency fund auto-invest
	const updateAutoInvestMutation = useUpdateEmergencyFundAutoInvest();

	const autoInvest = profile?.emergency_fund_auto_invest !== null;

	// Handle emergency fund toggle
	const handleEmergencyFundToggle = async (value: boolean) => {
		if (value) {
			// Open bottom sheet to set amount
			emergencyFundModalRef.current?.present();
		} else {
			// Disable emergency fund using mutation
			updateAutoInvestMutation.mutate({ amount: null });
		}
	};

	const handleDeposit = () => {
		setTransactionType("deposit");
		emergencyFundTransactionModalRef.current?.present();
	};

	const handleWithdraw = () => {
		setTransactionType("withdraw");
		emergencyFundTransactionModalRef.current?.present();
	};

	return (
		<GestureHandlerRootView style={styles.gestureContainer}>
			<BottomSheetModalProvider>
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
					</View>

					{/* Current Savings Card */}
					<CurrentSavingsCard />
					{/* Emergency Fund Balance Card */}
					<EmergencyFundBalanceCard balance={profile?.emergency_fund_amount || 0} onDeposit={handleDeposit} onWithdraw={handleWithdraw} />
					{/* Auto-Invest Section */}
					<View style={styles.autoInvestContainer}>
						<View style={styles.autoInvestSubContainer}>
							<View style={styles.trendingIcon}>
								<Feather name='trending-up' size={24} color='#155DFC' />
							</View>
							<View style={styles.autoInvestLeft}>
								<ThemedText style={styles.autoInvestTitle}>Auto-Invest to Emergency Fund</ThemedText>
								{autoInvest && profile?.emergency_fund_auto_invest ? <ThemedText style={styles.autoInvestAmount}>AED {profile.emergency_fund_auto_invest.toFixed(2)}/month</ThemedText> : <ThemedText style={styles.autoInvestStatus}>Not active</ThemedText>}
							</View>
							<Switch value={autoInvest} onValueChange={handleEmergencyFundToggle} trackColor={{ false: "#E5E7EB", true: "#86EFAC" }} thumbColor={autoInvest ? "#10B981" : "#9CA3AF"} />
						</View>
						{profile?.emergency_fund_auto_invest && (
							<View style={styles.autoInvestTipContainer}>
								<ThemedText style={styles.autoInvestTipContent}>AED {profile.emergency_fund_auto_invest.toFixed(2)} will be deducted from every income</ThemedText>
							</View>
						)}
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

					{/* Monthly Budget Section */}
					<MonthlyBudgets onAddBudgetPress={() => addBudgetModalRef.current?.present()} />

					<View style={{ height: 50 }} />

					{/* Add Budget Bottom Sheet Modal */}
					<AddBudgetBottomSheet
						ref={addBudgetModalRef}
						onClose={() => {
							// Modal will auto-refresh data via React Query
							addBudgetModalRef.current?.dismiss();
						}}
					/>

					{/* Add Emergency Fund Bottom Sheet Modal */}
					<AddEmergencyFundBottomSheet
						ref={emergencyFundModalRef}
						onClose={() => {
							// Profile will auto-refresh via React Query
						}}
						onSuccess={() => {
							// Close modal - data will auto-refresh
							emergencyFundModalRef.current?.dismiss();
						}}
					/>

					{/* Emergency Fund Transaction Bottom Sheet */}
					<EmergencyFundTransactionBottomSheet
						ref={emergencyFundTransactionModalRef}
						type={transactionType}
						currentBalance={profile?.emergency_fund_amount || 0}
						onClose={() => {}}
						onSuccess={() => {}}
					/>
				</ThemedScrollView>
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	gestureContainer: {
		flex: 1,
	},
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
	trendingIcon: {
		width: 50,
		height: 50,
		borderRadius: 16,
		backgroundColor: "#EFF6FF",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	autoInvestContainer: {
		paddingVertical: 16,
		paddingHorizontal: 16,
		backgroundColor: "#F9FAFB",
		borderRadius: 12,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	autoInvestSubContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
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
	autoInvestAmount: {
		fontSize: 12,
		color: "#6A7282",
		lineHeight: 16,
	},
	autoInvestTipContainer: {
		flexDirection: "row",
		padding: 12,
		backgroundColor: "#EFF6FF",
		borderRadius: 12,
		marginTop: 16,
	},
	autoInvestTipContent: {
		fontSize: 13,
		color: "#0369A1",
		fontWeight: "600",
		flex: 1,
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
	addButton: {
		paddingVertical: 8,
		paddingHorizontal: 16,
	},
});
