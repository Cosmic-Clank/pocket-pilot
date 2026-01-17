import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";

export default function AIRecordScreen() {
	return (
		<ThemedScrollView style={styles.container}>
			<View style={styles.content}>
				<ThemedText type='title' style={styles.title}>
					AI Record
				</ThemedText>
				<ThemedText style={styles.subtitle}>AI-powered financial insights</ThemedText>
			</View>
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#FFFFFF",
	},
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 30,
	},
	title: {
		fontSize: 32,
		fontWeight: "bold",
		color: "#000000",
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: "#6B7280",
		textAlign: "center",
	},
});
