import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { WagmiProvider } from "wagmi";
import { mainnet, base, bsc } from "viem/chains";
import { createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/adminComponents/Header";
import PublicChat from "./pages/chatbot/PublicChat";
import CustomerBooking from "./components/adminComponents/bookingComponents/CustomerBooking";
import { Toaster } from "react-hot-toast";
import { useBotConfig } from "./store/useBotConfig";
import { TimezoneProvider } from "./context/TimezoneContext";
import AdminLayout from "./components/adminComponents/AdminLayout";
import Profile from "./pages/admin/TabsComponent/Dashboard/Profile";
import AiModel from "./pages/admin/TabsComponent/Dashboard/AiModel";
import Brain from "./pages/admin/TabsComponent/Dashboard/Brain";
import Voice from "./pages/admin/TabsComponent/Dashboard/Voice";
import Theme from "./pages/admin/TabsComponent/Dashboard/Theme";
import WelcomeText from "./pages/admin/TabsComponent/Dashboard/WelcomeText";
import Prompts from "./pages/admin/TabsComponent/Dashboard/Prompts";
import Policies from "./pages/admin/TabsComponent/Commerce/Policies";
import ChatLogs from "./pages/admin/TabsComponent/CRM/ChatLogs";
import CustomerLeads from "./pages/admin/TabsComponent/CRM/CustomerLeads";
import BookingDashboardWrapper from "./pages/admin/BookingComponent/BookingDashboardWrapper";
import Login from "./pages/admin/Login";
import { useAdminStore } from "./store/useAdminStore";
import CreateNewBot from "./pages/admin/CreateNewBot";
import Plans from "./pages/admin/TabsComponent/Account/Plans";
import Usage from "./pages/admin/TabsComponent/Account/Usage";
import { IS_MAINTENANCE_MODE } from "./utils/constants";
import Maintenance from "./pages/Maintenance";

import Commerce from "./pages/admin/TabsComponent/Commerce/Commerce";
import Operations from "./pages/admin/TabsComponent/Business/Operations";
import Home from "./pages/landing/Home";
import AllAgents from "./pages/admin/AllAgents";
import Pricing from "./pages/landing/Pricing";
import { Loader } from "lucide-react";
import PaymentSuccessPage from "./pages/admin/PlanComponents/PaymentSuccessPage";
import PaymentCancelPage from "./pages/admin/PlanComponents/PaymentCancelPage";
import { useUserStore } from "./store/useUserStore";
import RescheduleBookingWrapper from "./components/chatbotComponents/chatbotBookingComponents/RescheduleBookingWrapper";
import Payments from "./pages/admin/TabsComponent/Account/Payments";
import Income from "./pages/admin/TabsComponent/Business/Income";
import Overview from "./pages/admin/TabsComponent/Dashboard/Overview";
import Support from "./pages/admin/Support";
import Team from "./pages/admin/TabsComponent/Account/Team";
import PrivacyPolicy from "./pages/landing/PrivacyPolicy";
import Embed from "./pages/admin/TabsComponent/Dashboard/Embed";
import TermConditions from "./pages/landing/TermConditions";
import Calendar from "./pages/admin/TabsComponent/Calendar/Calendar";

// Add type definition for window
declare global {
  interface Window {
    setActiveAdminTab?: (tab: string) => void;
  }
}

// Create wagmi config
const config = createConfig({
  chains: [mainnet, base, bsc],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
  },
});

