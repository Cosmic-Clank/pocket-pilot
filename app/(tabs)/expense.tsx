import { StyleSheet, View, FlatList, ActivityIndicator, Modal, Pressable, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider, BottomSheetModal } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedAlert } from "@/components/themed-alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AddExpenseBottomSheet } from "@/components/expense/add-expense-bottom-sheet";
import { useRef, useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { supabase } from "@/utils/supabase";
import { useFocusEffect } from "@react-navigation/native";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface Expense {
	id: string;
	name: string;
	category: string;
	date: string;
	amount: number;
	icon: FeatherIconName;
	receiptUrl?: string | null;
	notes?: string | null;
	transactionDate: string;
}

const categoryIconMap: { [key: string]: FeatherIconName } = {
	Transport: "truck",
	Entertainment: "film",
	Food: "coffee",
	Shopping: "shopping-bag",
	Bills: "file-text",
	Health: "heart",
	Education: "book",
	Other: "tag",
};

export default function ExpenseScreen() {
	const insets = useSafeAreaInsets();
	const addExpenseModalRef = useRef<BottomSheetModal>(null);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [loading, setLoading] = useState(true);
	const [totalAmount, setTotalAmount] = useState(0);
	const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
	const [detailVisible, setDetailVisible] = useState(false);
	const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
	const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
	const [deleting, setDeleting] = useState(false);

	useFocusEffect(
		useCallback(() => {
			fetchExpenses();
		}, [])
	);

	const fetchExpenses = async () => {
		try {
			setLoading(true);
			const { data: authData } = await supabase.auth.getUser();
			if (!authData?.user?.id) return;

			const { data, error } = await supabase.from("transactions").select("*").eq("user_id", authData.user.id).eq("type", "expense").order("transaction_date", { ascending: false });

			if (error) throw error;

			const formattedExpenses: Expense[] = (data || []).map((transaction: any) => ({
				id: transaction.id,
				name: transaction.title,
				category: transaction.category,
				date: new Date(transaction.transaction_date).toLocaleDateString("en-US", {
					month: "2-digit",
					day: "2-digit",
					year: "numeric",
				}),
				amount: transaction.amount,
				icon: (categoryIconMap[transaction.category] || "tag") as FeatherIconName,
				receiptUrl: transaction.receipt_url || null,
				notes: transaction.notes || null,
				transactionDate: transaction.transaction_date,
			}));

			setExpenses(formattedExpenses);

			// Calculate total for only this month
			const now = new Date();
			const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
			const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

			const thisMonthTotal = formattedExpenses
				.filter((exp) => {
					const expDate = new Date(exp.transactionDate);
					return expDate >= startOfMonth && expDate <= endOfMonth;
				})
				.reduce((sum, exp) => sum + exp.amount, 0);

			setTotalAmount(thisMonthTotal);
		} catch (error) {
			console.error("Failed to fetch expenses:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleSelectExpense = (expense: Expense) => {
		setSelectedExpense(expense);
		setDetailVisible(true);
	};

	const closeDetail = () => {
		setDetailVisible(false);
		setSelectedExpense(null);
	};

	const promptDeleteExpense = (expense: Expense) => {
		setExpenseToDelete(expense);
		setDeleteAlertVisible(true);
	};

	const cancelDeleteExpense = () => {
		if (deleting) return;
		setDeleteAlertVisible(false);
		setExpenseToDelete(null);
	};

	const confirmDeleteExpense = async () => {
		if (!expenseToDelete) return;
		try {
			setDeleting(true);
			const { data: authData } = await supabase.auth.getUser();
			if (!authData?.user?.id) {
				setDeleting(false);
				return;
			}

			const { error } = await supabase.from("transactions").delete().eq("id", expenseToDelete.id).eq("user_id", authData.user.id);
			if (error) throw error;

			await fetchExpenses();
			setDeleteAlertVisible(false);
			setExpenseToDelete(null);
		} catch (err) {
			console.error("Failed to delete expense:", err);
		} finally {
			setDeleting(false);
		}
	};

	const renderExpenseItem = ({ item }: { item: Expense }) => (
		<Pressable style={styles.expenseCard} onPress={() => handleSelectExpense(item)}>
			<View style={styles.expenseIconContainer}>
				<Feather name={item.icon} size={20} color='#717182' />
			</View>
			<View style={styles.expenseInfo}>
				<View style={styles.expenseTop}>
					<ThemedText style={styles.expenseName}>{item.name}</ThemedText>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
						<ThemedText style={styles.expenseAmount}>${item.amount.toFixed(2)}</ThemedText>
						<Pressable
							onPress={(e) => {
								e.stopPropagation?.();
								promptDeleteExpense(item);
							}}
							hitSlop={8}>
							<Feather name='trash-2' size={20} color='#FF3B30' />
						</Pressable>
					</View>
				</View>
				<ThemedText style={styles.expenseCategory}>
					{item.category} • {item.date}
				</ThemedText>
			</View>
		</Pressable>
	);

	return (
		<GestureHandlerRootView style={styles.gestureContainer}>
			<BottomSheetModalProvider>
				<View style={[styles.container, { paddingTop: insets.top }]}>
					{/* Header */}
					<View style={styles.header}>
						<ThemedText type='title' style={styles.title}>
							Expenses
						</ThemedText>
					</View>

					{/* Total Expenses Card */}
					<LinearGradient colors={["#FB2C36", "#E60076"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.totalCard}>
						<ThemedText style={styles.totalLabel}>Total Expenses</ThemedText>
						<ThemedText style={styles.totalAmount}>${totalAmount.toFixed(2)}</ThemedText>
						<ThemedText style={styles.totalPeriod}>This month</ThemedText>
					</LinearGradient>

					{/* Add New Expense Button */}
					<ThemedButton title='Add New Expense' variant='primary' icon={<Feather name='plus' size={20} color='#FFFFFF' />} style={styles.addButton} onPress={() => addExpenseModalRef.current?.present()} />

					{/* Recent Expenses Section */}
					<View style={styles.recentSection}>
						<ThemedText style={styles.sectionTitle}>Recent Expenses</ThemedText>
					</View>

					{/* Expenses List */}
					{loading ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size='large' color='#155DFC' />
						</View>
					) : expenses.length === 0 ? (
						<View style={styles.emptyContainer}>
							<ThemedText style={styles.emptyText}>No expenses yet. Add one to get started!</ThemedText>
						</View>
					) : (
						<FlatList data={expenses} renderItem={renderExpenseItem} keyExtractor={(item) => item.id} scrollEnabled={true} contentContainerStyle={styles.expensesList} style={styles.flatListContainer} />
					)}
				</View>

				{selectedExpense && (
					<Modal visible={detailVisible} transparent animationType='fade' onRequestClose={closeDetail}>
						<Pressable style={styles.modalOverlay} onPress={closeDetail}>
							<View style={styles.modalCard} onStartShouldSetResponder={() => true}>
								<View style={styles.modalHeader}>
									<ThemedText style={styles.modalTitle}>{selectedExpense.name}</ThemedText>
									<Pressable onPress={closeDetail} hitSlop={8}>
										<Feather name='x' size={20} color='#111827' />
									</Pressable>
								</View>
								<ThemedText style={styles.modalMeta}>
									{selectedExpense.category} • {selectedExpense.date}
								</ThemedText>
								<ThemedText style={styles.modalAmount}>${selectedExpense.amount.toFixed(2)}</ThemedText>
								{selectedExpense.notes ? <ThemedText style={styles.modalNotes}>{selectedExpense.notes}</ThemedText> : null}

								<ThemedText style={styles.modalSubheading}>Receipt</ThemedText>
								{selectedExpense.receiptUrl ? <Image source={{ uri: selectedExpense.receiptUrl }} style={styles.receiptImage} resizeMode='cover' /> : <ThemedText style={styles.emptyText}>No receipt attached</ThemedText>}
							</View>
						</Pressable>
					</Modal>
				)}

				<ThemedAlert visible={deleteAlertVisible} title='Delete expense?' message={expenseToDelete ? `Remove "${expenseToDelete.name}" permanently?` : "Remove this expense?"} variant='confirm' confirmText='Delete' cancelText='Cancel' onCancel={cancelDeleteExpense} onConfirm={confirmDeleteExpense} loading={deleting} />

				{/* Bottom Sheet Modal */}
				<AddExpenseBottomSheet ref={addExpenseModalRef} onClose={() => fetchExpenses()} onExpenseSuccess={() => addExpenseModalRef.current?.dismiss()} />
			</BottomSheetModalProvider>
			<StatusBar style='dark' backgroundColor='transparent' />
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	gestureContainer: {
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		padding: 30,
	},
	flatListContainer: {
		flex: 1,
	},
	header: {
		marginBottom: 32,
		marginTop: 32,
	},
	title: {
		fontSize: 28,
		color: "#000000",
	},
	totalCard: {
		borderRadius: 16,
		padding: 24,
		marginBottom: 32,
		minHeight: 180,
		justifyContent: "center",
	},
	totalLabel: {
		fontSize: 16,
		color: "#FFFFFF",
		marginBottom: 8,
	},
	totalAmount: {
		fontSize: 24,
		color: "#FFFFFF",
		marginBottom: 24,
	},
	totalPeriod: {
		fontSize: 14,
		color: "#FFFFFF",
	},
	addButton: {
		marginBottom: 32,
	},
	recentSection: {
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000000",
	},
	expensesList: {
		gap: 12,
		paddingBottom: 32,
	},
	expenseCard: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 12,
		padding: 16,
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	expenseIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 12,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 12,
	},
	expenseInfo: {
		flex: 1,
	},
	expenseTop: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	expenseName: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000000",
	},
	expenseAmount: {
		fontSize: 14,
		fontWeight: "600",
		color: "#000000",
	},
	expenseCategory: {
		fontSize: 12,
		color: "#6B7280",
	},
	loadingContainer: {
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyContainer: {
		justifyContent: "center",
		alignItems: "center",
		paddingVertical: 40,
	},
	emptyText: {
		fontSize: 14,
		color: "#6B7280",
		textAlign: "center",
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	modalCard: {
		width: "100%",
		borderRadius: 16,
		backgroundColor: "#FFFFFF",
		padding: 20,
		gap: 12,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
	},
	modalMeta: {
		fontSize: 13,
		color: "#6B7280",
	},
	modalAmount: {
		fontSize: 20,
		fontWeight: "700",
		color: "#000000",
	},
	modalNotes: {
		fontSize: 14,
		color: "#374151",
		lineHeight: 20,
	},
	modalSubheading: {
		fontSize: 14,
		fontWeight: "600",
		color: "#111827",
	},
	receiptImage: {
		width: "100%",
		height: 240,
		borderRadius: 12,
		backgroundColor: "#F3F4F6",
	},
});
