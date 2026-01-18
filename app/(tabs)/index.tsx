import { StyleSheet, View, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { FinancialOverviewCard } from "@/components/home/financial-overview-card";
import { MonthlyBudgets } from "@/components/savings/monthly-budgets";
import { CurrentSavingsCard } from "@/components/savings/current-savings-card";
import { InsightsSection } from "@/components/home/insights-section";

export default function HomeScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.container}>
			<ThemedScrollView style={styles.scrollView}>
				{/* Header with Gradient */}
				<LinearGradient colors={["#155DFC", "#432DD7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 20 }]}>
					<View style={styles.headerContent}>
						<View>
							<ThemedText style={styles.welcomeText}>Welcome Back</ThemedText>
							<ThemedText style={styles.subtitleText}>Here is your financial overview</ThemedText>
						</View>
						<Pressable style={styles.notificationButton}>
							<Feather name='bell' size={24} color='#FFFFFF' />
							<View style={styles.notificationBadge}>
								<ThemedText style={styles.badgeText}>3</ThemedText>
							</View>
						</Pressable>
					</View>
				</LinearGradient>

				{/* Financial Overview Card */}
				<FinancialOverviewCard />

				{/* Monthly Spending Section */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<ThemedText style={styles.sectionTitle}>Monthly Spending</ThemedText>
						<Pressable>
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
						<Pressable>
							<ThemedText style={styles.viewAllText}>View All</ThemedText>
						</Pressable>
					</View>
					<View style={styles.savingsContainer}>
						<CurrentSavingsCard />
					</View>
				</View>

				{/* Insights Section */}
				<InsightsSection />
			</ThemedScrollView>
			<StatusBar style='auto' backgroundColor='transparent' />
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
		top: -4,
		right: -4,
		backgroundColor: "#EF4444",
		borderRadius: 10,
		width: 20,
		height: 20,
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
