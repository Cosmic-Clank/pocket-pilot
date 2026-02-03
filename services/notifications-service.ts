import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Configure notification behavior
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldPlaySound: true,
		shouldSetBadge: true,
		shouldShowBanner: true,
		shouldShowList: true,
	}),
});

interface ScheduledNotification {
	id: string;
	type: string;
	dayOfMonth: number;
	title: string;
	body: string;
	createdAt: string;
}

const NOTIFICATIONS_STORAGE_KEY = "pocket_pilot_notifications";

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions(): Promise<boolean> {
	try {
		const permission = await Notifications.requestPermissionsAsync({
			ios: {
				allowAlert: true,
				allowBadge: true,
				allowSound: true,
			},
		});

		return permission.granted;
	} catch (error) {
		console.error("Error requesting notification permissions:", error);
		return false;
	}
}

/**
 * Schedule a monthly recurring notification on a specific day of the month
 * @param dayOfMonth - Day of the month (1-31)
 * @param title - Notification title
 * @param body - Notification body/message
 * @param type - Type of notification (e.g., "salary_reminder", "budget_alert")
 * @param sendImmediatelyIfToday - If today is the day, send notification immediately
 */
export async function scheduleMonthlyNotification(dayOfMonth: number, title: string, body: string, type: string = "reminder", sendImmediatelyIfToday: boolean = true): Promise<{ success: boolean; message: string; notificationId?: string }> {
	try {
		// Validate day of month
		if (dayOfMonth < 1 || dayOfMonth > 31) {
			return { success: false, message: "Day of month must be between 1 and 31" };
		}

		// Request permissions first
		const hasPermission = await requestNotificationPermissions();
		if (!hasPermission) {
			console.warn("Notification permissions not granted");
			// Continue anyway - user might grant permission later
		}

		const today = new Date();
		const todayDay = today.getDate();

		// Check if today is the notification day and send immediately if requested
		if (sendImmediatelyIfToday && todayDay === dayOfMonth) {
			await Notifications.scheduleNotificationAsync({
				content: {
					title,
					body,
					data: { type },
				},
				trigger: null, // Send immediately
			});
			console.log(`Immediate notification sent for ${type} on day ${dayOfMonth}`);
		}

		// Schedule recurring monthly notification
		// Calculate next occurrence
		let nextNotificationDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);

		// If the day has already passed this month, schedule for next month
		if (nextNotificationDate < today && todayDay !== dayOfMonth) {
			nextNotificationDate = new Date(today.getFullYear(), today.getMonth() + 1, dayOfMonth);
		}

		// Schedule the notification for the next occurrence of that day of month
		// Using a more precise trigger with seconds
		const notificationId = await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data: { type },
			},
			trigger: {
				hour: 9,
				minute: 0,
				type: "time-interval" as any,
				seconds: 60 * 60 * 24, // Check daily
			},
		});

		// Store notification metadata for tracking
		await saveNotificationMetadata({
			id: notificationId,
			type,
			dayOfMonth,
			title,
			body,
			createdAt: new Date().toISOString(),
		});

		console.log(`Monthly notification scheduled: ${notificationId} for day ${dayOfMonth}`);

		return {
			success: true,
			message: `Notification scheduled for day ${dayOfMonth} of every month`,
			notificationId,
		};
	} catch (error) {
		console.error("Error scheduling monthly notification:", error);
		return {
			success: false,
			message: `Failed to schedule notification: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Send an instant/immediate notification
 */
export async function sendInstantNotification(title: string, body: string, type: string = "instant"): Promise<{ success: boolean; message: string }> {
	try {
		await Notifications.scheduleNotificationAsync({
			content: {
				title,
				body,
				data: { type },
			},
			trigger: null, // Send immediately
		});

		console.log(`Instant notification sent: ${title}`);
		return {
			success: true,
			message: "Notification sent successfully",
		};
	} catch (error) {
		console.error("Error sending instant notification:", error);
		return {
			success: false,
			message: `Failed to send notification: ${error instanceof Error ? error.message : "Unknown error"}`,
		};
	}
}

/**
 * Save notification metadata to AsyncStorage for tracking
 */
async function saveNotificationMetadata(notification: ScheduledNotification): Promise<void> {
	try {
		const existing = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
		const notifications: ScheduledNotification[] = existing ? JSON.parse(existing) : [];

		// Remove any existing notification of the same type to avoid duplicates
		const filtered = notifications.filter((n) => n.type !== notification.type);
		filtered.push(notification);

		await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));
	} catch (error) {
		console.error("Error saving notification metadata:", error);
	}
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<ScheduledNotification[]> {
	try {
		const data = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
		return data ? JSON.parse(data) : [];
	} catch (error) {
		console.error("Error retrieving scheduled notifications:", error);
		return [];
	}
}

/**
 * Cancel all notifications of a specific type
 */
export async function cancelNotificationByType(type: string): Promise<boolean> {
	try {
		const notifications = await getScheduledNotifications();
		const toCancel = notifications.filter((n) => n.type === type);

		for (const notif of toCancel) {
			await Notifications.cancelScheduledNotificationAsync(notif.id);
		}

		// Remove from storage
		const filtered = notifications.filter((n) => n.type !== type);
		await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(filtered));

		console.log(`Cancelled ${toCancel.length} notifications of type: ${type}`);
		return true;
	} catch (error) {
		console.error("Error cancelling notifications:", error);
		return false;
	}
}

/**
 * Clear all scheduled notifications
 */
export async function clearAllNotifications(): Promise<boolean> {
	try {
		await Notifications.cancelAllScheduledNotificationsAsync();
		await AsyncStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
		console.log("All notifications cleared");
		return true;
	} catch (error) {
		console.error("Error clearing notifications:", error);
		return false;
	}
}

/**
 * Schedule a salary reminder notification
 * Called when user sets their monthly income date
 */
export async function scheduleSalaryReminder(dayOfMonth: number, salaryAmount?: number): Promise<{ success: boolean; message: string }> {
	const title = "Salary Day Reminder 💰";
	const body = salaryAmount ? `You're expecting AED ${salaryAmount.toFixed(2)} today` : "It's your salary day! Don't forget to log your income.";

	return scheduleMonthlyNotification(dayOfMonth, title, body, "salary_reminder", true);
}

/**
 * Schedule a budget alert notification
 */
export async function scheduleBudgetAlert(category: string, threshold: number = 80): Promise<{ success: boolean; message: string }> {
	const title = "Budget Alert 📊";
	const body = `You've reached ${threshold}% of your ${category} budget`;

	return scheduleMonthlyNotification(1, title, body, `budget_alert_${category}`, false);
}

/**
 * Schedule a savings goal check-in notification
 */
export async function scheduleSavingsCheckIn(dayOfMonth: number, savingsGoal?: number): Promise<{ success: boolean; message: string }> {
	const title = "Savings Check-in 🎯";
	const body = savingsGoal ? `Track your progress towards your AED ${savingsGoal.toFixed(2)} savings goal` : "Check your savings progress this month!";

	return scheduleMonthlyNotification(dayOfMonth, title, body, "savings_checkin", false);
}
