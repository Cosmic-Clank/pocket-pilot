import React from "react";
import { StyleSheet, View, Modal, TouchableOpacity, ActivityIndicator } from "react-native";
import { ThemedText } from "./themed-text";

interface ThemedAlertProps {
	visible: boolean;
	title: string;
	message: string;
	variant?: "alert" | "confirm";
	onDismiss?: () => void;
	onConfirm?: () => void;
	onCancel?: () => void;
	confirmText?: string;
	cancelText?: string;
	okText?: string;
	loading?: boolean;
}

export function ThemedAlert({ visible, title, message, variant = "alert", onDismiss, onConfirm, onCancel, confirmText = "Yes", cancelText = "Cancel", okText = "OK", loading = false }: ThemedAlertProps) {
	return (
		<Modal transparent visible={visible} animationType='fade'>
			<View style={styles.overlay}>
				<View style={styles.alertBox}>
					<ThemedText style={styles.title}>{title}</ThemedText>
					<ThemedText style={styles.message}>{message}</ThemedText>

					{variant === "alert" ? (
						<TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onDismiss} disabled={loading}>
							<ThemedText style={styles.buttonText}>{okText}</ThemedText>
						</TouchableOpacity>
					) : (
						<View style={styles.buttonRow}>
							<TouchableOpacity style={[styles.button, styles.cancelButton, loading && styles.buttonDisabled]} onPress={onCancel} disabled={loading}>
								<ThemedText style={[styles.buttonText, styles.cancelButtonText]}>{cancelText}</ThemedText>
							</TouchableOpacity>
							<TouchableOpacity style={[styles.button, styles.confirmButton, loading && styles.buttonDisabled]} onPress={onConfirm} disabled={loading}>
								{loading ? <ActivityIndicator color='#FFFFFF' /> : <ThemedText style={styles.buttonText}>{confirmText}</ThemedText>}
							</TouchableOpacity>
						</View>
					)}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	alertBox: {
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		padding: 24,
		width: "80%",
		maxWidth: 320,
	},
	title: {
		fontSize: 18,
		fontWeight: "600",
		color: "#000000",
		marginBottom: 12,
	},
	message: {
		fontSize: 14,
		color: "#6B7280",
		marginBottom: 24,
		lineHeight: 20,
	},
	button: {
		backgroundColor: "#155DFC",
		borderRadius: 12,
		paddingVertical: 12,
		alignItems: "center",
	},
	buttonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "600",
	},
	buttonRow: {
		flexDirection: "row",
		gap: 12,
	},
	confirmButton: {
		flex: 1,
		backgroundColor: "#155DFC",
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#F3F4F6",
	},
	cancelButtonText: {
		color: "#6B7280",
	},
	buttonDisabled: {
		opacity: 0.7,
	},
});
