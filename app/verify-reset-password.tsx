import { StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Toast } from "toastify-react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ThemedPasswordInput } from "@/components/themed-password-input";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { supabase } from "@/utils/supabase";
import * as Linking from "expo-linking";

export default function VerifyResetPasswordScreen() {
	const insets = useSafeAreaInsets();

	const [loading, setLoading] = useState(false);
	const [verifying, setVerifying] = useState(true);
	const [isValid, setIsValid] = useState(false);
	const initialUrl = Linking.useLinkingURL();
	console.log("Initial URL:", initialUrl);

	useEffect(() => {
		const verifyAndSetSession = async () => {
			try {
				// Get initial URL when component mounts

				if (initialUrl) {
					// Parse the URL - hash fragment format: pocketpilot://verify-reset-password#access_token=...&refresh_token=...&type=...
					const hashIndex = initialUrl.indexOf("#");
					let accessToken = "";
					let refreshToken = "";
					let type = "";

					if (hashIndex !== -1) {
						// Extract fragment after #
						const fragment = initialUrl.substring(hashIndex + 1);
						console.log("URL fragment:", fragment);

						// Parse fragment parameters manually
						const params = new URLSearchParams(fragment);
						accessToken = params.get("access_token") || "";
						refreshToken = params.get("refresh_token") || "";
						type = params.get("type") || "";
					}

					console.log("URL params:", { accessToken, refreshToken, type });

					if (type === "recovery" && accessToken) {
						const { error } = await supabase.auth.setSession({
							access_token: accessToken,
							refresh_token: refreshToken || "",
						});

						if (error) {
							console.error("Session error:", error);
							Toast.error(error.message || "Invalid or expired reset link");
							setIsValid(false);
							setTimeout(() => {
								router.replace("/forgot");
							}, 2000);
							return;
						}
					}
				}

				// Check if session is valid
				const {
					data: { session },
				} = await supabase.auth.getSession();

				if (session) {
					console.log("Valid session found");
					setIsValid(true);
					// Navigate to reset password screen
					setTimeout(() => {
						router.replace("/reset-password");
					}, 200);
				} else {
					console.log("No valid session");
					Toast.error("Invalid or expired reset link");
					setIsValid(false);
					setTimeout(() => {
						router.replace("/forgot");
					}, 2000);
				}
			} catch (error) {
				console.error("Token verification error:", error);
				Toast.error("Something went wrong. Please request a new reset link");
				setIsValid(false);
				setTimeout(() => {
					router.replace("/forgot");
				}, 2000);
			} finally {
				setVerifying(false);
			}
		};

		verifyAndSetSession();
	}, []);

	if (verifying) {
		return (
			<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<ThemedText type='title' style={styles.title}>
						Verifying...
					</ThemedText>
					<ThemedText style={styles.subtitle}>Please wait while we verify your reset link</ThemedText>
				</View>
			</ThemedScrollView>
		);
	}

	if (!isValid) {
		return (
			<ThemedScrollView style={[styles.container, { paddingTop: insets.top }]}>
				<View style={styles.header}>
					<ThemedText type='title' style={styles.title}>
						Invalid Link
					</ThemedText>
					<ThemedText style={styles.subtitle}>This reset link is invalid or has expired. Redirecting...</ThemedText>
				</View>
			</ThemedScrollView>
		);
	}

	return null;
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
});
