import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../stores/useAuth";

const API_BASE_URL = "http://localhost:4000";

interface Client {
  id: string;
  advocateId: string;
  name: string;
  contact: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreateClientData {
  name: string;
  contact?: string;
}

interface UpdateClientData extends Partial<CreateClientData> {}

const getAuthHeaders = () => {
  const { accessToken } = useAuth.getState();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export const useClients = () => {
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();

  // Fetch clients
  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async (): Promise<Client[]> => {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
      return response.json();
    },
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (clientData: CreateClientData): Promise<Client> => {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
        throw new Error("Failed to create client");
      }
      return response.json();
    },
    onSuccess: (newClient) => {
      queryClient.setQueryData<Client[]>(["clients"], (oldClients) => [
        ...(oldClients || []),
        newClient,
      ]);
    },
    onError: (error) => {
      console.error("Create client error:", error);
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({
      id,
      clientData,
    }: {
      id: string;
      clientData: UpdateClientData;
    }): Promise<Client> => {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });
      if (!response.ok) {
        throw new Error("Failed to update client");
      }
      return response.json();
    },
    onSuccess: (updatedClient) => {
      queryClient.setQueryData<Client[]>(
        ["clients"],
        (oldClients) =>
          oldClients?.map((c) =>
            c.id === updatedClient.id ? updatedClient : c
          ) || []
      );
    },
    onError: (error) => {
      console.error("Update client error:", error);
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to delete client");
      }
    },
    onSuccess: (_, deletedId) => {
      queryClient.setQueryData<Client[]>(
        ["clients"],
        (oldClients) => oldClients?.filter((c) => c.id !== deletedId) || []
      );
    },
    onError: (error) => {
      console.error("Delete client error:", error);
    },
  });

  return {
    clients: clientsQuery.data || [],
    isLoading: clientsQuery.isLoading,
    error: clientsQuery.error,
    refetch: clientsQuery.refetch,
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending,
  };
};
