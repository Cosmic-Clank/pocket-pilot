import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { supabase } from "@/utils/supabase";

export default function ProfileScreen() {
	const router = useRouter();

	const handleSignOut = async () => {
		try {
			await supabase.auth.signOut();
			router.replace("/welcome");
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	return (
		<ThemedScrollView style={styles.container}>
			<View style={styles.content}>
				<ThemedText type='title' style={styles.title}>
					Profile
				</ThemedText>
				<ThemedText style={styles.subtitle}>Manage your account settings</ThemedText>
				<ThemedButton title='Sign Out' onPress={handleSignOut} variant='outline' style={styles.signOutButton} />
			</View>
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 30,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
		marginBottom: 32,
	},
	signOutButton: {
		marginTop: "auto",
		width: "100%",
	},
});
