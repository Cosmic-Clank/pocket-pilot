import { StyleSheet, View, TextInput, TouchableOpacity, type TextInputProps } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { useState } from "react";

export type ThemedPasswordInputProps = TextInputProps & {
	label?: string;
	error?: string;
};

export function ThemedPasswordInput({ label, error, style, ...props }: ThemedPasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false);

	return (
		<View style={styles.container}>
			{label && <ThemedText style={styles.label}>{label}</ThemedText>}
			<View style={[styles.inputWrapper, error && styles.errorBorder]}>
				<Feather name='lock' size={20} color='#717182' style={styles.icon} />
				<TextInput style={[styles.input, style]} placeholderTextColor='#717182' secureTextEntry={!showPassword} autoCapitalize='none' {...props} />
				<TouchableOpacity style={styles.toggleIcon} onPress={() => setShowPassword(!showPassword)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
					<Feather name={showPassword ? "eye" : "eye-off"} size={20} color='#717182' />
				</TouchableOpacity>
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
	toggleIcon: {
		padding: 8,
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
