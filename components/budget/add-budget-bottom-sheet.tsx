import React, { useCallback, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { ManualBudgetForm } from "./manual-budget-form";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

interface AddBudgetBottomSheetProps {
	onClose: () => void;
	onBudgetSuccess?: () => void;
}

export const AddBudgetBottomSheet = React.forwardRef<BottomSheetModal, AddBudgetBottomSheetProps>(({ onClose, onBudgetSuccess }: AddBudgetBottomSheetProps, ref) => {
	const snapPoints = useMemo(() => [500, "75%"], []);

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
						<ThemedText style={styles.title}>Set Budget</ThemedText>
						<ThemedText style={styles.subtitle}>Create a monthly budget for a spending category</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				{/* Form Content */}
				<ManualBudgetForm onSuccess={onBudgetSuccess} />
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

AddBudgetBottomSheet.displayName = "AddBudgetBottomSheet";

const styles = StyleSheet.create({
	bottomSheet: {
		zIndex: 100,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
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
});
