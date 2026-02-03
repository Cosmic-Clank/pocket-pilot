import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { ThemedScrollView } from "@/components/themed-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { AvailableToInvestCard } from "@/components/ai-record/available-to-invest-card";
import { PortfolioSection } from "@/components/ai-record/portfolio-section";
import { TopPicksSection } from "@/components/ai-record/top-picks";
import { WatchlistSection } from "@/components/ai-record/watchlist-section";

export default function AIRecordScreen() {
	const insets = useSafeAreaInsets();

	return (
		<View style={styles.container}>
			<ThemedScrollView style={styles.scrollView}>
				{/* Header with Gradient */}
				<LinearGradient colors={["#9810FA", "#432DD7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.header, { paddingTop: insets.top + 20 }]}>
					<View style={styles.headerContent}>
						<View>
							<ThemedText style={styles.headerTitle}>AI Record</ThemedText>
							<ThemedText style={styles.headerSubtitle}>Personalized recommendations and alerts</ThemedText>
						</View>
					</View>
				</LinearGradient>

				{/* Available to Invest Card */}
				<View style={styles.section}>
					<AvailableToInvestCard />
				</View>

				{/* Portfolio Section */}
				<PortfolioSection />

				{/* Top Picks Section */}
				<TopPicksSection />

				{/* Your Watchlist Section */}
				<WatchlistSection />

				{/* Smart Investing Info */}
				<View style={styles.infoBox}>
					<Feather name='zap' size={24} color='#155DFC' />
					<View style={styles.infoContent}>
						<ThemedText style={styles.infoTitle}>Smart Investing with AI</ThemedText>
						<ThemedText style={styles.infoText}>Our AI analyzes stock trends and matches them to your savings. The recommendations are based on recent price movements and sentiment analysis. Remember: past performance doesn&apos;t guarantee future results. Start small and diversify!</ThemedText>
					</View>
				</View>

				<View style={{ height: 30 }} />
			</ThemedScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#F9FAFB",
	},
	scrollView: {
		flex: 1,
	},
	header: {
		paddingHorizontal: 30,
		paddingBottom: 80,
		borderBottomLeftRadius: 24,
		borderBottomRightRadius: 24,
	},
	headerContent: {
		paddingTop: 10,
		paddingBottom: 20,
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "700",
		color: "#FFFFFF",
		marginBottom: 4,
	},
	headerSubtitle: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.8)",
	},
	section: {
		paddingHorizontal: 30,
		marginTop: -60,
	},
	sectionContainer: {
		marginBottom: 16,
		paddingHorizontal: 30,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 8,
	},
	infoBox: {
		flexDirection: "row",
		gap: 12,
		padding: 20,
		backgroundColor: "#EFF6FF",
		borderRadius: 14,
		marginBottom: 20,
		marginHorizontal: 30,
		borderWidth: 1,
		borderColor: "#C7D2FE",
	},
	infoContent: {
		flex: 1,
	},
	infoTitle: {
		fontSize: 14,
		fontWeight: "700",
		color: "#1E40AF",
		marginBottom: 6,
	},
	infoText: {
		fontSize: 12,
		color: "#1E3A8A",
		lineHeight: 18,
	},
});
