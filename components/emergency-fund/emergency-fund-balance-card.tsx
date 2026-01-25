import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";

interface EmergencyFundBalanceCardProps {
	balance: number;
	onDeposit: () => void;
	onWithdraw: () => void;
}

export function EmergencyFundBalanceCard({ balance, onDeposit, onWithdraw }: EmergencyFundBalanceCardProps) {
	return (
		<LinearGradient colors={["#3B82F6", "#1D4ED8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
			<View style={styles.header}>
				<View style={styles.iconContainer}>
					<Feather name='shield' size={24} color='#FFFFFF' />
				</View>
				<View style={styles.headerContent}>
					<ThemedText style={styles.label}>Emergency Fund Balance</ThemedText>
					<ThemedText style={styles.amount}>${balance.toFixed(2)}</ThemedText>
				</View>
			</View>

			<View style={styles.buttonRow}>
				<ThemedButton title='Deposit' variant='outline' onPress={onDeposit} style={styles.button} textStyle={styles.buttonText} />
				<ThemedButton title='Withdraw' variant='outline' onPress={onWithdraw} style={styles.button} textStyle={styles.buttonText} />
			</View>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		padding: 20,
		marginBottom: 16,
		gap: 16,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 12,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	headerContent: {
		flex: 1,
	},
	label: {
		fontSize: 13,
		color: "rgba(255, 255, 255, 0.8)",
		marginBottom: 4,
	},
	amount: {
		fontSize: 28,
		fontWeight: "700",
		color: "#FFFFFF",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 12,
	},
	button: {
		flex: 1,
		borderColor: "#FFFFFF",
		borderWidth: 1.5,
		backgroundColor: "transparent",
	},
	buttonText: {
		color: "#FFFFFF",
		fontWeight: "600",
	},
});
