import { supabase } from "@/utils/supabase";
import type { ImagePickerAsset } from "expo-image-picker";

export interface SaveExpenseParams {
	title: string;
	amount: string;
	category: string;
	date: Date;
	notes?: string;
	receiptAsset?: ImagePickerAsset | null;
}

export interface SaveExpenseResult {
	success: boolean;
	message: string;
	error?: string;
}

/**
 * Uploads receipt to Supabase storage and returns public URL
 */
async function uploadReceipt(userId: string, asset: ImagePickerAsset): Promise<string | null> {
	try {
		const fileName = asset.fileName || `receipt-${Date.now()}.jpg`;
		const bucket = "receipts";
		const filePath = `${userId}/${fileName}`;

		// Use base64 from asset if available
		if (!asset.base64) {
			console.error("No base64 data available from image picker");
			return null;
		}

		// Decode base64 to bytes
		const binaryString = atob(asset.base64);
		const bytes = new Uint8Array(binaryString.length);
		for (let i = 0; i < binaryString.length; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}

		// Upload to storage
		const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, bytes, {
			contentType: asset.mimeType || "image/jpeg",
			upsert: true,
		});

		if (uploadError) {
			console.error("Upload error:", uploadError);
			return null;
		}

		// Get public URL
		const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
		return data?.publicUrl || null;
	} catch (error) {
		console.error("Receipt upload failed:", error);
		return null;
	}
}

/**
 * Saves expense transaction to Supabase
 */
export async function saveExpense(params: SaveExpenseParams): Promise<SaveExpenseResult> {
	try {
		// Get current user
		const { data: authData } = await supabase.auth.getUser();
		if (!authData?.user?.id) {
			return {
				success: false,
				message: "User not authenticated",
				error: "Please log in to save expenses",
			};
		}

		const userId = authData.user.id;

		// Parse amount
		const parsedAmount = parseFloat(params.amount);
		if (isNaN(parsedAmount) || parsedAmount <= 0) {
			return {
				success: false,
				message: "Invalid amount",
				error: "Amount must be a valid positive number",
			};
		}

		// Upload receipt if provided
		let receiptUrl: string | null = null;
		if (params.receiptAsset) {
			receiptUrl = await uploadReceipt(userId, params.receiptAsset);
		}

		// Insert transaction
		const { error: insertError } = await supabase.from("transactions").insert([
			{
				user_id: userId,
				title: params.title,
				amount: parsedAmount,
				category: params.category,
				type: "expense",
				transaction_date: params.date.toISOString(),
				notes: params.notes || null,
				receipt_url: receiptUrl,
				vendor: null,
				ocr_confidence: null,
			},
		]);

		if (insertError) {
			console.error("Insert error:", insertError);
			return {
				success: false,
				message: "Failed to save expense",
				error: insertError.message,
			};
		}

		return {
			success: true,
			message: "Expense saved successfully",
		};
	} catch (error) {
		console.error("Save expense error:", error);
		return {
			success: false,
			message: "An error occurred",
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
}
