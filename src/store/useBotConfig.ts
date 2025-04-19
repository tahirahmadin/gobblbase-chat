import { create } from "zustand";
import { getAgentDetails } from "../lib/serverActions";

interface BotConfig {
  agentId?: string;
  logo?: string;
  username?: string;
  name: string;
  calendlyUrl?: string;
  systemPrompt?: string;
  model?: string;
  themeColors?: {
    headerColor: string;
    headerTextColor: string;
    headerNavColor: string;
    headerIconColor: string;
    chatBackgroundColor: string;
    bubbleAgentBgColor: string;
    bubbleAgentTextColor: string;
    bubbleAgentTimeTextColor: string;
    bubbleUserBgColor: string;
    bubbleUserTextColor: string;
    bubbleUserTimeTextColor: string;
    inputCardColor: string;
    inputBackgroundColor: string;
    inputTextColor: string;
  };
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
