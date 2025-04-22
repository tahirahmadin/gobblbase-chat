import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  fetchClientAgents,
  signUpUser,
  getUserDetails,
} from "../lib/serverActions";
import { Agent } from "../types";
import { toast } from "react-hot-toast";

interface UserDetails {
  _id: string;
  email: string;
  name?: string;
  avatar?: string;
  signUpVia: {
    via: string;
    handle: string;
  };
}

interface UserState {
  // User authentication state
  isLoggedIn: boolean;
  userEmail: string | null;
  userId: string | null;
  userRole: "user" | "admin" | null;
  userDetails: UserDetails | null;

  // Agent related state
  activeAgentId: string | null;
  currentAgentData: Agent | null;
  activeAgentUsername: string | null;
  calendlyUrl: string;
  agents: Agent[];

  // Actions
  setUserEmail: (email: string) => void;
  setUserId: (id: string) => void;
  setIsLoggedIn: (status: boolean) => void;
  setUserRole: (role: "user" | "admin" | null) => void;
  setUserDetails: (details: UserDetails | null) => void;

  // Agent related actions
  setActiveAgentId: (id: string | null) => void;
  setActiveAgentUsername: (username: string | null) => void;
  setCalendlyUrl: (url: string) => void;
  setCurrentAgentData: (data: Agent | null) => void;
  addAgent: (agent: Omit<Agent, "agentId">) => void;
  fetchAndSetAgents: () => Promise<void>;

  // Auth actions
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
  handleGoogleLoginError: () => void;
  logout: () => void;
  fetchUserDetails: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoggedIn: false,
      userEmail: null,
      userId: null,
      userRole: null,
      userDetails: null,
      activeAgentId: null,
      currentAgentData: null,
      activeAgentUsername: null,
      calendlyUrl: "",
      agents: [],

      // Basic setters
      setUserEmail: (email) => set({ userEmail: email }),
      setUserId: (id) => set({ userId: id }),
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      setUserRole: (role) => set({ userRole: role }),
      setUserDetails: (details) => set({ userDetails: details }),
      setActiveAgentId: (id) => {
        const agent = get().agents.find((a) => a.agentId === id);
        set({
          activeAgentId: id,
          activeAgentUsername: agent?.username || null,
        });
      },
      setActiveAgentUsername: (username) =>
        set({ activeAgentUsername: username }),
      setCalendlyUrl: (url) => set({ calendlyUrl: url }),
      setCurrentAgentData: (data) => set({ currentAgentData: data }),

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
          set({ userEmail: userInfo.email, isLoggedIn: true });

          // Call the signUpUser API
          const response = await signUpUser("google", userInfo.email);

          if (response.error) {
            toast.error("Failed to complete signup process");
            console.error("Signup failed:", response.result);
          } else {
            // Store the userId from the response
            if (typeof response.result !== "string" && response.result._id) {
              const userId = response.result._id;
              set({ userId });

              // Fetch user details
              const userDetails = await getUserDetails(userId);
              set({ userDetails });

              // Set role based on email domain or other criteria
              const isAdmin = userInfo.email.endsWith("@gobbl.ai"); // Example criteria
              set({ userRole: isAdmin ? "admin" : "user" });
            }
            toast.success(
              `Successfully signed in${
                get().userRole === "admin" ? " as admin" : ""
              }!`
            );
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

      fetchUserDetails: async (userId: string) => {
        try {
          const details = await getUserDetails(userId);
          set({ userDetails: details });
        } catch (error) {
          console.error("Failed to fetch user details:", error);
        }
      },

      addAgent: (agent) =>
        set((state) => ({
          agents: [
            ...state.agents,
            {
              ...agent,
              agentId: Date.now().toString(),
            },
          ],
        })),

      fetchAndSetAgents: async () => {
        const { userId } = get();
        if (!userId) return;

        try {
          const agents = await fetchClientAgents(userId);
          set({ agents });
        } catch (error) {
          console.error("Failed to fetch agents:", error);
        }
      },

      logout: () =>
        set({
          isLoggedIn: false,
          userEmail: null,
          userId: null,
          userRole: null,
          userDetails: null,
          activeAgentId: null,
          activeAgentUsername: null,
          calendlyUrl: "",
          agents: [],
          currentAgentData: null,
        }),
    }),
    {
      name: "user-storage",
    }
  )
);
