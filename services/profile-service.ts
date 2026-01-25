import { supabase } from "@/utils/supabase";

export interface ProfileRecord {
	id: string;
	user_id: string;
	emergency_fund_auto_invest: number | null;
	emergency_fund_amount: number;
	created_at?: string;
}

export interface FetchProfileResult {
	success: boolean;
	data: ProfileRecord | null;
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
 * Fetch the current user's profile
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
