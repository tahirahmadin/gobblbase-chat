import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchClientAgents } from "../lib/serverActions";
import { Agent } from "../types";

interface UserState {
  isLoggedIn: boolean;
  userEmail: string | null;
  clientId: string | null;
  activeAgentId: string | null;
  currentAgentData: Agent | null;
  activeAgentUsername: string | null;
  calendlyUrl: string;
  agents: Agent[];
  setUserEmail: (email: string) => void;
  setClientId: (id: string) => void;
  setIsLoggedIn: (status: boolean) => void;
  setActiveAgentId: (id: string | null) => void;
  setActiveAgentUsername: (username: string | null) => void;
  setCalendlyUrl: (url: string) => void;
  setCurrentAgentData: (data: Agent | null) => void;
  addAgent: (agent: Omit<Agent, "agentId">) => void;
  fetchAndSetAgents: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userEmail: null,
      clientId: null,
      activeAgentId: null,
      currentAgentData: null,
      setCurrentAgentData: (data: Agent | null) =>
        set({ currentAgentData: data }),
      activeAgentUsername: null,
      calendlyUrl: "",
      agents: [],
      setUserEmail: (email) => set({ userEmail: email }),
      setClientId: (id) => set({ clientId: id }),
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
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
        const { clientId } = get();
        if (!clientId) return;

        try {
          const agents = await fetchClientAgents(clientId);
          set({ agents });
        } catch (error) {
          console.error("Failed to fetch agents:", error);
        }
      },
      logout: () =>
        set({
          isLoggedIn: false,
          userEmail: null,
          clientId: null,
          activeAgentId: null,
          activeAgentUsername: null,
          calendlyUrl: "",
          agents: [],
        }),
    }),
    {
      name: "user-storage", // unique name for localStorage key
    }
  )
);
