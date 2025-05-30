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
  RefreshCcw,
  X,
  Loader2,
  Clock,
  ArrowDown,
} from "lucide-react";
import { useUserStore } from "../../store/useUserStore";
import { BotConfig, Theme } from "../../types";
import {
  getUserBookingHistory,
  cancelUserBooking,
} from "../../lib/serverActions";
import RescheduleFlowComponent from "./chatbotBookingComponents/RescheduleFlowComponent";
import { PERSONALITY_OPTIONS } from "../../utils/constants";

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
  rescheduledFrom?: {
    date: string;
    startTime: string;
    endTime: string;
  };
  rescheduledTo?: string;
  isRescheduled?: boolean;
  rescheduledToData?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

function HeaderSection({
  theme,
  currentConfig,
  activeScreen,
  setActiveScreen,
}: HeaderSectionProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<
    "orders" | "bookings"
  >("orders");
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

  // Booking management state
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null
  );
  const [bookingActionError, setBookingActionError] = useState<string | null>(
    null
  );
  const [bookingActionSuccess, setBookingActionSuccess] = useState<
    string | null
  >(null);

  // Reschedule modal state
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] =
    useState<Booking | null>(null);

  const [agentPicture, setAgentPicture] = useState<string | null>(null);

  useEffect(() => {
    if (currentConfig?.logo) {
      if (agentPicture === currentConfig?.logo) {
        return;
      }
      const logoWithTimestamp = `${currentConfig.logo}?t=${Date.now()}`;
      setAgentPicture(logoWithTimestamp);
    } else if (currentConfig?.personalityType?.name) {
      let voiceName = currentConfig.personalityType.name;

      const logoObj = PERSONALITY_OPTIONS.find(
        (model) => model.title === voiceName
      );

      if (logoObj) {
        setAgentPicture(logoObj.image);
      } else {
        setAgentPicture(
          "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
        );
      }
    }
  }, [currentConfig]);

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
    if (
      showHistoryModal &&
      isLoggedIn &&
      userEmail &&
      activeHistoryTab === "bookings"
    ) {
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
      // Process bookings to identify rescheduled ones
      const processedBookings = (bookingsData || []).map((booking: Booking) => {
        // Check if the booking has rescheduling data
        if (booking.status === "cancelled" && booking.isRescheduled) {
          return {
            ...booking,
            statusLabel: "rescheduled",
          };
        }
        return booking;
      });

      setBookings(processedBookings);
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      setBookings([]);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const formatBookingTime = (date: string, time: string, timezone: string) => {
    try {
      const [hours, minutes] = time.split(":").map(Number);
      const dateObj = new Date(date);
      dateObj.setHours(hours, minutes, 0, 0);

      return dateObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      });
    } catch (error) {
      return time;
    }
  };

  const formatBookingDate = (date: string) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return date;
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

  // Handle reschedule click
  const handleRescheduleClick = (booking: Booking) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleModalOpen(true);
  };

  // Handle reschedule success
  const handleRescheduleSuccess = () => {
    setRescheduleModalOpen(false);
    setSelectedBookingForReschedule(null);
    setBookingActionSuccess("Appointment rescheduled successfully!");
    fetchUserBookings(); // Refresh bookings
  };

  // Handle cancel booking
  const handleCancelBooking = async (booking: Booking) => {
    // Validate if booking can be cancelled
    if (booking.statusLabel !== "upcoming") {
      setBookingActionError("Only upcoming bookings can be cancelled");
      return;
    }

    // Check if booking is too close to start time (e.g., within 24 hours)
    const bookingDate = new Date(booking.date);
    const startTime = booking.startTime.split(":");
    bookingDate.setHours(parseInt(startTime[0]), parseInt(startTime[1]));

    const hoursUntilBooking =
      (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilBooking < 24) {
      if (
        !confirm(
          "This booking is within 24 hours. Are you sure you want to cancel? You may not be eligible for a refund."
        )
      ) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to cancel this booking?")) {
        return;
      }
    }

    setCancellingBookingId(booking._id);
    setBookingActionError(null);
    setBookingActionSuccess(null);

    try {
      await cancelUserBooking(booking._id, userEmail);
      setBookingActionSuccess("Booking cancelled successfully");

      // Refresh bookings
      await fetchUserBookings();
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setBookingActionError("Failed to cancel booking. Please try again.");
    } finally {
      setCancellingBookingId(null);
    }
  };

  // Clear messages after timeout
  useEffect(() => {
    if (bookingActionSuccess || bookingActionError) {
      const timer = setTimeout(() => {
        setBookingActionSuccess(null);
        setBookingActionError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [bookingActionSuccess, bookingActionError]);

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
      </div>
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

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const getStatusColor = (status: string) => {
      switch (status) {
        case "upcoming":
          return "#4CAF50";
        case "cancelled":
          return "#F44336";
        case "rescheduled":
          return "#FF9800";
        default:
          return "#9E9E9E";
      }
    };

    const statusColor = getStatusColor(booking.statusLabel);

    return (
      <div
        className="rounded-lg px-4 py-3 flex flex-col"
        style={{
          backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
          border: `1px solid ${theme.isDark ? "#333" : "#e0e0e0"}`,
          borderLeft: `3px solid ${statusColor}`,
        }}
      >
        {/* Header: Session Type and Status */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex flex-col">
            <div
              className="text-sm font-semibold"
              style={{ color: theme.highlightColor }}
            >
              {booking.sessionType}
            </div>
          </div>
          <div
            className="text-xs rounded-full px-2 py-0.5"
            style={{
              backgroundColor: `${statusColor}20`,
              color: statusColor,
            }}
          >
            {booking.statusLabel.toUpperCase()}
          </div>
        </div>

        {/* Date and Time Information */}
        {booking.statusLabel === "rescheduled" && booking.rescheduledFrom ? (
          <div className="space-y-1 mb-2">
            {/* Old date and time (strikethrough) */}
            <div className="flex items-center text-xs opacity-60 line-through">
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formatBookingDate(booking.rescheduledFrom.date)}</span>
              <Clock className="h-3 w-3 ml-2 mr-1" />
              <span>
                {formatBookingTime(
                  booking.rescheduledFrom.date,
                  booking.rescheduledFrom.startTime,
                  booking.userTimezone
                )}{" "}
                -{" "}
                {formatBookingTime(
                  booking.rescheduledFrom.date,
                  booking.rescheduledFrom.endTime,
                  booking.userTimezone
                )}
              </span>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-start ml-4">
              <ArrowDown
                className="h-3 w-3"
                style={{ color: theme.highlightColor }}
              />
            </div>

            {/* New date and time */}
            <div
              className="flex items-center text-xs"
              style={{ color: theme.highlightColor }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              <span className="font-medium">
                {booking.rescheduledToData
                  ? formatBookingDate(booking.rescheduledToData.date)
                  : "Date not available"}
              </span>
              <Clock className="h-3 w-3 ml-2 mr-1" />
              <span className="font-medium">
                {booking.rescheduledToData ? (
                  <>
                    {formatBookingTime(
                      booking.rescheduledToData.date,
                      booking.rescheduledToData.startTime,
                      booking.userTimezone
                    )}{" "}
                    -{" "}
                    {formatBookingTime(
                      booking.rescheduledToData.date,
                      booking.rescheduledToData.endTime,
                      booking.userTimezone
                    )}
                  </>
                ) : (
                  "Time not available"
                )}
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Regular date and time */}
            <div
              className="text-xs mb-1"
              style={{ color: theme.isDark ? "#e0e0e0" : "#333" }}
            >
              {formatBookingDate(booking.date)}
            </div>
            <div
              className="flex items-center text-xs mb-2"
              style={{ color: theme.isDark ? "#e0e0e0" : "#333" }}
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatBookingTime(
                booking.date,
                booking.startTime,
                booking.userTimezone
              )}{" "}
              -{" "}
              {formatBookingTime(
                booking.date,
                booking.endTime,
                booking.userTimezone
              )}
            </div>
          </>
        )}

        {/* Location */}
        <div className="text-xs text-gray-400">
          {booking.location === "google_meet"
            ? "Google Meet"
            : booking.location === "zoom"
            ? "Zoom"
            : booking.location === "teams"
            ? "Microsoft Teams"
            : "In Person"}
        </div>

        {/* Action buttons for upcoming bookings */}
        {booking.statusLabel === "upcoming" && (
          <div className="flex gap-2 mt-3">
            {booking.canJoin && booking.meetingLink && (
              <a
                href={booking.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center px-2 py-1 rounded text-xs font-medium"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: theme.isDark ? "black" : "white",
                }}
              >
                Join
              </a>
            )}

            <button
              onClick={() => handleRescheduleClick(booking)}
              className="flex-1 flex items-center justify-center px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: theme.mainLightColor,
                color: "white",
              }}
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Reschedule
            </button>

            <button
              onClick={() => handleCancelBooking(booking)}
              disabled={cancellingBookingId === booking._id}
              className="flex-1 px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                opacity: cancellingBookingId === booking._id ? 0.7 : 1,
              }}
            >
              {cancellingBookingId === booking._id ? (
                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
              ) : (
                "Cancel"
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

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
        {/* Modal header */}
        <div className="p-4 pb-0 flex justify-between items-center">
          <div
            className="font-semibold text-md"
            style={{ color: theme.isDark ? "white" : "black" }}
          >
            HISTORY
          </div>
          <button
            style={{ color: theme.highlightColor }}
            onClick={() => {
              setShowHistoryModal(false);
              setBookingActionError(null);
              setBookingActionSuccess(null);
            }}
          >
            <span className="text-xl">&times;</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-2">
          <button
            className={`py-2 px-3 text-sm font-medium rounded-t-md flex items-center`}
            style={{
              color:
                activeHistoryTab === "orders"
                  ? theme.highlightColor
                  : "#bfbfbf",
              borderBottom:
                activeHistoryTab === "orders"
                  ? `2px solid ${theme.highlightColor}`
                  : "none",
              backgroundColor:
                activeHistoryTab === "orders"
                  ? theme.isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)"
                  : "transparent",
            }}
            onClick={() => setActiveHistoryTab("orders")}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            ORDERS
          </button>
          <button
            className={`py-2 px-3 text-sm font-medium rounded-t-md flex items-center ml-2`}
            style={{
              color:
                activeHistoryTab === "bookings"
                  ? theme.highlightColor
                  : "#bfbfbf",
              borderBottom:
                activeHistoryTab === "bookings"
                  ? `2px solid ${theme.highlightColor}`
                  : "none",
              backgroundColor:
                activeHistoryTab === "bookings"
                  ? theme.isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)"
                  : "transparent",
            }}
            onClick={() => setActiveHistoryTab("bookings")}
          >
            <Calendar className="h-4 w-4 mr-2" />
            BOOKINGS
          </button>
        </div>

        <div
          style={{
            backgroundColor: theme.highlightColor,
            height: 1,
            opacity: 0.3,
          }}
          className="mx-4 mt-2"
        />

        {/* Messages */}
        {(bookingActionSuccess || bookingActionError) && (
          <div className="px-4 pt-2">
            {bookingActionSuccess && (
              <div className="p-2 bg-green-100 text-green-700 rounded text-sm mb-2">
                {bookingActionSuccess}
              </div>
            )}
            {bookingActionError && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-sm mb-2">
                {bookingActionError}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="p-4 space-y-3 overflow-y-auto"
          style={{ maxHeight: "400px" }}
        >
          {activeHistoryTab === "orders" ? (
            [1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-lg px-4 py-3 flex flex-row justify-between items-center"
                style={{
                  backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
                  border: `1px solid ${theme.isDark ? "#333" : "#e0e0e0"}`,
                }}
              >
                <div className="flex flex-col ">
                  <div className="text-xs text-gray-400">DD MM YYYY HH:MM</div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: theme.highlightColor }}
                  >
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
          ) : isLoadingBookings ? (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                style={{ borderColor: theme.highlightColor }}
              ></div>
            </div>
          ) : bookings.length > 0 ? (
            bookings.map((booking) => (
              <BookingCard key={booking._id} booking={booking} />
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No bookings found for this agent
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col">
      {/* Top Header */}
      <div
        className="flex justify-between items-center px-4 py-0.5"
        style={{
          backgroundColor: theme.mainDarkColor,
        }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img
              key={agentPicture}
              src={
                agentPicture ||
                "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
              }
              alt="Agent"
              className="w-8 h-8 object-cover"
              onError={(e) => {
                console.log("Image load error:", e);
                e.currentTarget.src =
                  "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg";
              }}
            />
          </div>
          <div style={{ color: theme.isDark ? "white" : "black" }}>
            <div className="text-md font-semibold">{currentConfig.name}</div>
          </div>
        </div>
        <div
          className="flex items-center relative gap-2"
          style={{ minHeight: 48 }}
        >
          {isLoggedIn ? (
            <>
              <div className="flex items-center relative gap-1">
                {/* <button
                  className="p-2 rounded-full hover:bg-opacity-10 hover:bg-white"
                  style={{
                    backgroundColor: theme.highlightColor,
                    color: !theme.isDark ? "white" : "black",
                    border: "2px solid #ffffff",
                  }}
                  onClick={() => setShowHistoryModal(true)}
                >
                  <History className="h-5 w-5" />
                </button> */}
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
            </>
          ) : (
            <div>
              <button
                className="rounded-full hover:bg-opacity-10 hover:bg-white px-3 py-0.5 text-xs font-semibold"
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
      </div>

      {/* Ad Strip */}
      {currentConfig.isPromoBannerEnabled && (
        <div
          className="flex justify-center items-center px-2 py-1 text-center text-xs"
          style={{
            backgroundColor: theme.isDark ? "white" : "black",
            color: theme.isDark ? "black" : "white",
          }}
        >
          <div className="text-xs">{currentConfig.promotionalBanner}</div>
        </div>
      )}

      {/* Navigation Bar */}
      <div
        className="flex justify-around pt-2"
        style={{ backgroundColor: theme.isDark ? "black" : "white" }}
      >
        <button
          onClick={() => setActiveScreen("about")}
          className={`text-xs  px-4 py-1 flex items-center space-x-1 pb-2`}
          style={{
            fontWeight: 500,
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
          className={`text-xs  px-4 py-1 relative flex items-center space-x-1`}
          style={{
            fontWeight: 500,
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
          className={`text-xs px-4 py-1 flex items-center space-x-1`}
          style={{
            fontWeight: 500,
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

      {/* Reschedule Modal */}
      {rescheduleModalOpen && selectedBookingForReschedule && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div
            className="rounded-xl w-96 max-w-full p-0 relative max-h-[80vh] overflow-y-auto"
            style={{
              backgroundColor: theme.isDark ? "black" : "white",
              border: `1px solid ${theme.highlightColor}`,
            }}
          >
            <div
              className="sticky top-0 p-4 border-b flex justify-between items-center"
              style={{
                backgroundColor: theme.isDark ? "black" : "white",
                borderColor: theme.highlightColor,
              }}
            >
              <h2 className="font-semibold">Reschedule Appointment</h2>
              <button
                onClick={() => {
                  setRescheduleModalOpen(false);
                  setSelectedBookingForReschedule(null);
                }}
                style={{ color: theme.highlightColor }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <RescheduleFlowComponent
              bookingId={selectedBookingForReschedule._id}
              userId={userEmail}
              theme={theme}
              onClose={() => {
                setRescheduleModalOpen(false);
                setSelectedBookingForReschedule(null);
              }}
              onSuccess={handleRescheduleSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default HeaderSection;
