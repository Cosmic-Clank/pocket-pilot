import { StyleSheet, View } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";

export default function ForgotPasswordScreen() {
	const insets = useSafeAreaInsets();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [emailSent, setEmailSent] = useState(false);

	const validateEmail = (email: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSendResetLink = async () => {
		if (!email.trim()) {
			Toast.error("Please enter your email address");
			return;
		}

		if (!validateEmail(email.trim())) {
			Toast.error("Please enter a valid email address");
			return;
		}

		setLoading(true);

		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
				redirectTo: "pocketpilot://verify-reset-password",
			});

			if (error) {
				Toast.error(error.message || "Failed to send reset link");
				return;
			}

			setEmailSent(true);
			Toast.success("Reset link sent! Check your email");
		} catch (error) {
			console.error("Forgot password error:", error);
			Toast.error("Something went wrong. Please try again");
		} finally {
			setLoading(false);
		}
	};

	const handleBackToLogin = () => {
		router.replace("/welcome");
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Forgot Password?
				</ThemedText>
				<ThemedText style={styles.subtitle}>{emailSent ? "We've sent a reset link to your email." : "Don't worry! Enter your email and we'll send you a reset link."}</ThemedText>
			</View>

			<View style={styles.illustration}>
				<View style={styles.iconCircle}>
					<Feather name={emailSent ? "check-circle" : "mail"} size={64} color={emailSent ? "#10B981" : "#155DFC"} />
				</View>
			</View>

			{!emailSent ? (
				<>
					<View style={styles.inputContainer}>
						<ThemedInput label='Email' icon='mail' placeholder='Enter your email' keyboardType='email-address' autoCapitalize='none' autoCorrect={false} textContentType='emailAddress' value={email} onChangeText={setEmail} editable={!loading} />
					</View>

					<ThemedButton title={loading ? "Sending..." : "Send Reset Link"} variant='primary' style={styles.resetButton} onPress={handleSendResetLink} disabled={loading} />
				</>
			) : (
				<>
					<ThemedText style={styles.instructionText}>Please check your email inbox and click the reset link to create a new password.</ThemedText>

					<ThemedButton title='Back to Login' variant='outline' style={styles.backButton} onPress={handleBackToLogin} />

					<ThemedButton
						title='Resend Link'
						variant='primary'
						style={styles.resendButton}
						onPress={() => {
							setEmailSent(false);
						}}
					/>
				</>
			)}
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
		fontSize: 18,
		color: "#6B7280",
		lineHeight: 22,
	},
	illustration: {
		alignItems: "center",
		marginBottom: 40,
	},
	iconCircle: {
		width: 150,
		height: 150,
		borderRadius: 90,
		backgroundColor: "#EFF5FF",
		alignItems: "center",
		justifyContent: "center",
	},
	inputContainer: {
		marginBottom: 24,
	},
	resetButton: {
		marginTop: 8,
	},
	instructionText: {
		fontSize: 16,
		color: "#6B7280",
		lineHeight: 24,
		textAlign: "center",
		marginBottom: 24,
		paddingHorizontal: 20,
	},
	backButton: {
		marginTop: 8,
		marginBottom: 12,
	},
	resendButton: {
		marginTop: 4,
	},
});
