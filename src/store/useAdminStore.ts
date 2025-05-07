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
  totalAgents: number;
  setError: (error: string | null) => void;
  // Admin operations
  fetchAllAgents: () => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  adminLogout: () => void;
  handleGoogleLoginError: () => void;
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
}

// Add a type for the expected result
interface SignUpResult {
  _id: string;
  signUpVia: { via: string; handle: string };
  totalAgents?: number;
  [key: string]: any;
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
      totalAgents: 0,

      // Basic setters
      setError: (error) => set({ error }),

      // Complex actions
      handleGoogleLoginSuccess: async (credentialResponse: any) => {
        try {
          console.log("Received credential response:", credentialResponse);

          // Get user info from the response
          const userInfo = credentialResponse.userInfo;
          console.log("User info:", userInfo);

          if (!userInfo || !userInfo.email) {
            throw new Error("Invalid user info received from Google");
          }

          // Call the signUpClient API
          console.log("Calling signUpClient with:", {
            via: "google",
            email: userInfo.email,
          });
          const response = await signUpClient("google", userInfo.email);
          console.log("SignUpClient response:", response);

          if (response.error) {
            console.error("Signup failed with error:", response.result);
            toast.error("Failed to complete signup process");
            return;
          }

          // Store the userId from the response
          if (
            typeof response.result === "object" &&
            response.result !== null &&
            "_id" in response.result
          ) {
            const result = response.result as SignUpResult;
            const adminId = result._id;
            console.log("Successfully got admin ID:", adminId);

            let tempAgents = await fetchClientAgents(adminId);
            console.log("Fetched agents:", tempAgents);

            set({
              adminId,
              adminEmail: result.signUpVia.handle,
              isAdminLoggedIn: true,
              totalAgents: tempAgents.length,
            });
            set({ agents: tempAgents, isLoading: false });
            toast.success(`Successfully signed in!`);
          } else {
            console.error("Invalid response format:", response.result);
            toast.error("Invalid response from server");
          }
        } catch (error) {
          console.error("Detailed error during Google login:", error);
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
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
          const adminId = get().adminId;
          if (!adminId) {
            throw new Error("Admin ID is not set");
          }
          const agents = await fetchClientAgents(adminId);
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
        // Clear the state
        set({
          adminId: null,
          adminEmail: null,
          isAdminLoggedIn: false,
          agents: [],
          isLoading: false,
          error: null,
          totalAgents: 0,
        });

        // Clear the persisted storage
        localStorage.removeItem("admin-storage");
      },
    }),
    {
      name: "admin-storage",
    }
  )
);
