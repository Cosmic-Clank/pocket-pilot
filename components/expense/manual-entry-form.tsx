import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { SelectDropdown, type SelectOption } from "@/components/themed-dropdown";
import { ThemedDatePicker } from "@/components/themed-date-picker";
import { MediaPicker } from "@/components/media-picker";
import { ThemedAlert } from "@/components/themed-alert";
import { type ImagePickerAsset } from "expo-image-picker";
import { saveExpense } from "@/services/transaction-service";

interface ManualEntryFormProps {
	initialTitle?: string;
	initialAmount?: string;
	initialCategory?: string;
	initialDate?: Date | null;
	initialNotes?: string;
	initialReceiptAsset?: ImagePickerAsset | null;
	onSuccess?: () => void;
}

export const ManualEntryForm = ({ initialTitle = "", initialAmount = "", initialCategory = "", initialDate = null, initialNotes = "", initialReceiptAsset = null, onSuccess }: ManualEntryFormProps) => {
	const [title, setTitle] = useState(initialTitle);
	const [amount, setAmount] = useState(initialAmount);
	const [category, setCategory] = useState(initialCategory);
	const [date, setDate] = useState<Date | null>(initialDate);
	const [notes, setNotes] = useState(initialNotes);
	const [receiptAsset, setReceiptAsset] = useState<ImagePickerAsset | null>(initialReceiptAsset);
	const [isSaving, setIsSaving] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({ title: "", message: "" });

	const categoryOptions: SelectOption[] = [
		{ label: "Transport", value: "transport" },
		{ label: "Food", value: "food" },
		{ label: "Shopping", value: "shopping" },
		{ label: "Entertainment", value: "entertainment" },
		{ label: "Utilities", value: "utilities" },
		{ label: "Other", value: "other" },
		{ label: "Healthcare", value: "healthcare" },
		{ label: "Insurance", value: "insurance" },
		{ label: "Rent", value: "rent" },
		{ label: "Groceries", value: "groceries" },
		{ label: "Dining Out", value: "dining" },
		{ label: "Subscriptions", value: "subscriptions" },
		{ label: "Education", value: "education" },
		{ label: "Personal Care", value: "personal_care" },
		{ label: "Fitness", value: "fitness" },
		{ label: "Travel", value: "travel" },
		{ label: "Electronics", value: "electronics" },
		{ label: "Home & Garden", value: "home_garden" },
		{ label: "Pets", value: "pets" },
		{ label: "Gifts", value: "gifts" },
		{ label: "Charity", value: "charity" },
		{ label: "Childcare", value: "childcare" },
		{ label: "Parking", value: "parking" },
		{ label: "Fuel", value: "fuel" },
		{ label: "Auto Maintenance", value: "auto_maintenance" },
		{ label: "Work Expenses", value: "work_expenses" },
		{ label: "Other", value: "other" },
	];

	const handleSaveExpense = async () => {
		// Validate required fields
		if (!title.trim()) {
			setAlertContent({ title: "Missing title", message: "Please enter an expense title." });
			setAlertVisible(true);
			return;
		}

		if (!amount.trim() || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
			setAlertContent({ title: "Invalid amount", message: "Please enter a valid amount greater than 0." });
			setAlertVisible(true);
			return;
		}

		if (!category) {
			setAlertContent({ title: "Missing category", message: "Please select a category." });
			setAlertVisible(true);
			return;
		}

		if (!date) {
			setAlertContent({ title: "Missing date", message: "Please select a transaction date." });
			setAlertVisible(true);
			return;
		}

		setIsSaving(true);
		const result = await saveExpense({
			title,
			amount,
			category,
			date,
			notes: notes.trim() || undefined,
			receiptAsset: receiptAsset || undefined,
		});

		setIsSaving(false);

		if (result.success) {
			// Reset form
			setTitle("");
			setAmount("");
			setCategory("");
			setDate(null);
			setNotes("");
			setReceiptAsset(null);

			setAlertContent({ title: "Success", message: "Expense saved successfully!" });
			setAlertVisible(true);

			if (onSuccess) {
				onSuccess();
			}
		} else {
			setAlertContent({
				title: result.message,
				message: result.error || "An error occurred while saving the expense.",
			});
			setAlertVisible(true);
		}
	};

	return (
		<View style={styles.container}>
			{/* Title Field */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Title</ThemedText>
				<ThemedInput placeholder='Enter expense title' value={title} onChangeText={setTitle} />
			</View>

			{/* Amount Field */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Amount</ThemedText>
				<ThemedInput placeholder='0.00' value={amount} onChangeText={setAmount} keyboardType='decimal-pad' icon='dollar-sign' />
			</View>

			{/* Category Dropdown */}
			<View style={styles.formGroup}>
				<SelectDropdown label='Category' placeholder='Select category' options={categoryOptions} selectedValue={category} onValueChange={(itemValue) => setCategory(itemValue)} />
			</View>

			{/* Date Picker */}
			<View style={styles.formGroup}>
				<ThemedDatePicker label='Date' value={date} onChange={(next) => setDate(next)} />
			</View>

			{/* Notes Field */}
			<View style={styles.formGroup}>
				<ThemedText style={styles.label}>Notes (Optional)</ThemedText>
				<ThemedInput placeholder='Add notes...' value={notes} onChangeText={setNotes} multiline />
			</View>

			{/* Attach Receipt */}
			<MediaPicker label='Attach Receipt (Optional)' value={receiptAsset?.fileName ?? receiptAsset?.uri} onSelect={(asset) => setReceiptAsset(asset)} />

			{/* Save Button */}
			<ThemedButton title='Save Expense' variant='primary' style={styles.saveButton} onPress={handleSaveExpense} loading={isSaving} disabled={isSaving} />

			{/* Alert */}
			<ThemedAlert visible={alertVisible} title={alertContent.title} message={alertContent.message} onDismiss={() => setAlertVisible(false)} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 16,
		paddingBottom: 20,
	},
	formGroup: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#374151",
	},
	saveButton: {
		marginTop: 8,
	},
});
