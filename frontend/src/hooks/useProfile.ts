import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../stores/useAuth";

const API_BASE_URL = "http://localhost:4000";

interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  barId?: string;
  // Add other fields as needed
}

const getAuthHeaders = () => {
  const { accessToken } = useAuth.getState();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export const useProfile = () => {
  const queryClient = useQueryClient();
  const { accessToken, setProfile } = useAuth();

  // Fetch profile
  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      return response.json();
    },
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (
      profileData: Partial<UserProfile>
    ): Promise<UserProfile> => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(profileData),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      return response.json();
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["profile"], updatedProfile);
      // Update Zustand store
      setProfile(updatedProfile);
    },
    onError: (error) => {
      console.error("Update profile error:", error);
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    refetch: profileQuery.refetch,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
};
