import { create } from "zustand";
import {
  fetchClientAgents,
  deleteAgent,
  signUpClient,
  getEmailTemplates,
  updateEmailTemplates,
  getClient,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { AdminAgent } from "../types";

interface ClientData {
  paymentMethods: {
    stripe: {
      enabled: boolean;
      isActivated: boolean;
      accountId: string;
      reasons: { status: string; reasons: string[] };
    };
    razorpay: {
      enabled: boolean;
      accountId: string;
    };
    crypto: {
      enabled: boolean;
      walletAddress: string;
      chains: string[];
    };
  };
  currency: string;
  preferredPaymentMethod: string;
  availableCredits: number;
  creditsPerMonth: number;
  creditsPerMonthResetDate: string;
  planId: string;
  payoutBalance: {
    available: number;
    pending: number;
  };
}

interface AdminState {
  // Admin data state
  adminId: string | null;
  adminEmail: string | null;
  clientData: ClientData | null;
  isAdminLoggedIn: boolean;
  agents: AdminAgent[];
  isLoading: boolean;
  error: string | null;
  totalAgents: number;
  emailTemplates: EmailTemplatesResponse | null;

  setError: (error: string | null) => void;
  // Admin operations
  fetchAllAgents: () => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  adminLogout: () => void;
  handleGoogleLoginError: () => void;
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
  // Email template operations
  fetchEmailTemplates: (agentId: string) => Promise<void>;
  updateEmailTemplate: (
    agentId: string,
    updatedData: any,
    emailTemplateId: string
  ) => Promise<boolean>;
  setEmailTemplates: (templates: EmailTemplatesResponse) => void;
  isAgentsLoaded: boolean;
  // Session management
  initializeSession: () => Promise<boolean>;
  refetchClientData: () => Promise<void>;
}

// Add a type for the expected result
interface SignUpResult {
  _id: string;
  signUpVia: { via: string; handle: string };
  totalAgents?: number;
  [key: string]: any;
}

interface EmailTemplate {
  subText: string;
  isActive: boolean;
  subject: string;
  body1: string;
  body2: string;
  body3: string;
}

interface EmailTemplatesResponse {
  [key: string]: EmailTemplate | string;
}

export const useAdminStore = create<AdminState>()((set, get) => {
  // Initialize session when store is created
  const initializeStore = async () => {
    try {
      const storedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("adminEmail")
          : null;
      if (storedEmail) {
        await get().initializeSession();
      }
    } catch (error) {
      console.warn("Failed to initialize admin store:", error);
    }
  };

  // Call initialization
  initializeStore();

  return {
    // Initial state
    adminId: null,
    adminEmail: null,
    isAdminLoggedIn: false,
    isAgentsLoaded: false,
    agents: [],
    isLoading: false,
    error: null,
    totalAgents: 0,
    emailTemplates: null,

    clientInfo: null,

    // Basic setters
    setError: (error) => set({ error }),

    // Session management
    initializeSession: async () => {
      try {
        const storedEmail =
          typeof window !== "undefined"
            ? localStorage.getItem("adminEmail")
            : null;

        if (!storedEmail) {
          set({ isAdminLoggedIn: false });
          return false;
        }

        set({ isLoading: true });
        const response = await signUpClient("google", storedEmail);

        if (response.error) {
          const errorMessage =
            typeof response.result === "string"
              ? response.result
              : JSON.stringify(response.result);
          if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("invalid")
          ) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("adminEmail");
            }
            set({ isAdminLoggedIn: false, isLoading: false });
          } else {
            set({ error: errorMessage, isLoading: false });
          }
          return false;
        }

        if (
          typeof response.result === "object" &&
          response.result !== null &&
          "_id" in response.result
        ) {
          const result = response.result as SignUpResult;
          const adminId = result._id;
          const tempAgents = await fetchClientAgents(adminId);

          // Fetch client information
          const clientResponse = await getClient(adminId);

          set({
            adminId,
            adminEmail: result.signUpVia.handle,
            isAdminLoggedIn: true,
            totalAgents: tempAgents.length,
            agents: tempAgents,
            isLoading: false,
            error: null, // Clear any previous errors
            clientData: clientResponse.error ? null : clientResponse,
          });
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error restoring session:", error);
        // Only clear session for authentication errors
        if (
          error instanceof Error &&
          (error.message.includes("unauthorized") ||
            error.message.includes("invalid"))
        ) {
          localStorage.removeItem("adminEmail");
          set({ isAdminLoggedIn: false, isLoading: false });
        } else {
          // For other errors, keep the session but show error
          set({ error: (error as Error).message, isLoading: false });
        }
        return false;
      }
    },

    // Complex actions
    handleGoogleLoginSuccess: async (credentialResponse: any) => {
      try {
        // Get user info from the response
        const userInfo = credentialResponse.userInfo;

        if (!userInfo || !userInfo.email) {
          throw new Error("Invalid user info received from Google");
        }

        // Store email in localStorage for session management
        localStorage.setItem("adminEmail", userInfo.email);

        const response = await signUpClient("google", userInfo.email);

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

          // First set the basic auth state
          set({
            adminId,
            adminEmail: result.signUpVia.handle,
            isAdminLoggedIn: true,
            error: null,
          });

          // Then set the agents data
          set({
            totalAgents: tempAgents.length,
            agents: tempAgents,
            isLoading: false,
          });

          console.log("State updated with:", {
            adminId,
            adminEmail: result.signUpVia.handle,
            isAdminLoggedIn: true,
            agentsCount: tempAgents.length,
          });

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

    refetchClientData: async () => {
      const adminId = get().adminId;
      if (!adminId) {
        throw new Error("Admin ID is not set");
      }
      const clientData = await getClient(adminId);
      set({ clientData });
    },
    // Admin operations
    fetchAllAgents: async () => {
      try {
        set({ isAgentsLoaded: false });
        const adminId = get().adminId;
        if (!adminId) {
          throw new Error("Admin ID is not set");
        }
        const agents = await fetchClientAgents(adminId);
        set({ agents, totalAgents: agents.length, isAgentsLoaded: true });
      } catch (error) {
        set({ error: (error as Error).message, isLoading: false });
        toast.error("Failed to fetch agents");
      }
    },

    deleteAgent: async (agentId: string) => {
      try {
        set({ isLoading: true, error: null });
        await deleteAgent(agentId);
        const adminId = get().adminId;
        if (!adminId) {
          throw new Error("Admin ID is not set");
        }
        const agents = await fetchClientAgents(adminId);
        set({ agents, totalAgents: agents.length, isLoading: false });
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
        emailTemplates: null,
        clientData: null,
      });

      // Clear the stored email
      localStorage.removeItem("adminEmail");
    },

    // Email template actions
    fetchEmailTemplates: async (agentId: string) => {
      try {
        const response = await getEmailTemplates(agentId);
        if (response) {
          set({
            emailTemplates: response,
          });
        } else {
          set({
            emailTemplates: null,
          });
        }
      } catch (err: any) {
        console.error("Error fetching email templates:", err);
      }
    },

    updateEmailTemplate: async (
      agentId: string,
      updatedData: any,
      emailTemplateId: string
    ) => {
      try {
        let response = await updateEmailTemplates(
          agentId,
          updatedData,
          emailTemplateId
        );
        console.log("response", response);
        if (!response?.error && response?.result) {
          set({ emailTemplates: response });
          return true;
        } else {
          return false;
        }
      } catch (err: any) {
        return false;
      } finally {
      }
    },

    setEmailTemplates: (templates) => set({ emailTemplates: templates }),
  };
});
