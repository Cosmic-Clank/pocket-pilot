import React, { useCallback, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from "@/components/themed-button";
import { ThemedAlert } from "@/components/themed-alert";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { saveExpense, fetchTransactions, calculateTotalBalanceAfterBudget, type TransactionRecord } from "@/services/transaction-service";
import { updateEmergencyFundAmount } from "@/services/profile-service";
import { fetchBudgets } from "@/services/budget-service";

interface EmergencyFundTransactionBottomSheetProps {
	type: "deposit" | "withdraw";
	currentBalance: number;
	onClose: () => void;
	onSuccess?: () => void;
}

export const EmergencyFundTransactionBottomSheet = React.forwardRef<BottomSheetModal, EmergencyFundTransactionBottomSheetProps>(({ type, currentBalance, onClose, onSuccess }: EmergencyFundTransactionBottomSheetProps, ref) => {
	const snapPoints = useMemo(() => [400, "55%"], []);
	const [amount, setAmount] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({ title: "", message: "" });
	const [maxAmount, setMaxAmount] = useState(0);

	useEffect(() => {
		if (type === "deposit") {
			// Calculate available funds for deposit
			const calculateAvailableFunds = async () => {
				const [txResult, budgetResult] = await Promise.all([fetchTransactions(), fetchBudgets()]);

				const transactions = (txResult.success ? txResult.data : []) as TransactionRecord[];
				const budgets = budgetResult.success ? budgetResult.data : [];

				// Calculate total balance after accounting for budgets
				const balanceData = calculateTotalBalanceAfterBudget(transactions, budgets);

				if (balanceData.balanceAfterBudget <= 0) {
					// Can't deposit if no positive balance after budgets
					setMaxAmount(0);
					return;
				}

				// Available = balance after budgets - current emergency fund balance
				const available = Math.max(0, balanceData.balanceAfterBudget - currentBalance);
				setMaxAmount(available);
			};
			calculateAvailableFunds();
		} else {
			// For withdraw, max is current balance
			setMaxAmount(currentBalance);
		}
	}, [type, currentBalance]);

	const handleSheetChanges = useCallback((index: number) => {
		// console.log("handleSheetChanges", index);
	}, []);

	const handleClosePress = () => {
		(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
	};

	const renderBackdrop = useCallback((props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => <BottomSheetBackdrop {...props} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />, []);

	const handleSave = async () => {
		// Validate amount
		const parsedAmount = parseFloat(amount);

		// Check for invalid input
		if (!amount.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
			setAlertContent({
				title: "Invalid amount",
				message: "Please enter a valid amount greater than 0.",
			});
			setAlertVisible(true);
			return;
		}

		// Check if attempting deposit with no income
		if (type === "deposit" && maxAmount <= 0) {
			setAlertContent({
				title: "Cannot deposit",
				message: "You don't have any net positive income available. Your income must exceed your expenses and budget allocations.",
			});
			setAlertVisible(true);
			return;
		}

		// Check if amount exceeds available
		if (parsedAmount > maxAmount) {
			const remaining = Math.max(0, maxAmount);
			setAlertContent({
				title: "Insufficient funds",
				message: type === "deposit" ? `You only have AED ${remaining.toFixed(2)} available to deposit after your budgets and existing emergency fund.` : `You can only withdraw AED ${remaining.toFixed(2)} from your emergency fund.`,
			});
			setAlertVisible(true);
			return;
		}

		setIsSaving(true);

		try {
			// Calculate new balance
			const newBalance = type === "deposit" ? currentBalance + parsedAmount : currentBalance - parsedAmount;

			// Validate new balance is not negative
			if (newBalance < 0) {
				throw new Error("New balance cannot be negative");
			}

			// Update emergency fund amount
			const updateResult = await updateEmergencyFundAmount({ amount: newBalance });

			if (!updateResult.success) {
				throw new Error(updateResult.error || "Failed to update emergency fund");
			}

			// Create transaction record
			const transactionResult = await saveExpense({
				title: type === "deposit" ? "Emergency Fund Deposit" : "Emergency Fund Withdrawal",
				amount: parsedAmount.toString(),
				category: "other",
				type: type === "deposit" ? "expense" : "income",
				date: new Date(),
				notes: `${type === "deposit" ? "Deposited to" : "Withdrawn from"} emergency fund`,
			});

			if (!transactionResult.success) {
				console.warn("Transaction record failed but fund updated:", transactionResult.error);
			}

			// Reset form
			setAmount("");

			// Notify parent component
			onSuccess?.();
		} catch (error) {
			console.error("Emergency fund transaction error:", error);
			setAlertContent({
				title: "Error",
				message: error instanceof Error ? error.message : "An error occurred",
			});
			setAlertVisible(true);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<BottomSheetModal ref={ref as any} snapPoints={snapPoints} onChange={handleSheetChanges} onDismiss={onClose} style={styles.bottomSheet} backdropComponent={renderBackdrop}>
			<BottomSheetScrollView style={styles.container} scrollEnabled={true}>
				{/* Header */}
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<ThemedText style={styles.title}>{type === "deposit" ? "Deposit to Emergency Fund" : "Withdraw from Emergency Fund"}</ThemedText>
						<ThemedText style={styles.subtitle}>{type === "deposit" ? (maxAmount <= 0 ? "No available funds to deposit" : `Available: AED ${maxAmount.toFixed(2)} (after budgets)`) : `Available to withdraw: AED ${maxAmount.toFixed(2)}`}</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				{/* Form Content */}
				<View style={styles.formContainer}>
					<View style={styles.formGroup}>
						<ThemedText style={styles.label}>Amount</ThemedText>
						<ThemedInput placeholder='0.00' value={amount} onChangeText={setAmount} keyboardType='decimal-pad' icon='dollar-sign' editable={!isSaving} />
						<ThemedText style={styles.hint}>Current balance: AED {currentBalance.toFixed(2)}</ThemedText>
					</View>

					{/* Submit Button */}
					<ThemedButton title={type === "deposit" ? "Deposit" : "Withdraw"} onPress={handleSave} loading={isSaving} variant='primary' style={styles.submitButton} />

					{/* Alert Dialog */}
					<ThemedAlert visible={alertVisible} title={alertContent.title} message={alertContent.message} onDismiss={() => setAlertVisible(false)} />
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

EmergencyFundTransactionBottomSheet.displayName = "EmergencyFundTransactionBottomSheet";

const styles = StyleSheet.create({
	bottomSheet: {
		zIndex: 100,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: -2 },
		shadowOpacity: 0.25,
		shadowRadius: 20,
		elevation: 12,
	},
	container: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 20,
		paddingBottom: 32,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingVertical: 20,
		paddingHorizontal: 16,
		marginHorizontal: -20,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: "#6B7280",
	},
	formContainer: {
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
	hint: {
		fontSize: 12,
		color: "#9CA3AF",
		marginTop: 4,
	},
	submitButton: {
		marginTop: 12,
	},
});
