import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchClientAgents,
  deleteAgent,
  signUpClient,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { AdminAgent } from "../types";

interface AdminState {
  // Admin data state
  adminId: string | null;
  adminEmail: string | null;
  isAdminLoggedIn: boolean;
  agents: AdminAgent[];
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  // Admin operations
  fetchAllAgents: () => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  adminLogout: () => void;
  handleGoogleLoginError: () => void;
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // Initial state
      adminId: null,
      adminEmail: null,
      isAdminLoggedIn: false,
      agents: [],

      isLoading: false,
      error: null,

      // Basic setters
      setError: (error) => set({ error }),

      // Complex actions
      handleGoogleLoginSuccess: async (credentialResponse: any) => {
        try {
          // Decode the JWT token to get user info
          const base64Url = credentialResponse.credential.split(".")[1];
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );

          const userInfo = JSON.parse(jsonPayload);
          set({ adminEmail: userInfo.email, isAdminLoggedIn: true });

          // Call the signUpUser API
          const response = await signUpClient("google", userInfo.email);

          if (response.error) {
            toast.error("Failed to complete signup process");
            console.error("Signup failed:", response.result);
          } else {
            // Store the userId from the response
            if (typeof response.result !== "string" && response.result._id) {
              const adminId = response.result._id;
              set({ adminId });
            }
            toast.success(`Successfully signed in!`);
          }
        } catch (error) {
          console.error("Error during Google login:", error);
          toast.error("An error occurred during login");
        }
      },

      handleGoogleLoginError: () => {
        console.log("Login Failed");
        toast.error("Google login failed");
      },

      // Admin operations
      fetchAllAgents: async () => {
        try {
          set({ isLoading: true, error: null });
          if (!get().adminId) {
            throw new Error("Admin ID is not set");
          }
          const agents = await fetchClientAgents(get().adminId);
          set({ agents, isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to fetch agents");
        }
      },

      deleteAgent: async (agentId: string) => {
        try {
          set({ isLoading: true, error: null });
          await deleteAgent(agentId);
          const agents = await fetchClientAgents(agentId);
          set({ agents, isLoading: false });
          toast.success("Agent deleted successfully");
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to delete agent");
        }
      },
      adminLogout: () => {
        set({ adminId: null, adminEmail: null, isAdminLoggedIn: false });
      },
    }),
    {
      name: "admin-storage",
    }
  )
);
