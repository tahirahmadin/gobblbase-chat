import React, { useState, useEffect } from "react";
import {
  User,
  LogOut,
  History,
  Info,
  MessageCircle,
  ShoppingCart,
  Menu,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { BotConfig, Theme } from "../../types";
import { getUserBookingHistory } from "../../lib/serverActions"; 

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
  currentConfig: BotConfig;
  activeScreen: "about" | "chat" | "browse";
  setActiveScreen: (screen: "about" | "chat" | "browse") => void;
}

interface Booking {
  _id: string;
  agentId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  statusLabel: string;
  meetingLink?: string;
  sessionType: string;
  notes?: string;
  canJoin: boolean;
  userTimezone: string;
}

function HeaderSection({
  theme,
  currentConfig,
  activeScreen,
  setActiveScreen,
}: HeaderSectionProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<"orders" | "bookings">("orders");
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

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

  useEffect(() => {
    if (showHistoryModal && isLoggedIn && userEmail && activeHistoryTab === "bookings") {
      fetchUserBookings();
    }
  }, [showHistoryModal, activeHistoryTab, isLoggedIn, userEmail]);

  const fetchUserBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const agentId = currentConfig?.agentId;
      
      if (!agentId) {
        console.error("Agent ID not found in current config");
        setBookings([]);
        return;
      }
      
      const bookingsData = await getUserBookingHistory(userEmail, agentId);
      setBookings(bookingsData || []);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const formatBookingTime = (date: string, time: string, timezone: string) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const dateObj = new Date(date);
      dateObj.setHours(hours, minutes, 0, 0);
      
      return dateObj.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true,
        timeZone: timezone 
      });
    } catch (error) {
      return time;
    }
  };

  const formatBookingDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return date;
    }
  };

  const formatOrderDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }) + ' ' + date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

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
      style={{
        backgroundColor: !theme.isDark ? "white" : "black",
        border: `1px solid ${theme.highlightColor}`,
      }}
    >
      <div className="py-3 px-4 flex items-center space-x-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: theme.mainDarkColor }}
        >
          <User
            className="h-6 w-6"
            style={{ color: theme.isDark ? "white" : "black" }}
          />
        </div>
        <div>
          <div
            className="text-xs"
            style={{
              color: theme.isDark ? "white" : "black",
            }}
          >
            {userEmail || "email@email.com"}
          </div>
        </div>
      </div>{" "}
      <div
        style={{ backgroundColor: theme.highlightColor, height: 1 }}
        className="mx-4"
      />
      <button
        onClick={userLogout}
        className="w-full text-left px-4 py-3 text-sm flex items-center space-x-2 font-semibold"
        style={{ color: theme.highlightColor }}
      >
        <LogOut className="h-4 w-4" />
        <span>LOGOUT</span>
      </button>
    </div>
  );

  const HistoryModal = () => (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-40">
      <div
        className="rounded-xl w-96 max-w-full p-0 relative max-h-[80vh] flex flex-col"
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          backgroundColor: theme.isDark ? "black" : "white",
          border: `1px solid ${theme.highlightColor}`,
        }}
      >
        <div className="p-4 pb-0 flex justify-between items-center">
          <div
            className="font-semibold text-md"
            style={{ color: theme.isDark ? "white" : "black" }}
          >
           HISTORY
          </div>
          <button
            style={{ color: theme.highlightColor }}
            onClick={() => setShowHistoryModal(false)}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>
        
        {/* Tabs */}
        <div className="flex px-4 pt-2">
          <button
            className={`py-2 px-3 text-sm font-medium rounded-t-md flex items-center`}
            style={{
              color: activeHistoryTab === "orders" ? theme.highlightColor : "#bfbfbf",
              borderBottom: activeHistoryTab === "orders" ? `2px solid ${theme.highlightColor}` : "none",
              backgroundColor: activeHistoryTab === "orders" 
                ? (theme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") 
                : "transparent"
            }}
            onClick={() => setActiveHistoryTab("orders")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            ORDERS
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium rounded-t-md flex items-center ml-2`}
            style={{
              color: activeHistoryTab === "bookings" ? theme.highlightColor : "#bfbfbf",
              borderBottom: activeHistoryTab === "bookings" ? `2px solid ${theme.highlightColor}` : "none",
              backgroundColor: activeHistoryTab === "bookings" 
                ? (theme.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") 
                : "transparent"
            }}
            onClick={() => setActiveHistoryTab("bookings")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            BOOKINGS
          </button>
        </div>
        
        <div
          style={{ backgroundColor: theme.highlightColor, height: 1, opacity: 0.3 }}
          className="mx-4 mt-2"
        />
        
        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto">
          {activeHistoryTab === "orders" ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg px-4 py-3 flex flex-row justify-between items-center"
                style={{ 
                  backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
                  border: `1px solid ${theme.isDark ? "#333" : "#e0e0e0"}`
                }}
              >
                <div className="flex flex-col ">
                  <div className="text-xs text-gray-400">DD MM YYYY HH:MM</div>
                  <div className="text-sm font-semibold" style={{ color: theme.highlightColor }}>
                    Product Name
                  </div>
                  <div className="text-xs text-gray-300 mb-1">Qty: XX</div>
                </div>
                <div className="flex flex-col justify-between items-end mb-1">
                  <div
                    className="text-sm font-semibold"
                    style={{ color: theme.isDark ? "white" : "black" }}
                  >
                    Amount
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: theme.mainLightColor }}
                  >
                    Paid via Stripe
                  </div>
                </div>
              </div>
            ))
          ) : (
            isLoadingBookings ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: theme.highlightColor }}></div>
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-lg px-4 py-3 flex flex-col"
                  style={{ 
                    backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
                    border: `1px solid ${theme.isDark ? "#333" : "#e0e0e0"}`,
                    borderLeft: `3px solid ${
                      booking.statusLabel === "upcoming" 
                        ? "#4CAF50" 
                        : booking.statusLabel === "cancelled" 
                          ? "#F44336" 
                          : "#9E9E9E"
                    }`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold" style={{ color: theme.highlightColor }}>
                        {booking.sessionType}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatBookingDate(booking.date)}
                      </div>
                    </div>
                    <div
                      className="text-xs rounded-full px-2 py-0.5"
                      style={{ 
                        backgroundColor: 
                          booking.statusLabel === "upcoming" 
                            ? "rgba(76, 175, 80, 0.2)" 
                            : booking.statusLabel === "cancelled" 
                              ? "rgba(244, 67, 54, 0.2)" 
                              : "rgba(158, 158, 158, 0.2)",
                        color: 
                          booking.statusLabel === "upcoming" 
                            ? "#4CAF50" 
                            : booking.statusLabel === "cancelled" 
                              ? "#F44336" 
                              : "#9E9E9E"
                      }}
                    >
                      {booking.statusLabel.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs" style={{ color: theme.isDark ? "#e0e0e0" : "#333" }}>
                      {formatBookingTime(booking.date, booking.startTime, booking.userTimezone)} - {" "}
                      {formatBookingTime(booking.date, booking.endTime, booking.userTimezone)}
                      <div className="text-xs text-gray-400">
                        {booking.location === "google_meet" 
                          ? "Google Meet" 
                          : booking.location === "zoom" 
                            ? "Zoom" 
                            : booking.location === "teams" 
                              ? "Microsoft Teams" 
                              : "In Person"}
                      </div>
                    </div>
                    
                    {booking.canJoin && booking.meetingLink && (
                      <a 
                        href={booking.meetingLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: theme.highlightColor,
                          color: theme.isDark ? "black" : "white",
                        }}
                      >
                        Join <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No bookings found for this agent
              </div>
            )
          )}
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
              onClick={() => setShowHistoryModal(true)}
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
            {showHistoryModal && <HistoryModal />}
          </div>
        ) : (
          <div>
            <button
              className="rounded-full hover:bg-opacity-10 hover:bg-white px-4 py-1 text-sm"
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
          className="flex justify-center items-center px-4 py-2 text-center"
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
