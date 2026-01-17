import { Link } from "expo-router";
import { StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";

export default function ModalScreen() {
	return (
		<ThemedScrollView style={styles.container}>
			<ThemedText type='title'>This is a modal</ThemedText>
			<Link href='/' dismissTo style={styles.link}>
				<ThemedText type='link'>Go to home screen</ThemedText>
			</Link>
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	link: {
		marginTop: 15,
		paddingVertical: 15,
	},
});
