import { StyleSheet, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
	const insets = useSafeAreaInsets();

	return (
		<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
			<View style={styles.header}>
				<ThemedText type='title' style={styles.title}>
					Forgot Password?
				</ThemedText>
				<ThemedText style={styles.subtitle}>Don't worry! Enter your email and we'll send you a reset link.</ThemedText>
			</View>

			<View style={styles.illustration}>
				<View style={styles.iconCircle}>
					<Feather name='mail' size={64} color='#155DFC' />
				</View>
			</View>

			<View style={styles.inputContainer}>
				<ThemedInput label='Email' icon='mail' placeholder='Enter your email' keyboardType='email-address' autoCapitalize='none' autoCorrect={false} textContentType='emailAddress' />
			</View>

			<ThemedButton title='Send Reset Link' variant='primary' style={styles.resetButton} />
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
});
