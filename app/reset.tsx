import { StyleSheet, View } from "react-native";
import { Toast } from "toastify-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedPasswordInput } from "@/components/themed-password-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ResetPasswordScreen() {
	const insets = useSafeAreaInsets();

	const handleResetPassword = () => {
		// TODO: Add password validation and API call here
		Toast.success("Password has been reset successfully!");
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Reset Password
				</ThemedText>
				<ThemedText style={styles.subtitle}>Create a new password for your account</ThemedText>
			</View>

			{/* New Password Input */}
			<ThemedPasswordInput label='New Password' placeholder='Enter new password' />

			{/* Confirm Password Input */}
			<ThemedPasswordInput label='Confirm Password' placeholder='Confirm your password' />

			{/* Submit Button */}
			<ThemedButton title='Update Password' variant='primary' style={styles.submitButton} onPress={handleResetPassword} />
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 30,
		backgroundColor: "#FFFFFF",
	},
	header: {
		marginTop: 46,
		marginBottom: 46,
		gap: 8,
	},
	title: {
		fontSize: 32,
		color: "#000000",
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		lineHeight: 22,
	},
	submitButton: {
		marginTop: 24,
	},
});
