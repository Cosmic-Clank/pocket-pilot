import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Modal } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ThemedText } from "@/components/themed-text";
import { ThemedAlert } from "@/components/themed-alert";

interface ProfilePicPickerProps {
	onImageSelected: (base64: string) => void;
	onRemovePhoto?: () => void;
	hasExistingPhoto?: boolean;
	showOptions: boolean;
	onDismiss: () => void;
}

export function ProfilePicPicker({ onImageSelected, onRemovePhoto, hasExistingPhoto, showOptions, onDismiss }: ProfilePicPickerProps) {
	const [permissionAlert, setPermissionAlert] = useState<{ title: string; message: string } | null>(null);

	const showPermissionAlert = (title: string, message: string) => {
		setPermissionAlert({ title, message });
	};

	const pickImage = async () => {
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
		if (status !== "granted") {
			showPermissionAlert("Permission Required", "Camera roll permission is required to select photos");
			return;
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			onDismiss();
			onImageSelected(result.assets[0].base64);
		}
	};

	const takePhoto = async () => {
		const { status } = await ImagePicker.requestCameraPermissionsAsync();
		if (status !== "granted") {
			showPermissionAlert("Permission Required", "Camera permission is required to take photos");
			return;
		}

		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			onDismiss();
			onImageSelected(result.assets[0].base64);
		}
	};

	const handleRemovePhoto = () => {
		onDismiss();
		onRemovePhoto?.();
	};

	return (
		<>
			<Modal transparent visible={showOptions} animationType="fade">
				<View style={styles.overlay}>
					<View style={styles.optionsContainer}>
						<ThemedText style={styles.title}>Update Profile Picture</ThemedText>

						<TouchableOpacity style={styles.option} onPress={takePhoto}>
							<ThemedText style={styles.optionText}>Take a Photo</ThemedText>
						</TouchableOpacity>

						<TouchableOpacity style={styles.option} onPress={pickImage}>
							<ThemedText style={styles.optionText}>Choose from Gallery</ThemedText>
						</TouchableOpacity>

						{hasExistingPhoto && (
							<TouchableOpacity style={[styles.option, styles.removeOption]} onPress={handleRemovePhoto}>
								<ThemedText style={[styles.optionText, styles.removeText]}>Remove Photo</ThemedText>
							</TouchableOpacity>
						)}

						<TouchableOpacity style={styles.cancelButton} onPress={onDismiss}>
							<ThemedText style={styles.cancelText}>Cancel</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
			<ThemedAlert
				visible={!!permissionAlert}
				title={permissionAlert?.title ?? ""}
				message={permissionAlert?.message ?? ""}
				onDismiss={() => setPermissionAlert(null)}
			/>
		</>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "flex-end",
	},
	optionsContainer: {
		backgroundColor: "#FFFFFF",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 40,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 20,
		textAlign: "center",
	},
	option: {
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#E5E7EB",
	},
	optionText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#155DFC",
		textAlign: "center",
	},
	removeOption: {
		borderBottomWidth: 0,
	},
	removeText: {
		color: "#DC2626",
	},
	cancelButton: {
		paddingVertical: 14,
		marginTop: 8,
	},
	cancelText: {
		fontSize: 16,
		fontWeight: "500",
		color: "#6B7280",
		textAlign: "center",
	},
});
