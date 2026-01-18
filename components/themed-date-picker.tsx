import { useMemo, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";

interface ThemedDatePickerProps {
	label?: string;
	value?: Date | null;
	placeholder?: string;
	onChange: (date: Date) => void;
	minimumDate?: Date;
	maximumDate?: Date;
	enabled?: boolean;
}

export function ThemedDatePicker({ label, value, placeholder = "Select date", onChange, minimumDate, maximumDate, enabled = true }: ThemedDatePickerProps) {
	const [show, setShow] = useState(false);

	const displayValue = useMemo(() => {
		if (!value) return placeholder;
		return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(value);
	}, [value, placeholder]);

	const onChangeInternal = (event: DateTimePickerEvent, date?: Date) => {
		if (event.type === "dismissed") {
			setShow(false);
			return;
		}
		if (date) {
			onChange(date);
		}
		if (Platform.OS !== "ios") {
			setShow(false);
		}
	};

	return (
		<View style={styles.container}>
			{label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
			<Pressable style={[styles.inputWrapper, !enabled && styles.disabled]} onPress={() => enabled && setShow(true)}>
				<Feather name='calendar' size={20} color='#717182' style={styles.icon} />
				<ThemedText style={[styles.inputText, !value && styles.placeholder]}>{displayValue}</ThemedText>
			</Pressable>

			{show && <DateTimePicker value={value ?? new Date()} mode='date' display={Platform.OS === "ios" ? "spinner" : "default"} onChange={onChangeInternal} minimumDate={minimumDate} maximumDate={maximumDate} />}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
		gap: 8,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		color: "#000000",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#F3F3F5",
		borderRadius: 16,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderWidth: 1,
		borderColor: "#D1D5DC",
	},
	inputText: {
		flex: 1,
		fontSize: 16,
		color: "#000000",
	},
	placeholder: {
		color: "#717182",
	},
	icon: {
		marginRight: 12,
	},
	disabled: {
		opacity: 0.6,
	},
});
