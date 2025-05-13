import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useUserStore } from "../../../store/useUserStore";
import toast from "react-hot-toast";

interface LoginCardProps {
  theme: {
    isDark: boolean;
    highlightColor: string;
  };
}

export const LoginCard: React.FC<LoginCardProps> = ({ theme }) => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsGoogleLoaded(true);
    };
    script.onerror = (error) => {
      console.error("Error loading Google Identity Services script:", error);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLoginClick = () => {
    if (!isGoogleLoaded) {
      toast.error("Google login is not ready yet. Please try again.");
      return;
    }

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    if (!clientId) {
      toast.error("Google login is not configured");
      return;
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        callback: (response: { error?: string; access_token: string }) => {
          if (response.error) {
            toast.error("Login failed. Please try again.");
          } else {
            // Get user info using the access token
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            })
              .then((res) => res.json())
              .then((userInfo) => {
                useUserStore.getState().handleGoogleLoginSuccess({
                  credential: response.access_token,
                  userInfo: userInfo,
                });
              })
              .catch((error) => {
                toast.error("Failed to get user info");
                useUserStore.getState().handleGoogleLoginError();
              });
          }
        },
        scope: "email profile",
      });

      client.requestAccessToken();
    } catch (error) {
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div
        className="w-full max-w-md p-6 rounded-xl"
        style={{
          backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
          border: `1px solid ${theme.highlightColor}`,
        }}
      >
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: theme.highlightColor }}
          >
            <User
              className="h-8 w-8"
              style={{ color: theme.isDark ? "black" : "white" }}
            />
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: theme.isDark ? "white" : "black" }}
          >
            Login Required
          </h2>
          <p
            className="text-sm"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            Please log in to continue with your purchase
          </p>
        </div>

        <button
          onClick={handleLoginClick}
          className="w-full py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          style={{
            backgroundColor: theme.highlightColor,
            color: theme.isDark ? "black" : "white",
          }}
        >
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};
