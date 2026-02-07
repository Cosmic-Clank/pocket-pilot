import React, { useCallback, useMemo, useState, useEffect } from "react";
import { StyleSheet, View, TouchableOpacity, Switch, ActivityIndicator } from "react-native";
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { BottomSheetDefaultBackdropProps } from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetBackdrop/types";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { updateProfile, getProfile } from "@/services/profile-service";
import { scheduleWeeklyReport, cancelNotificationByType } from "@/services/notifications-service";
import { supabase } from "@/utils/supabase";
import { Toast } from "toastify-react-native";

interface SettingsBottomSheetProps {
	onClose: () => void;
}

export const SettingsBottomSheet = React.forwardRef<BottomSheetModal, SettingsBottomSheetProps>(({ onClose }, ref) => {
	const snapPoints = useMemo(() => [480, "75%"], []);
	const [salaryNotif, setSalaryNotif] = useState(false);
	const [budgetNotif, setBudgetNotif] = useState(false);
	const [reportNotif, setReportNotif] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		loadSettings();
	}, []);

	const loadSettings = async () => {
		try {
			setIsLoading(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				Toast.error("User not found");
				return;
			}

			const profile = await getProfile(user.id);
			if (profile) {
				setSalaryNotif(profile.salary_notif ?? false);
				setBudgetNotif(profile.budget_notif ?? false);
				setReportNotif(profile.report_notif ?? false);
				setHasChanges(false);
			}
		} catch (error: any) {
			console.error("Failed to load settings:", error);
			Toast.error("Failed to load settings");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSaveChanges = async () => {
		try {
			setIsSaving(true);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) {
				Toast.error("User not found");
				return;
			}

			await updateProfile(user.id, {
				salary_notif: salaryNotif,
				budget_notif: budgetNotif,
				report_notif: reportNotif,
			});

			// Handle weekly report notification toggle
			if (reportNotif) {
				// Enable weekly report notification
				const result = await scheduleWeeklyReport();
				if (!result.success) {
					console.warn("Failed to schedule weekly report:", result.message);
				}
			} else {
				// Disable weekly report notification
				await cancelNotificationByType("weekly_report");
			}

			Toast.success("Settings saved successfully");
			setHasChanges(false);
		} catch (error: any) {
			console.error("Failed to save settings:", error);
			Toast.error("Failed to save settings");
		} finally {
			setIsSaving(false);
		}
	};

	const handleClosePress = () => {
		(ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
	};

	const renderBackdrop = useCallback((props: React.JSX.IntrinsicAttributes & BottomSheetDefaultBackdropProps) => <BottomSheetBackdrop {...props} opacity={0.5} appearsOnIndex={0} disappearsOnIndex={-1} />, []);

	return (
		<BottomSheetModal ref={ref as any} snapPoints={snapPoints} onDismiss={onClose} style={styles.bottomSheet} backdropComponent={renderBackdrop}>
			<BottomSheetScrollView style={styles.container} scrollEnabled>
				<View style={styles.header}>
					<View style={{ flex: 1 }}>
						<ThemedText style={styles.title}>Settings</ThemedText>
						<ThemedText style={styles.subtitle}>Manage your notification preferences</ThemedText>
					</View>
					<TouchableOpacity onPress={handleClosePress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
						<Feather name='x' size={24} color='#6B7280' />
					</TouchableOpacity>
				</View>

				{isLoading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size='large' color='#155DFC' />
					</View>
				) : (
					<>
						<View style={styles.settingList}>
							<SettingRow
								icon='dollar-sign'
								title='Salary Notifications'
								description='Receive salary day notifications'
								value={salaryNotif}
								onValueChange={(val) => {
									setSalaryNotif(val);
									setHasChanges(true);
								}}
							/>
							<SettingRow
								icon='alert-circle'
								title='Budget Alerts'
								description='Get notified when near budget'
								value={budgetNotif}
								onValueChange={(val) => {
									setBudgetNotif(val);
									setHasChanges(true);
								}}
							/>
							<SettingRow
								icon='settings'
								title='Weekly Reports'
								description='Receive weekly spending reports'
								value={reportNotif}
								onValueChange={(val) => {
									setReportNotif(val);
									setHasChanges(true);
								}}
							/>
						</View>

						<ThemedButton title={isSaving ? "Saving..." : "Save Changes"} onPress={handleSaveChanges} style={styles.saveButton} disabled={!hasChanges || isSaving} />
					</>
				)}
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
});

SettingsBottomSheet.displayName = "SettingsBottomSheet";

interface SettingRowProps {
	icon: React.ComponentProps<typeof Feather>["name"];
	title: string;
	description: string;
	value: boolean;
	onValueChange: (value: boolean) => void;
}

function SettingRow({ icon, title, description, value, onValueChange }: SettingRowProps) {
	return (
		<View style={styles.settingRow}>
			<View style={styles.settingLeft}>
				<View style={styles.settingIcon}>
					<Feather name={icon} size={18} color='#155DFC' />
				</View>
				<View style={{ flex: 1 }}>
					<ThemedText style={styles.settingTitle}>{title}</ThemedText>
					<ThemedText style={styles.settingDescription}>{description}</ThemedText>
				</View>
			</View>
			<Switch value={value} onValueChange={onValueChange} trackColor={{ false: "#E5E7EB", true: "#C7D2FE" }} thumbColor={value ? "#155DFC" : "#9CA3AF"} />
		</View>
	);
}

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
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		minHeight: 200,
	},
	settingList: {
		gap: 16,
		marginTop: 4,
		marginBottom: 20,
	},
	settingRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		paddingHorizontal: 12,
		borderRadius: 14,
		backgroundColor: "#F8FAFC",
		borderWidth: 1,
		borderColor: "#E5E7EB",
		gap: 12,
	},
	settingLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		flex: 1,
	},
	settingIcon: {
		width: 36,
		height: 36,
		borderRadius: 12,
		backgroundColor: "#EEF2FF",
		alignItems: "center",
		justifyContent: "center",
	},
	settingTitle: {
		fontSize: 15,
		fontWeight: "600",
		color: "#111827",
	},
	settingDescription: {
		fontSize: 13,
		color: "#6B7280",
		marginTop: 2,
	},
	saveButton: {
		marginTop: 4,
	},
});
