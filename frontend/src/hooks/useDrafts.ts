import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../stores/useAuth";

const API_BASE_URL = "http://localhost:4000";

interface Draft {
  id: string;
  caseId: string;
  advocateId: string;
  templateType: string;
  content: string;
  createdAt: Date;
}

const getAuthHeaders = () => {
  const { accessToken } = useAuth.getState();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export const useDrafts = (caseId: string) => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  // Fetch drafts for a case
  const draftsQuery = useQuery({
    queryKey: ["drafts", caseId],
    queryFn: async (): Promise<Draft[]> => {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/drafts`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch drafts");
      }
      return response.json();
    },
    enabled: !!accessToken && !!caseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Generate AI draft mutation
  const generateDraftMutation = useMutation({
    mutationFn: async (templateType: string): Promise<string> => {
      const response = await fetch(`${API_BASE_URL}/ai/draft`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ caseId, templateType }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate draft");
      }
      return response.text(); // Assuming it returns the content
    },
    onSuccess: () => {
      // Invalidate drafts query to refetch
      queryClient.invalidateQueries({ queryKey: ["drafts", caseId] });
    },
    onError: (error) => {
      console.error("Generate draft error:", error);
    },
  });

  // Save draft mutation (assuming a save endpoint exists)
  const saveDraftMutation = useMutation({
    mutationFn: async (draftData: {
      templateType: string;
      content: string;
    }): Promise<Draft> => {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/drafts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(draftData),
      });
      if (!response.ok) {
        throw new Error("Failed to save draft");
      }
      return response.json();
    },
    onSuccess: (newDraft) => {
      queryClient.setQueryData<Draft[]>(["drafts", caseId], (oldDrafts) => [
        ...(oldDrafts || []),
        newDraft,
      ]);
    },
    onError: (error) => {
      console.error("Save draft error:", error);
    },
  });

  return {
    drafts: draftsQuery.data || [],
    isLoading: draftsQuery.isLoading,
    error: draftsQuery.error,
    refetch: draftsQuery.refetch,
    generateDraft: generateDraftMutation.mutate,
    saveDraft: saveDraftMutation.mutate,
    isGenerating: generateDraftMutation.isPending,
    isSaving: saveDraftMutation.isPending,
  };
};
