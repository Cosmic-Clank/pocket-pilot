import { useState } from "react";
import { StyleSheet, View, Text, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedPasswordInput } from "@/components/themed-password-input";
import { ThemedAlert } from "@/components/themed-alert";
import { supabase } from "@/utils/supabase";
import { Toast } from "toastify-react-native";
import { StatusBar } from "expo-status-bar";

export default function CreateAccountScreen() {
	const insets = useSafeAreaInsets();
	const [fullName, setFullName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [agreed, setAgreed] = useState(false);
	const [loading, setLoading] = useState(false);
	const [alert, setAlert] = useState({ visible: false, title: "", message: "" });
	const router = useRouter();

	const isFormValid = agreed && fullName.trim() && email.trim() && password && confirmPassword && password === confirmPassword;

	const handleCreateAccount = async () => {
		if (!isFormValid) {
			setAlert({ visible: true, title: "Check your details", message: "Please complete all fields and ensure passwords match." });
			return;
		}

		try {
			setLoading(true);
			const { error, data } = await supabase.auth.signUp({
				email: email.trim(),
				password,
				options: {
					data: {
						full_name: fullName.trim(),
					},
				},
			});

			if (error) {
				setAlert({ visible: true, title: "Sign up failed", message: error.message });
				return;
			}

			Toast.success("Check your email for a verification link", "bottom");
			router.replace({
				pathname: "/verify-email",
				params: { email: email.trim() },
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Create Account
				</ThemedText>
				<ThemedText style={styles.subtitle}>Sign up to start managing your finances</ThemedText>
			</View>

			<View style={styles.socialButtons}>
				<ThemedButton variant='outline' title='Continue with Google' icon={<Image source={require("@/assets/icons/google-logo.png")} style={styles.socialIcon} />} />
				<ThemedButton variant='outline' title='Continue with Facebook' icon={<Image source={require("@/assets/icons/facebook-logo.png")} style={styles.socialIcon} />} />
			</View>

			<View style={styles.dividerContainer}>
				<View style={styles.dividerLine} />
				<Text style={styles.dividerText}>Or continue with email</Text>
				<View style={styles.dividerLine} />
			</View>

			<View style={styles.form}>
				<ThemedInput label='Full Name' icon='user' placeholder='Enter your full name' autoCapitalize='words' value={fullName} onChangeText={setFullName} />
				<ThemedInput label='Email' icon='mail' placeholder='Enter your email' keyboardType='email-address' autoCapitalize='none' value={email} onChangeText={setEmail} />
				<ThemedPasswordInput label='Password' placeholder='Create a password' value={password} onChangeText={setPassword} />
				<ThemedPasswordInput label='Confirm Password' placeholder='Confirm your password' value={confirmPassword} onChangeText={setConfirmPassword} />

				<View style={styles.termsRow}>
					<TouchableOpacity onPress={() => setAgreed(!agreed)} style={[styles.checkbox, agreed && styles.checkboxChecked]}>
						{agreed && <Feather name='check' size={16} color='#FFFFFF' />}
					</TouchableOpacity>
					<Text style={styles.termsText}>
						I agree to the <Text style={styles.linkText}>Terms of Service</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
					</Text>
				</View>

				<ThemedButton title={loading ? "Creating..." : "Create Account"} variant='primary' style={styles.createButton} disabled={loading || !isFormValid} onPress={handleCreateAccount} />
			</View>

			<View style={styles.footer}>
				<Text style={styles.footerText}>Already have an account? </Text>
				<ThemedButton title='Login' variant='text' onPress={() => router.replace("/welcome")} />
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
	socialButtons: {
		gap: 16,
		marginBottom: 28,
	},
	socialIcon: {
		width: 24,
		height: 24,
	},
	dividerContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 24,
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
	form: {
		gap: 16,
	},
	termsRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderRadius: 6,
		borderWidth: 1.5,
		borderColor: "#CBD5E1",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#FFFFFF",
	},
	checkboxChecked: {
		backgroundColor: "#155DFC",
		borderColor: "#155DFC",
	},
	termsText: {
		flex: 1,
		fontSize: 14,
		color: "#374151",
		lineHeight: 20,
	},
	linkText: {
		color: "#155DFC",
		fontWeight: "600",
	},
	createButton: {
		marginTop: 8,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 24,
	},
	footerText: {
		fontSize: 14,
		color: "#6B7280",
	},
});
