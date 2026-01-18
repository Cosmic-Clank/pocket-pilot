import React, { useCallback, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/themed-text";
import { EmergencyFundForm } from "./emergency-fund-form";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";

interface AddEmergencyFundBottomSheetProps {
	onClose: () => void;
	onSuccess?: () => void;
}

export const AddEmergencyFundBottomSheet = React.forwardRef<BottomSheetModal, AddEmergencyFundBottomSheetProps>(({ onClose, onSuccess }: AddEmergencyFundBottomSheetProps, ref) => {
	const snapPoints = useMemo(() => [400, "60%"], []);

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
						<ThemedText style={styles.title}>Add to Emergency Fund</ThemedText>
						<ThemedText style={styles.subtitle}>Add money to your emergency savings</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				{/* Form Content */}
				<EmergencyFundForm onSuccess={onSuccess} />
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

AddEmergencyFundBottomSheet.displayName = "AddEmergencyFundBottomSheet";

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
});
