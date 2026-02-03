import { Modal, View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { type AiSavingsTip, type InvestIdeaSuggestion } from "@/services/notification-service";

interface NotificationModalProps {
	visible: boolean;
	onClose: () => void;
	loading: boolean;
	error: string | null;
	budgetUsage?: { percent: number; spent: number; total: number } | null;
	savingsProgress?: { percent: number; saved: number } | null;
	investIdea?: InvestIdeaSuggestion | null;
	savingsTip?: AiSavingsTip | null;
	savingsGoal?: number;
}

export function NotificationModal({ visible, onClose, loading, error, budgetUsage, savingsProgress, investIdea, savingsTip, savingsGoal = 5000 }: NotificationModalProps) {
	const renderCard = (title: string, description: string, meta?: string, icon: keyof typeof Feather.glyphMap = "bell", tone: "primary" | "success" | "warning" = "primary") => {
		const colors: Record<"primary" | "success" | "warning", string> = {
			primary: "#155DFC",
			success: "#10B981",
			warning: "#F59E0B",
		};

		return (
			<View style={[styles.card, { borderColor: colors[tone], backgroundColor: `${colors[tone]}14` }]}>
				<View style={styles.cardIcon}>
					<Feather name={icon} size={22} color={colors[tone]} />
				</View>
				<View style={{ flex: 1 }}>
					<ThemedText style={styles.cardTitle}>{title}</ThemedText>
					<ThemedText style={styles.cardBody}>{description}</ThemedText>
					{meta ? <ThemedText style={styles.cardMeta}>{meta}</ThemedText> : null}
				</View>
			</View>
		);
	};

	return (
		<Modal visible={visible} animationType='fade' transparent statusBarTranslucent>
			<View style={styles.overlay}>
				<View style={styles.sheet}>
					<View style={styles.header}>
						<ThemedText style={styles.headerTitle}>Notifications</ThemedText>
						<Pressable onPress={onClose} hitSlop={12}>
							<Feather name='x' size={24} color='#111827' />
						</Pressable>
					</View>

					{loading ? (
						<View style={styles.loader}>
							<ActivityIndicator color='#155DFC' />
							<ThemedText style={styles.loaderText}>Fetching your latest insights...</ThemedText>
						</View>
					) : error ? (
						<View style={styles.loader}>
							<ThemedText style={styles.errorText}>{error}</ThemedText>
						</View>
					) : (
						<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
							{budgetUsage ? renderCard("Spending Limit Alert", `You've reached ${budgetUsage.percent}% of your monthly budgets (AED ${budgetUsage.spent.toFixed(0)} of AED ${budgetUsage.total.toFixed(0)}).`, "Just now", "bell", budgetUsage.percent >= 85 ? "warning" : "primary") : null}

							{savingsProgress ? renderCard("Savings Goal Progress", `You're at ${savingsProgress.percent}% of your AED ${savingsGoal.toLocaleString()} goal (saved AED ${savingsProgress.saved.toFixed(0)} this month).`, "Today", "dollar-sign", "success") : null}

							{savingsTip ? renderCard("AI Savings Tip", `${savingsTip.title}: ${savingsTip.suggestion}` + (savingsTip.action_items.length ? `\n• ${savingsTip.action_items.join("\n• ")}` : ""), savingsTip.estimated_monthly_savings ? `Est. save AED ${savingsTip.estimated_monthly_savings.toFixed(0)}/mo` : "Today", "target", "success") : null}
						</ScrollView>
					)}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.35)",
		justifyContent: "flex-end",
	},
	sheet: {
		backgroundColor: "#F9FAFB",
		paddingTop: 16,
		paddingHorizontal: 20,
		paddingBottom: 12,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		maxHeight: "88%",
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 12,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "700",
		color: "#111827",
	},
	loader: {
		paddingVertical: 24,
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	loaderText: {
		color: "#111827",
	},
	errorText: {
		color: "#DC2626",
		textAlign: "center",
	},
	card: {
		flexDirection: "row",
		gap: 12,
		padding: 14,
		borderRadius: 14,
		borderWidth: 1,
		marginBottom: 12,
		backgroundColor: "#EEF2FF",
	},
	cardIcon: {
		width: 36,
		height: 36,
		borderRadius: 10,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
	},
	cardTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
		marginBottom: 4,
	},
	cardBody: {
		fontSize: 14,
		color: "#1F2937",
		lineHeight: 20,
	},
	cardMeta: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 4,
	},
});
