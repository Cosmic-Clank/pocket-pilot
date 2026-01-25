import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";

interface InsightsSectionProps {
	onBudgetAlertPress?: () => void;
	onSavingsTipPress?: () => void;
}

export function InsightsSection({ onBudgetAlertPress, onSavingsTipPress }: InsightsSectionProps) {
	const router = useRouter();

	return (
		<View style={styles.container}>
			<ThemedText style={styles.sectionTitle}>Insights</ThemedText>

			<Pressable style={styles.insightCard} onPress={() => router.push("/weekly-report")}>
				<View style={styles.insightContent}>
					<ThemedText style={styles.insightTitle}>Weekly Report</ThemedText>
					<ThemedText style={styles.insightSubtitle}>Check your spending analysis</ThemedText>
				</View>
				<Feather name='chevron-right' size={20} color='#9CA3AF' />
			</Pressable>

			<Pressable style={styles.insightCard} onPress={onBudgetAlertPress}>
				<View style={styles.insightContent}>
					<ThemedText style={styles.insightTitle}>Budget Alert</ThemedText>
					<ThemedText style={styles.insightSubtitle}>Track your budget status</ThemedText>
				</View>
				<Feather name='chevron-right' size={20} color='#9CA3AF' />
			</Pressable>

			<Pressable style={styles.insightCard} onPress={onSavingsTipPress}>
				<View style={styles.insightContent}>
					<ThemedText style={styles.insightTitle}>Savings Tip</ThemedText>
					<ThemedText style={styles.insightSubtitle}>Get AI-powered money advice</ThemedText>
				</View>
				<Feather name='chevron-right' size={20} color='#9CA3AF' />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 20,
		marginTop: 24,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000000",
		marginBottom: 16,
	},
	insightCard: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "#FFFFFF",
		padding: 20,
		borderRadius: 16,
		marginBottom: 12,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	insightContent: {
		flex: 1,
	},
	insightTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#000000",
		marginBottom: 4,
	},
	insightSubtitle: {
		fontSize: 13,
		color: "#6B7280",
	},
});
