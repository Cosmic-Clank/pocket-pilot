import { supabase } from "@/utils/supabase";

export interface ProfileRecord {
	id: string;
	display_name: string | null;
	preferred_currency: string | null;
	monthly_income: number | null;
	monthly_income_date: string | null;
	phone_number: string | null;
	emergency_fund_auto_invest: number | null;
	emergency_fund_amount: number;
	salary_notif: boolean;
	budget_notif: boolean;
	report_notif: boolean;
	monthly_saving_goal: number | null;
	created_at?: string;
}

export interface FetchProfileResult {
	success: boolean;
	data: ProfileRecord | null;
	error?: string;
}

export interface UpdateProfileParams {
	display_name?: string;
	phone_number?: string;
	monthly_income?: number | null;
	monthly_income_date?: string | null;
	preferred_currency?: string;
	salary_notif?: boolean;
	budget_notif?: boolean;
	report_notif?: boolean;
	monthly_saving_goal?: number | null;
}

export interface UpdateProfileResult {
	success: boolean;
	message: string;
	data?: ProfileRecord;
	error?: string;
}

export interface UpdateEmergencyFundAutoInvestParams {
	amount: number | null;
}

export interface UpdateEmergencyFundAutoInvestResult {
	success: boolean;
	message: string;
	error?: string;
}

/**
 * Fetch profile by user ID
 */
export async function getProfile(userId: string): Promise<ProfileRecord | null> {
	try {
		const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

		if (error) {
			console.error("Get profile error:", error);
			return null;
		}

		return data as ProfileRecord;
	} catch (error: any) {
		console.error("Get profile unexpected error:", error);
		return null;
	}
}

/**
 * Fetch current user's profile
 */
export async function fetchProfile(): Promise<FetchProfileResult> {
	try {
		// Get current user
		const { data: authData, error: authError } = await supabase.auth.getUser();

		if (authError || !authData?.user?.id) {
			return {
				success: false,
				data: null,
				error: "User not authenticated",
			};
		}

		// Fetch profile
		const { data, error } = await supabase.from("profiles").select("*").eq("id", authData.user.id).single();

		if (error) {
			return {
				success: false,
				data: null,
				error: error.message,
			};
		}

		return {
			success: true,
			data: data as ProfileRecord,
		};
	} catch (error: any) {
		return {
			success: false,
			data: null,
			error: error.message || "Failed to fetch profile",
		};
	}
}

/**
 * Update the current user's profile information
 */
export async function updateProfile(userId: string, params: UpdateProfileParams): Promise<UpdateProfileResult> {
	try {
		// Validate inputs
		if (params.display_name !== undefined && (!params.display_name || params.display_name.trim().length === 0)) {
			return {
				success: false,
				message: "Full name is required",
				error: "Please enter a valid name",
			};
		}

		if (params.phone_number !== undefined && params.phone_number && params.phone_number.trim().length === 0) {
			return {
				success: false,
				message: "Invalid phone number",
				error: "Phone number must be empty or a valid number",
			};
		}

		if (params.monthly_income !== undefined && params.monthly_income !== null && params.monthly_income < 0) {
			return {
				success: false,
				message: "Invalid income",
				error: "Monthly income cannot be negative",
			};
		}

		// Build update object with only provided fields
		const updateData: Partial<ProfileRecord> = {};
		if (params.display_name !== undefined) updateData.display_name = params.display_name;
		if (params.phone_number !== undefined) updateData.phone_number = params.phone_number || null;
		if (params.monthly_income !== undefined) updateData.monthly_income = params.monthly_income;
		if (params.monthly_income_date !== undefined) updateData.monthly_income_date = params.monthly_income_date;
		if (params.preferred_currency !== undefined) updateData.preferred_currency = params.preferred_currency;
		if (params.salary_notif !== undefined) updateData.salary_notif = params.salary_notif;
		if (params.budget_notif !== undefined) updateData.budget_notif = params.budget_notif;
		if (params.report_notif !== undefined) updateData.report_notif = params.report_notif;
		if (params.monthly_saving_goal !== undefined) updateData.monthly_saving_goal = params.monthly_saving_goal;

		// Update profile
		const { data, error } = await supabase.from("profiles").update(updateData).eq("id", userId).select().single();

		if (error) {
			console.error("Update profile error:", error);
			return {
				success: false,
				message: "Failed to update profile",
				error: error.message,
			};
		}

		return {
			success: true,
			message: "Profile updated successfully",
			data: data as ProfileRecord,
		};
	} catch (error: any) {
		console.error("Update profile unexpected error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error.message || "Failed to update profile",
		};
	}
}

/**
 * Update current user's profile by user ID (legacy - kept for backward compatibility)
 */
export async function updateProfileLegacy(params: UpdateProfileParams): Promise<UpdateProfileResult> {
	try {
		// Get current user
		const { data: authData, error: authError } = await supabase.auth.getUser();

		if (authError || !authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to update your profile",
			};
		}

		return await updateProfile(authData.user.id, params);
	} catch (error: any) {
		console.error("Update profile legacy unexpected error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error.message || "Failed to update profile",
		};
	}
}

/**
 * Update the emergency fund amount in user's profile
 */
export async function updateEmergencyFundAutoInvest(params: UpdateEmergencyFundAutoInvestParams): Promise<UpdateEmergencyFundAutoInvestResult> {
	try {
		// Get current user
		const { data: authData, error: authError } = await supabase.auth.getUser();

		if (authError || !authData?.user?.id) {
			return {
				success: false,
				message: "Please log in to update emergency fund",
			};
		}

		// Update profile
		const { error } = await supabase.from("profiles").update({ emergency_fund_auto_invest: params.amount }).eq("id", authData.user.id);

		if (error) {
			return {
				success: false,
				message: "Failed to update emergency fund",
				error: error.message,
			};
		}

		return {
			success: true,
			message: params.amount === null ? "Emergency fund auto-invest disabled" : "Emergency fund auto-invest enabled",
		};
	} catch (error: any) {
		return {
			success: false,
			message: "An error occurred",
			error: error.message || "Failed to update emergency fund",
		};
	}
}

export interface UpdateEmergencyFundAmountParams {
	amount: number;
}

export interface UpdateEmergencyFundAmountResult {
	success: boolean;
	message: string;
	error?: string;
}

/**
 * Update the emergency fund amount (for deposit/withdraw operations)
 */
export async function updateEmergencyFundAmount(params: UpdateEmergencyFundAmountParams): Promise<UpdateEmergencyFundAmountResult> {
	try {
		// Get current user
		const { data: authData, error: authError } = await supabase.auth.getUser();

		if (authError || !authData?.user?.id) {
			return {
				success: false,
				message: "Please log in to update emergency fund",
			};
		}

		// Update profile emergency fund amount
		const { error } = await supabase.from("profiles").update({ emergency_fund_amount: params.amount }).eq("id", authData.user.id);

		if (error) {
			return {
				success: false,
				message: "Failed to update emergency fund amount",
				error: error.message,
			};
		}

		return {
			success: true,
			message: "Emergency fund updated successfully",
		};
	} catch (error: any) {
		return {
			success: false,
			message: "An error occurred",
			error: error.message || "Failed to update emergency fund amount",
		};
	}
}
