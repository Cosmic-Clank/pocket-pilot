import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Toast } from "toastify-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedPasswordInput } from "@/components/themed-password-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";

export default function ResetPasswordScreen() {
	const insets = useSafeAreaInsets();

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const validatePassword = (password: string) => {
		if (password.length < 6) {
			return "Password must be at least 6 characters";
		}
		return null;
	};

	const handleResetPassword = async () => {
		const passwordError = validatePassword(newPassword);
		if (passwordError) {
			Toast.error(passwordError);
			return;
		}

		if (newPassword !== confirmPassword) {
			Toast.error("Passwords do not match");
			return;
		}

		setLoading(true);

		try {
			const { error } = await supabase.auth.updateUser({
				password: newPassword,
			});

			if (error) {
				Toast.error(error.message || "Failed to reset password");
				return;
			}

			Toast.success("Password reset successfully!");

			// await supabase.auth.signOut();
			setTimeout(() => {
				router.replace("/welcome");
			}, 1500);
		} catch (error) {
			console.error("Password reset error:", error);
			Toast.error("Something went wrong. Please try again");
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Reset Password
				</ThemedText>
				<ThemedText style={styles.subtitle}>Create a new password for your account</ThemedText>
			</View>

			<ThemedPasswordInput label='New Password' placeholder='Enter new password' value={newPassword} onChangeText={setNewPassword} editable={!loading} />

			<ThemedPasswordInput label='Confirm Password' placeholder='Confirm your password' value={confirmPassword} onChangeText={setConfirmPassword} editable={!loading} />

			<ThemedButton title={loading ? "Updating..." : "Update Password"} variant='primary' style={styles.submitButton} onPress={handleResetPassword} disabled={loading} />
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
