import React, { useState, useEffect } from "react";
import {
  Calendar,
  CreditCard,
  MessageSquare,
  DollarSign,
  Calendar as CalendarIcon,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import ServiceConfiguration from "./ServiceConfiguration";
import { getIntegratedServices, updateCalendlyUrl, getAppointmentSettings } from "../lib/serverActions";
import { useBotConfig } from "../store/useBotConfig";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";
import BookingIntegration from "./booking/BookingIntegration";

interface Service {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  logo: string;
  active: boolean;
}

const services: Service[] = [
  {
    id: "calendly",
    name: "Calendly",
    icon: <Calendar className="h-8 w-8 text-indigo-600" />,
    description: "Schedule meetings and appointments with your customers",
    logo: "https://logos-world.net/wp-content/uploads/2021/06/Calendly-New-Logo.png",
    active: true,
  },
  {
    id: "razorpay",
    name: "Razorpay",
    icon: <DollarSign className="h-8 w-8 text-indigo-600" />,
    description: "Accept payments and manage transactions",
    logo: "https://razorpay.com/assets/razorpay-logo.svg",
    active: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: <CreditCard className="h-8 w-8 text-indigo-600" />,
    description: "Process payments and handle subscriptions",
    logo: "https://stripe.com/img/v3/home/twitter.png",
    active: false,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <MessageSquare className="h-8 w-8 text-indigo-600" />,
    description: "Send and receive messages via WhatsApp",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/512px-WhatsApp.svg.png",
    active: false,
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    icon: <CalendarIcon className="h-8 w-8 text-indigo-600" />,
    description: "Manage events and schedules with Google Calendar",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/1024px-Google_Calendar_icon_%282020%29.svg.png",
    active: false,
  },
];

const Services: React.FC = () => {
  const { activeBotData } = useBotConfig();
  const activeAgentId = activeBotData?.agentId;
  const { calendlyUrl, setCalendlyUrl } = useUserStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [integratedServices, setIntegratedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showBookingIntegration, setShowBookingIntegration] = useState(false);
  const [bookingMode, setBookingMode] = useState<"setup" | "dashboard">("dashboard");
  const [bookingConfigured, setBookingConfigured] = useState(false);

  // Check if booking is already configured using the API
  useEffect(() => {
    const checkBookingConfig = async () => {
      if (!activeAgentId) return;
      
      setIsLoading(true);
      try {
        // Fetch booking settings from API
        const settings = await getAppointmentSettings(activeAgentId);
        // If settings exist, booking is configured
        setBookingConfigured(!!settings);
      } catch (error) {
        console.error("Error checking booking configuration:", error);
        setBookingConfigured(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkBookingConfig();
  }, [activeAgentId, showBookingIntegration]);

  const handleServiceClick = (serviceId: string) => {
    if (!integratedServices.includes(serviceId)) {
      setSelectedService(serviceId);
    }
  };

  const handleCloseConfiguration = () => {
    setSelectedService(null);
    setShowBookingIntegration(false);
  };

  const handleCalendlyUrlUpdate = async () => {
    if (!activeAgentId) {
      toast.error("No active agent selected");
      return;
    }

    setIsUpdating(true);
    try {
      await updateCalendlyUrl(activeAgentId, calendlyUrl);
      toast.success("Calendly URL updated successfully");
    } catch (error) {
      console.error("Error updating Calendly URL:", error);
      toast.error("Failed to update Calendly URL");
    } finally {
      setIsUpdating(false);
    }
  };

  const openBookingSetup = () => {
    // Set to setup mode without modifying any storage
    setBookingMode("setup");
    setShowBookingIntegration(true);
  };

  const openBookingDashboard = () => {
    setBookingMode("dashboard");
    setShowBookingIntegration(true);
  };

  if (showBookingIntegration) {
    return (
      <div className="p-6">
        <button
          onClick={handleCloseConfiguration}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Services
        </button>
        <BookingIntegration
        initialView={bookingMode}
        isEditMode={bookingConfigured}
        onSetupComplete={handleCloseConfiguration}
       />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendly URL Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Calendly Integration
            </h2>
          </div>
          <p className="mt-2 text-gray-600">
            Connect your Calendly account for appointment scheduling
          </p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={calendlyUrl}
                onChange={(e) => setCalendlyUrl(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                placeholder="Enter your Calendly URL"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <a
                href="https://calendly.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-800"
              >
                Get your Calendly URL
              </a>
              <span>•</span>
              <span>Example: https://calendly.com/your-username</span>
            </div>
            <button
              onClick={handleCalendlyUrlUpdate}
              disabled={isUpdating || !calendlyUrl}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isUpdating || !calendlyUrl
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-900"
              }`}
            >
              {isUpdating ? "Updating..." : "Update Calendly URL"}
            </button>
          </div>
        </div>
      </div>

      {/* Booking System Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <CalendarIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Booking System
            </h2>
          </div>
          <p className="mt-2 text-gray-600">
            Set up your own appointment booking system with customizable time slots
          </p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-800"></div>
            </div>
          ) : bookingConfigured ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 flex items-start">
                <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">Booking system is configured!</p>
                  <p className="text-green-700 text-sm mt-1">
                    Your booking system is ready to accept appointments.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  onClick={openBookingSetup}
                  className="flex-1 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                >
                  Edit Booking Settings
                </button>
                <button
                  onClick={openBookingDashboard}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium"
                >
                  Go to Booking Dashboard
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-700">
                Create a personalized booking experience for your clients. Configure your:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Booking type (individual or team)</li>
                <li>Meeting duration and buffer times</li>
                <li>Available days and times</li>
                <li>Meeting location options (Google Meet, In-person)</li>
              </ul>
              <button
                onClick={openBookingSetup}
                className="w-full py-3 px-4 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-medium transition-colors"
              >
                Configure Booking System
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;