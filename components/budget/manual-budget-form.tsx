import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { SelectDropdown, type SelectOption } from "@/components/themed-dropdown";
import { ThemedAlert } from "@/components/themed-alert";
import { saveBudget } from "@/services/budget-service";
import { CATEGORIES } from "@/constants/config";

interface ManualBudgetFormProps {
	initialCategory?: string;
	initialAmount?: string;
	onSuccess?: () => void;
}

export const ManualBudgetForm = ({ initialCategory = "", initialAmount = "", onSuccess }: ManualBudgetFormProps) => {
	const [category, setCategory] = useState(initialCategory);
	const [amount, setAmount] = useState(initialAmount);
	const [isSaving, setIsSaving] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({
		title: "",
		message: "",
	});

	const categoryOptions: SelectOption[] = CATEGORIES;

	const handleSaveBudget = async () => {
		// Validate category
		if (!category || category.trim() === "") {
			setAlertContent({
				title: "Missing category",
				message: "Please select a spending category.",
			});
			setAlertVisible(true);
			return;
		}

		// Validate amount
		if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
			setAlertContent({
				title: "Invalid amount",
				message: "Please enter a valid budget amount greater than 0.",
			});
			setAlertVisible(true);
			return;
		}

		setIsSaving(true);
		const result = await saveBudget({
			category,
			amount,
		});

		setIsSaving(false);

		if (result.success) {
			// Reset form
			setCategory("");
			setAmount("");

			// Notify parent component
			onSuccess?.();
		} else {
			setAlertContent({
				title: "Error saving budget",
				message: result.error || "An error occurred while saving the budget.",
			});
			setAlertVisible(true);
		}
	};

	return (
		<View style={styles.container}>
			{/* Category Selection */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Category</ThemedText>
				<SelectDropdown options={categoryOptions} selectedValue={category} onValueChange={setCategory} placeholder='Select a category' enabled={!isSaving} />
			</View>

			{/* Amount Input */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Budget Amount ($)</ThemedText>
				<ThemedInput placeholder='Enter budget amount' value={amount} onChangeText={setAmount} keyboardType='decimal-pad' editable={!isSaving} />
			</View>

			{/* Submit Button */}
			<ThemedButton title={"Create Budget"} onPress={handleSaveBudget} loading={isSaving} style={styles.submitButton} />

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
