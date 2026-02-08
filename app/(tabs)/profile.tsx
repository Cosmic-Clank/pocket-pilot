import { useMemo, useRef, useState, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider, BottomSheetModal } from "@gorhom/bottom-sheet";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { ThemedButton } from "@/components/themed-button";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileMenuCard, type ProfileMenuItemConfig } from "@/components/profile/profile-menu-card";
import { ProfilePicPicker } from "@/components/profile/profile-pic-picker";
import { EditProfileBottomSheet } from "@/components/profile/edit-profile-bottom-sheet";
import { SettingsBottomSheet } from "@/components/profile/settings-bottom-sheet";
import { SecurityBottomSheet } from "@/components/profile/security-bottom-sheet";
import { type ProfileRecord } from "@/services/profile-service";
import { supabase } from "@/utils/supabase";
import { useProfile } from "@/hooks/queries/use-profile";
import { useUpdateProfilePicture, useDeleteProfilePicture } from "@/hooks/mutations/use-profile-mutations";

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

	const [userEmail, setUserEmail] = useState("");
	const [uploadingPhoto, setUploadingPhoto] = useState(false);
	const [showPhotoOptions, setShowPhotoOptions] = useState(false);

	// Fetch profile using React Query
	const { data: profile, isLoading: loading } = useProfile();

	// Profile picture mutations
	const updateProfilePicMutation = useUpdateProfilePicture();
	const deleteProfilePicMutation = useDeleteProfilePicture();

	// Fetch user email from auth
	useEffect(() => {
		const loadEmail = async () => {
			const { data: authData } = await supabase.auth.getUser();
			if (authData?.user?.email) {
				setUserEmail(authData.user.email);
			}
		};
		loadEmail();
	}, []);

	const handleSignOut = async () => {
		try {
			await supabase.auth.signOut();
			router.replace("/welcome");
		} catch (error) {
			console.error("Sign out error:", error);
		}
	};

	const handleProfilePicSelected = (base64: string) => {
		setUploadingPhoto(true);
		updateProfilePicMutation.mutate(
			{ base64 },
			{
				onSuccess: () => {
					setUploadingPhoto(false);
				},
				onError: () => {
					setUploadingPhoto(false);
				},
			}
		);
	};

	const handleRemovePhoto = () => {
		setUploadingPhoto(true);
		deleteProfilePicMutation.mutate(undefined, {
			onSuccess: () => {
				setUploadingPhoto(false);
			},
			onError: () => {
				setUploadingPhoto(false);
			},
		});
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

	return (
		<GestureHandlerRootView style={styles.gestureContainer}>
			<BottomSheetModalProvider>
				<View style={styles.container}>
					<ThemedScrollView style={styles.scrollView}>
						<ProfileHeader name={profile?.display_name || "User"} email={userEmail || "No email"} profilePic={profile?.profile_pic} onChangePhoto={() => setShowPhotoOptions(true)} />

						<View style={styles.body}>
							<ProfilePicPicker onImageSelected={handleProfilePicSelected} onRemovePhoto={handleRemovePhoto} hasExistingPhoto={!!profile?.profile_pic} showOptions={showPhotoOptions} onDismiss={() => setShowPhotoOptions(false)} />

							<ProfileMenuCard items={menuItems} />

							<ThemedButton title='Logout' variant='outline' icon={<Feather name='log-out' size={18} color='#EF4444' />} onPress={handleSignOut} textStyle={{ color: "#EF4444" }} style={styles.logoutButton} disabled={uploadingPhoto} />
						</View>
					</ThemedScrollView>
				</View>

				{/* Profile will automatically update via React Query */}
				<EditProfileBottomSheet ref={editProfileModalRef} onClose={() => {}} />
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
