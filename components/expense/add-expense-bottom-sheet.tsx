import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ManualEntryForm } from "./manual-entry-form";
import { ScanReceiptView } from "./scan-receipt-view";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

interface AddExpenseBottomSheetProps {
	onClose: () => void;
	onExpenseSuccess?: () => void;
}

type TabType = "manual" | "scan";

export const AddExpenseBottomSheet = React.forwardRef<BottomSheetModal, AddExpenseBottomSheetProps>(({ onClose, onExpenseSuccess }: AddExpenseBottomSheetProps, ref) => {
	const [activeTab, setActiveTab] = useState<TabType>("manual");
	const snapPoints = useMemo(() => [800, "90%"], []);

	const handleSheetChanges = useCallback((index: number) => {
		// console.log("handleSheetChanges", index);
	}, []);

	const handleClosePress = () => {
		(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
	};

	const renderBackdrop = useCallback((props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => <BottomSheetBackdrop {...props} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />, []);

	return (
		<BottomSheetModal ref={ref as any} snapPoints={snapPoints} onChange={handleSheetChanges} onDismiss={onClose} style={styles.bottomSheet} backdropComponent={renderBackdrop}>
			<BottomSheetScrollView style={styles.container} scrollEnabled={true}>
				{/* Header */}
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
					<ThemedText style={styles.title}>Add Transaction</ThemedText>
					<ThemedText style={styles.subtitle}>Add a new expense or income manually or scan a receipt</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				{/* Tab Buttons */}
				<View style={styles.tabsContainer}>
					<TouchableOpacity style={[styles.tab, activeTab === "manual" && styles.tabActive]} onPress={() => setActiveTab("manual")}>
						<ThemedText style={[styles.tabText, activeTab === "manual" && styles.tabTextActive]}>Manual Entry</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.tab, activeTab === "scan" && styles.tabActive]} onPress={() => setActiveTab("scan")}>
						<ThemedText style={[styles.tabText, activeTab === "scan" && styles.tabTextActive]}>Scan Receipt (OCR)</ThemedText>
					</TouchableOpacity>
				</View>

				{/* Tab Content */}
				{activeTab === "manual" ? <ManualEntryForm onSuccess={onExpenseSuccess} /> : <ScanReceiptView onExpenseSuccess={onExpenseSuccess} />}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

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
	tabsContainer: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
		backgroundColor: "#F3F4F6",
		borderRadius: 12,
		padding: 4,
	},
	tab: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	tabActive: {
		backgroundColor: "#FFFFFF",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 8,
		elevation: 6,
	},
	tabText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#9CA3AF",
	},
	tabTextActive: {
		color: "#000",
	},
});
