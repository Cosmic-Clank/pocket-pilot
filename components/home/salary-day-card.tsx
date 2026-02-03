import React, { useEffect, useState, useCallback } from "react";
import { StyleSheet, View, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { Toast } from "toastify-react-native";
import { ThemedText } from "@/components/themed-text";
import { supabase } from "@/utils/supabase";
import { fetchProfile, type ProfileRecord } from "@/services/profile-service";
import { fetchTransactions, type TransactionRecord } from "@/services/transaction-service";
import { useFocusEffect } from "@react-navigation/native";

interface SalaryDayCardProps {
	onSalaryAdded?: () => void;
}

export const SalaryDayCard: React.FC<SalaryDayCardProps> = ({ onSalaryAdded }) => {
	const [profile, setProfile] = useState<ProfileRecord | null>(null);
	const [shouldShow, setShouldShow] = useState(false);
	const [loading, setLoading] = useState(false);

	const checkSalaryDay = useCallback(async () => {
		try {
			// Fetch profile
			const profileResult = await fetchProfile();
			if (!profileResult.success || !profileResult.data) {
				return;
			}

			const userProfile = profileResult.data;
			setProfile(userProfile);

			// Check if monthly income exists
			if (!userProfile.monthly_income || userProfile.monthly_income <= 0) {
				setShouldShow(false);
				return;
			}

			// Check if monthly income date matches today (only compare day of month)
			if (!userProfile.monthly_income_date) {
				setShouldShow(false);
				return;
			}

			const today = new Date();
			const [incomeYear, incomeMonth, incomeDay] = userProfile.monthly_income_date.split("-").map((value) => Number(value));

			// Compare only the day of month using local date parts to avoid UTC shift
			const isSalaryDay = today.getDate() === incomeDay && !Number.isNaN(incomeDay) && !Number.isNaN(incomeMonth) && !Number.isNaN(incomeYear);

			if (!isSalaryDay) {
				setShouldShow(false);
				return;
			}

			// Check if salary has already been added today
			const txResult = await fetchTransactions();
			if (!txResult.success || !txResult.data) {
				setShouldShow(false);
				return;
			}

			const transactions = txResult.data as TransactionRecord[];

			// Check if there's already a salary income transaction today
			const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD format
			const salarySentToday = transactions.some((tx) => {
				const txDate = tx.transaction_date.split("T")[0]; // Extract date part
				return txDate === todayStr && tx.type === "income" && tx.category === "salary";
			});

			setShouldShow(!salarySentToday);
		} catch (error) {
			console.error("Error checking salary day:", error);
			setShouldShow(false);
		}
	}, []);

	useEffect(() => {
		checkSalaryDay();
	}, [checkSalaryDay]);

	useFocusEffect(
		useCallback(() => {
			checkSalaryDay();
		}, [checkSalaryDay]),
	);

	const handleAddSalary = async () => {
		if (!profile || !profile.monthly_income) {
			Toast.error("Unable to add salary");
			return;
		}

		setLoading(true);

		try {
			const { data: authData } = await supabase.auth.getUser();
			if (!authData?.user?.id) {
				Toast.error("User not authenticated");
				return;
			}

			const userId = authData.user.id;
			const salaryAmount = profile.monthly_income;

			// Step 1: Create salary income transaction
			const { error: salaryTxError } = await supabase.from("transactions").insert({
				user_id: userId,
				amount: salaryAmount,
				type: "income",
				category: "salary",
				title: "Salary",
				transaction_date: new Date().toISOString(),
			});

			if (salaryTxError) {
				throw new Error(salaryTxError.message || "Failed to create salary transaction");
			}

			Toast.success("Salary added successfully!");

			// Step 2: Check if emergency fund auto-invest is set
			if (profile.emergency_fund_auto_invest && profile.emergency_fund_auto_invest > 0) {
				// Step 3: Create emergency fund auto-invest transaction
				const { error: emergencyTxError } = await supabase.from("transactions").insert({
					user_id: userId,
					amount: profile.emergency_fund_auto_invest,
					type: "expense",
					category: "emergency fund",
					title: "Emergency Fund Auto-Invest",
					transaction_date: new Date().toISOString(),
				});

				if (emergencyTxError) {
					// throw new Error(emergencyTxError.message || "Failed to create emergency fund transaction");
					console.error("Failed to create emergency fund transaction:", emergencyTxError);
					Toast.error("Salary added, but emergency fund transfer failed");
				}

				// Step 4: Update emergency fund amount in profile
				const newEmergencyFundAmount = (profile.emergency_fund_amount || 0) + profile.emergency_fund_auto_invest;

				const { error: profileUpdateError } = await supabase.from("profiles").update({ emergency_fund_amount: newEmergencyFundAmount }).eq("id", userId);

				if (profileUpdateError) {
					console.error("Failed to update emergency fund amount:", profileUpdateError);
					Toast.error("Salary added, but emergency fund amount not updated");
				} else {
					Toast.success(`Emergency fund increased by AED ${profile.emergency_fund_auto_invest.toFixed(2)}`);
				}
			}

			// Hide the card after successful addition
			setShouldShow(false);

			// Callback to refresh parent
			onSalaryAdded?.();
		} catch (error: any) {
			console.error("Error adding salary:", error);
			Toast.error(error?.message || "Failed to add salary");
		} finally {
			setLoading(false);
		}
	};

	if (!shouldShow || !profile) {
		return null;
	}

	return (
		<LinearGradient colors={["#FDB913", "#D4A80E"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.container}>
			<View style={styles.content}>
				<View style={styles.iconContainer}>
					<Feather name='dollar-sign' size={32} color='#FFFFFF' />
				</View>

				<View style={styles.textContainer}>
					<ThemedText style={styles.titleText}>Today is Salary Day!</ThemedText>
					<ThemedText style={styles.subtitleText}>Add AED {profile?.monthly_income?.toFixed(2) || "0.00"} to your bank?</ThemedText>
				</View>

				<Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={handleAddSalary} disabled={loading}>
					{loading ? <ActivityIndicator color='#FFFFFF' size='small' /> : <ThemedText style={styles.buttonText}>Yes</ThemedText>}
				</Pressable>
			</View>
		</LinearGradient>
	);
};

const styles = StyleSheet.create({
	container: {
		marginHorizontal: 20,
		marginTop: 20,
		borderRadius: 16,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
	},
	iconContainer: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "rgba(255, 255, 255, 0.3)",
		alignItems: "center",
		justifyContent: "center",
	},
	textContainer: {
		flex: 1,
	},
	titleText: {
		fontSize: 16,
		fontWeight: "700",
		color: "#FFFFFF",
		marginBottom: 4,
	},
	subtitleText: {
		fontSize: 14,
		color: "rgba(255, 255, 255, 0.9)",
		lineHeight: 20,
	},
	button: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
		minWidth: 56,
	},
	buttonPressed: {
		opacity: 0.8,
	},
	buttonText: {
		fontSize: 14,
		fontWeight: "700",
		color: "#D4A80E",
	},
});
