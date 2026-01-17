import { StyleSheet, View, TextInput, type TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";

export type ThemedInputProps = TextInputProps & {
	label?: string;
	icon?: string;
	error?: string;
};

export function ThemedInput({ label, icon, error, style, ...props }: ThemedInputProps) {
	return (
		<View style={styles.container}>
			{label && <ThemedText style={styles.label}>{label}</ThemedText>}
			<View style={[styles.inputWrapper, error && styles.errorBorder]}>
				{icon && <Feather name={icon as any} size={20} color='#717182' style={styles.icon} />}
				<TextInput style={[styles.input, style]} placeholderTextColor='#717182' {...props} />
			</View>
			{error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
		marginBottom: 8,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F3F3F5",
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 4,
		borderWidth: 1,
		borderColor: "#D1D5DC",
	},
	icon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontSize: 16,
		color: "#000000",
		paddingVertical: 16,
	},
	errorBorder: {
		borderColor: "#EF4444",
	},
	errorText: {
		fontSize: 14,
		color: "#EF4444",
		marginTop: 4,
	},
});
