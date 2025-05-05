import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  History,
  Info,
  MessageCircle,
  ShoppingCart,
  Menu,
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { Theme } from "../../types";

// Add Google API type declaration
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            callback: (response: any) => void;
            scope: string;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface HeaderSectionProps {
  theme: Theme;
  currentConfig: {
    isPromoBannerEnabled?: boolean;
    promotionalBanner?: string;
    logo?: string;
    name?: string;
  };
  activeScreen: "about" | "chat" | "browse";
  setActiveScreen: (screen: "about" | "chat" | "browse") => void;
}

function HeaderSection({
  theme,
  currentConfig,
  activeScreen,
  setActiveScreen,
}: HeaderSectionProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const {
    isLoggedIn,
    userEmail,
    userDetails,
    handleGoogleLoginSuccess: userGoogleLoginSuccess,
    handleGoogleLoginError: userGoogleLoginError,
    logout: userLogout,
  } = useUserStore();

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
    console.log("Login button clicked");
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
    if (!clientId) {
      console.error("Google Client ID is not configured");
      return;
    }

    if (!isGoogleLoaded) {
      console.error("Google Identity Services not loaded yet");
      return;
    }

    try {
      console.log("Initializing Google client with ID:", clientId);
      // Initialize Google OAuth client
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        callback: (response: { error?: string; access_token: string }) => {
          console.log("Google OAuth response:", response);
          if (response.error) {
            console.error("Google OAuth error:", response.error);
            userGoogleLoginError();
          } else {
            console.log("Google OAuth success");
            // Get user info using the access token
            fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
              headers: {
                Authorization: `Bearer ${response.access_token}`,
              },
            })
              .then((res) => res.json())
              .then((userInfo) => {
                console.log("User info:", userInfo);
                userGoogleLoginSuccess({
                  credential: response.access_token,
                  userInfo: userInfo,
                });
              })
              .catch((error) => {
                console.error("Error fetching user info:", error);
                userGoogleLoginError();
              });
          }
        },
        scope: "email profile",
      });

      console.log("Requesting Google OAuth token");
      // Request the token
      client.requestAccessToken();
    } catch (error) {
      console.error("Error initializing Google client:", error);
      userGoogleLoginError();
    }
  };

  const UserDropdownMenu = () => (
    <div
      className="absolute right-0 top-full mt-2 w-64 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20"
      style={{ backgroundColor: theme.mainLightColor }}
    >
      <div className="py-3 px-4 flex items-center space-x-3 border-b">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <User className="h-6 w-6 text-gray-500" />
        </div>
        <div>
          <div className="font-semibold text-sm text-black">
            {userDetails?.name || "Full Name"}
          </div>
          <div className="text-xs text-gray-600">
            {userEmail || "email@email.com"}
          </div>
        </div>
      </div>
      <button
        onClick={userLogout}
        className="w-full text-left px-4 py-3 text-sm text-yellow-500 hover:bg-gray-100 flex items-center space-x-2 border-t"
      >
        <LogOut className="h-4 w-4" />
        <span>LOGOUT</span>
      </button>
    </div>
  );

  const OrderHistoryModal = () => (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="bg-black rounded-xl border border-yellow-400 w-96 max-w-full p-0 relative"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.2)" }}
      >
        <button
          className="absolute top-2 right-2 text-yellow-400 hover:text-yellow-600"
          onClick={() => setShowOrderHistory(false)}
        >
          <span className="text-xl">&times;</span>
        </button>
        <div className="p-4 pb-2 border-b border-yellow-400">
          <div className="text-white font-semibold text-md">ORDER HISTORY</div>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-[#232323] rounded-lg px-4 py-3 flex flex-col border border-gray-700"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">DD MM YYYY HH:MM</span>
                <span className="text-sm text-white font-semibold">Amount</span>
              </div>
              <div className="text-yellow-400 text-sm font-semibold">
                Product Name
              </div>
              <div className="text-xs text-gray-300 mb-1">Qty: XX</div>
              <div className="text-xs text-blue-300">Paid via Stripe</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Top Header */}
      <div
        className="flex justify-between items-center px-4 py-3"
        style={{
          backgroundColor: theme.mainDarkColor,
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img
              src={
                currentConfig?.logo ||
                "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
              }
              alt="Agent"
              className="w-10 h-10 object-cover"
            />
          </div>
          <div style={{ color: theme.isDark ? "white" : "black" }}>
            <div className="text-md font-semibold mb-[-4px]">
              {currentConfig.name}
            </div>
          </div>
        </div>
        {isLoggedIn ? (
          <div className="flex items-center relative gap-2">
            <button
              className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "white" : "black",
                border: "2px solid #ffffff",
              }}
              onClick={() => setShowOrderHistory(true)}
            >
              <History className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "white" : "black",
                  border: "2px solid #ffffff",
                }}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="h-5 w-5" />
              </button>
              {showUserMenu && <UserDropdownMenu />}
            </div>
            {showOrderHistory && <OrderHistoryModal />}
          </div>
        ) : (
          <div>
            <button
              className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "white" : "black",
              }}
              onClick={handleLoginClick}
            >
              LOGIN
            </button>
          </div>
        )}
      </div>
      {/* Ad Strip */}
      {currentConfig.isPromoBannerEnabled && (
        <div
          className="flex justify-center items-center px-4 py-3"
          style={{
            backgroundColor: theme.isDark ? "white" : "black",
            color: theme.isDark ? "black" : "white",
          }}
        >
          <div className="text-sm">{currentConfig.promotionalBanner}</div>
        </div>
      )}

      {/* Navigation Bar */}
      <div
        className="flex justify-around pt-2"
        style={{ backgroundColor: theme.isDark ? "black" : "white" }}
      >
        <button
          onClick={() => setActiveScreen("about")}
          className={`text-xs font-medium px-4 py-1 flex items-center space-x-1 pb-2`}
          style={{
            color: activeScreen === "about" ? theme.highlightColor : "#bfbfbf",
            borderBlockEnd:
              activeScreen === "about"
                ? `4px solid ${theme.highlightColor}`
                : "none",
          }}
        >
          <Info
            className="h-3.5 w-3.5"
            style={{
              marginRight: 3,
              color:
                activeScreen === "about" ? theme.highlightColor : "#bfbfbf",
            }}
          />
          ABOUT
        </button>
        <button
          onClick={() => setActiveScreen("chat")}
          className={`text-xs font-medium px-4 py-1 relative flex items-center space-x-1`}
          style={{
            color: activeScreen === "chat" ? theme.highlightColor : "#bfbfbf",
            borderBlockEnd:
              activeScreen === "chat"
                ? `4px solid ${theme.highlightColor}`
                : "none",
          }}
        >
          <MessageCircle
            className="h-3.5 w-3.5"
            style={{
              marginRight: 3,
              color: activeScreen === "chat" ? theme.highlightColor : "#bfbfbf",
            }}
          />{" "}
          CHAT
        </button>
        <button
          onClick={() => setActiveScreen("browse")}
          className={`text-xs font-medium px-4 py-1 flex items-center space-x-1`}
          style={{
            color: activeScreen === "browse" ? theme.highlightColor : "#bfbfbf",
            borderBlockEnd:
              activeScreen === "browse"
                ? `4px solid ${theme.highlightColor}`
                : "none",
          }}
        >
          <Menu
            className="h-3.5 w-3.5"
            style={{
              marginRight: 3,
              color:
                activeScreen === "browse" ? theme.highlightColor : "#bfbfbf",
            }}
          />{" "}
          BROWSE
        </button>
      </div>
    </div>
  );
}

export default HeaderSection;
