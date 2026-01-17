import { Platform, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function HomeScreen() {
	const [data, setData] = useState(null);
	useEffect(() => {
		const getData = async () => {
			const { data, error } = await supabase.from("test").select();
			if (data) {
				setData(data[0].data);
			}
		};
		getData();
	}, []);

	return (
		<ThemedScrollView style={{ paddingTop: useSafeAreaInsets().top, flex: 1 }}>
			<ThemedText
				type='title'
				style={{
					fontFamily: "System",
				}}>
				Pocket Pilot
			</ThemedText>
			<ThemedText>{data ?? "Loading..."}</ThemedText>
		</ThemedScrollView>
	);
}

const styles = StyleSheet.create({
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: "absolute",
	},
});
