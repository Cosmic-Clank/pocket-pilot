import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedAlert } from "@/components/themed-alert";
import { useUpdateEmergencyFundAutoInvest } from "@/hooks/mutations/use-profile-mutations";

interface EmergencyFundFormProps {
	onSuccess?: () => void;
}

export const EmergencyFundForm = ({ onSuccess }: EmergencyFundFormProps) => {
	const [amount, setAmount] = useState("");
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({
		title: "",
		message: "",
	});

	// Use React Query mutation for updating emergency fund
	const updateMutation = useUpdateEmergencyFundAutoInvest();

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

		// Use mutation to update emergency fund
		updateMutation.mutate(
			{ amount: parseFloat(amount) },
			{
				onSuccess: (result) => {
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
				},
				onError: (error) => {
					setAlertContent({
						title: "Error",
						message: error instanceof Error ? error.message : "An error occurred while saving.",
					});
					setAlertVisible(true);
				},
			}
		);
	};

	return (
		<View style={styles.container}>
			<ThemedText style={styles.description}>Add money to your emergency savings</ThemedText>

			{/* Amount Input */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Amount</ThemedText>
				<ThemedInput placeholder='0.00' value={amount} onChangeText={setAmount} keyboardType='decimal-pad' icon='hash' editable={!updateMutation.isPending} />
			</View>

			{/* Submit Button */}
			<ThemedButton title='Add to Fund' onPress={handleSave} loading={updateMutation.isPending} variant='primary' style={styles.submitButton} />

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
