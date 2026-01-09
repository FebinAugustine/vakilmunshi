import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  id: string;
  email: string;
  // Add other profile fields as needed
}

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  profile: UserProfile | null;
  sendOtp: (email: string, isRegister?: boolean) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setProfile: (profile: UserProfile) => void;
}

const API_BASE_URL = "http://localhost:4000";

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      accessToken: null,
      refreshToken: null,
      profile: null,

      sendOtp: async (email: string, isRegister: boolean = false) => {
        const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, isRegister }),
        });

        if (!response.ok) {
          throw new Error("Failed to send OTP");
        }
      },

      verifyOtp: async (email: string, token: string) => {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, token }),
        });

        if (!response.ok) {
          throw new Error("Invalid OTP");
        }

        const data = await response.json();
        const { accessToken, refreshToken } = data;

        // Decode accessToken to get user info
        const payload = JSON.parse(atob(accessToken.split(".")[1]));
        const profile: UserProfile = {
          id: payload.sub,
          email: payload.email,
        };

        set({
          isLoggedIn: true,
          accessToken,
          refreshToken,
          profile,
        });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            throw new Error("Login failed");
          }

          const data = await response.json();
          const { accessToken, refreshToken } = data;

          // Decode accessToken to get user info (simple decode, assuming JWT)
          const payload = JSON.parse(atob(accessToken.split(".")[1]));
          const profile: UserProfile = {
            id: payload.sub,
            email: payload.email,
          };

          set({
            isLoggedIn: true,
            accessToken,
            refreshToken,
            profile,
          });
        } catch (error) {
          console.error("Login error:", error);
          throw error;
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            });
          } catch (error) {
            console.error("Logout error:", error);
          }
        }

        set({
          isLoggedIn: false,
          accessToken: null,
          refreshToken: null,
          profile: null,
        });
      },

      refresh: async () => {
        const { refreshToken } = get();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        try {
          const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (!response.ok) {
            throw new Error("Refresh failed");
          }

          const data = await response.json();
          const { accessToken, refreshToken: newRefreshToken } = data;

          set({
            accessToken,
            refreshToken: newRefreshToken,
          });
        } catch (error) {
          console.error("Refresh error:", error);
          // If refresh fails, logout
          get().logout();
          throw error;
        }
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      setProfile: (profile: UserProfile) => {
        set({ profile });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        profile: state.profile,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          state.isLoggedIn = true;
        }
      },
    }
  )
);
