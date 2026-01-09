import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../stores/useAuth";
import { useCaseStore } from "../stores/useCaseStore";

const API_BASE_URL = "http://localhost:4000";

interface Case {
  id: string;
  advocateId: string;
  clientId: string;
  cnrNumber: string;
  title: string;
  status: string;
  nextHearing: Date | null;
  caseContext: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateCaseData {
  clientId: string;
  cnrNumber: string;
  title: string;
  status?: string;
  nextHearing?: Date;
  caseContext?: string;
}

interface UpdateCaseData extends Partial<CreateCaseData> {}

const getAuthHeaders = () => {
  const { accessToken } = useAuth.getState();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export const useCases = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  // Fetch cases
  const casesQuery = useQuery({
    queryKey: ["cases"],
    queryFn: async (): Promise<Case[]> => {
      const response = await fetch(`${API_BASE_URL}/cases`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }
      return response.json();
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Create case mutation
  const createCaseMutation = useMutation({
    mutationFn: async (caseData: CreateCaseData): Promise<Case> => {
      const response = await fetch(`${API_BASE_URL}/cases`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(caseData),
      });
      if (!response.ok) {
        throw new Error("Failed to create case");
      }
      return response.json();
    },
    onSuccess: (newCase) => {
      queryClient.setQueryData<Case[]>(["cases"], (oldCases) => [
        ...(oldCases || []),
        newCase,
      ]);
      // Update Zustand store
      const { cases, setActiveCase } = useCaseStore.getState();
      useCaseStore.setState({ cases: [...cases, newCase] });
      setActiveCase(newCase);
    },
    onError: (error) => {
      console.error("Create case error:", error);
    },
  });

  // Update case mutation
  const updateCaseMutation = useMutation({
    mutationFn: async ({
      id,
      caseData,
    }: {
      id: string;
      caseData: UpdateCaseData;
    }): Promise<Case> => {
      const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(caseData),
      });
      if (!response.ok) {
        throw new Error("Failed to update case");
      }
      return response.json();
    },
    onSuccess: (updatedCase) => {
      queryClient.setQueryData<Case[]>(
        ["cases"],
        (oldCases) =>
          oldCases?.map((c) => (c.id === updatedCase.id ? updatedCase : c)) ||
          []
      );
      // Update Zustand store
      const { cases, activeCase, setActiveCase } = useCaseStore.getState();
      const updatedCases = cases.map((c) =>
        c.id === updatedCase.id ? updatedCase : c
      );
      useCaseStore.setState({
        cases: updatedCases,
        activeCase:
          activeCase?.id === updatedCase.id ? updatedCase : activeCase,
      });
    },
    onError: (error) => {
      console.error("Update case error:", error);
    },
  });

  // Delete case mutation
  const deleteCaseMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to delete case");
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Case[]>(
        ["cases"],
        (oldCases) => oldCases?.filter((c) => c.id !== deletedId) || []
      );
      // Update Zustand store
      const { cases, activeCase, setActiveCase } = useCaseStore.getState();
      const filteredCases = cases.filter((c) => c.id !== deletedId);
      useCaseStore.setState({
        cases: filteredCases,
        activeCase: activeCase?.id === deletedId ? null : activeCase,
      });
    },
    onError: (error) => {
      console.error("Delete case error:", error);
    },
  });

  return {
    cases: casesQuery.data || [],
    isLoading: casesQuery.isLoading,
    error: casesQuery.error,
    refetch: casesQuery.refetch,
    createCase: createCaseMutation.mutate,
    updateCase: updateCaseMutation.mutate,
    deleteCase: deleteCaseMutation.mutate,
    isCreating: createCaseMutation.isPending,
    isUpdating: updateCaseMutation.isPending,
    isDeleting: deleteCaseMutation.isPending,
  };
};
