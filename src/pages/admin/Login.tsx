import React, { useEffect, useRef } from "react";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import CreateNewBot from "./CreateNewBot";
import styled from "styled-components";
// Add type definitions for Google Identity Services
const Card = styled.div`
  position: relative;
  width: calc(100% - 30vw);
  height: 500px;
  background: #EAEFFF;
  border: 2px solid black;
  // box-shadow: 4px 4px 0 0 #222b5f;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  // z-index:10;
  @media (max-width: 600px) {
    width: 90%;
  }
  &::before {
    box-sizing: border-box;
    content: "";
    position: absolute;
    top: 17px;
    right: -17px;
    width: 100%;
    height: 100%;
    border: 8px solid #000000;
    z-index: -1;
    background: #FFFFFF;
  }

  .btn-container {
    z-index: 2;
  }
`;
const Button = styled.button`
  position: relative;
  width: 100%;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #7fffa1;
  padding: 0.75rem 1rem;
  border: 2px solid black;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &:hover {
    background: #6ee7b7;
  }

  @media (max-width: 600px) {
    max-width: 200px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 6px;
    right: -6px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #7fffa1;
  }

  &:disabled {
    background: #d6ffe0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
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
    <Card>
      <h2 className="main-font text-xl font-bold mb-2 text-center ">Login or Sign Up</h2>
      <p className=" para-font text-sm text-center mb-8">
        Connect with your email credentials
      </p>
      <div className="btn-container">
        <Button onClick={handleCustomGoogleLogin}>
          <span className="mr-2">
            {/* Google Icon SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="20"
              height="20"
              viewBox="0 0 48 48"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              ></path>
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              ></path>
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              ></path>
            </svg>
          </span>
          LOGIN WITH GOOGLE
        </Button>
        <Button disabled={true}>
          <span className="mr-2">
            {/* Email Icon SVG */}
            <svg
              width="26"
              height="19"
              viewBox="0 0 26 19"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M23.6914 1.14377C23.4389 1.08273 23.1456 1 22.8263 1H2.80212C1.39989 1 2.10395 1.25404 4.20272 3.38033C5.13227 4.32205 6.00583 5.17619 6.93201 6.11584C7.85822 7.05563 8.72953 7.9135 9.66043 8.8523C13.3025 12.5254 12.3445 12.5701 15.531 9.38019C16.4746 8.43559 23.4717 1.52537 23.6914 1.14377Z"
                fill="#4D65FF"
                stroke="#CEFFDC"
                strokeMiterlimit="22.9256"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.8016 18.0038H22.8258C23.1446 18.0038 23.438 17.9228 23.6921 17.863L16.0049 10.1094C14.0744 12.2278 13.0681 13.4756 11.1383 11.5558C10.6661 11.0861 10.1872 10.6555 9.7619 10.1479C9.40445 10.3208 4.5453 15.2944 3.56556 16.272C1.99618 17.838 1.49911 18.0038 2.80169 18.0038H2.8016Z"
                fill="#4D65FF"
                stroke="#CEFFDC"
                strokeMiterlimit="22.9256"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.31965 17.2867L9.09465 9.50747L1.31925 1.71094C0.808452 2.54594 1.06567 8.04298 1.06567 9.49734C1.06567 10.9592 0.805887 16.4392 1.3197 17.2867H1.31965Z"
                fill="#4D65FF"
                stroke="#CEFFDC"
                strokeMiterlimit="22.9256"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.6377 9.49473L24.3003 17.2005C24.7119 16.415 24.4993 10.8677 24.4993 9.50202C24.4993 8.18188 24.6977 2.52222 24.3053 1.82031L16.6377 9.49473Z"
                fill="#4D65FF"
                stroke="#CEFFDC"
                strokeMiterlimit="22.9256"
              />
            </svg>
          </span>
          LOGIN WITH EMAIL(coming soon)
        </Button>
      </div>
    </Card>
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
      <div className="flex-1 flex items-center justify-center z-10 relative">
        {renderContent()}
      </div>
    </div>
  );
};

export default Login;
