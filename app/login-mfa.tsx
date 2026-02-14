import { ThemedAlert } from "@/components/themed-alert";
import { ThemedButton } from "@/components/themed-button";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { getApiUrl, API_CONFIG } from "@/constants/config";
import { supabase } from "@/utils/supabase";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";

export default function LoginMFAScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { email, password } = useLocalSearchParams<{ email: string; password: string }>();
	const [code, setCode] = useState("");
	const [generatedOtp, setGeneratedOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [otpKey, setOtpKey] = useState(0); // Key to force OTP input re-render
	const [alert, setAlert] = useState({ visible: false, title: "", message: "", onDismissAction: null as (() => void) | null });

	// Generate random 6-digit OTP
	const generateOTP = () => {
		return Math.floor(100000 + Math.random() * 900000).toString();
	};

	// Send OTP to email
	const sendOTP = async (otp: string) => {
		if (!email) return;

		try {
			const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SEND_OTP), {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					otp: otp,
					email: email,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.detail || "Failed to send OTP");
			}

			Toast.success("Verification code sent to your email!", "bottom");
		} catch (err: any) {
			console.error("Error sending OTP:", err);
			setAlert({
				visible: true,
				title: "Error",
				message: err.message || "Failed to send verification code",
				onDismissAction: null,
			});
		}
	};

	// Send OTP when component mounts
	useEffect(() => {
		const initializeOTP = async () => {
			if (!email) {
				setAlert({
					visible: true,
					title: "Error",
					message: "Email address is required. Redirecting to login...",
					onDismissAction: () => router.replace("/welcome"),
				});
				return;
			}

			try {
				const otp = generateOTP();
				setGeneratedOtp(otp);
				await sendOTP(otp);
			} catch (err) {
				console.error("Failed to initialize OTP:", err);
				setAlert({
					visible: true,
					title: "Error",
					message: "Failed to send verification code. Please try again.",
					onDismissAction: () => router.replace("/welcome"),
				});
			}
		};

		initializeOTP();
	}, [email]);

	const handleVerifyMFA = async () => {
		// Validate inputs
		if (code.length !== 6) {
			setAlert({
				visible: true,
				title: "Invalid Code",
				message: "Please enter a 6-digit verification code",
				onDismissAction: null,
			});
			return;
		}

		if (!email || typeof email !== "string" || email.trim() === "") {
			setAlert({
				visible: true,
				title: "Error",
				message: "Invalid email address. Please try again.",
				onDismissAction: () => router.replace("/welcome"),
			});
			return;
		}

		if (!password || typeof password !== "string" || password.trim() === "") {
			setAlert({
				visible: true,
				title: "Error",
				message: "Invalid password. Please try again.",
				onDismissAction: () => router.replace("/welcome"),
			});
			return;
		}

		if (!generatedOtp) {
			setAlert({
				visible: true,
				title: "Error",
				message: "No OTP was generated. Please try resending the code.",
				onDismissAction: null,
			});
			return;
		}

		try {
			setLoading(true);

			if (code.trim() !== generatedOtp) {
				console.log("❌ OTP FAILED - Blocking sign-in");
				setLoading(false); // Reset loading immediately
				setAlert({
					visible: true,
					title: "Invalid Code",
					message: "The verification code you entered is incorrect. Please try again.",
					onDismissAction: null,
				});
				setCode("");
				setOtpKey((prev) => prev + 1);
				return; // STOP - Do NOT proceed to authentication
			}

			// OTP is correct, proceed with Supabase authentication
			const { data, error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password: password,
			});

			if (error) {
				// Handle authentication errors
				if (error.message.toLowerCase().includes("invalid") || error.message.toLowerCase().includes("credentials")) {
					setAlert({
						visible: true,
						title: "Login Failed",
						message: "Your username or password is incorrect. Please try again.",
						onDismissAction: () => router.replace("/welcome"),
					});
				} else if (error.message.toLowerCase().includes("email") && error.message.toLowerCase().includes("confirmed")) {
					setAlert({
						visible: true,
						title: "Email Not Verified",
						message: "Please verify your email address before signing in.",
						onDismissAction: () => router.replace("/welcome"),
					});
				} else {
					setAlert({
						visible: true,
						title: "Login Failed",
						message: error.message || "An error occurred during sign in.",
						onDismissAction: () => router.replace("/welcome"),
					});
				}
				return;
			}

			// Success!
			Toast.success("Logged in successfully!", "bottom");
			router.replace("/(tabs)");
		} catch (err: any) {
			console.error("Sign in error:", err);
			setAlert({
				visible: true,
				title: "Error",
				message: err.message || "An unexpected error occurred. Please try again.",
				onDismissAction: () => router.replace("/welcome"),
			});
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email) {
			setAlert({
				visible: true,
				title: "Error",
				message: "Email address is missing. Please return to login.",
				onDismissAction: () => router.replace("/welcome"),
			});
			return;
		}

		try {
			setResendLoading(true);

			// Generate new OTP and send it
			const newOtp = generateOTP();
			setGeneratedOtp(newOtp);
			await sendOTP(newOtp);
			setCode("");
			setOtpKey((prev) => prev + 1); // Force OTP input to re-render
		} catch (err: any) {
			setAlert({
				visible: true,
				title: "Error",
				message: err.message || "Failed to resend code. Please try again.",
				onDismissAction: null,
			});
		} finally {
			setResendLoading(false);
		}
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Two-Factor Authentication
				</ThemedText>
				<ThemedText style={styles.subtitle}>Enter the 6-digit code sent to {email} to verify your identity</ThemedText>
			</View>

			<View style={styles.illustration}>
				<View style={styles.iconCircle}>
					<Feather name='shield' size={64} color='#155DFC' />
				</View>
			</View>

			<OtpInput
				key={otpKey}
				numberOfDigits={6}
				onTextChange={setCode}
				theme={{
					containerStyle: styles.otpContainer,
					pinCodeContainerStyle: styles.otpInput,
					pinCodeTextStyle: styles.otpText,
					focusStickStyle: styles.otpFocusStick,
					focusedPinCodeContainerStyle: styles.otpInputFocused,
				}}
			/>

			<ThemedButton title='Verify & Sign In' variant='primary' style={styles.verifyButton} loading={loading} disabled={code.length !== 6 || loading} onPress={handleVerifyMFA} />

			<View style={styles.resendContainer}>
				<Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
				<ThemedButton title='Resend' variant='text' style={styles.resendButton} loading={resendLoading} disabled={resendLoading} onPress={handleResend} />
			</View>

			<ThemedAlert
				visible={alert.visible}
				title={alert.title}
				message={alert.message}
				onDismiss={() => {
					setAlert({ ...alert, visible: false });
					if (alert.onDismissAction) {
						alert.onDismissAction();
					}
				}}
			/>
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
	},
	illustration: {
		alignItems: "center",
		marginBottom: 48,
	},
	iconCircle: {
		width: 150,
		height: 150,
		borderRadius: 75,
		backgroundColor: "#EFF5FF",
		alignItems: "center",
		justifyContent: "center",
	},
	otpContainer: {
		marginBottom: 32,
		gap: 8,
	},
	otpInput: {
		backgroundColor: "#F3F3F5",
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "#D1D5DC",
		width: 62,
		height: 68,
	},
	otpInputFocused: {
		borderColor: "#155DFC",
		borderWidth: 2,
	},
	otpText: {
		fontSize: 24,
		fontWeight: "600",
		color: "#000000",
	},
	otpFocusStick: {
		backgroundColor: "#155DFC",
	},
	verifyButton: {
		marginBottom: 32,
	},
	resendContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	resendText: {
		fontSize: 14,
		color: "#6B7280",
	},
	resendButton: {
		paddingVertical: 0,
	},
});
