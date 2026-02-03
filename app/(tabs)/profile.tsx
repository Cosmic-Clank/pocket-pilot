import { useMemo, useRef, useState, useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileMenuCard, type ProfileMenuItemConfig } from "@/components/profile/profile-menu-card";
import { EditProfileBottomSheet } from "@/components/profile/edit-profile-bottom-sheet";
import { SettingsBottomSheet } from "@/components/profile/settings-bottom-sheet";
import { SecurityBottomSheet } from "@/components/profile/security-bottom-sheet";
import { fetchProfile, type ProfileRecord } from "@/services/profile-service";
import { supabase } from "@/utils/supabase";

// Export options for tab configuration
export const screenOptions = {
	title: "Profile",
	tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
		<View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
			<Feather name='user' size={24} color={focused ? "#FFFFFF" : color} />
		</View>
	),
};

export default function ProfileScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();

	const editProfileModalRef = useRef<BottomSheetModal>(null);
	const settingsModalRef = useRef<BottomSheetModal>(null);
	const securityModalRef = useRef<BottomSheetModal>(null);

	const [profile, setProfile] = useState<ProfileRecord | null>(null);
	const [userEmail, setUserEmail] = useState("");
	const [loading, setLoading] = useState(true);

	const loadProfile = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch profile data
			const profileResult = await fetchProfile();
			if (profileResult.success && profileResult.data) {
				setProfile(profileResult.data);
			}

			// Fetch user email from auth
			const { data: authData } = await supabase.auth.getUser();
			if (authData?.user?.email) {
				setUserEmail(authData.user.email);
			}
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			loadProfile();
		}, [loadProfile]),
	);

	const handleSignOut = async () => {
		try {
			await supabase.auth.signOut();
			router.replace("/welcome");
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const menuItems = useMemo<ProfileMenuItemConfig[]>(
		() => [
			{
				title: "Edit Profile",
				subtitle: "Update your profile information",
				icon: "edit-3",
				onPress: () => editProfileModalRef.current?.present(),
			},
			{
				title: "Settings",
				subtitle: "Notification preferences",
				icon: "settings",
				onPress: () => settingsModalRef.current?.present(),
			},
			{
				title: "Security",
				subtitle: "Change password and more",
				icon: "shield",
				onPress: () => securityModalRef.current?.present(),
			},
		],
		[],
	);

	const handleProfileUpdateSuccess = (updatedProfile: ProfileRecord) => {
		setProfile(updatedProfile);
	};

	return (
		<GestureHandlerRootView style={styles.gestureContainer}>
			<BottomSheetModalProvider>
				<View style={styles.container}>
					<ThemedScrollView style={styles.scrollView}>
						<ProfileHeader name={profile?.display_name || "User"} email={userEmail || "No email"} />

						<View style={styles.body}>
							<ProfileMenuCard items={menuItems} />

							<ThemedButton title='Logout' variant='outline' icon={<Feather name='log-out' size={18} color='#EF4444' />} onPress={handleSignOut} textStyle={{ color: "#EF4444" }} style={styles.logoutButton} />
						</View>

						<View style={{ height: 40 }} />
					</ThemedScrollView>
				</View>

				<EditProfileBottomSheet ref={editProfileModalRef} onClose={() => {}} onSuccess={handleProfileUpdateSuccess} />
				<SettingsBottomSheet ref={settingsModalRef} onClose={() => {}} />
				<SecurityBottomSheet ref={securityModalRef} onClose={() => {}} />
			</BottomSheetModalProvider>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	gestureContainer: {
		flex: 1,
	},
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	scrollView: {
		flex: 1,
	},
	body: {
		marginTop: -60,
		paddingHorizontal: 30,
		gap: 20,
	},
	logoutButton: {
		borderColor: "#FCA5A5",
		borderWidth: 1,
		backgroundColor: "#FFF1F2",
		marginTop: 8,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	iconContainerActive: {
		backgroundColor: "#155DFC",
	},
});
