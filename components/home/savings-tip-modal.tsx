import { Modal, View, StyleSheet, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { type AiSavingsTip } from "@/services/notification-service";

interface SavingsTipModalProps {
	visible: boolean;
	onClose: () => void;
	loading: boolean;
	tip: AiSavingsTip | null;
}

export function SavingsTipModal({ visible, onClose, loading, tip }: SavingsTipModalProps) {
	return (
		<Modal visible={visible} animationType='fade' transparent statusBarTranslucent>
			<View style={styles.overlay}>
				<View style={styles.modal}>
					{/* Header */}
					<LinearGradient colors={["#10B981", "#059669"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
						<View style={styles.headerTop}>
							<View style={styles.headerLeft}>
								<View style={styles.iconCircle}>
									<Feather name='zap' size={24} color='#FFFFFF' />
								</View>
								<View>
									<ThemedText style={styles.headerTitle}>AI Savings Tip</ThemedText>
									<ThemedText style={styles.headerSubtitle}>Personalized money-saving advice</ThemedText>
								</View>
							</View>
							<Pressable onPress={onClose} hitSlop={12}>
								<Feather name='x' size={24} color='#FFFFFF' />
							</Pressable>
						</View>
					</LinearGradient>

					{/* Content */}
					<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
						{loading ? (
							<View style={styles.loadingState}>
								<ActivityIndicator color='#10B981' size='large' />
								<ThemedText style={styles.loadingText}>Analyzing your spending patterns...</ThemedText>
							</View>
						) : !tip ? (
							<View style={styles.emptyState}>
								<Feather name='alert-circle' size={48} color='#6B7280' />
								<ThemedText style={styles.emptyTitle}>No Tips Available</ThemedText>
								<ThemedText style={styles.emptySubtitle}>Add some transactions to get personalized advice</ThemedText>
							</View>
						) : (
							<>
								{/* Main Suggestion Card */}
								<View style={styles.mainCard}>
									<View style={styles.mainCardHeader}>
										<View style={styles.sparkleIcon}>
											<Feather name='star' size={20} color='#10B981' />
										</View>
										<ThemedText style={styles.mainCardTitle}>{tip.title}</ThemedText>
									</View>
									<ThemedText style={styles.suggestion}>{tip.suggestion}</ThemedText>
								</View>

								{/* Savings Estimate */}
								{tip.estimated_monthly_savings && tip.estimated_monthly_savings > 0 && (
									<View style={styles.savingsCard}>
										<LinearGradient colors={["#ECFDF5", "#D1FAE5"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.savingsGradient}>
											<View style={styles.savingsIcon}>
												<Feather name='dollar-sign' size={24} color='#10B981' />
											</View>
											<View style={{ flex: 1 }}>
												<ThemedText style={styles.savingsLabel}>Potential Monthly Savings</ThemedText>
												<ThemedText style={styles.savingsAmount}>${tip.estimated_monthly_savings.toFixed(0)}</ThemedText>
											</View>
										</LinearGradient>
									</View>
								)}

								{/* Rationale */}
								{tip.rationale && (
									<View style={styles.rationaleCard}>
										<View style={styles.rationaleHeader}>
											<Feather name='info' size={16} color='#6B7280' />
											<ThemedText style={styles.rationaleTitle}>Why This Matters</ThemedText>
										</View>
										<ThemedText style={styles.rationaleText}>{tip.rationale}</ThemedText>
									</View>
								)}

								{/* Action Items */}
								{tip.action_items && tip.action_items.length > 0 && (
									<View style={styles.actionSection}>
										<View style={styles.actionHeader}>
											<Feather name='check-square' size={18} color='#155DFC' />
											<ThemedText style={styles.actionTitle}>Action Steps</ThemedText>
										</View>
										{tip.action_items.map((item, index) => (
											<View key={index} style={styles.actionItem}>
												<View style={styles.actionBullet}>
													<ThemedText style={styles.actionBulletText}>{index + 1}</ThemedText>
												</View>
												<ThemedText style={styles.actionText}>{item}</ThemedText>
											</View>
										))}
									</View>
								)}

								{/* Motivational Footer */}
								<View style={styles.motivationCard}>
									<Feather name='trending-up' size={20} color='#10B981' />
									<ThemedText style={styles.motivationText}>Small changes lead to big savings! Start today and watch your money grow.</ThemedText>
								</View>
							</>
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
	loadingState: {
		alignItems: "center",
		paddingVertical: 40,
		gap: 16,
	},
	loadingText: {
		fontSize: 14,
		color: "#6B7280",
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
	mainCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 16,
		padding: 18,
		marginBottom: 16,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	mainCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 12,
	},
	sparkleIcon: {
		width: 32,
		height: 32,
		borderRadius: 8,
		backgroundColor: "#ECFDF5",
		alignItems: "center",
		justifyContent: "center",
	},
	mainCardTitle: {
		fontSize: 17,
		fontWeight: "700",
		color: "#111827",
		flex: 1,
	},
	suggestion: {
		fontSize: 15,
		color: "#374151",
		lineHeight: 22,
	},
	savingsCard: {
		borderRadius: 14,
		overflow: "hidden",
		marginBottom: 16,
	},
	savingsGradient: {
		flexDirection: "row",
		alignItems: "center",
		gap: 14,
		padding: 16,
	},
	savingsIcon: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
	},
	savingsLabel: {
		fontSize: 13,
		color: "#047857",
		fontWeight: "500",
		marginBottom: 4,
	},
	savingsAmount: {
		fontSize: 26,
		fontWeight: "700",
		color: "#065F46",
	},
	rationaleCard: {
		backgroundColor: "#F3F4F6",
		borderRadius: 12,
		padding: 14,
		marginBottom: 16,
	},
	rationaleHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginBottom: 8,
	},
	rationaleTitle: {
		fontSize: 13,
		fontWeight: "600",
		color: "#6B7280",
	},
	rationaleText: {
		fontSize: 14,
		color: "#374151",
		lineHeight: 20,
	},
	actionSection: {
		marginBottom: 16,
	},
	actionHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	actionTitle: {
		fontSize: 16,
		fontWeight: "700",
		color: "#111827",
	},
	actionItem: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 12,
		alignItems: "flex-start",
	},
	actionBullet: {
		width: 24,
		height: 24,
		borderRadius: 12,
		backgroundColor: "#155DFC",
		alignItems: "center",
		justifyContent: "center",
	},
	actionBulletText: {
		fontSize: 12,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	actionText: {
		flex: 1,
		fontSize: 14,
		color: "#374151",
		lineHeight: 20,
		paddingTop: 2,
	},
	motivationCard: {
		flexDirection: "row",
		gap: 12,
		backgroundColor: "#ECFDF5",
		padding: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#A7F3D0",
		alignItems: "center",
	},
	motivationText: {
		flex: 1,
		fontSize: 13,
		color: "#065F46",
		lineHeight: 18,
		fontWeight: "500",
	},
});
