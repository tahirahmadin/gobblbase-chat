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
import { getIntegratedServices } from "../lib/serverActions";
import { useUserStore } from "../store/useUserStore";

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

export default function Services() {
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [integratedServices, setIntegratedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { activeAgentId } = useUserStore();

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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Available Services
      </h2>
      {isLoading ? (
        <div className="text-center py-8">Loading services...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const isIntegrated = integratedServices.includes(service.id);
            return (
              <div
                key={service.id}
                className={`bg-white p-6 rounded-lg shadow-sm border ${
                  isIntegrated
                    ? "border-green-200"
                    : "border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                }`}
                onClick={() => handleServiceClick(service.id)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={service.logo}
                      alt={`${service.name} logo`}
                      className="h-12 w-12 object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {service.name}
                      </h3>
                      {isIntegrated && (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {service.description}
                    </p>
                    {isIntegrated && (
                      <p className="text-sm text-green-600 mt-2">Integrated</p>
                    )}
                    {!service.active && (
                      <p className="text-sm text-gray-500 mt-2">Coming soon</p>
                    )}
                    {service.active && (
                      <p className="text-sm text-green-600 mt-2">Live</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
