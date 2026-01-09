import { create } from "zustand";
import { useAuth } from "./useAuth";

interface Client {
  id: string;
  advocateId: string;
  name: string;
  contact: string;
  createdAt: Date;
  updatedAt: Date;
}

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

interface CaseContext {
  id: string;
  caseId: string;
  context: string;
  // Add other fields as needed
}

interface CaseState {
  cases: Case[];
  activeCase: Case | null;
  clients: Client[];
  caseContext: CaseContext | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCases: () => Promise<void>;
  fetchClients: () => Promise<void>;
  createCase: (caseData: Partial<Case>) => Promise<void>;
  updateCase: (id: string, caseData: Partial<Case>) => Promise<void>;
  deleteCase: (id: string) => Promise<void>;
  setActiveCase: (case_: Case | null) => void;
  fetchCaseContext: (caseId: string) => Promise<void>;
  createClient: (clientData: Partial<Client>) => Promise<void>;
  updateClient: (id: string, clientData: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

const API_BASE_URL = "http://localhost:4000";

const getAuthHeaders = () => {
  const { accessToken } = useAuth.getState();
  return {
    "Content-Type": "application/json",
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
};

export const useCaseStore = create<CaseState>((set, get) => ({
  cases: [],
  activeCase: null,
  clients: [],
  caseContext: null,
  loading: false,
  error: null,

  fetchCases: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/cases`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch cases");
      }

      const cases: Case[] = await response.json();
      set({ cases, loading: false });
    } catch (error) {
      console.error("Fetch cases error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  fetchClients: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }

      const clients: Client[] = await response.json();
      set({ clients, loading: false });
    } catch (error) {
      console.error("Fetch clients error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createCase: async (caseData: Partial<Case>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/cases`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(caseData),
      });

      if (!response.ok) {
        throw new Error("Failed to create case");
      }

      const newCase: Case = await response.json();
      const { cases } = get();
      set({ cases: [...cases, newCase], loading: false });
    } catch (error) {
      console.error("Create case error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateCase: async (id: string, caseData: Partial<Case>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(caseData),
      });

      if (!response.ok) {
        throw new Error("Failed to update case");
      }

      const updatedCase: Case = await response.json();
      const { cases, activeCase } = get();
      const updatedCases = cases.map((c) => (c.id === id ? updatedCase : c));
      set({
        cases: updatedCases,
        activeCase: activeCase?.id === id ? updatedCase : activeCase,
        loading: false,
      });
    } catch (error) {
      console.error("Update case error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteCase: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete case");
      }

      const { cases, activeCase } = get();
      const filteredCases = cases.filter((c) => c.id !== id);
      set({
        cases: filteredCases,
        activeCase: activeCase?.id === id ? null : activeCase,
        loading: false,
      });
    } catch (error) {
      console.error("Delete case error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  setActiveCase: (case_: Case | null) => {
    set({ activeCase: case_ });
  },

  fetchCaseContext: async (caseId: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/cases/${caseId}/context`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch case context");
      }

      const caseContext: CaseContext = await response.json();
      set({ caseContext, loading: false });
    } catch (error) {
      console.error("Fetch case context error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  createClient: async (clientData: Partial<Client>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/clients`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      const newClient: Client = await response.json();
      const { clients } = get();
      set({ clients: [...clients, newClient], loading: false });
    } catch (error) {
      console.error("Create client error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  updateClient: async (id: string, clientData: Partial<Client>) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(clientData),
      });

      if (!response.ok) {
        throw new Error("Failed to update client");
      }

      const updatedClient: Client = await response.json();
      const { clients } = get();
      const updatedClients = clients.map((c) =>
        c.id === id ? updatedClient : c
      );
      set({ clients: updatedClients, loading: false });
    } catch (error) {
      console.error("Update client error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  deleteClient: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE_URL}/clients/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete client");
      }

      const { clients } = get();
      const filteredClients = clients.filter((c) => c.id !== id);
      set({ clients: filteredClients, loading: false });
    } catch (error) {
      console.error("Delete client error:", error);
      set({ error: (error as Error).message, loading: false });
    }
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
