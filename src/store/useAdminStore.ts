import { create } from "zustand";
import {
  fetchClientAgents,
  deleteAgent,
  signUpClient,
  getEmailTemplates,
  updateEmailTemplates,
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
  emailTemplates: any[];
  emailTemplatesLoading?: boolean;
  emailTemplatesError?: string | null;
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
  ) => Promise<void>;
  setEmailTemplates: (templates: any[]) => void;
  isAgentsLoaded: boolean;
  // Session management
  initializeSession: () => Promise<boolean>;
}

// Add a type for the expected result
interface SignUpResult {
  _id: string;
  signUpVia: { via: string; handle: string };
  totalAgents?: number;
  [key: string]: any;
}

export const useAdminStore = create<AdminState>()((set, get) => ({
  // Initial state
  adminId: null,
  adminEmail: null,
  isAdminLoggedIn: false,
  isAgentsLoaded: false,
  agents: [],
  isLoading: false,
  error: null,
  totalAgents: 0,
  emailTemplates: [],
  emailTemplatesLoading: false,
  emailTemplatesError: null,

  // Basic setters
  setError: (error) => set({ error }),

  // Session management
  initializeSession: async () => {
    const storedEmail = localStorage.getItem("adminEmail");
    if (!storedEmail) {
      set({ isAdminLoggedIn: false });
      return false;
    }

    try {
      set({ isLoading: true });
      const response = await signUpClient("google", storedEmail);

      if (response.error) {
        console.error("Session restoration failed:", response.result);
        localStorage.removeItem("adminEmail");
        set({ isAdminLoggedIn: false, isLoading: false });
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

        set({
          adminId,
          adminEmail: result.signUpVia.handle,
          isAdminLoggedIn: true,
          totalAgents: tempAgents.length,
          agents: tempAgents,
          isLoading: false,
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error restoring session:", error);
      localStorage.removeItem("adminEmail");
      set({ isAdminLoggedIn: false, isLoading: false });
      return false;
    }
  },

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

      // Store email in localStorage for session management
      localStorage.setItem("adminEmail", userInfo.email);

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
          agents: tempAgents,
          isLoading: false,
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
      emailTemplates: [],
      emailTemplatesLoading: false,
      emailTemplatesError: null,
    });

    // Clear the stored email
    localStorage.removeItem("adminEmail");
  },

  // Email template actions
  fetchEmailTemplates: async (agentId: string) => {
    set({ emailTemplatesLoading: true, emailTemplatesError: null });
    try {
      const res = await getEmailTemplates(agentId);
      if (res && res.result) {
        // Flatten the result object into an array for UI
        const arr = Object.entries(res.result)
          .filter(
            ([key]) => key !== "_id" && key !== "agentId" && key !== "__v"
          )
          .map(([key, value]: any, idx) => ({
            id: idx + 1,
            category: key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str: string) => str.toUpperCase()),
            name: value.subText || key,
            enabled: value.isActive,
            subject: value.subject,
            body: value.body,
            rawKey: key,
          }));
        set({ emailTemplates: arr, emailTemplatesLoading: false });
      } else {
        set({ emailTemplates: [], emailTemplatesLoading: false });
      }
    } catch (err: any) {
      set({
        emailTemplatesError: "Failed to load email templates",
        emailTemplatesLoading: false,
      });
    }
  },

  updateEmailTemplate: async (
    agentId: string,
    updatedData: any,
    emailTemplateId: string
  ) => {
    set({ emailTemplatesLoading: true, emailTemplatesError: null });
    try {
      await updateEmailTemplates(agentId, updatedData, emailTemplateId);
      // Optionally, you can refetch templates after update
      await get().fetchEmailTemplates(agentId);
      toast.success("Email template updated successfully");
    } catch (err: any) {
      set({
        emailTemplatesError: "Failed to update email template",
        emailTemplatesLoading: false,
      });
      toast.error("Failed to update email template");
    } finally {
      set({ emailTemplatesLoading: false });
    }
  },

  setEmailTemplates: (templates) => set({ emailTemplates: templates }),
}));
