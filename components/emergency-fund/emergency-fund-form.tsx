import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedAlert } from "@/components/themed-alert";
import { updateEmergencyFundAutoInvest } from "@/services/profile-service";

interface EmergencyFundFormProps {
	onSuccess?: () => void;
}

export const EmergencyFundForm = ({ onSuccess }: EmergencyFundFormProps) => {
	const [amount, setAmount] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({
		title: "",
		message: "",
	});

	const handleSave = async () => {
		// Validate amount
		if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
			setAlertContent({
				title: "Invalid amount",
				message: "Please enter a valid amount greater than 0.",
			});
			setAlertVisible(true);
			return;
		}

		setIsSaving(true);
		const result = await updateEmergencyFundAutoInvest({
			amount: parseFloat(amount),
		});

		setIsSaving(false);

		if (result.success) {
			// Reset form
			setAmount("");

			// Notify parent component
			onSuccess?.();
		} else {
			setAlertContent({
				title: "Error",
				message: result.error || "An error occurred while saving.",
			});
			setAlertVisible(true);
		}
	};

	return (
		<View style={styles.container}>
			<ThemedText style={styles.description}>Add money to your emergency savings</ThemedText>

			{/* Amount Input */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Amount</ThemedText>
				<ThemedInput placeholder='0.00' value={amount} onChangeText={setAmount} keyboardType='decimal-pad' icon='hash' editable={!isSaving} />
			</View>

			{/* Submit Button */}
			<ThemedButton title='Add to Fund' onPress={handleSave} loading={isSaving} variant='primary' style={styles.submitButton} />

			{/* Alert Dialog */}
			<ThemedAlert visible={alertVisible} title={alertContent.title} message={alertContent.message} onDismiss={() => setAlertVisible(false)} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		paddingHorizontal: 0,
		paddingVertical: 20,
		gap: 20,
	},
	description: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 4,
	},
	formGroup: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000000",
	},
	submitButton: {
		marginTop: 12,
	},
});
