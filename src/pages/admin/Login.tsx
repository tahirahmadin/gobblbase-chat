import React, { useEffect, useRef } from "react";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import CreateNewBot from "./CreateNewBot";

// Add type definitions for Google Identity Services
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            ux_mode: string;
          }) => void;
          prompt: (
            callback: (notification: {
              isNotDisplayed: () => boolean;
              isSkippedMoment: () => boolean;
            }) => void
          ) => void;
        };
      };
    };
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAdminLoggedIn,
    agents,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    adminLogout,
  } = useAdminStore();

  // Only initialize once
  const initialized = useRef(false);

  useEffect(() => {
    adminLogout();
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn && agents.length > 0) {
      navigate("/admin/dashboard/profile");
    }
  }, [isAdminLoggedIn, agents]);

  // Load Google OAuth2 script and initialize
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const scriptId = "google-oauth2";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.id = scriptId;
      script.onload = () => {
        if (
          window.google &&
          window.google.accounts &&
          window.google.accounts.oauth2
        ) {
          const client = window.google.accounts.oauth2.initTokenClient({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
            scope: "email profile",
            callback: async (response: any) => {
              if (response && response.access_token) {
                try {
                  // Fetch user info using the access token
                  const userInfoResponse = await fetch(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    {
                      headers: {
                        Authorization: `Bearer ${response.access_token}`,
                      },
                    }
                  );
                  const userInfo = await userInfoResponse.json();

                  // Format the response to match what handleGoogleLoginSuccess expects
                  const credentialResponse = {
                    credential: response.access_token,
                    userInfo: userInfo,
                  };

                  handleGoogleLoginSuccess(credentialResponse);
                } catch (error) {
                  console.error("Error fetching user info:", error);
                  handleGoogleLoginError();
                }
              } else {
                handleGoogleLoginError();
              }
            },
          });
          // Store the client for later use
          (window as any).googleOAuthClient = client;
        }
      };
      document.body.appendChild(script);
    }
  }, [handleGoogleLoginSuccess, handleGoogleLoginError]);

  const handleCustomGoogleLogin = () => {
    const client = (window as any).googleOAuthClient;
    if (client) {
      client.requestAccessToken();
    } else {
      handleGoogleLoginError();
    }
  };

  const renderSignUpCard = () => (
    <div className="w-[500px] bg-[#e9ecf7] border-2 border-black shadow-[4px_4px_0_0_#222b5f] p-12 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-2 text-center">Login or Sign Up</h2>
      <p className="text-sm text-center mb-8">
        Connect with your email credentials
      </p>
      <button
        onClick={handleCustomGoogleLogin}
        className="flex items-center w-full max-w-[300px] mb-4 px-4 py-2 bg-[#7fffa1] border border-black rounded shadow hover:bg-[#6ee7b7] transition justify-center"
      >
        <span className="mr-2">
          {/* Google Icon SVG */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <g>
              <path
                fill="#4285F4"
                d="M43.6 20.5H42V20.4H24v7.2h11.2C34.7 32.1 29.8 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.6 0 5 .9 6.9 2.4l5.8-5.8C33.3 7.1 28.9 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20c11.1 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"
              />
              <path
                fill="#34A853"
                d="M6.3 14.7l5.9 4.3C14.1 16.1 18.7 13 24 13c2.6 0 5 .9 6.9 2.4l5.8-5.8C33.3 7.1 28.9 5 24 5c-7.2 0-13.4 4.1-16.7 9.7z"
              />
              <path
                fill="#FBBC05"
                d="M24 44c5.8 0 11.1-2.2 15.1-5.9l-7-5.7C29.8 35 27 36 24 36c-5.7 0-10.5-3.7-12.2-8.8l-6.9 5.3C7.9 39.9 15.4 44 24 44z"
              />
              <path
                fill="#EA4335"
                d="M43.6 20.5H42V20.4H24v7.2h11.2c-1.2 3.2-4.2 5.4-7.2 5.4-2.6 0-5-.9-6.9-2.4l-5.8 5.8C14.7 40.9 19.1 44 24 44c8.6 0 16.1-4.1 19.7-10.3l-7-5.7c-1.7 3.1-5.1 5.1-8.7 5.1z"
              />
            </g>
          </svg>
        </span>
        LOGIN WITH GOOGLE
      </button>
      <button
        disabled={true}
        className="flex items-center w-full max-w-[300px] px-4 py-2 bg-[#d6ffe0] border border-black rounded shadow hover:bg-[#bbf7d0] transition justify-center text-xs"
      >
        <span className="mr-2">
          {/* Email Icon SVG */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </span>
        LOGIN WITH EMAIL(coming soon)
      </button>
    </div>
  );

  // --- CONDITIONAL RENDER ---
  const renderContent = () => {
    if (!isAdminLoggedIn) {
      return renderSignUpCard();
    }
    if (isAdminLoggedIn && agents.length === 0) {
      return <CreateNewBot />;
    }
    return null;
  };

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-[#aeb4f7] flex flex-col">
      {/* Black top strip */}
      <div className="w-full py-2 px-4 flex items-center">
        <span className="text-black text-lg font-bold tracking-tight">
          kifor
        </span>
      </div>
      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default Login;
