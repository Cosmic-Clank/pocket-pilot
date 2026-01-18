import { StyleSheet, View } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { ThemedText } from "@/components/themed-text";

export type SelectOption = {
	label: string;
	value: string;
};

interface SelectDropdownProps {
	label?: string;
	placeholder?: string;
	options: SelectOption[];
	selectedValue?: string;
	onValueChange: (itemValue: string, itemIndex: number) => void;
	enabled?: boolean;
}

export function SelectDropdown({ label, placeholder = "Select", options, selectedValue, onValueChange, enabled = true }: SelectDropdownProps) {
	const hasValue = selectedValue !== undefined && selectedValue !== null && selectedValue !== "";

	return (
		<View style={styles.container}>
			{label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}

			<View style={[styles.inputWrapper, !enabled && styles.disabled]}>
				<Picker selectedValue={selectedValue ?? ""} enabled={enabled} onValueChange={onValueChange} mode='dropdown' style={styles.picker} dropdownIconColor='#717182'>
					{!hasValue && <Picker.Item label={placeholder} value='' color='#717182' />}
					{options.map((opt) => (
						<Picker.Item key={opt.value} label={opt.label} value={opt.value} />
					))}
				</Picker>
			</View>
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
		paddingVertical: 0,
		borderWidth: 1,
		borderColor: "#D1D5DC",
	},
	picker: {
		flex: 1,
		height: 58,
		color: "#000000",
	},
	disabled: {
		opacity: 0.6,
	},
});
