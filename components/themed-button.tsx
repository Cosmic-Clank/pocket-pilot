import { StyleSheet, TouchableOpacity, Text, ActivityIndicator, type TouchableOpacityProps, type ViewStyle, type TextStyle } from "react-native";
import * as Haptics from "expo-haptics";

export type ThemedButtonProps = TouchableOpacityProps & {
	title: string;
	variant?: "primary" | "outline" | "text";
	textStyle?: TextStyle;
	onPress?: () => void;
	enableHaptic?: boolean;
	icon?: React.ReactNode;
	loading?: boolean;
};

export function ThemedButton({ title, variant = "primary", style, textStyle, onPress, enableHaptic = true, icon, disabled, loading = false, ...rest }: ThemedButtonProps) {
	const isDisabled = disabled || loading;

	const handlePress = () => {
		if (isDisabled) return;
		if (enableHaptic) {
			Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
		}
		onPress?.();
	};

	const getSpinnerColor = () => {
		if (variant === "primary") return "#FFFFFF";
		if (variant === "text") return "#155DFC";
		return "#000000";
	};

	return (
		<TouchableOpacity style={[styles.base, variant === "primary" && styles.primary, variant === "outline" && styles.outline, variant === "text" && styles.text, isDisabled && styles.disabled, style]} onPress={handlePress} disabled={isDisabled} activeOpacity={isDisabled ? 1 : 0.2} {...rest}>
			{loading && <ActivityIndicator size='small' color={getSpinnerColor()} />}
			{!loading && icon && <>{icon}</>}
			<Text style={[styles.baseText, variant === "primary" && styles.primaryText, variant === "outline" && styles.outlineText, variant === "text" && styles.textButtonText, textStyle]}>{title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	base: {
		borderRadius: 16,
		paddingVertical: 18,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 12,
	},
	primary: {
		backgroundColor: "#155DFC",
	},
	outline: {
		backgroundColor: "#FFFFFF",
		borderWidth: 1,
		borderColor: "#D1D5DC",
	},
	text: {
		backgroundColor: "transparent",
		paddingVertical: 8,
	},
	disabled: {
		opacity: 0.6,
	},
	baseText: {
		fontSize: 16,
		fontWeight: "600",
	},
	primaryText: {
		color: "#FFFFFF",
		fontSize: 18,
	},
	outlineText: {
		color: "#000000",
	},
	textButtonText: {
		color: "#155DFC",
		fontSize: 14,
	},
});
