import React, { useCallback, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from "@/components/themed-button";
import { ThemedAlert } from "@/components/themed-alert";
import { ThemedDatePicker } from "@/components/themed-date-picker";
import { fetchProfile, updateProfile, type ProfileRecord } from "@/services/profile-service";
import { scheduleSalaryReminder } from "@/services/notifications-service";
import { supabase } from "@/utils/supabase";

interface EditProfileBottomSheetProps {
	onClose: () => void;
	onSuccess?: (profile: ProfileRecord) => void;
}

export const EditProfileBottomSheet = React.forwardRef<BottomSheetModal, EditProfileBottomSheetProps>(({ onClose, onSuccess }, ref) => {
	const snapPoints = useMemo(() => [640, "85%"], []);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [profile, setProfile] = useState<ProfileRecord | null>(null);
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [monthlyIncome, setMonthlyIncome] = useState("");
	const [monthlyIncomeDate, setMonthlyIncomeDate] = useState<Date | undefined>(undefined);
	const [monthlySavingGoal, setMonthlySavingGoal] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [alertVisible, setAlertVisible] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [alertVariant, setAlertVariant] = useState<"confirm" | "alert">("alert");

	const loadProfile = useCallback(async () => {
		try {
			setLoading(true);

			// Fetch profile data
			const profileResult = await fetchProfile();
			if (profileResult.success && profileResult.data) {
				setProfile(profileResult.data);
				setDisplayName(profileResult.data.display_name || "");
				setPhoneNumber(profileResult.data.phone_number || "");
				setMonthlyIncome(profileResult.data.monthly_income ? profileResult.data.monthly_income.toString() : "");
				setMonthlySavingGoal(profileResult.data.monthly_saving_goal ? profileResult.data.monthly_saving_goal.toString() : "");
				if (profileResult.data.monthly_income_date) {
					setMonthlyIncomeDate(new Date(profileResult.data.monthly_income_date));
				}
			}

			// Fetch user email from auth
			const { data: authData } = await supabase.auth.getUser();
			if (authData?.user?.email) {
				setEmail(authData.user.email);
			}
		} catch (error) {
			console.error("Error loading profile:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		// Load profile when modal appears
		loadProfile();
	}, [loadProfile]);

	const handleClosePress = () => {
		(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
	};

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!displayName || displayName.trim().length === 0) {
			newErrors.displayName = "Full name is required";
		}

		if (phoneNumber && phoneNumber.trim().length > 0 && phoneNumber.trim().length < 5) {
			newErrors.phoneNumber = "Phone number is invalid";
		}

		if (monthlyIncome) {
			const income = parseFloat(monthlyIncome);
			if (isNaN(income) || income < 0) {
				newErrors.monthlyIncome = "Monthly income must be a valid positive number";
			}
		}

		if (monthlySavingGoal) {
			const goal = parseFloat(monthlySavingGoal);
			if (isNaN(goal) || goal < 0) {
				newErrors.monthlySavingGoal = "Monthly saving goal must be a valid positive number";
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSave = async () => {
		if (!validateForm()) {
			return;
		}

		setSaving(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				throw new Error("User not found");
			}

			const result = await updateProfile(user.id, {
				display_name: displayName.trim(),
				phone_number: phoneNumber.trim() ? phoneNumber.trim() : undefined,
				monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : null,
				monthly_income_date: monthlyIncomeDate ? monthlyIncomeDate.toISOString().split("T")[0] : null,
				monthly_saving_goal: monthlySavingGoal ? parseFloat(monthlySavingGoal) : null,
			});

			setSaving(false);

			if (result.success) {
				// Schedule salary reminder if monthly income date is set
				if (monthlyIncomeDate) {
					const dayOfMonth = monthlyIncomeDate.getDate();
					const monthlyIncome_num = monthlyIncome ? parseFloat(monthlyIncome) : undefined;
					await scheduleSalaryReminder(dayOfMonth, monthlyIncome_num);
				}

				setAlertMessage("Profile updated successfully");
				setAlertVariant("alert");
				setAlertVisible(true);
				if (result.data) {
					onSuccess?.(result.data);
				}
				setTimeout(() => {
					handleClosePress();
				}, 1500);
			} else {
				setAlertMessage(result.error || result.message);
				setAlertVariant("alert");
				setAlertVisible(true);
			}
		} catch (error: any) {
			setSaving(false);
			setAlertMessage(error?.message || "An error occurred while saving");
			setAlertVariant("alert");
			setAlertVisible(true);
		}
	};

	const renderBackdrop = useCallback((props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => <BottomSheetBackdrop {...props} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />, []);

	return (
		<BottomSheetModal ref={ref as any} snapPoints={snapPoints} onDismiss={onClose} style={styles.bottomSheet} backdropComponent={renderBackdrop}>
			<BottomSheetScrollView style={styles.container} scrollEnabled>
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<ThemedText style={styles.title}>Edit Profile</ThemedText>
						<ThemedText style={styles.subtitle}>Update your profile information</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				{loading ? (
					<View style={styles.loadingContainer}>
						<ThemedText style={styles.loadingText}>Loading profile...</ThemedText>
					</View>
				) : (
					<View style={styles.form}>
						<ThemedInput
							label='Full Name'
							value={displayName}
							onChangeText={(text) => {
								setDisplayName(text);
								if (errors.displayName) setErrors({ ...errors, displayName: "" });
							}}
							autoCapitalize='words'
							returnKeyType='next'
							error={errors.displayName}
							editable={!saving}
						/>
						<ThemedInput
							label='Phone Number'
							value={phoneNumber}
							onChangeText={(text) => {
								setPhoneNumber(text);
								if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: "" });
							}}
							keyboardType='phone-pad'
							returnKeyType='next'
							error={errors.phoneNumber}
							editable={!saving}
							placeholder='e.g., +1 234 567 8900'
						/>
						<ThemedInput
							label='Monthly Income'
							value={monthlyIncome}
							onChangeText={(text) => {
								setMonthlyIncome(text);
								if (errors.monthlyIncome) setErrors({ ...errors, monthlyIncome: "" });
							}}
							keyboardType='decimal-pad'
							returnKeyType='done'
							error={errors.monthlyIncome}
							editable={!saving}
							placeholder='Enter your monthly income'
						/>
						<ThemedDatePicker label='Monthly Income Date' value={monthlyIncomeDate} onChange={setMonthlyIncomeDate} placeholder='Select the date you receive income' />
						<ThemedText style={styles.incomeNoteText}>{monthlyIncomeDate && `You receive income on day ${monthlyIncomeDate.getDate()} of every month`}</ThemedText>
						<ThemedInput
							label='Monthly Saving Goal'
							value={monthlySavingGoal}
							onChangeText={(text) => {
								setMonthlySavingGoal(text);
								if (errors.monthlySavingGoal) setErrors({ ...errors, monthlySavingGoal: "" });
							}}
							keyboardType='decimal-pad'
							returnKeyType='done'
							error={errors.monthlySavingGoal}
							editable={!saving}
							placeholder='Enter your monthly saving goal'
						/>
					</View>
				)}

				<ThemedButton title={saving ? "Saving..." : "Save Changes"} variant='primary' onPress={handleSave} style={styles.saveButton} loading={saving} disabled={loading || saving} />

				<ThemedAlert visible={alertVisible} title='Success' message={alertMessage} variant='alert' onDismiss={() => setAlertVisible(false)} />
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

EditProfileBottomSheet.displayName = "EditProfileBottomSheet";

const styles = StyleSheet.create({
	bottomSheet: {
		zIndex: 100,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
	},
	container: {
		backgroundColor: "#FFFFFF",
		paddingHorizontal: 20,
		paddingBottom: 32,
		borderTopLeftRadius: 32,
		borderTopRightRadius: 32,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingVertical: 20,
		paddingHorizontal: 16,
		marginHorizontal: -20,
	},
	title: {
		fontSize: 20,
		fontWeight: "700",
		color: "#000000",
		marginBottom: 4,
	},
	subtitle: {
		fontSize: 14,
		color: "#6B7280",
	},
	form: {
		marginBottom: 12,
		gap: 8,
	},
	loadingContainer: {
		paddingVertical: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		fontSize: 14,
		color: "#6B7280",
	},
	saveButton: {
		marginTop: 8,
	},
	incomeNoteText: {
		fontSize: 12,
		color: "#6B7280",
		marginTop: 4,
	},
});
