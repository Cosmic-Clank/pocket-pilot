import { StyleSheet, View, Pressable, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface ProfileMenuItemConfig {
	title: string;
	subtitle?: string;
	icon: React.ComponentProps<typeof Feather>["name"];
	onPress?: () => void;
	accentColor?: string;
}

interface ProfileMenuCardProps {
	items: ProfileMenuItemConfig[];
}

export function ProfileMenuCard({ items }: ProfileMenuCardProps) {
	return (
		<View style={styles.card}>
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				return (
					<Pressable key={item.title} style={[styles.row, !isLast && styles.rowDivider]} onPress={item.onPress} android_ripple={{ color: "#EEF2FF" }}>
						<View style={[styles.iconWrapper, { backgroundColor: "#EEF2FF" }]}>
							<Feather name={item.icon} size={22} color={item.accentColor || "#155DFC"} />
						</View>
						<View style={styles.textCol}>
							<Text style={styles.title}>{item.title}</Text>
							{item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
						</View>
						<Feather name='chevron-right' size={20} color='#9CA3AF' />
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#FFFFFF",
		borderRadius: 20,
		paddingHorizontal: 16,
		paddingVertical: 8,
		shadowColor: "#111827",
		shadowOpacity: 0.06,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 18,
		elevation: 4,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		gap: 14,
	},
	rowDivider: {
		borderBottomWidth: 1,
		borderColor: "#F0F2F5",
	},
	iconWrapper: {
		width: 52,
		height: 52,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	textCol: {
		flex: 1,
		gap: 4,
	},
	title: {
		fontSize: 16,
		fontWeight: "600",
		color: "#111827",
	},
	subtitle: {
		fontSize: 14,
		color: "#6B7280",
	},
});
