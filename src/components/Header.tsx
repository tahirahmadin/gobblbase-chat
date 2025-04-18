import React from "react";
import { LogIn, User, Upload, Bot } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../store/useUserStore";
import { signUpClient } from "../lib/serverActions";
import { toast } from "react-hot-toast";

export default function Header() {
  const { isLoggedIn, userEmail, setUserEmail, setIsLoggedIn, setClientId } =
    useUserStore();

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
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
      setUserEmail(userInfo.email);
      setIsLoggedIn(true);

      // Call the signUpClient API
      const response = await signUpClient("google", userInfo.email);

      if (response.error) {
        toast.error("Failed to complete signup process");
        console.error("Signup failed:", response.result);
      } else {
        // Store the clientId from the response
        if (typeof response.result !== "string" && response.result._id) {
          setClientId(response.result._id);
        }
        toast.success("Successfully signed up!");
        console.log("User signed up successfully:", response.result);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      toast.error("An error occurred during login");
    }
  };

  const handleGoogleLoginError = () => {
    console.log("Login Failed");
    toast.error("Google login failed");
  };

  return (
    <header className="bg-white border-b border-gray-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
              <Bot className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              KiFor.ai
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 text-gray-700">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50">
                  <User className="h-4 w-4 text-primary-600" />
                </div>
                <span className="text-sm font-medium">{userEmail}</span>
              </div>
            ) : (
              <GoogleOAuthProvider
                clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
              >
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={handleGoogleLoginError}
                  useOneTap
                />
              </GoogleOAuthProvider>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
