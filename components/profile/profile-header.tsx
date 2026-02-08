import { StyleSheet, View, Text, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileHeaderProps {
	name: string;
	email: string;
	avatarInitials?: string;
	profilePic?: string | null;
	onChangePhoto?: () => void;
}

export function ProfileHeader({ name, email, avatarInitials, profilePic, onChangePhoto }: ProfileHeaderProps) {
	const insets = useSafeAreaInsets();
	const initials = avatarInitials || deriveInitials(name);
	const profileImageUri = profilePic ? (profilePic.startsWith("data:") ? profilePic : `data:image/jpeg;base64,${profilePic}`) : undefined;

	return (
		<LinearGradient colors={["#155DFC", "#432DD7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 24 }]}>
			<TouchableOpacity onPress={onChangePhoto} activeOpacity={0.7}>
				<View style={styles.avatarContainer}>
					<View style={styles.avatarCircle}>
						{profileImageUri ? (
							<Image source={{ uri: profileImageUri }} style={styles.profileImage} />
					) : (
						<Text style={styles.avatarText}>{initials}</Text>
					)}
					</View>
					<View style={styles.editBadge}>
						<Feather name="edit-2" size={14} color="#FFFFFF" />
					</View>
				</View>
			</TouchableOpacity>
			<Text style={styles.name}>{name}</Text>
			<Text style={styles.email}>{email}</Text>
		</LinearGradient>
	);
}

function deriveInitials(fullName: string) {
	if (!fullName) return "";
	const parts = fullName.trim().split(" ").filter(Boolean);
	if (parts.length === 0) return "";
	if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
	return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const styles = StyleSheet.create({
	header: {
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
		alignItems: "center",
		paddingHorizontal: 30,
		paddingBottom: 80,
	},
	avatarCircle: {
		width: 120,
		height: 120,
		borderRadius: 60,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000000",
		shadowOpacity: 0.15,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 8,
		overflow: "hidden",
	},
	avatarContainer: {
		position: "relative",
	},
	profileImage: {
		width: 120,
		height: 120,
		borderRadius: 60,
	},
	avatarText: {
		fontSize: 36,
		fontWeight: "700",
		color: "#155DFC",
	},
	editBadge: {
		position: "absolute",
		bottom: 6,
		right: 6,
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#155DFC",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#FFFFFF",
	},
	name: {
		fontSize: 22,
		fontWeight: "700",
		color: "#FFFFFF",
		marginTop: 6,
	},
	email: {
		fontSize: 16,
		color: "rgba(255, 255, 255, 0.9)",
		marginTop: 4,
	},
});
