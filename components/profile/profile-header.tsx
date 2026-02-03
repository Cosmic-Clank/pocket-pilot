import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ProfileHeaderProps {
	name: string;
	email: string;
	avatarInitials?: string;
	onChangePhoto?: () => void;
}

export function ProfileHeader({ name, email, avatarInitials, onChangePhoto }: ProfileHeaderProps) {
	const insets = useSafeAreaInsets();
	const initials = avatarInitials || deriveInitials(name);

	return (
		<LinearGradient colors={["#155DFC", "#432DD7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 24 }]}>
			<View style={styles.avatarWrapper}>
				<View style={styles.avatarCircle}>
					<Text style={styles.avatarText}>{initials}</Text>
				</View>
				<TouchableOpacity style={styles.cameraButton} onPress={onChangePhoto} activeOpacity={0.7}>
					<Feather name='camera' size={20} color='#155DFC' />
				</TouchableOpacity>
			</View>
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
	avatarWrapper: {
		position: "relative",
		marginBottom: 12,
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
	},
	avatarText: {
		fontSize: 36,
		fontWeight: "700",
		color: "#155DFC",
	},
	cameraButton: {
		position: "absolute",
		bottom: 8,
		right: 8,
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#FFFFFF",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000000",
		shadowOpacity: 0.12,
		shadowOffset: { width: 0, height: 4 },
		shadowRadius: 10,
		elevation: 6,
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
