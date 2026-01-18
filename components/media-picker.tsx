import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useCallback, useState } from "react";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/themed-text";
import { ThemedAlert } from "@/components/themed-alert";

export type MediaPickerProps = {
	label?: string;
	value?: string | null;
	onSelect: (asset: ImagePicker.ImagePickerAsset) => void;
	disabled?: boolean;
};

export function MediaPicker({ label, value, onSelect, disabled = false }: MediaPickerProps) {
	const [isPicking, setIsPicking] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertContent, setAlertContent] = useState<{ title: string; message: string }>({ title: "", message: "" });

	const handlePick = useCallback(async () => {
		if (isPicking || disabled) return;
		setIsPicking(true);
		try {
			const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				setAlertContent({ title: "Permission required", message: "Permission to access the media library is required." });
				setAlertVisible(true);
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				quality: 0.8,
				base64: true,
			});

			if (!result.canceled) {
				onSelect(result.assets[0]);
			}
		} catch (error) {
			setAlertContent({ title: "Could not open gallery", message: "Something went wrong while opening your media library." });
			setAlertVisible(true);
			console.error("MediaPicker error", error);
		} finally {
			setIsPicking(false);
		}
	}, [disabled, isPicking, onSelect]);

	const textColor = value ? "#155DFC" : "#6B7280";

	return (
		<View style={styles.container}>
			{label && <ThemedText style={styles.label}>{label}</ThemedText>}
			<TouchableOpacity style={[styles.pickerButton, (disabled || isPicking) && styles.disabled]} onPress={handlePick} disabled={disabled || isPicking} activeOpacity={0.8}>
				<Feather name='paperclip' size={20} color={textColor} />
				<ThemedText style={[styles.pickerText, { color: textColor }]}>{value ?? "Choose file"}</ThemedText>
				{value && <Feather name='check-circle' size={20} color={textColor} />}
			</TouchableOpacity>
			<ThemedAlert visible={alertVisible} title={alertContent.title} message={alertContent.message} onDismiss={() => setAlertVisible(false)} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 8,
	},
	label: {
		fontSize: 14,
		fontWeight: "600",
		color: "#374151",
	},
	pickerButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		borderRadius: 14,
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: "#6B7280",
		paddingVertical: 18,
		paddingHorizontal: 16,
		backgroundColor: "#FFFFFF",
		minHeight: 72,
	},
	pickerText: {
		fontSize: 15,
		fontWeight: "600",
		textAlign: "center",
	},
	disabled: {
		opacity: 0.6,
	},
});
