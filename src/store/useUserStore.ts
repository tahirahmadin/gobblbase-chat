import { create } from "zustand";
import { signUpUser, getUserDetails } from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { UserDetails } from "../types";

interface UserState {
  // User authentication state
  isLoggedIn: boolean;
  userEmail: string | null;
  userId: string | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  setUserEmail: (email: string) => void;
  setUserId: (id: string) => void;
  setIsLoggedIn: (status: boolean) => void;
  setUserDetails: (details: UserDetails | null) => void;
  setError: (error: string | null) => void;

  // Auth actions
  handleGoogleLoginSuccess: (response: {
    credential: string;
    userInfo: any;
  }) => Promise<void>;
  handleGoogleLoginError: () => void;
  logout: () => void;
  fetchUserDetails: (userId: string) => Promise<void>;
  initializeSession: () => Promise<boolean>;
}

export const useUserStore = create<UserState>()((set, get) => {
  // Initialize session when store is created
  const initializeStore = async () => {
    try {
      const storedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("userEmail")
          : null;
      if (storedEmail) {
        await get().initializeSession();
      }
      set({ isInitialized: true });
    } catch (error) {
      console.warn("Failed to initialize user store:", error);
      set({ isInitialized: true });
    }
  };

  // Call initialization
  initializeStore();

  return {
    // Initial state
    isLoggedIn: false,
    userId: null,
    userEmail: null,
    userDetails: null,
    isLoading: false,
    error: null,
    isInitialized: false,

    // Basic setters
    setUserEmail: (email) => set({ userEmail: email }),
    setUserId: (id) => set({ userId: id }),
    setIsLoggedIn: (status) => set({ isLoggedIn: status }),
    setUserDetails: (details) => set({ userDetails: details }),
    setError: (error) => set({ error }),

    // Session management
    initializeSession: async () => {
      try {
        const storedEmail =
          typeof window !== "undefined"
            ? localStorage.getItem("userEmail")
            : null;
        if (!storedEmail) {
          set({ isLoggedIn: false, isInitialized: true });
          return false;
        }

        set({ isLoading: true });
        const response = await signUpUser("google", storedEmail);

        if (response.error) {
          console.error("Session restoration failed:", response.result);
          const errorMessage =
            typeof response.result === "string"
              ? response.result
              : JSON.stringify(response.result);

          if (
            errorMessage.includes("unauthorized") ||
            errorMessage.includes("invalid")
          ) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("userEmail");
            }
            set({ isLoggedIn: false, isLoading: false, isInitialized: true });
          } else {
            set({ error: errorMessage, isLoading: false, isInitialized: true });
          }
          return false;
        }

        if (
          typeof response.result === "object" &&
          response.result !== null &&
          "_id" in response.result
        ) {
          const userId = response.result._id;
          const userDetails = await getUserDetails(userId);

          set({
            userId,
            userEmail: response.result.signUpVia.handle,
            isLoggedIn: true,
            userDetails,
            isLoading: false,
            error: null,
            isInitialized: true,
          });
          return true;
        }
        set({ isInitialized: true });
        return false;
      } catch (error) {
        console.error("Error restoring session:", error);
        if (
          error instanceof Error &&
          (error.message.includes("unauthorized") ||
            error.message.includes("invalid"))
        ) {
          if (typeof window !== "undefined") {
            localStorage.removeItem("userEmail");
          }
          set({ isLoggedIn: false, isLoading: false, isInitialized: true });
        } else {
          set({
            error: (error as Error).message,
            isLoading: false,
            isInitialized: true,
          });
        }
        return false;
      }
    },

    // Complex actions
    handleGoogleLoginSuccess: async (response: {
      credential: string;
      userInfo: any;
    }) => {
      try {
        const userInfo = response.userInfo;
        if (!userInfo || !userInfo.email) {
          throw new Error("Invalid user info received from Google");
        }

        // Store email in localStorage for session management
        localStorage.setItem("userEmail", userInfo.email);

        // Call the signUpUser API
        const signUpResponse = await signUpUser("google", userInfo.email);

        if (signUpResponse.error) {
          toast.error("Failed to complete signup process");
          console.error("Signup failed:", signUpResponse.result);
          return;
        }

        if (
          typeof signUpResponse.result === "object" &&
          signUpResponse.result !== null &&
          "_id" in signUpResponse.result
        ) {
          const userId = signUpResponse.result._id;
          const userDetails = await getUserDetails(userId);

          set({
            userId,
            userEmail: signUpResponse.result.signUpVia.handle,
            isLoggedIn: true,
            userDetails,
            error: null,
            isInitialized: true,
          });

          toast.success(`Successfully signed in`);
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
        set({ error: (error as Error).message });
      }
    },

    logout: () => {
      // Clear the state
      set({
        isLoggedIn: false,
        userEmail: null,
        userId: null,
        userDetails: null,
        error: null,
        isInitialized: true,
      });

      // Clear the stored email
      localStorage.removeItem("userEmail");
    },
  };
});
