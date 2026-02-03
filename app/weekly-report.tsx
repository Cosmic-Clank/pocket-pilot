import { View, StyleSheet, Pressable, ScrollView, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { ThemedText } from "@/components/themed-text";
import { fetchTransactions, type TransactionRecord } from "@/services/transaction-service";
import { computeWeeklyStats, type WeeklyStats } from "@/utils/weekly-analytics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function WeeklyReportScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const [loading, setLoading] = useState(true);
	const [stats, setStats] = useState<WeeklyStats | null>(null);

	useEffect(() => {
		loadWeeklyData();
	}, []);

	const loadWeeklyData = async () => {
		try {
			setLoading(true);
			const result = await fetchTransactions();
			if (result.success) {
				const weeklyStats = computeWeeklyStats(result.data as TransactionRecord[]);
				setStats(weeklyStats);
			}
		} catch (error) {
			console.error("Weekly report error:", error);
		} finally {
			setLoading(false);
		}
	};

	const renderHeader = () => (
		<LinearGradient colors={["#155DFC", "#432DD7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 16 }]}>
			<View style={styles.headerContent}>
				<Pressable onPress={() => router.back()} hitSlop={16}>
					<Feather name='arrow-left' size={24} color='#FFFFFF' />
				</Pressable>
				<ThemedText style={styles.headerTitle}>Weekly Report</ThemedText>
				<View style={{ width: 24 }} />
			</View>
			<ThemedText style={styles.headerSubtitle}>Last 7 days analysis</ThemedText>
		</LinearGradient>
	);

	const renderOverviewCards = () => {
		if (!stats) return null;

		return (
			<View style={styles.overviewContainer}>
				<View style={styles.overviewRow}>
					<LinearGradient colors={["#EF4444", "#DC2626"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.overviewCard}>
						<Feather name='trending-down' size={24} color='#FFFFFF' />
						<ThemedText style={styles.overviewLabel}>Total Spent</ThemedText>
						<ThemedText style={styles.overviewAmount}>AED {stats.totalSpending.toFixed(0)}</ThemedText>
						{stats.weekOverWeekChange !== 0 && (
							<View style={styles.changeContainer}>
								<Feather name={stats.weekOverWeekChange > 0 ? "arrow-up" : "arrow-down"} size={12} color='#FFFFFF' />
								<ThemedText style={styles.changeText}>{Math.abs(stats.weekOverWeekChange).toFixed(1)}%</ThemedText>
							</View>
						)}
					</LinearGradient>

					<LinearGradient colors={["#10B981", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.overviewCard}>
						<Feather name='trending-up' size={24} color='#FFFFFF' />
						<ThemedText style={styles.overviewLabel}>Total Income</ThemedText>
						<ThemedText style={styles.overviewAmount}>AED {stats.totalIncome.toFixed(0)}</ThemedText>
					</LinearGradient>
				</View>

				<View style={styles.overviewRow}>
					<View style={[styles.overviewCard, { backgroundColor: "#F3F4F6" }]}>
						<Feather name='activity' size={24} color='#155DFC' />
						<ThemedText style={[styles.overviewLabel, { color: "#6B7280" }]}>Daily Average</ThemedText>
						<ThemedText style={[styles.overviewAmount, { color: "#111827" }]}>AED {stats.averageDailySpending.toFixed(0)}</ThemedText>
					</View>

					<View style={[styles.overviewCard, { backgroundColor: "#F3F4F6" }]}>
						<Feather name='file-text' size={24} color='#155DFC' />
						<ThemedText style={[styles.overviewLabel, { color: "#6B7280" }]}>Transactions</ThemedText>
						<ThemedText style={[styles.overviewAmount, { color: "#111827" }]}>{stats.transactionCount}</ThemedText>
					</View>
				</View>
			</View>
		);
	};

	const renderDailyChart = () => {
		if (!stats || stats.dailyBreakdown.length === 0) return null;

		const maxAmount = Math.max(...stats.dailyBreakdown.map((d) => d.amount), 1);

		return (
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Feather name='bar-chart-2' size={20} color='#155DFC' />
					<ThemedText style={styles.sectionTitle}>Daily Breakdown</ThemedText>
				</View>

				<View style={styles.chartContainer}>
					{stats.dailyBreakdown.map((day, index) => {
						const barHeight = maxAmount > 0 ? (day.amount / maxAmount) * 120 : 0;
						const isToday = index === stats.dailyBreakdown.length - 1;

						return (
							<View key={day.date} style={styles.chartBar}>
								<View style={styles.barWrapper}>
									<View style={[styles.bar, { height: Math.max(barHeight, 4), backgroundColor: isToday ? "#155DFC" : "#E5E7EB" }]} />
								</View>
								<ThemedText style={[styles.barLabel, isToday && styles.barLabelActive]}>{day.dayName}</ThemedText>
								<ThemedText style={styles.barAmount}>AED {day.amount.toFixed(0)}</ThemedText>
							</View>
						);
					})}
				</View>
			</View>
		);
	};

	const renderTopCategories = () => {
		if (!stats || stats.categories.length === 0) return null;

		const topThree = stats.categories.slice(0, 3);

		return (
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Feather name='pie-chart' size={20} color='#155DFC' />
					<ThemedText style={styles.sectionTitle}>Top Spending Categories</ThemedText>
				</View>

				{topThree.map((cat, index) => (
					<View key={cat.category} style={styles.categoryCard}>
						<View style={styles.categoryLeft}>
							<View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
								<Feather name={cat.icon as any} size={20} color={cat.color} />
							</View>
							<View style={{ flex: 1 }}>
								<ThemedText style={styles.categoryName}>{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</ThemedText>
								<ThemedText style={styles.categoryCount}>{cat.transactionCount} transactions</ThemedText>
							</View>
						</View>

						<View style={styles.categoryRight}>
							<ThemedText style={styles.categoryAmount}>AED {cat.amount.toFixed(0)}</ThemedText>
							<ThemedText style={styles.categoryPercent}>{cat.percentage.toFixed(1)}%</ThemedText>
						</View>

						<View style={styles.categoryBar}>
							<View style={[styles.categoryBarFill, { width: `${cat.percentage}%`, backgroundColor: cat.color }]} />
						</View>
					</View>
				))}
			</View>
		);
	};

	const renderAllCategories = () => {
		if (!stats || stats.categories.length <= 3) return null;

		const remaining = stats.categories.slice(3);

		return (
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Feather name='list' size={20} color='#6B7280' />
					<ThemedText style={styles.sectionTitle}>Other Categories</ThemedText>
				</View>

				{remaining.map((cat) => (
					<View key={cat.category} style={styles.miniCategoryCard}>
						<View style={styles.categoryLeft}>
							<View style={[styles.miniCategoryIcon, { backgroundColor: `${cat.color}15` }]}>
								<Feather name={cat.icon as any} size={16} color={cat.color} />
							</View>
							<ThemedText style={styles.categoryName}>{cat.category.charAt(0).toUpperCase() + cat.category.slice(1)}</ThemedText>
						</View>
						<ThemedText style={styles.categoryAmount}>AED {cat.amount.toFixed(0)}</ThemedText>
					</View>
				))}
			</View>
		);
	};

	const renderInsights = () => {
		if (!stats) return null;

		const insights: Array<{ icon: string; title: string; message: string; color: string }> = [];

		if (stats.weekOverWeekChange > 15) {
			insights.push({
				icon: "alert-circle",
				title: "Spending Increased",
				message: `You spent ${stats.weekOverWeekChange.toFixed(0)}% more than last week. Consider reviewing your budget.`,
				color: "#F59E0B",
			});
		} else if (stats.weekOverWeekChange < -15) {
			insights.push({
				icon: "check-circle",
				title: "Great Progress!",
				message: `You spent ${Math.abs(stats.weekOverWeekChange).toFixed(0)}% less than last week. Keep it up!`,
				color: "#10B981",
			});
		}

		if (stats.topCategory && stats.topCategory.percentage > 40) {
			insights.push({
				icon: "info",
				title: `High ${stats.topCategory.category} Spending`,
				message: `${stats.topCategory.category} represents ${stats.topCategory.percentage.toFixed(0)}% of your spending this week.`,
				color: "#155DFC",
			});
		}

		if (insights.length === 0) return null;

		return (
			<View style={styles.section}>
				<View style={styles.sectionHeader}>
					<Feather name='zap' size={20} color='#F59E0B' />
					<ThemedText style={styles.sectionTitle}>Insights</ThemedText>
				</View>

				{insights.map((insight, index) => (
					<View key={index} style={styles.insightCard}>
						<View style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}>
							<Feather name={insight.icon as any} size={20} color={insight.color} />
						</View>
						<View style={{ flex: 1 }}>
							<ThemedText style={styles.insightTitle}>{insight.title}</ThemedText>
							<ThemedText style={styles.insightMessage}>{insight.message}</ThemedText>
						</View>
					</View>
				))}
			</View>
		);
	};

	if (loading) {
		return (
			<View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
				<ThemedText>Loading weekly report...</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{renderHeader()}
			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{renderOverviewCards()}
				{renderDailyChart()}
				{renderTopCategories()}
				{renderInsights()}
				{renderAllCategories()}
				<View style={{ height: 40 }} />
			</ScrollView>
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
		paddingBottom: 24,
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
	},
	headerContent: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	headerSubtitle: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
		textAlign: "center",
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingTop: 20,
	},
	overviewContainer: {
		paddingHorizontal: 20,
		gap: 12,
	},
	overviewRow: {
		flexDirection: "row",
		gap: 12,
	},
	overviewCard: {
		flex: 1,
		padding: 16,
		borderRadius: 16,
		gap: 6,
	},
	overviewLabel: {
		fontSize: 12,
		color: "rgba(255, 255, 255, 0.8)",
		fontWeight: "500",
	},
	overviewAmount: {
		fontSize: 24,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	changeContainer: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
		marginTop: 4,
	},
	changeText: {
		fontSize: 12,
		color: "#FFFFFF",
		fontWeight: "600",
	},
	section: {
		paddingHorizontal: 20,
		marginTop: 28,
	},
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: "#111827",
	},
	chartContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-end",
		paddingVertical: 16,
		paddingHorizontal: 8,
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	chartBar: {
		flex: 1,
		alignItems: "center",
		gap: 6,
	},
	barWrapper: {
		height: 120,
		justifyContent: "flex-end",
		alignItems: "center",
		width: "100%",
	},
	bar: {
		width: "70%",
		borderRadius: 6,
		minHeight: 4,
	},
	barLabel: {
		fontSize: 11,
		fontWeight: "600",
		color: "#6B7280",
	},
	barLabelActive: {
		color: "#155DFC",
	},
	barAmount: {
		fontSize: 10,
		color: "#9CA3AF",
		fontWeight: "500",
	},
	categoryCard: {
		backgroundColor: "#FFFFFF",
		borderRadius: 14,
		padding: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	categoryLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 12,
	},
	categoryIcon: {
		width: 44,
		height: 44,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	categoryName: {
		fontSize: 15,
		fontWeight: "600",
		color: "#111827",
	},
	categoryCount: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 2,
	},
	categoryRight: {
		position: "absolute",
		top: 16,
		right: 16,
		alignItems: "flex-end",
	},
	categoryAmount: {
		fontSize: 17,
		fontWeight: "700",
		color: "#111827",
	},
	categoryPercent: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 2,
	},
	categoryBar: {
		height: 6,
		backgroundColor: "#F3F4F6",
		borderRadius: 3,
		overflow: "hidden",
	},
	categoryBarFill: {
		height: 6,
		borderRadius: 3,
	},
	miniCategoryCard: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		padding: 14,
		borderRadius: 12,
		marginBottom: 8,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	miniCategoryIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	insightCard: {
		flexDirection: "row",
		gap: 12,
		backgroundColor: "#FFFFFF",
		padding: 16,
		borderRadius: 14,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	insightIcon: {
		width: 40,
		height: 40,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	insightTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#111827",
		marginBottom: 4,
	},
	insightMessage: {
		fontSize: 13,
		color: "#6B7280",
		lineHeight: 18,
	},
});
