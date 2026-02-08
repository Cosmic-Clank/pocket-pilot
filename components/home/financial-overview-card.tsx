import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { SkeletonPulse } from "@/components/ui/skeleton-pulse";
import { useMemo } from "react";
import { calculateTotalBalance } from "@/services/transaction-service";
import { useTransactions } from "@/hooks/queries/use-transactions";

export function FinancialOverviewCard() {
	// Fetch transactions using React Query
	const { data: transactions = [], isLoading: loading } = useTransactions();

	// Calculate financial data from transactions
	const { totalBalance, income, expenses } = useMemo(() => {
		const balanceData = calculateTotalBalance(transactions);
		return {
			totalBalance: balanceData.balance,
			income: balanceData.income,
			expenses: balanceData.expenses,
		};
	}, [transactions]);

	return (
		<View style={styles.card}>
			{loading ? (
				// Skeleton loading state
				<>
					<SkeletonPulse height={14} width="40%" style={{ marginBottom: 12 }} borderRadius={4} />
					<SkeletonPulse height={40} width="60%" style={{ marginBottom: 24 }} borderRadius={8} />
					
					<View style={styles.statsRow}>
						<View style={styles.statItem}>
							<SkeletonPulse height={16} width="70%" style={{ marginBottom: 12 }} borderRadius={4} />
							<SkeletonPulse height={24} width="80%" borderRadius={6} />
						</View>
						<View style={styles.statItem}>
							<SkeletonPulse height={16} width="70%" style={{ marginBottom: 12 }} borderRadius={4} />
							<SkeletonPulse height={24} width="80%" borderRadius={6} />
						</View>
					</View>
				</>
			) : (
				// Actual content
				<>
					<ThemedText style={styles.cardLabel}>Total Balance</ThemedText>
					<ThemedText style={styles.balanceAmount}>{`AED ${totalBalance.toFixed(2)}`}</ThemedText>

					<View style={styles.statsRow}>
						<View style={styles.statItem}>
							<View style={styles.statHeader}>
								<Feather name='trending-up' size={16} color='#10B981' />
								<ThemedText style={styles.statLabel}>Income</ThemedText>
							</View>
							<ThemedText style={styles.incomeAmount}>{`AED ${income.toFixed(2)}`}</ThemedText>
						</View>

						<View style={styles.statItem}>
							<View style={styles.statHeader}>
								<Feather name='trending-down' size={16} color='#EF4444' />
								<ThemedText style={styles.statLabel}>Expenses</ThemedText>
							</View>
							<ThemedText style={styles.expenseAmount}>{`AED ${expenses.toFixed(2)}`}</ThemedText>
						</View>
					</View>
				</>
			)}
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
