import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";
import ToastManager from "toastify-react-native";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "@/utils/supabase";

import { useFonts } from "@expo-google-fonts/inter/useFonts";
import { Inter_100Thin } from "@expo-google-fonts/inter/100Thin";
import { Inter_200ExtraLight } from "@expo-google-fonts/inter/200ExtraLight";
import { Inter_300Light } from "@expo-google-fonts/inter/300Light";
import { Inter_400Regular } from "@expo-google-fonts/inter/400Regular";
import { Inter_500Medium } from "@expo-google-fonts/inter/500Medium";
import { Inter_600SemiBold } from "@expo-google-fonts/inter/600SemiBold";
import { Inter_700Bold } from "@expo-google-fonts/inter/700Bold";
import { Inter_800ExtraBold } from "@expo-google-fonts/inter/800ExtraBold";
import { Inter_900Black } from "@expo-google-fonts/inter/900Black";
import { Inter_100Thin_Italic } from "@expo-google-fonts/inter/100Thin_Italic";
import { Inter_200ExtraLight_Italic } from "@expo-google-fonts/inter/200ExtraLight_Italic";
import { Inter_300Light_Italic } from "@expo-google-fonts/inter/300Light_Italic";
import { Inter_400Regular_Italic } from "@expo-google-fonts/inter/400Regular_Italic";
import { Inter_500Medium_Italic } from "@expo-google-fonts/inter/500Medium_Italic";
import { Inter_600SemiBold_Italic } from "@expo-google-fonts/inter/600SemiBold_Italic";
import { Inter_700Bold_Italic } from "@expo-google-fonts/inter/700Bold_Italic";
import { Inter_800ExtraBold_Italic } from "@expo-google-fonts/inter/800ExtraBold_Italic";
import { Inter_900Black_Italic } from "@expo-google-fonts/inter/900Black_Italic";

const toastConfig = {
	success: ({ text1 }: { text1: string }) => (
		<View style={styles.toastContainer}>
			<View style={styles.iconCircle}>
				<Feather name='check-circle' size={28} color='#00A63E' />
			</View>
			<ThemedText style={styles.toastText}>{text1}</ThemedText>
		</View>
	),
};

const styles = StyleSheet.create({
	toastContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		paddingHorizontal: 20,
		paddingVertical: 16,
		marginHorizontal: 16,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 12,
		elevation: 5,
	},
	iconCircle: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#DCFCE7",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 16,
	},
	toastText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
		flex: 1,
	},
});

export const unstable_settings = {
	anchor: "welcome",
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	let [fontsLoaded] = useFonts({
		Inter_100Thin,
		Inter_200ExtraLight,
		Inter_300Light,
		Inter_400Regular,
		Inter_500Medium,
		Inter_600SemiBold,
		Inter_700Bold,
		Inter_800ExtraBold,
		Inter_900Black,
		Inter_100Thin_Italic,
		Inter_200ExtraLight_Italic,
		Inter_300Light_Italic,
		Inter_400Regular_Italic,
		Inter_500Medium_Italic,
		Inter_600SemiBold_Italic,
		Inter_700Bold_Italic,
		Inter_800ExtraBold_Italic,
		Inter_900Black_Italic,
	});

	useEffect(() => {
		const checkSession = async () => {
			try {
				const { data } = await supabase.auth.getSession();
				setIsLoggedIn(!!data?.session);
			} catch (error) {
				console.error("Error checking session:", error);
				setIsLoggedIn(false);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();

		// Listen for auth state changes
		const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
			setIsLoggedIn(!!session);
		});

		return () => {
			authListener?.subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (fontsLoaded && !isLoading) {
			SplashScreen.hide();
		}
	}, [fontsLoaded, isLoading]);

	if (isLoading || !fontsLoaded) {
		return null; // Or a splash screen component
	}

	return (
		<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Protected guard={!isLoggedIn}>
					<Stack.Screen name='welcome' />
					<Stack.Screen name='create-account' />
					<Stack.Screen name='forgot' />
					<Stack.Screen name='reset' />
					<Stack.Screen name='verify-email' />
				</Stack.Protected>
				<Stack.Protected guard={isLoggedIn}>
					<Stack.Screen name='(tabs)' options={{ headerShown: false }} />
					<Stack.Screen name='modal' options={{ presentation: "modal", title: "Modal" }} />
				</Stack.Protected>
			</Stack>

			<StatusBar style='dark' backgroundColor='#fff' />
			<ToastManager config={toastConfig} />
		</ThemeProvider>
	);
}
