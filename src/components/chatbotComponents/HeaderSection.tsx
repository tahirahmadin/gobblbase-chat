import React, { useState } from "react";
import {
  User,
  LogOut,
  History,
  Info,
  MessageCircle,
  ShoppingCart,
  Menu,
} from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../../store/useUserStore";

interface HeaderSectionProps {
  theme: Theme;
  currentConfig: {
    logo?: string;
    name?: string;
  };
  activeScreen: "about" | "chat" | "browse";
  setActiveScreen: (screen: "about" | "chat" | "browse") => void;
  onGoogleLoginSuccess?: (response: any) => void;
  onGoogleLoginError?: () => void;
}

export default function HeaderSection({
  theme,
  currentConfig,
  activeScreen,
  setActiveScreen,
  onGoogleLoginSuccess,
  onGoogleLoginError,
}: HeaderSectionProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const {
    isLoggedIn,
    userEmail,
    handleGoogleLoginSuccess: userGoogleLoginSuccess,
    handleGoogleLoginError: userGoogleLoginError,
    logout: userLogout,
  } = useUserStore();

  const handleLoginSuccess = (response: any) => {
    if (isAdminView) {
      userGoogleLoginSuccess(response);
    } else if (onGoogleLoginSuccess) {
      onGoogleLoginSuccess(response);
    } else {
      userGoogleLoginSuccess(response);
    }
  };

  const handleLoginError = () => {
    if (isAdminView) {
      userGoogleLoginError();
    } else if (onGoogleLoginError) {
      onGoogleLoginError();
    } else {
      userGoogleLoginError();
    }
  };

  const UserDropdownMenu = () => (
    <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
      <div className="py-1" role="menu" aria-orientation="vertical">
        <div className="px-4 py-2 text-sm text-gray-700 border-b">
          {userEmail}
        </div>
        <button
          onClick={userLogout}
          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Top Header */}
      <div
        className="flex justify-between items-center px-4 py-3"
        style={{
          backgroundColor: theme.headerBgColor,
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
          <div style={{ color: theme.headerTextColor }}>
            <div className="text-md font-bold mb-[-4px]">
              {currentConfig.name}
            </div>
            <div className="text-sm">@tahirahmadin</div>
          </div>
        </div>
        {isLoggedIn ? (
          <div className="flex items-center relative">
            <button
              className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
              style={{
                color: theme.headerIconColor,
              }}
              onClick={() => {
                /* Handle order history click */
              }}
            >
              <History className="h-5 w-5" />
            </button>
            <div className="relative">
              <button
                className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
                style={{
                  color: theme.headerTextColor,
                }}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User className="h-5 w-5" />
              </button>
              {showUserMenu && <UserDropdownMenu />}
            </div>
          </div>
        ) : (
          <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              useOneTap
            />
          </GoogleOAuthProvider>
        )}
      </div>
      {/* Ad Strip */}
      <div className="flex justify-center items-center px-4 py-3">
        <div className="text-sm">
          New batches will be available by 1st June.
        </div>
      </div>
      {/* Navigation Bar */}
      <div className="flex justify-around py-2">
        <button
          onClick={() => setActiveScreen("about")}
          className={`text-xs font-medium px-4 py-1 flex items-center space-x-1`}
          style={{
            color:
              activeScreen === "about"
                ? theme.headerTabActiveColor
                : theme.headerTabInactiveColor,

            borderBlockEnd:
              activeScreen === "about"
                ? `4px solid ${theme.headerIconBgColor}`
                : "none",
          }}
        >
          <Info
            className="h-3.5 w-3.5"
            style={{
              marginRight: 3,
              color:
                activeScreen === "about"
                  ? theme.headerTabActiveColor
                  : theme.headerTabInactiveColor,
            }}
          />
          ABOUT
        </button>
        <button
          onClick={() => setActiveScreen("chat")}
          className={`text-xs font-medium px-4 py-1 relative flex items-center space-x-1`}
          style={{
            color:
              activeScreen === "chat"
                ? theme.headerTabActiveColor
                : theme.headerTabInactiveColor,

            borderBlockEnd:
              activeScreen === "chat"
                ? `4px solid ${theme.headerIconBgColor}`
                : "none",
          }}
        >
          <MessageCircle
            className="h-3.5 w-3.5"
            style={{
              marginRight: 3,
              color:
                activeScreen === "chat"
                  ? theme.headerTabActiveColor
                  : theme.headerTabInactiveColor,
            }}
          />{" "}
          CHAT
        </button>
        <button
          onClick={() => setActiveScreen("browse")}
          className={`text-xs font-medium px-4 py-1 flex items-center space-x-1`}
          style={{
            color:
              activeScreen === "browse"
                ? theme.headerTabActiveColor
                : theme.headerTabInactiveColor,

            borderBlockEnd:
              activeScreen === "browse"
                ? `4px solid ${theme.headerIconBgColor}`
                : "none",
          }}
        >
          <Menu
            className="h-3.5 w-3.5"
            style={{
              marginRight: 3,
              color:
                activeScreen === "chat"
                  ? theme.headerTabActiveColor
                  : theme.headerTabInactiveColor,
            }}
          />{" "}
          BROWSE
        </button>
      </div>
    </div>
  );
}
