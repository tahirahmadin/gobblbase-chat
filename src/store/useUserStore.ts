import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signUpUser, getUserDetails } from "../lib/serverActions";

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
  userDetails: UserDetails | null;
  userRole: string | null;

  // Actions
  setUserEmail: (email: string) => void;
  setUserId: (id: string) => void;
  setIsLoggedIn: (status: boolean) => void;
  setUserDetails: (details: UserDetails | null) => void;
  setUserRole: (role: string | null) => void;

  // Auth actions
  handleGoogleLoginSuccess: (response: {
    credential: string;
    userInfo: any;
  }) => Promise<void>;
  handleGoogleLoginError: () => void;
  logout: () => void;
  fetchUserDetails: (userId: string) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      isLoggedIn: false,
      userId: null,
      userRole: null,
      userEmail: null,
      userDetails: null,

      // Basic setters
      setUserEmail: (email) => set({ userEmail: email }),
      setUserId: (id) => set({ userId: id }),
      setIsLoggedIn: (status) => set({ isLoggedIn: status }),
      setUserDetails: (details) => set({ userDetails: details }),
      setUserRole: (role) => set({ userRole: role }),

      // Complex actions
      handleGoogleLoginSuccess: async (response: {
        credential: string;
        userInfo: any;
      }) => {
        try {
          const userInfo = response.userInfo;
          set({ userEmail: userInfo.email, isLoggedIn: true });

          // Call the signUpUser API
          const signUpResponse = await signUpUser("google", userInfo.email);

          if (signUpResponse.error) {
            toast.error("Failed to complete signup process");
            console.error("Signup failed:", signUpResponse.result);
          } else {
            // Store the userId from the response
            if (
              typeof signUpResponse.result !== "string" &&
              signUpResponse.result._id
            ) {
              const userId = signUpResponse.result._id;
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

      logout: () => {
        // Clear the state
        set({
          isLoggedIn: false,
          userEmail: null,
          userId: null,
          userDetails: null,
          userRole: null,
        });

        // Clear the persisted storage
        localStorage.removeItem("user-storage");
      },
    }),
    {
      name: "user-storage",
    }
  )
);
