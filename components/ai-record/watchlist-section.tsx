import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/themed-text";
import { fetchWatchlist, removeFromWatchlist, type WatchlistRecord } from "@/services/stock-watchlist-service";
import { API_CONFIG, getApiUrl } from "@/constants/config";

interface StockPriceData {
	price: number;
	change: number;
	changePercent: number;
}

const NETWORK_ERROR_MESSAGE = "Network error. Please refresh.";

function isHtmlResponse(response: Response, text?: string): boolean {
	const contentType = response.headers.get("content-type");
	if (contentType?.toLowerCase().includes("text/html")) {
		return true;
	}
	return text ? /<!doctype html|<html/i.test(text) : false;
}

export function WatchlistSection() {
	const [loading, setLoading] = useState(true);
	const [watchlist, setWatchlist] = useState<WatchlistRecord[]>([]);
	const [priceData, setPriceData] = useState<Record<string, StockPriceData>>({});
	const [removingId, setRemovingId] = useState<string | null>(null);

	const loadWatchlist = useCallback(async () => {
		setLoading(true);
		const result = await fetchWatchlist();

		if (result.success && result.data.length > 0) {
			setWatchlist(result.data);
			// Fetch price data for all symbols
			await fetchPriceData(result.data.map((item) => item.symbol));
		} else {
			setWatchlist([]);
			setPriceData({});
		}

		setLoading(false);
	}, []);

	const fetchPriceData = async (symbols: string[]) => {
		try {
			// Call backend API to get real-time stock prices
			const response = await fetch(`${API_CONFIG.BASE_URL}/api/stock/batch-prices`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ symbols }),
			});

			if (!response.ok) {
				const text = await response.text();
				if (isHtmlResponse(response, text)) {
					throw new Error(NETWORK_ERROR_MESSAGE);
				}
				throw new Error("Failed to fetch prices");
			}

			if (isHtmlResponse(response)) {
				throw new Error(NETWORK_ERROR_MESSAGE);
			}

			const data = (await response.json()) as Record<string, StockPriceData>;
			setPriceData(data);
		} catch (error) {
			console.error("Failed to fetch price data:", error);
		}
	};

	const handleRemove = async (item: WatchlistRecord) => {
		Alert.alert("Remove from Watchlist", `Remove ${item.symbol} from your watchlist?`, [
			{ text: "Cancel", style: "cancel" },
			{
				text: "Remove",
				style: "destructive",
				onPress: async () => {
					setRemovingId(item.id);
					const result = await removeFromWatchlist(item.id);

					if (result.success) {
						// Remove from local state
						setWatchlist((prev) => prev.filter((w) => w.id !== item.id));
					} else {
						Alert.alert("Error", result.error || "Failed to remove from watchlist");
					}

					setRemovingId(null);
				},
			},
		]);
	};

	useFocusEffect(
		useCallback(() => {
			loadWatchlist();
		}, [loadWatchlist]),
	);

	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size='small' color='#155DFC' />
			</View>
		);
	}

	if (watchlist.length === 0) {
		return (
			<View style={styles.emptyContainer}>
				<Feather name='bookmark' size={48} color='#D1D5DB' />
				<ThemedText style={styles.emptyText}>Your watchlist is empty</ThemedText>
				<ThemedText style={styles.emptySubtext}>Add stocks from Top Picks to track them here</ThemedText>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<View style={styles.sectionContainer}>
				<ThemedText style={styles.sectionTitle}>Your Watchlist</ThemedText>
			</View>

			{watchlist.map((item) => {
				const prices = priceData[item.symbol];
				const isRemoving = removingId === item.id;

				return (
					<View key={item.id} style={styles.watchlistCard}>
						<View style={styles.watchlistHeader}>
							<View style={styles.watchlistIconContainer}>
								<ThemedText style={styles.watchlistIcon}>📊</ThemedText>
							</View>
							<View style={styles.watchlistInfo}>
								<ThemedText style={styles.watchlistName}>{item.symbol}</ThemedText>
								<ThemedText style={styles.watchlistCompany}>{item.company || "Company Name"}</ThemedText>
							</View>
							<View style={styles.watchlistRight}>
								{prices ? (
									<>
										<ThemedText style={styles.watchlistPrice}>AED {prices.price.toFixed(2)}</ThemedText>
										<View style={styles.watchlistChange}>
											<Feather name={prices.change >= 0 ? "trending-up" : "trending-down"} size={14} color={prices.change >= 0 ? "#10B981" : "#EF4444"} />
											<ThemedText style={[styles.watchlistChangeText, { color: prices.change >= 0 ? "#10B981" : "#EF4444" }]}>
												{prices.change >= 0 ? "+" : ""}
												{prices.changePercent.toFixed(2)}%
											</ThemedText>
										</View>
									</>
								) : (
									<ActivityIndicator size='small' color='#9CA3AF' />
								)}
							</View>
						</View>

						{item.note && <ThemedText style={styles.watchlistNote}>{item.note}</ThemedText>}

						<TouchableOpacity style={styles.removeButton} onPress={() => handleRemove(item)} disabled={isRemoving}>
							{isRemoving ? (
								<ActivityIndicator size='small' color='#EF4444' />
							) : (
								<>
									<Feather name='trash-2' size={14} color='#EF4444' />
									<ThemedText style={styles.removeButtonText}>Remove from Watchlist</ThemedText>
								</>
							)}
						</TouchableOpacity>
					</View>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginBottom: 20,
	},
	loadingContainer: {
		paddingVertical: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyContainer: {
		paddingVertical: 60,
		paddingHorizontal: 30,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyText: {
		fontSize: 16,
		fontWeight: "600",
		color: "#6B7280",
		marginTop: 16,
		marginBottom: 4,
	},
	emptySubtext: {
		fontSize: 13,
		color: "#9CA3AF",
		textAlign: "center",
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
	watchlistCard: {
		backgroundColor: "#F9FAFB",
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		marginHorizontal: 30,
		borderWidth: 1,
		borderColor: "#E5E7EB",
	},
	watchlistHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 12,
	},
	watchlistIconContainer: {
		width: 40,
		height: 40,
		borderRadius: 10,
		backgroundColor: "#EFF6FF",
		alignItems: "center",
		justifyContent: "center",
	},
	watchlistIcon: {
		fontSize: 20,
	},
	watchlistInfo: {
		flex: 1,
	},
	watchlistName: {
		fontSize: 13,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 2,
	},
	watchlistCompany: {
		fontSize: 12,
		color: "#6B7280",
	},
	watchlistRight: {
		alignItems: "flex-end",
	},
	watchlistPrice: {
		fontSize: 14,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 4,
	},
	watchlistChange: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	watchlistChangeText: {
		fontSize: 12,
		fontWeight: "600",
	},
	watchlistNote: {
		fontSize: 12,
		color: "#6B7280",
		fontWeight: "500",
		marginBottom: 12,
		fontStyle: "italic",
	},
	removeButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 6,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#FEE2E2",
		backgroundColor: "#FEF2F2",
	},
	removeButtonText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#EF4444",
	},
});
