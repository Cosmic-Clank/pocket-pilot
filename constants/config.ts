/**
 * App Configuration
 * Centralized configuration for API endpoints and other settings
 * Change these values to switch between development and production
 */

export const API_CONFIG = {
	// Backend API Base URL
	BASE_URL: "http://192.168.1.139:8000",

	// API Endpoints
	ENDPOINTS: {
		PROCESS_RECEIPT: "/api/process-receipt",
		HEALTH: "/health",
	},
};

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
	return `${API_CONFIG.BASE_URL}${endpoint}`;
};

/**
 * Transaction & Budget Categories
 * Used across the app for dropdowns and icon mapping
 */
export const CATEGORIES = [
	{ label: "Transport", value: "transport" },
	{ label: "Entertainment", value: "entertainment" },
	{ label: "Groceries", value: "groceries" },
	{ label: "Food", value: "food" },
	{ label: "Shopping", value: "shopping" },
	{ label: "Bills", value: "bills" },
	{ label: "Health", value: "health" },
	{ label: "Education", value: "education" },
	{ label: "Other", value: "other" },
];

export const CATEGORY_ICON_MAP: { [key: string]: any } = {
	transport: "truck",
	entertainment: "film",
	groceries: "shopping-cart",
	food: "coffee",
	shopping: "shopping-bag",
	bills: "file-text",
	health: "heart",
	education: "book",
	other: "tag",
};

/**
 * Usage in components:
 *
 * import { API_CONFIG, getApiUrl, CATEGORIES, CATEGORY_ICON_MAP } from "@/constants/config";
 *
 * // For API:
 * const url = getApiUrl(API_CONFIG.ENDPOINTS.PROCESS_RECEIPT);
 *
 * // For categories dropdown:
 * <Picker selectedValue={category} onValueChange={setCategory}>
 *   {CATEGORIES.map((cat) => (
 *     <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
 *   ))}
 * </Picker>
 *
 * // For icons:
 * const iconName = CATEGORY_ICON_MAP[category] || "tag";
 * <Feather name={iconName} size={20} />
 */
