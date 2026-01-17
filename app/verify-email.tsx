import { useState } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { OtpInput } from "react-native-otp-entry";
import { Toast } from "toastify-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedAlert } from "@/components/themed-alert";
import { supabase } from "@/utils/supabase";

export default function VerifyEmailScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const { email } = useLocalSearchParams<{ email: string }>();
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [resendLoading, setResendLoading] = useState(false);
	const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

	const handleVerify = async () => {
		if (code.length !== 6 || !email) return;

		try {
			setLoading(true);
			const { error } = await supabase.auth.verifyOtp({
				email: email,
				token: code,
				type: "email",
			});

			if (error) {
				setAlert({ visible: true, title: "Verification failed", message: error.message });
				return;
			}

			Toast.success("Email verified successfully!", "bottom");
			router.replace("/welcome");
		} catch (err: any) {
			setAlert({ visible: true, title: "Error", message: err.message || "Something went wrong" });
		} finally {
			setLoading(false);
		}
	};

	const handleResend = async () => {
		if (!email) return;

		try {
			setResendLoading(true);
			const { error } = await supabase.auth.resend({
				type: "signup",
				email: email,
			});

			if (error) {
				setAlert({ visible: true, title: "Resend failed", message: error.message });
				return;
			}

			Toast.success("Verification code sent!", "bottom");
			setCode("");
		} catch (err: any) {
			setAlert({ visible: true, title: "Error", message: err.message || "Something went wrong" });
		} finally {
			setResendLoading(false);
		}
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Verify Your Email
				</ThemedText>
				<ThemedText style={styles.subtitle}>We've sent a 6-digit code to {email}</ThemedText>
			</View>

			<View style={styles.illustration}>
				<View style={styles.iconCircle}>
					<Feather name='mail' size={64} color='#155DFC' />
				</View>
			</View>

			<OtpInput
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

			<ThemedButton title={loading ? "Verifying..." : "Verify Email"} variant='primary' style={styles.verifyButton} disabled={code.length !== 6 || loading} onPress={handleVerify} />

			<View style={styles.resendContainer}>
				<Text style={styles.resendText}>Didn't receive the code? </Text>
				<ThemedButton title={resendLoading ? "Sending..." : "Resend"} variant='text' style={styles.resendButton} disabled={resendLoading} onPress={handleResend} />
			</View>

			<ThemedAlert visible={alert.visible} title={alert.title} message={alert.message} onDismiss={() => setAlert({ ...alert, visible: false })} />
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
