import { create } from "zustand";
import {
  fetchClientAgents,
  deleteAgent,
  signUpClient,
  getEmailTemplates,
  updateEmailTemplates,
  getTeamDetails,
  getTeamUsage,
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
  teamMembers: {
    email: string;
    role: string;
    status: string;
  }[];

  otherTeams: {
    teamName: string;
    teamId: string;
    role: string;
    email: string;
    agents: AdminAgent[];
  }[];
  role: string;
}

interface ClientUsageData {
  creditsInfo: {
    totalCredits: number;
    availableCredits: number;
  };
  usage: {
    agentUsage: {
      totalTokensUsed: number;
      usageData: {
        _id: string;
        clientId: string;
        agentId: string;
        date: string;
        totalTokensUsed: number;
      }[];
      agentId: string;
      agentName: string;
    }[];
    totalTokensUsedAllAgents: number;
    planId: string;
    agentLimit: number;
  };
  totalAgentCount: number;
}

interface AdminState {
  // Admin data state
  adminId: string | null;
  adminEmail: string | null;
  isAdminLoggedIn: boolean;
  activeTeamId: string | null;
  isLoading: boolean;
  error: string | null;
  clientData: ClientData | null;
  agents: AdminAgent[];
  totalAgents: number;
  emailTemplates: EmailTemplatesResponse | null;
  clientUsage: ClientUsageData | null;
  setError: (error: string | null) => void;
  setActiveTeamId: (teamId: string | null) => void;
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
  fetchClientUsage: (params: { clientId: string }) => Promise<ClientUsageData>;
}

// Add a type for the expected result
interface SignUpResult {
  teamId: string;
  signUpVia: { via: string; handle: string };
  agents: AdminAgent[];
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

  // Helper function to handle signup response
  const handleSignupResponse = async (email: string) => {
    console.log("Starting handleSignupResponse with email:", email);
    const signupRes = await signUpClient("google", email);
    console.log("signupRes", signupRes);

    if (signupRes.error) {
      console.log("Signup response has error:", signupRes.error);
      const errorMessage =
        typeof signupRes.result === "string"
          ? signupRes.result
          : JSON.stringify(signupRes.result);

      if (
        errorMessage.includes("unauthorized") ||
        errorMessage.includes("invalid")
      ) {
        console.log("Unauthorized or invalid error detected");
        if (typeof window !== "undefined") {
          localStorage.removeItem("adminEmail");
        }
        set({ isAdminLoggedIn: false, isLoading: false });
        return false;
      }

      set({ error: errorMessage, isLoading: false });
      return false;
    }

    console.log("Checking signupRes.result type:", typeof signupRes.result);
    if (
      typeof signupRes.result === "object" &&
      signupRes.result !== null &&
      "teamId" in signupRes.result
    ) {
      console.log("Valid signup result object found");
      const result = signupRes.result as SignUpResult;
      const adminId = result.teamId;
      const tempAgents = result.agents;

      console.log("result", result);
      console.log("adminId", adminId);
      console.log("tempAgents", tempAgents);

      // Fetch client information
      console.log("Fetching client information for adminId:", adminId);
      const clientResponse = await getTeamDetails(adminId, adminId);
      console.log("Client response:", clientResponse);

      // Set all state updates in one go to avoid multiple re-renders
      set({
        adminId,
        activeTeamId: adminId,
        adminEmail: result.signUpVia.handle,
        agents: tempAgents,
        totalAgents: tempAgents.length,
        isAdminLoggedIn: true,
        isLoading: false,
        error: null,
        clientData: clientResponse.error ? null : clientResponse,
      });

      console.log("State updated successfully");
      return true;
    }
    console.log("Invalid signup result format");
    return false;
  };

  // Call initialization
  initializeStore();

  return {
    // Initial state
    adminId: null,
    adminEmail: null,
    activeTeamId: null,
    isAdminLoggedIn: false,
    isAgentsLoaded: false,
    agents: [],
    isLoading: false,
    error: null,
    totalAgents: 0,
    emailTemplates: null,
    clientData: null,
    clientInfo: null,
    clientUsage: null,

    // Basic setters
    setError: (error) => set({ error }),
    setActiveTeamId: (teamId) => set({ activeTeamId: teamId }),

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
        const isSignupSuccess = await handleSignupResponse(storedEmail);

        if (isSignupSuccess) {
          // Fetch usage data after adminId is set
          await get().fetchClientUsage({ clientId: get().adminId! });
        }

        return isSignupSuccess;
      } catch (error) {
        console.error("Error restoring session:", error);
        if (
          error instanceof Error &&
          (error.message.includes("unauthorized") ||
            error.message.includes("invalid"))
        ) {
          localStorage.removeItem("adminEmail");
          set({ isAdminLoggedIn: false, isLoading: false });
        } else {
          set({ error: (error as Error).message, isLoading: false });
        }
        return false;
      }
    },

    handleGoogleLoginSuccess: async (credentialResponse: any) => {
      try {
        const userInfo = credentialResponse.userInfo;

        if (!userInfo || !userInfo.email) {
          throw new Error("Invalid user info received from Google");
        }

        localStorage.setItem("adminEmail", userInfo.email);
        const isSignupSuccess = await handleSignupResponse(userInfo.email);

        if (isSignupSuccess) {
          toast.success(`Successfully signed in!`);
          // Fetch usage data after adminId is set
          await get().fetchClientUsage({ clientId: get().adminId! });
        } else {
          toast.error("Failed to complete signup process");
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
      const activeTeamId = get().activeTeamId;

      if (!activeTeamId || !adminId) {
        throw new Error("Admin ID is not set");
      }
      const clientData = await getTeamDetails(adminId, activeTeamId);
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

        if (!response?.error && response?.result) {
          set({ emailTemplates: response.result });
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

    fetchClientUsage: async (params: { clientId: string }) => {
      try {
        const usage = await getTeamUsage(params.clientId);
        set({ clientUsage: usage });
        return usage;
      } catch (error) {
        toast.error("Failed to fetch client usage");
        throw error;
      }
    },
  };
});