// Create a client
const queryClient = new QueryClient();

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminLoggedIn, initializeSession: initializeAdminSession } =
    useAdminStore();
  const { initializeSession: initializeUserSession } = useUserStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(true);

  // Initialize sessions on mount
  useEffect(() => {
    const init = async () => {
      await Promise.all([initializeAdminSession(), initializeUserSession()]);
      setIsInitializing(false);
      setHasInitialized(true);
    };
    init();
  }, [initializeAdminSession, initializeUserSession]);

  // Handle redirect to signup when user has no agents
  useEffect(() => {
    if (!isInitializing && !isAdminLoggedIn) {
      if (!location.pathname.includes("/admin/signup")) {
        navigate("/admin/signup");
      }
    }
  }, [isAdminLoggedIn, navigate, location.pathname, isInitializing]);

  // Redirect to profile only on initial load
  useEffect(() => {
    if (hasInitialized && isAdminLoggedIn && location.pathname === "/admin") {
      navigate("/admin/dashboard/overview");
    }
  }, [hasInitialized, isAdminLoggedIn, location.pathname, navigate]);

  // Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin" />
      </div>
    );
  }

  // If logged in and agent selected, show admin layout with content
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard/overview" element={<Overview />} />
        <Route path="dashboard/profile" element={<Profile />} />

        <Route path="dashboard/brain" element={<Brain />} />
        <Route path="dashboard/ai-model" element={<AiModel />} />
        <Route path="dashboard/voice" element={<Voice />} />
        <Route path="dashboard/theme" element={<Theme />} />
        <Route path="dashboard/welcome" element={<WelcomeText />} />
        <Route path="dashboard/prompts" element={<Prompts />} />
        <Route path="dashboard/embed" element={<Embed />} />

        <Route path="commerce" element={<Commerce />} />
        <Route path="commerce/add" element={<Commerce />} />
        <Route path="commerce/manage" element={<Commerce />} />
        <Route path="commerce/email" element={<Commerce />} />

        <Route path="business" element={<Operations />} />
        <Route path="business/orders" element={<Operations />} />
        <Route path="business/payments" element={<Payments />} />
        <Route path="business/income" element={<Income />} />

        <Route path="business/integrations" element={<Operations />} />

        {/* Modified Calendar Routes */}
        <Route path="calendar/manage" element={<Calendar />} />
        <Route path="calendar/email" element={<Calendar />} />
        <Route 
          path="commerce/calendar" 
          element={<BookingDashboardWrapper />} 
        />
        <Route
          path="commerce/calendar/edit"
          element={<BookingDashboardWrapper isEditMode={true} />}
        />
        <Route
          path="commerce/calendar/new"
          element={<BookingDashboardWrapper />}
        />
        <Route path="commerce/policies" element={<Policies />} />
        <Route path="crm/chat-logs" element={<ChatLogs />} />
        <Route path="crm/leads" element={<CustomerLeads />} />

        <Route path="account/income" element={<Income />} />
        <Route path="account/plans" element={<Plans />} />
        <Route path="account/usage" element={<Usage />} />
        <Route path="account/team" element={<Team />} />
        <Route path="all-agents" element={<AllAgents />} />
        <Route path="support" element={<Support />} />
        <Route path="dashboard/overview" element={<Overview />} />
        <Route path="*" element={<Navigate to="dashboard/profile" replace />} />
      </Routes>
    </AdminLayout>
  );
}

function CustomerBookingPage() {
  const { activeBotId } = useBotConfig();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CustomerBooking
          businessId={activeBotId || "default"}
          serviceName="Consultation"
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <TimezoneProvider>
            <Router>
              <Toaster position="top-right" />
              <Routes>
                {IS_MAINTENANCE_MODE ? (
                  <Route path="*" element={<Maintenance />} />
                ) : (
                  <>
                    <Route path="/admin/signup" element={<Login />} />
                    <Route
                      path="/admin/dashboard/create-bot"
                      element={<CreateNewBot />}
                    />
                    <Route
                      path="/book/:agentId"
                      element={<CustomerBookingPage />}
                    />
                    <Route
                      path="/reschedule/:bookingId"
                      element={<RescheduleBookingWrapper />}
                    />
                    <Route
                      path=":botUsername"
                      element={
                        <PublicChat
                          chatHeight={null}
                          previewConfig={null}
                          isPreview={false}
                          screenName=""
                        />
                      }
                    />
                    <Route
                      path="/admin/payment-success"
                      element={<PaymentSuccessPage />}
                    />
                    <Route
                      path="/admin/payment-cancel"
                      element={<PaymentCancelPage />}
                    />
                    <Route path="/admin/*" element={<Dashboard />} />
                    <Route path="/pricing" element={<Pricing />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route
                      path="/terms-condition"
                      element={<TermConditions />}
                    />
                    <Route path="/" element={<Home />} />
                  </>
                )}
              </Routes>
            </Router>
          </TimezoneProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
