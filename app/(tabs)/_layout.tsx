import { Tabs } from "expo-router";
import React from "react";
import { Feather, FontAwesome, MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";

import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";

export default function TabLayout() {
	const insets = useSafeAreaInsets();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#155DFC",
				tabBarInactiveTintColor: "#9CA3AF",
				headerShown: false,
				tabBarButton: HapticTab,
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopWidth: 1,
					borderTopColor: "#E5E7EB",
					height: 100 + insets.bottom,
					paddingBottom: insets.bottom + 8,
					paddingTop: 16,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "500",
				},
				tabBarIconStyle: {
					marginBottom: 12,
				},
			}}>
			<Tabs.Screen
				name='index'
				options={{
					title: "Dashboard",
					tabBarIcon: ({ color, focused }) => (
						<View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
							<MaterialCommunityIcons name='view-dashboard-outline' size={24} color={focused ? "#FFFFFF" : color} />
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name='transactions'
				options={{
					title: "Transactions",
					tabBarIcon: ({ color, focused }) => (
						<View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
							<FontAwesome name='money' size={24} color={focused ? "#FFFFFF" : color} />
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name='savings'
				options={{
					title: "Savings",
					tabBarIcon: ({ color, focused }) => (
						<View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
							<MaterialCommunityIcons name='piggy-bank-outline' size={24} color={focused ? "#FFFFFF" : color} />
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name='ai-record'
				options={{
					title: "AI Record",
					tabBarIcon: ({ color, focused }) => (
						<View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
							<Ionicons name='sparkles-outline' size={24} color={focused ? "#FFFFFF" : color} />
						</View>
					),
				}}
			/>
			<Tabs.Screen
				name='profile'
				options={{
					title: "Profile",
					tabBarIcon: ({ color, focused }) => (
						<View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
							<Feather name='user' size={24} color={focused ? "#FFFFFF" : color} />
						</View>
					),
				}}
			/>
		</Tabs>
	);
}

const styles = StyleSheet.create({
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	iconContainerActive: {
		backgroundColor: "#155DFC",
	},
});
