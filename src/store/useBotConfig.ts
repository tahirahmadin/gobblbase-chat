import { create } from "zustand";
import { getAgentDetails } from "../lib/serverActions";

interface BotConfig {
  logo?: string;
  username?: string;
  calendlyUrl?: string;
  systemPrompt?: string;
  model?: string;
  [key: string]: any;
}

interface BotConfigStore {
  config: BotConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchConfig: (agentId: string) => Promise<void>;
}

export const useBotConfig = create<BotConfigStore>((set) => ({
  config: null,
  isLoading: false,
  error: null,
  fetchConfig: async (username: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await getAgentDetails(null, username);
      set({ config: response, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}));
