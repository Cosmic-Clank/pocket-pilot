import { GoogleSignin, GoogleSigninButton, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";
import { supabase } from "@/utils/supabase";
import { StyleSheet, TouchableOpacity, Text, Image, ActivityIndicator, type ViewStyle } from "react-native";
import { useState } from "react";
import * as Haptics from "expo-haptics";

type GoogleAuthProps = {
	variant?: "native" | "custom";
	style?: ViewStyle;
	onSuccess?: () => void;
	onError?: (error: any) => void;
};

export default function GoogleAuth({ variant = "native", style, onSuccess, onError }: GoogleAuthProps) {
	const [loading, setLoading] = useState(false);

	GoogleSignin.configure({
		webClientId: "839702511871-q094sfunbe900ogttnd9imp4go0llpak.apps.googleusercontent.com",
	});

	const handleSignIn = async () => {
		try {
			setLoading(true);
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

			console.log("Google sign in pressed");
			await GoogleSignin.hasPlayServices();
			const response = await GoogleSignin.signIn();
			if (isSuccessResponse(response) && response.data.idToken) {
				const { data, error } = await supabase.auth.signInWithIdToken({
					provider: "google",
					token: response.data.idToken,
				});
				console.log(response, data, error);
				if (!error) {
					onSuccess?.();
				} else {
					onError?.(error);
				}
			}
		} catch (error: any) {
			console.log("Google sign in error:", error);
			onError?.(error);
			if (error.code === statusCodes.IN_PROGRESS) {
				// operation (e.g. sign in) is in progress already
			} else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
				// play services not available or outdated
			} else {
				// some other error happened
			}
		} finally {
			setLoading(false);
		}
	};

	// Native Google Sign-In Button (original styling)
	if (variant === "native") {
		return <GoogleSigninButton size={GoogleSigninButton.Size.Wide} color={GoogleSigninButton.Color.Dark} onPress={handleSignIn} disabled={loading} />;
	}

	// Custom styled button (matches app theme)
	return (
		<TouchableOpacity style={[styles.customButton, style]} onPress={handleSignIn} disabled={loading} activeOpacity={0.2}>
			{loading ? (
				<ActivityIndicator size='small' color='#FFFFFF' />
			) : (
				<>
					<Image source={require("@/assets/icons/google-logo.png")} style={styles.googleIcon} />
					<Text style={styles.buttonText}>Continue with Google</Text>
				</>
			)}
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	customButton: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#D1D5DC",
		borderRadius: 16,
		paddingVertical: 18,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	googleIcon: {
		width: 24,
		height: 24,
	},
	buttonText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
	},
});
