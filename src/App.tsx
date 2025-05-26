import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Header from "./components/adminComponents/Header";
import PublicChat from "./pages/chatbot/PublicChat";
import CustomerBooking from "./components/adminComponents/bookingComponents/CustomerBooking";
import { Toaster } from "react-hot-toast";
import { useBotConfig } from "./store/useBotConfig";

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
import Plans from "./pages/admin/Plans";
import Billing from "./pages/admin/Billing";
import Usage from "./pages/admin/Usage";
import RescheduleBookingWrapper from "./components/chatbotComponents/chatbotBookingComponents/RescheduleBookingWrapper";
import Commerce from "./pages/admin/TabsComponent/Commerce/Commerce";
import Operations from "./pages/admin/TabsComponent/Settings/Operations";
import Home from "./pages/landing/Home";
import AllAgents from "./pages/admin/AllAgents";
import Pricing from "./pages/landing/Pricing";
import { Loader } from "lucide-react";
import PaymentSuccessPage from "./pages/admin/PlanComponents/PaymentSuccessPage";
import PaymentCancelPage from "./pages/admin/PlanComponents/PaymentCancelPage";
import { useUserStore } from "./store/useUserStore";

// Add type definition for window
declare global {
  interface Window {
    setActiveAdminTab?: (tab: string) => void;
  }
}

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
      navigate("/admin/dashboard/profile");
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
        <Route path="dashboard/profile" element={<Profile />} />
        <Route path="dashboard/brain" element={<Brain />} />
        <Route path="dashboard/ai-model" element={<AiModel />} />
        <Route path="dashboard/voice" element={<Voice />} />
        <Route path="dashboard/theme" element={<Theme />} />
        <Route path="dashboard/welcome" element={<WelcomeText />} />
        <Route path="dashboard/prompts" element={<Prompts />} />
        <Route path="operations" element={<Operations />} />
        <Route path="operations/payments" element={<Operations />} />
        <Route path="operations/integrations" element={<Operations />} />
        <Route path="operations/embed" element={<Operations />} />
        <Route path="operations/orders" element={<Operations />} />
        <Route path="operations/email" element={<Operations />} />
        <Route path="commerce" element={<Commerce />} />
        <Route path="commerce/add" element={<Commerce />} />
        <Route path="commerce/manage" element={<Commerce />} />

        {/* Modified Calendar Routes */}
        <Route path="commerce/calendar" element={<BookingDashboardWrapper />} />
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
        <Route path="account/billing" element={<Billing />} />
        <Route path="account/plans" element={<Plans />} />
        <Route path="account/usage" element={<Usage />} />
        <Route path="all-agents" element={<AllAgents />} />
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
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/admin/signup" element={<Login />} />
          <Route
            path="/admin/dashboard/create-bot"
            element={<CreateNewBot />}
          />
          <Route path="/book/:agentId" element={<CustomerBookingPage />} />
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
              />
            }
          />
          <Route
            path="/admin/payment-success"
            element={<PaymentSuccessPage />}
          />
          <Route path="/admin/payment-cancel" element={<PaymentCancelPage />} />
          <Route path="/admin/*" element={<Dashboard />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
