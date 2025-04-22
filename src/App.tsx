import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import FileUpload from "./components/FileUpload";
import Activity from "./components/Activity";
import Integration from "./components/Integration";
import Playground from "./components/Playground";
import AgentsList from "./components/AgentsList";
import PublicChat from "./components/PublicChat";
import CustomerBooking from "./components/booking/CustomerBooking";
import Services from "./components/Services";
import { useUserStore } from "./store/useUserStore";
import { ArrowLeft, Bot } from "lucide-react";
import SettingsPage from "./components/Settings";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { signUpClient } from "./lib/serverActions";
import { toast, Toaster } from "react-hot-toast";

function Dashboard() {
  const [activeTab, setActiveTab] = useState("playground");
  const [isCreating, setIsCreating] = useState(false);
  const {
    activeAgentId,
    agents,
    isLoggedIn,
    setActiveAgentId,
    setUserEmail,
    setIsLoggedIn,
    setClientId,
  } = useUserStore();

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    try {
      // Decode the JWT token to get user info
      const base64Url = credentialResponse.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const userInfo = JSON.parse(jsonPayload);
      setUserEmail(userInfo.email);
      setIsLoggedIn(true);

      // Call the signUpClient API
      const response = await signUpClient("google", userInfo.email);

      if (response.error) {
        toast.error("Failed to complete signup process");
        console.error("Signup failed:", response.result);
      } else {
        // Store the clientId from the response
        if (typeof response.result !== "string" && response.result._id) {
          setClientId(response.result._id);
        }
        toast.success("Successfully signed up!");
        console.log("User signed up successfully:", response.result);
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      toast.error("An error occurred during login");
    }
  };

  const handleGoogleLoginError = () => {
    console.log("Login Failed");
    toast.error("Google login failed");
  };

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
  if (!activeAgentId) {
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

  // If logged in and agent selected, show tabs and content
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          <div className="w-42 pr-8">
            <div className="mb-4">
              <button
                onClick={() => setActiveAgentId(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Agents
              </button>
            </div>
            <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          <div className="flex-1">
            {activeTab === "playground" && (
              <Playground agentId={activeAgentId} />
            )}
            {activeTab === "activity" && <Activity />}
            {activeTab === "integration" && <Integration />}
            {activeTab === "services" && <Services />}
            {activeTab === "settings" && <SettingsPage />}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerBookingPage() {
  const { activeAgentId } = useUserStore();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <CustomerBooking 
          businessId={activeAgentId || "default"} 
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
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/chatbot/:botUsername"
          element={<PublicChat agentUsernamePlayground={null} />}
        />
        <Route path="/book/:agentId" element={<CustomerBookingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
