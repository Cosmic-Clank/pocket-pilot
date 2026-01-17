import { StyleSheet, View, Text, Image } from "react-native";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedPasswordInput } from "@/components/themed-password-input";
import { ThemedAlert } from "@/components/themed-alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Toast } from "toastify-react-native";
import { supabase } from "@/utils/supabase";

export default function WelcomeBackScreen() {
	const insets = useSafeAreaInsets();
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState({ visible: false, title: "", message: "" });

	const handleSignIn = async () => {
		if (!email.trim() || !password.trim()) {
			setAlert({ visible: true, title: "Error", message: "Please fill in all fields" });
			return;
		}

		setLoading(true);
		try {
			const { error } = await supabase.auth.signInWithPassword({
				email: email.trim(),
				password,
			});

			if (error) {
				setAlert({ visible: true, title: "Login Failed", message: error.message });
			} else {
				Toast.success("Logged in successfully!", "bottom");
				router.replace("/(tabs)");
			}
		} catch (err) {
			setAlert({ visible: true, title: "Error", message: "An unexpected error occurred" });
			console.error("Sign in error:", err);
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			{/* Header */}
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Welcome Back
				</ThemedText>
				<ThemedText style={styles.subtitle}>Login to continue managing your finances</ThemedText>
			</View>

			{/* Social Login Buttons */}
			<View style={styles.socialButtons}>
				<ThemedButton variant='outline' title='Continue with Google' icon={<Image source={require("@/assets/icons/google-logo.png")} style={styles.socialIcon} />} />

				<ThemedButton variant='outline' title='Continue with Facebook' icon={<Image source={require("@/assets/icons/facebook-logo.png")} style={styles.socialIcon} />} />
			</View>

			{/* Divider */}
			<View style={styles.dividerContainer}>
				<View style={styles.dividerLine} />
				<Text style={styles.dividerText}>Or continue with email</Text>
				<View style={styles.dividerLine} />
			</View>

			{/* Email Input */}
			<ThemedInput label='Email' icon='mail' placeholder='Enter your email' keyboardType='email-address' autoCapitalize='none' value={email} onChangeText={setEmail} editable={!loading} />

			{/* Password Input */}
			<ThemedPasswordInput label='Password' placeholder='Enter your password' value={password} onChangeText={setPassword} editable={!loading} />
			{/* Forgot Password */}
			<ThemedButton title='Forgot Password?' variant='text' style={styles.forgotPassword} onPress={() => router.navigate("/forgot")} disabled={loading} />

			{/* Login Button */}
			<ThemedButton title={loading ? "Logging in..." : "Login"} variant='primary' style={styles.loginButton} onPress={handleSignIn} disabled={loading} />

			{/* Sign Up Link */}
			<View style={styles.signupContainer}>
				<Text style={styles.signupText}>Don't have an account? </Text>
				<ThemedButton title='Sign up' variant='text' style={styles.signupButton} onPress={() => router.replace("/create-account")} disabled={loading} />
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
	},
	title: {
		fontSize: 32,
		color: "#000000",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
	},
	socialButtons: {
		gap: 16,
		marginBottom: 32,
	},
	socialIcon: {
		width: 24,
		height: 24,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 32,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: "#E5E7EB",
	},
	dividerText: {
		marginHorizontal: 16,
		fontSize: 14,
		color: "#9CA3AF",
	},
	forgotPassword: {
		alignSelf: "flex-end",
		marginTop: 8,
		marginBottom: 32,
	},
	loginButton: {
		marginBottom: 24,
	},
	signupContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	signupText: {
		fontSize: 14,
		color: "#6B7280",
	},
	signupButton: {
		paddingVertical: 0,
	},
});
