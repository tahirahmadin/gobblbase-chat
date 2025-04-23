import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signUpUser } from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { Agent } from "../types";

interface BotConfigState {
  isBotUserLoggedIn: boolean;
  botUserEmail: string | null;
  botUserId: string | null;
  activeBotId: string | null;
  activeBotUsername: string | null;
  currentBotData: Agent | null;
  config: any | null;
  isLoading: boolean;
  fetchConfig: (username: string) => Promise<void>;
  setBotUserEmail: (email: string) => void;
  setBotUserId: (id: string) => void;
  setIsBotUserLoggedIn: (status: boolean) => void;
  setActiveBotId: (id: string | null) => void;
  setActiveBotUsername: (username: string | null) => void;
  setCurrentBotData: (data: Agent | null) => void;
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
  handleGoogleLoginError: () => void;
  botUserLogout: () => void;
}

export const useBotConfig = create<BotConfigState>()(
  persist(
    (set, get) => ({
      isBotUserLoggedIn: false,
      botUserEmail: null,
      botUserId: null,
      activeBotId: null,
      activeBotUsername: null,
      currentBotData: null,
      config: null,
      isLoading: false,
      fetchConfig: async (username: string) => {
        set({ isLoading: true });
        try {
          // Add your fetch config logic here
          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          console.error("Error fetching config:", error);
        }
      },
      setBotUserEmail: (email) => set({ botUserEmail: email }),
      setBotUserId: (id) => set({ botUserId: id }),
      setIsBotUserLoggedIn: (status) => set({ isBotUserLoggedIn: status }),
      setActiveBotId: (id) => set({ activeBotId: id }),
      setActiveBotUsername: (username) => set({ activeBotUsername: username }),
      setCurrentBotData: (data) => set({ currentBotData: data }),
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
          set({ botUserEmail: userInfo.email, isBotUserLoggedIn: true });

          // Call the signUpUser API
          const response = await signUpUser("google", userInfo.email);

          if (response.error) {
            toast.error("Failed to complete bot user signup process");
            console.error("Bot user signup failed:", response.result);
          } else {
            // Store the botUserId from the response
            if (typeof response.result !== "string" && response.result._id) {
              set({ botUserId: response.result._id });
            }
            toast.success("Successfully signed in as bot user!");
            console.log("Bot user signed in successfully:", response.result);
          }
        } catch (error) {
          console.error("Error during bot user Google login:", error);
          toast.error("An error occurred during bot user login");
        }
      },
      handleGoogleLoginError: () => {
        console.log("Bot User Login Failed");
        toast.error("Google login failed for bot user");
      },
      botUserLogout: () => {
        set({
          isBotUserLoggedIn: false,
          botUserEmail: null,
          botUserId: null,
          activeBotId: null,
          activeBotUsername: null,
          currentBotData: null,
        });
        toast.success("Bot user logged out successfully");
      },
    }),
    {
      name: "bot-config-storage", // unique name for localStorage key
    }
  )
);
