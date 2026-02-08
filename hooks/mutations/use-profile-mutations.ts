import { useMutation, useQueryClient, type UseMutationResult } from "@tanstack/react-query";
import { 
	updateProfile, 
	updateEmergencyFundAutoInvest,
	updateEmergencyFundAmount,
	updateProfilePicture,
	deleteProfilePicture,
	type UpdateProfileParams, 
	type UpdateProfileResult,
	type UpdateEmergencyFundAutoInvestParams,
	type UpdateEmergencyFundAutoInvestResult,
	type UpdateEmergencyFundAmountParams,
	type UpdateEmergencyFundAmountResult,
	type UpdateProfilePictureParams,
	type UpdateProfilePictureResult
} from "@/services/profile-service";
import { PROFILE_QUERY_KEY } from "../queries/use-profile";

/**
 * Mutation hook for updating user profile
 * Automatically invalidates profile query on success
 */
export function useUpdateProfile(): UseMutationResult<UpdateProfileResult, Error, UpdateProfileParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UpdateProfileParams) => {
			return await updateProfile(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate profile to trigger refetch
				queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
			}
		},
	});
}

/**
 * Mutation hook for updating emergency fund auto-invest setting
 * Automatically invalidates profile query on success
 */
export function useUpdateEmergencyFundAutoInvest(): UseMutationResult<UpdateEmergencyFundAutoInvestResult, Error, UpdateEmergencyFundAutoInvestParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UpdateEmergencyFundAutoInvestParams) => {
			return await updateEmergencyFundAutoInvest(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate profile to trigger refetch
				queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
			}
		},
	});
}

/**
 * Mutation hook for updating emergency fund amount (deposit/withdraw)
 * Automatically invalidates profile query on success
 */
export function useUpdateEmergencyFundAmount(): UseMutationResult<UpdateEmergencyFundAmountResult, Error, UpdateEmergencyFundAmountParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UpdateEmergencyFundAmountParams) => {
			return await updateEmergencyFundAmount(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate profile to trigger refetch
				queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
			}
		},
	});
}

/**
 * Mutation hook for updating user's profile picture
 * Automatically invalidates profile query on success
 */
export function useUpdateProfilePicture(): UseMutationResult<UpdateProfilePictureResult, Error, UpdateProfilePictureParams> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (params: UpdateProfilePictureParams) => {
			return await updateProfilePicture(params);
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate profile to trigger refetch
				queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
			}
		},
	});
}

/**
 * Mutation hook for deleting user's profile picture
 * Automatically invalidates profile query on success
 */
export function useDeleteProfilePicture(): UseMutationResult<UpdateProfilePictureResult, Error, void> {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			return await deleteProfilePicture();
		},
		onSuccess: (data) => {
			if (data.success) {
				// Invalidate profile to trigger refetch
				queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
			}
		},
	});
}
