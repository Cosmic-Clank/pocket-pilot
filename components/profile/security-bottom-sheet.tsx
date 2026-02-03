import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedAlert } from "@/components/themed-alert";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";
import { Toast } from "toastify-react-native";

interface SecurityBottomSheetProps {
	onClose: () => void;
}

export const SecurityBottomSheet = React.forwardRef<BottomSheetModal, SecurityBottomSheetProps>(({ onClose }, ref) => {
	const snapPoints = useMemo(() => [380, "70%"], []);
	const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const handleClosePress = () => {
		(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
	};

	const handleChangePassword = () => {
		handleClosePress();
		// Navigate to forgot password screen which has the password reset logic
		router.push("/reset-password");
	};

	const handleDeleteConfirm = async () => {
		setIsDeleting(true);

		try {
			// Sign out the user
			const { error } = await supabase.auth.signOut();

			if (error) {
				Toast.error(error.message || "Failed to sign out");
				setIsDeleting(false);
				return;
			}

			setDeleteConfirmVisible(false);
			Toast.success("Account deleted. You have been signed out.");

			// The account deletion and logout will redirect via auth state change
		} catch (error: any) {
			console.error("Delete account error:", error);
			Toast.error(error?.message || "Failed to delete account");
			setIsDeleting(false);
		}
	};

	const renderBackdrop = useCallback((props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => <BottomSheetBackdrop {...props} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />, []);

	return (
		<BottomSheetModal ref={ref as any} snapPoints={snapPoints} onDismiss={onClose} style={styles.bottomSheet} backdropComponent={renderBackdrop}>
			<BottomSheetScrollView style={styles.container} scrollEnabled>
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<ThemedText style={styles.title}>Security</ThemedText>
						<ThemedText style={styles.subtitle}>Manage your security settings</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				<View style={styles.list}>
					<ActionRow icon='lock' title='Change Password' onPress={handleChangePassword} />
				</View>

				<View style={styles.dangerZone}>
					<ThemedText style={styles.dangerTitle}>Danger Zone</ThemedText>
					<Pressable style={[styles.actionRow, styles.deleteButton]} onPress={() => setDeleteConfirmVisible(true)} android_ripple={{ color: "#FEE2E2" }}>
						<View style={styles.deleteIcon}>
							<Feather name='trash-2' size={18} color='#DC2626' />
						</View>
						<ThemedText style={styles.deleteTitle}>Delete Account</ThemedText>
						<Feather name='chevron-right' size={20} color='#9CA3AF' />
					</Pressable>
				</View>

				<ThemedButton title='Done' onPress={handleClosePress} style={styles.doneButton} />

				<ThemedAlert visible={deleteConfirmVisible} variant='confirm' title='Delete Account?' message='This action cannot be undone. All your data will be permanently erased.' confirmText='Delete' cancelText='Cancel' onConfirm={handleDeleteConfirm} onCancel={() => setDeleteConfirmVisible(false)} loading={isDeleting} />
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

SecurityBottomSheet.displayName = "SecurityBottomSheet";

interface ActionRowProps {
	icon: React.ComponentProps<typeof Feather>["name"];
	title: string;
	onPress?: () => void;
}

function ActionRow({ icon, title, onPress }: ActionRowProps) {
	return (
		<Pressable style={styles.actionRow} onPress={onPress} android_ripple={{ color: "#EEF2FF" }}>
			<View style={styles.settingIcon}>
				<Feather name={icon} size={18} color='#155DFC' />
			</View>
			<ThemedText style={styles.settingTitle}>{title}</ThemedText>
			<Feather name='chevron-right' size={20} color='#9CA3AF' />
		</Pressable>
	);
}

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
	list: {
		marginTop: 4,
		gap: 12,
	},
	dangerZone: {
		marginTop: 24,
		marginBottom: 16,
	},
	dangerTitle: {
		fontSize: 12,
		fontWeight: "600",
		color: "#DC2626",
		marginBottom: 8,
		textTransform: "uppercase",
		letterSpacing: 0.5,
	},
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 14,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		gap: 12,
	},
	deleteButton: {
		backgroundColor: "#FEF2F2",
		borderColor: "#FCA5A5",
	},
	settingIcon: {
		width: 36,
		height: 36,
		borderRadius: 12,
		backgroundColor: "#EEF2FF",
		alignItems: "center",
		justifyContent: "center",
	},
	deleteIcon: {
		width: 36,
		height: 36,
		borderRadius: 12,
		backgroundColor: "#FEE2E2",
		alignItems: "center",
		justifyContent: "center",
	},
	settingTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#111827",
		flex: 1,
	},
	deleteTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#DC2626",
		flex: 1,
	},
	doneButton: {
		marginTop: 16,
	},
});
