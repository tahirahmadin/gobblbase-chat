import { create } from "zustand";
import { persist } from "zustand/middleware";
import { signUpClient } from "../lib/serverActions";
import { toast } from "react-hot-toast";

interface AdminState {
  isAdminLoggedIn: boolean;
  adminEmail: string | null;
  adminId: string | null;
  setAdminEmail: (email: string) => void;
  setAdminId: (id: string) => void;
  setIsAdminLoggedIn: (status: boolean) => void;
  handleGoogleLoginSuccess: (credentialResponse: any) => Promise<void>;
  handleGoogleLoginError: () => void;
  adminLogout: () => void;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAdminLoggedIn: false,
      adminEmail: null,
      adminId: null,
      setAdminEmail: (email) => set({ adminEmail: email }),
      setAdminId: (id) => set({ adminId: id }),
      setIsAdminLoggedIn: (status) => set({ isAdminLoggedIn: status }),
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
          set({ adminEmail: userInfo.email, isAdminLoggedIn: true });

          // Call the signUpClient API
          const response = await signUpClient("google", userInfo.email);

          if (response.error) {
            toast.error("Failed to complete admin signup process");
            console.error("Admin signup failed:", response.result);
          } else {
            // Store the adminId from the response
            if (typeof response.result !== "string" && response.result._id) {
              set({ adminId: response.result._id });
            }
            toast.success("Successfully signed in as admin!");
            console.log("Admin signed in successfully:", response.result);
          }
        } catch (error) {
          console.error("Error during admin Google login:", error);
          toast.error("An error occurred during admin login");
        }
      },
      handleGoogleLoginError: () => {
        console.log("Admin Login Failed");
        toast.error("Google login failed for admin");
      },
      adminLogout: () => {
        set({
          isAdminLoggedIn: false,
          adminEmail: null,
          adminId: null,
        });
        toast.success("Admin logged out successfully");
      },
    }),
    {
      name: "admin-storage", // unique name for localStorage key
    }
  )
);
