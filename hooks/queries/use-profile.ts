import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { fetchProfile, type ProfileRecord } from "@/services/profile-service";

export const PROFILE_QUERY_KEY = ["profile"];

/**
 * Hook to fetch user profile with React Query
 * Caches for 1 hour (profile rarely changes)
 */
export function useProfile(): UseQueryResult<ProfileRecord | null, Error> {
	return useQuery({
		queryKey: PROFILE_QUERY_KEY,
		queryFn: async () => {
			const result = await fetchProfile();
			if (!result.success) {
				throw new Error(result.error || "Failed to fetch profile");
			}
			return result.data;
		},
		staleTime: 60 * 60 * 1000, // 1 hour
		gcTime: 2 * 60 * 60 * 1000, // 2 hours
	});
}
