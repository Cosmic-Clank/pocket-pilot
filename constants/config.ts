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
 * Usage in components:
 *
 * import { API_CONFIG, getApiUrl } from "@/constants/config";
 *
 * // Option 1: Use BASE_URL + endpoint
 * const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROCESS_RECEIPT}`;
 *
 * // Option 2: Use helper function
 * const url = getApiUrl(API_CONFIG.ENDPOINTS.PROCESS_RECEIPT);
 *
 * // Then use in fetch:
 * const response = await fetch(url, {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(data)
 * });
 */
