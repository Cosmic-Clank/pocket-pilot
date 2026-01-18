import { StyleSheet, View, TouchableOpacity, Modal, ActivityIndicator, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ManualEntryForm } from "./manual-entry-form";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState, useRef } from "react";
import * as ImagePicker from "expo-image-picker";
import { ImagePickerAsset } from "expo-image-picker";
import { API_CONFIG, getApiUrl } from "@/constants/config";

interface ScannedData {
	title: string;
	amount: string;
	category: string;
	type: string;
	date: Date;
	notes: string;
	receiptBase64: string;
}

interface ScanReceiptViewProps {
	onExpenseSuccess?: () => void;
}

export const ScanReceiptView = ({ onExpenseSuccess }: ScanReceiptViewProps) => {
	const [cameraVisible, setCameraVisible] = useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	const [capturedImage, setCapturedImage] = useState<string | null>(null);
	const [processing, setProcessing] = useState(false);
	const [scannedData, setScannedData] = useState<ScannedData | null>(null);
	const cameraRef = useRef<CameraView>(null);

	const handleGalleryPick = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ["images"],
			allowsEditing: true,
			base64: true,
		});

		if (!result.canceled && result.assets[0].base64) {
			setCapturedImage(result.assets[0].base64);
		}
	};

	const handleCameraOpen = async () => {
		if (!permission?.granted) {
			const response = await requestPermission();
			if (!response.granted) return;
		}
		setCameraVisible(true);
	};

	const handleTakePicture = async () => {
		if (cameraRef.current) {
			const photo = await cameraRef.current.takePictureAsync({ base64: true });
			if (photo?.base64) {
				setCapturedImage(photo.base64);
				setCameraVisible(false);
			}
		}
	};

	const handleProcess = async () => {
		if (!capturedImage) return;

		setProcessing(true);
		try {
			const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.PROCESS_RECEIPT), {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					receipt_base64: capturedImage,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to process receipt");
			}

			const data = await response.json();

			// Convert ISO date string to Date object
			const scannedResponse: ScannedData = {
				title: data.title,
				amount: data.amount.toString(),
				category: data.category,
				type: data.type,
				date: new Date(data.transaction_date),
				notes: data.notes || "",
				receiptBase64: capturedImage,
			};

			setScannedData(scannedResponse);
		} catch (err) {
			console.error("Receipt processing error:", err);
			// TODO: Show error alert to user
		} finally {
			setProcessing(false);
		}
	};

	const handleRedo = () => {
		setCapturedImage(null);
		setScannedData(null);
	};

	// If scanned data exists, show manual entry form with pre-filled data
	if (scannedData) {
		// Create an ImagePickerAsset-like object from base64
		const receiptAsset: ImagePickerAsset = {
			uri: `data:image/jpeg;base64,${scannedData.receiptBase64}`,
			base64: scannedData.receiptBase64,
			width: 1920,
			height: 1080,
			type: "image",
			mimeType: "image/jpeg",
			fileName: `receipt-${Date.now()}.jpg`,
		};

		return (
			<View style={styles.container}>
				<View style={styles.redoHeader}>
					<ThemedText style={styles.verifyText}>Verify and edit the extracted data</ThemedText>
					<TouchableOpacity onPress={handleRedo} style={styles.redoButton}>
						<Feather name='refresh-cw' size={16} color='#155DFC' />
						<ThemedText style={styles.redoText}>Rescan</ThemedText>
					</TouchableOpacity>
				</View>
				<ManualEntryForm
					initialTitle={scannedData.title}
					initialAmount={scannedData.amount}
					initialCategory={scannedData.category}
					initialType={scannedData.type}
					initialDate={scannedData.date}
					initialNotes={scannedData.notes}
					initialReceiptAsset={receiptAsset}
					onSuccess={() => {
						onExpenseSuccess?.();
						handleRedo();
					}}
				/>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			{/* OCR Technology Info Box */}
			<View style={styles.infoBox}>
				<View style={styles.infoIconContainer}>
					<Feather name='maximize' size={24} color='#155DFC' />
				</View>
				<View style={styles.infoContent}>
					<ThemedText style={styles.infoTitle}>OCR Technology</ThemedText>
					<ThemedText style={styles.infoDescription}>Upload a receipt and our AI will automatically extract vendor name, amount, and date for you to verify.</ThemedText>
				</View>
			</View>

			{/* Upload Area or Image Preview */}
			{!capturedImage ? (
				<View style={styles.uploadOptions}>
					<TouchableOpacity style={styles.uploadArea} onPress={handleCameraOpen}>
						<View style={styles.uploadIconContainer}>
							<Feather name='camera' size={48} color='#9CA3AF' />
						</View>
						<ThemedText style={styles.uploadTitle}>Take Photo</ThemedText>
						<ThemedText style={styles.uploadSubtitle}>Use camera to scan receipt</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity style={styles.uploadArea} onPress={handleGalleryPick}>
						<View style={styles.uploadIconContainer}>
							<Feather name='image' size={48} color='#9CA3AF' />
						</View>
						<ThemedText style={styles.uploadTitle}>Choose from Gallery</ThemedText>
						<ThemedText style={styles.uploadSubtitle}>Select an existing image</ThemedText>
					</TouchableOpacity>
				</View>
			) : (
				<View style={styles.previewContainer}>
					<Image source={{ uri: `data:image/jpeg;base64,${capturedImage}` }} style={styles.previewImage} resizeMode='cover' />
					<TouchableOpacity style={styles.retakeButton} onPress={() => setCapturedImage(null)}>
						<Feather name='x-circle' size={20} color='#FFFFFF' />
						<ThemedText style={styles.retakeText}>Retake</ThemedText>
					</TouchableOpacity>
				</View>
			)}

			{/* Info Text */}
			<ThemedText style={styles.infoText}>After scanning, you'll be able to verify and edit the extracted information before saving.</ThemedText>

			{/* Process Button */}
			<ThemedButton title={processing ? "Processing..." : "Process Receipt"} variant='primary' style={styles.saveButton} disabled={!capturedImage || processing} onPress={handleProcess} loading={processing} />

			{/* Camera Modal */}
			<Modal visible={cameraVisible} animationType='slide'>
				<View style={styles.cameraContainer}>
					<CameraView ref={cameraRef} style={styles.camera} facing='back' />
					<View style={styles.cameraControls}>
						<TouchableOpacity style={styles.cameraButton} onPress={() => setCameraVisible(false)}>
							<Feather name='x' size={24} color='#FFFFFF' />
						</TouchableOpacity>
						<TouchableOpacity style={styles.captureButton} onPress={handleTakePicture}>
							<View style={styles.captureButtonInner} />
						</TouchableOpacity>
						<View style={styles.cameraButton} />
					</View>
				</View>
			</Modal>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		gap: 20,
		paddingBottom: 20,
	},
	redoHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: "#F0F9FF",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#BFDBFE",
	},
	verifyText: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1E40AF",
		flex: 1,
	},
	redoButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingVertical: 6,
		paddingHorizontal: 12,
		backgroundColor: "#FFFFFF",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#155DFC",
	},
	redoText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#155DFC",
	},
	infoBox: {
		flexDirection: "row",
		gap: 12,
		borderRadius: 12,
		padding: 14,
		backgroundColor: "#EFF6FF",
		borderWidth: 1,
		borderColor: "#D1E0F4",
	},
	infoIconContainer: {
		width: 48,
		height: 48,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
		flexShrink: 0,
	},
	infoContent: {
		flex: 1,
		justifyContent: "center",
	},
	infoTitle: {
		fontSize: 14,
		fontWeight: "600",
		color: "#1C398E",
		marginBottom: 4,
	},
	infoDescription: {
		fontSize: 13,
		color: "#1447E6",
		lineHeight: 18,
	},
	uploadOptions: {
		gap: 12,
	},
	uploadArea: {
		borderRadius: 12,
		borderWidth: 2,
		borderColor: "#E5E7EB",
		borderStyle: "dashed",
		paddingVertical: 32,
		paddingHorizontal: 20,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FAFBFC",
		gap: 8,
	},
	uploadIconContainer: {
		width: 60,
		height: 60,
		borderRadius: 12,
		backgroundColor: "#F3F4F6",
		alignItems: "center",
		justifyContent: "center",
	},
	uploadTitle: {
		fontSize: 16,
		fontWeight: "600",
		color: "#1F2937",
	},
	uploadSubtitle: {
		fontSize: 14,
		color: "#6B7280",
	},
	previewContainer: {
		position: "relative",
		borderRadius: 12,
		overflow: "hidden",
		backgroundColor: "#F3F4F6",
	},
	previewImage: {
		width: "100%",
		height: 300,
		borderRadius: 12,
	},
	retakeButton: {
		position: "absolute",
		top: 12,
		right: 12,
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: "rgba(0, 0, 0, 0.7)",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 8,
	},
	retakeText: {
		color: "#FFFFFF",
		fontSize: 14,
		fontWeight: "600",
	},
	infoText: {
		fontSize: 13,
		color: "#6B7280",
		lineHeight: 18,
		textAlign: "center",
	},
	saveButton: {
		marginTop: 8,
	},
	cameraContainer: {
		flex: 1,
		backgroundColor: "#000000",
	},
	camera: {
		flex: 1,
	},
	cameraControls: {
		position: "absolute",
		bottom: 40,
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	cameraButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	captureButton: {
		width: 70,
		height: 70,
		borderRadius: 35,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 4,
		borderColor: "rgba(255, 255, 255, 0.5)",
	},
	captureButtonInner: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#FFFFFF",
	},
});
