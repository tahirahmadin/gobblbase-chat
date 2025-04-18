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
import { getIntegratedServices, updateCalendlyUrl } from "../lib/serverActions";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";

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
  const { activeAgentId, calendlyUrl, setCalendlyUrl } = useUserStore();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [integratedServices, setIntegratedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // useEffect(() => {
  //   const fetchIntegratedServices = async () => {
  //     if (!activeAgentId) return;
  //     try {
  //       const services = await getIntegratedServices(activeAgentId);
  //       setIntegratedServices(services);
  //     } catch (error) {
  //       console.error("Failed to fetch integrated services:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchIntegratedServices();
  // }, [activeAgentId]);

  const handleServiceClick = (serviceId: string) => {
    if (!integratedServices.includes(serviceId)) {
      setSelectedService(serviceId);
    }
  };

  const handleCloseConfiguration = () => {
    setSelectedService(null);
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

  if (selectedService) {
    return (
      <div className="p-6">
        <button
          onClick={handleCloseConfiguration}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Services
        </button>
        <ServiceConfiguration
          serviceId={selectedService}
          onClose={handleCloseConfiguration}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendly URL Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Booking Integration
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
    </div>
  );
};

export default Services;
