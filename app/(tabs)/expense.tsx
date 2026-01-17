import { StyleSheet, View, FlatList } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];

interface Expense {
	id: string;
	name: string;
	category: string;
	date: string;
	amount: number;
	icon: FeatherIconName;
}

const mockExpenses: Expense[] = [
	{
		id: "1",
		name: "Gas Station",
		category: "Transport",
		date: "11/13/2025",
		amount: 45.0,
		icon: "truck",
	},
	{
		id: "2",
		name: "Netflix Subscription",
		category: "Entertainment",
		date: "11/13/2025",
		amount: 15.99,
		icon: "film",
	},
];

export default function ExpenseScreen() {
	const insets = useSafeAreaInsets();

	const renderExpenseItem = ({ item }: { item: Expense }) => (
		<View style={styles.expenseCard}>
			<View style={styles.expenseIconContainer}>
				<Feather name={item.icon} size={20} color='#717182' />
			</View>
			<View style={styles.expenseInfo}>
				<View style={styles.expenseTop}>
					<ThemedText style={styles.expenseName}>{item.name}</ThemedText>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
						<ThemedText style={styles.expenseAmount}>${item.amount.toFixed(2)}</ThemedText>
						<Feather name='trash-2' size={20} color='#FF3B30' />
					</View>
				</View>
				<ThemedText style={styles.expenseCategory}>
					{item.category} • {item.date}
				</ThemedText>
			</View>
		</View>
	);

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Expenses
				</ThemedText>
			</View>

			{/* Total Expenses Card */}
			<LinearGradient colors={["#FB2C36", "#E60076"]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.totalCard}>
				<ThemedText style={styles.totalLabel}>Total Expenses</ThemedText>
				<ThemedText style={styles.totalAmount}>$3,240</ThemedText>
				<ThemedText style={styles.totalPeriod}>This month</ThemedText>
			</LinearGradient>

			{/* Add New Expense Button */}
			<ThemedButton title='Add New Expense' variant='primary' icon={<Feather name='plus' size={20} color='#FFFFFF' />} style={styles.addButton} />

			{/* Recent Expenses Section */}
			<View style={styles.recentSection}>
				<ThemedText style={styles.sectionTitle}>Recent Expenses</ThemedText>
			</View>

			{/* Expenses List */}
			<FlatList data={mockExpenses} renderItem={renderExpenseItem} keyExtractor={(item) => item.id} scrollEnabled={false} contentContainerStyle={styles.expensesList} />
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
		padding: 30,
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
		boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
		backgroundColor: "#FFFFFF",
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
});
