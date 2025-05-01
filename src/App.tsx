import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/adminComponents/Header";
import Tabs from "./pages/admin/Tabs";
import FileUpload from "./pages/admin/FileUpload";
import Activity from "./pages/admin/Activity";
import Integration from "./pages/admin/Integration";
import Playground from "./pages/admin/Playground";
import AgentsList from "./pages/admin/AgentsList";
import PublicChat from "./pages/chatbot/PublicChat";
import CustomerBooking from "./components/adminComponents/bookingComponents/CustomerBooking";
import { useUserStore } from "./store/useUserStore";
import { ArrowLeft, Bot } from "lucide-react";
import SettingsPage from "./pages/admin/Settings";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import Products from "./pages/admin/Products";
import { useBotConfig } from "./store/useBotConfig";
import BookingTab from "./pages/chatbot/BookingTab";
import Integrations from "./pages/admin/TabsComponent/Integrations";
import Leads from "./pages/admin/Leads";
import Directory from "./pages/admin/Directory";
import AdminLayout from "./components/adminComponents/AdminLayout";
import Profile from "./pages/admin/TabsComponent/Profile";
import Brain from "./pages/admin/TabsComponent/Brain";
import Voice from "./pages/admin/TabsComponent/Voice";
import Theme from "./pages/admin/TabsComponent/Theme";
import WelcomeText from "./pages/admin/TabsComponent/WelcomeText";
import Prompts from "./pages/admin/TabsComponent/Prompts";
import Business from "./pages/admin/TabsComponent/Business";
import Embed from "./pages/admin/TabsComponent/Embed";
import Offerings from "./pages/admin/TabsComponent/Offerings";

// Add type definition for window
declare global {
  interface Window {
    setActiveAdminTab?: (tab: string) => void;
  }
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState("playground");
  const [isCreating, setIsCreating] = useState(false);
  const { isLoggedIn, handleGoogleLoginSuccess, handleGoogleLoginError } =
    useUserStore();
  const { activeBotId, setActiveBotId } = useBotConfig();

  // Check for redirect from public chat
  useEffect(() => {
    // Check if we have a redirect parameter in localStorage
    const redirectAgentId = localStorage.getItem("redirectToAgentBooking");
    if (redirectAgentId) {
      console.log("Redirecting to booking tab for agent:", redirectAgentId);

      // Set the active bot ID
      setActiveBotId(redirectAgentId);

      // Set the active tab to booking
      setActiveTab("booking");

      // Clear the localStorage item
      localStorage.removeItem("redirectToAgentBooking");
    }
  }, [setActiveBotId]);

  // Make setActiveTab function available to children through window
  useEffect(() => {
    // Add the function to window so it can be called from within iframes
    window.setActiveAdminTab = (tab) => {
      if (tab === "booking") {
        setActiveTab("booking");
      }
    };

    // Clean up
    return () => {
      delete window.setActiveAdminTab;
    };
  }, []);

  // If not logged in, redirect to create tab
  useEffect(() => {
    if (!isLoggedIn) {
      setActiveTab("playground");
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
                <div className="flex items-center justify-center space-x-3">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white">
                    <Bot className="h-8 w-8 text-primary-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome to KiFor.ai
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Sign in to continue
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Access your AI agents and start building amazing experiences
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-full">
                    <div className="flex items-center justify-center">
                      <div className="w-full max-w-xs">
                        <GoogleOAuthProvider
                          clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                        >
                          <GoogleLogin
                            onSuccess={handleGoogleLoginSuccess}
                            onError={handleGoogleLoginError}
                            useOneTap
                            theme="filled_blue"
                            size="large"
                            width="100%"
                          />
                        </GoogleOAuthProvider>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      By signing in, you agree to our Terms of Service and
                      Privacy Policy
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If logged in but no agent selected, show agents list
  if (!activeBotId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!isCreating ? (
            <AgentsList onStartCreating={() => setIsCreating(true)} />
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="">
                  <button
                    onClick={() => setIsCreating(false)}
                    className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Agents
                  </button>
                  <h2 className="text-2xl font-semibold text-gray-900 mt-2">
                    Create New Agent
                  </h2>
                </div>
              </div>
              <FileUpload onCancel={() => setIsCreating(false)} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // If logged in and agent selected, show admin layout with content
  return (
    <AdminLayout>
      <Routes>
        <Route path="dashboard/profile" element={<Profile />} />
        <Route path="dashboard/brain" element={<Brain />} />
        <Route path="dashboard/voice" element={<Voice />} />
        <Route path="dashboard/theme" element={<Theme />} />
        <Route path="dashboard/welcome" element={<WelcomeText />} />
        <Route path="dashboard/prompts" element={<Prompts />} />
        <Route path="business" element={<Business />} />
        <Route path="business/payments" element={<Business />} />
        <Route path="business/integrations" element={<Business />} />
        <Route path="business/embed" element={<Business />} />
        <Route path="offerings" element={<Offerings />} />
        <Route path="offerings/add" element={<Offerings />} />
        <Route path="offerings/manage" element={<Offerings />} />
        <Route path="offerings/calendar" element={<Offerings />} />
        <Route path="offerings/policies" element={<Offerings />} />
        <Route path="crm/*" element={<div>CRM Component</div>} />
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
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/book/:agentId" element={<CustomerBookingPage />} />
        <Route
          path="/:botUsername"
          element={<PublicChat agentUsernamePlayground={null} />}
        />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
