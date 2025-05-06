import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  getAgentDetails,
  updateAgentUsername,
  uploadProfilePicture,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { Theme, BotConfig } from "../types";

interface BotConfigState {
  activeBotId: string | null;
  activeBotData: BotConfig | null;

  isLoading: boolean;
  error: string | null;

  refetchBotData: number;
  setRefetchBotData: () => void;

  setActiveBotId: (id: string | null) => void;
  setActiveBotData: (data: BotConfig | null) => void;
  fetchBotData: (
    agentIdOrUsername: string,
    isFetchByUsername: boolean
  ) => Promise<void>;
  updateBotUsernameViaStore: (
    inputBotId: string,
    inputUsername: string
  ) => Promise<void>;
  updateBotLogoViaStore: (
    inputBotId: string,
    inputProfilePicture: File
  ) => Promise<void>;
  clearBotConfig: () => void;
}

export const useBotConfig = create<BotConfigState>()(
  persist(
    (set, get) => ({
      activeBotId: null,
      activeBotData: null,
      refetchBotData: 0,

      isLoading: false,
      error: null,

      setRefetchBotData: () =>
        set({ refetchBotData: get().refetchBotData + 1 }),
      setActiveBotId: async (id) => {
        console.log("Setting activeBotId to:", id);

        set({ activeBotId: id });

        if (id) {
          try {
            set({ isLoading: true, error: null });
            console.log("Fetching data for bot ID:", id);

            // Fetch the bot data
            let response = await getAgentDetails(id, false);

            // Extract only the required fields from the response

            set({ activeBotData: response, isLoading: false });
          } catch (error) {
            console.error("Error fetching bot data:", error);
            set({ error: (error as Error).message, isLoading: false });
          }
        }
      },
      clearBotConfig: () => {
        set({
          activeBotId: null,
          activeBotData: null,
          refetchBotData: 0,
          isLoading: false,
          error: null,
        });
        localStorage.removeItem("bot-config-storage");
      },
      setActiveBotData: (data) => set({ activeBotData: data }),

      fetchBotData: async (
        agentIdOrUsername: string,
        isFetchByUsername: boolean
      ) => {
        try {
          set({ isLoading: true, error: null });
          let response = await getAgentDetails(
            agentIdOrUsername,
            isFetchByUsername
          );

          set({
            activeBotData: response,
          });
          set({
            activeBotId: response.agentId,
            isLoading: false,
          });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
          toast.error("Failed to fetch bot configuration");
        }
      },

      updateBotUsernameViaStore: async (
        inputBotId: string,
        inputUsername: string
      ) => {
        try {
          const response = await updateAgentUsername(inputBotId, inputUsername);
          if (response.error) {
            toast.error(response.error);
          } else {
            const currentData = get().activeBotData;
            if (currentData) {
              set({
                activeBotData: {
                  ...currentData,
                  username: inputUsername,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error updating username:", error);
        }
      },
      updateBotLogoViaStore: async (
        inputBotId: string,
        inputProfilePicture: File
      ) => {
        try {
          const response = await uploadProfilePicture(
            inputBotId,
            inputProfilePicture
          );
          if (response.error) {
            toast.error(response.error);
          } else {
            const currentData = get().activeBotData;
            if (currentData) {
              set({
                activeBotData: {
                  ...currentData,
                  logo: response,
                },
              });
            }
          }
        } catch (error) {
          console.error("Error updating username:", error);
        }
      },
    }),
    {
      name: "bot-config-storage",
    }
  )
);
