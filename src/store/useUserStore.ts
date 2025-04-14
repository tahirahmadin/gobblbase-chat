import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchClientAgents } from "../lib/serverActions";

interface Agent {
  name: string;
  agentId: string;
}

interface UserState {
  isLoggedIn: boolean;
  userEmail: string | null;
  clientId: string | null;
  activeAgentId: string | null;
  agents: Agent[];
  setUserEmail: (email: string) => void;
  setClientId: (id: string) => void;
  setIsLoggedIn: (status: boolean) => void;
  setActiveAgentId: (id: string | null) => void;
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
      agents: [],
      setUserEmail: (email) => set({ userEmail: email }),
      setClientId: (id) => set({ clientId: id }),
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      setActiveAgentId: (id) => set({ activeAgentId: id }),
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
          agents: [],
        }),
    }),
    {
      name: "user-storage", // unique name for localStorage key
    }
  )
);
