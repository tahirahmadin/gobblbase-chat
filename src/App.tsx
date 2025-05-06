import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Header from "./components/adminComponents/Header";
import PublicChat from "./pages/chatbot/PublicChat";
import CustomerBooking from "./components/adminComponents/bookingComponents/CustomerBooking";
import { Toaster } from "react-hot-toast";
import { useBotConfig } from "./store/useBotConfig";

import AdminLayout from "./components/adminComponents/AdminLayout";
import Profile from "./pages/admin/TabsComponent/Profile";
import Brain from "./pages/admin/TabsComponent/Brain";
import Voice from "./pages/admin/TabsComponent/Voice";
import Theme from "./pages/admin/TabsComponent/Theme";
import WelcomeText from "./pages/admin/TabsComponent/WelcomeText";
import Prompts from "./pages/admin/TabsComponent/Prompts";
import Business from "./pages/admin/TabsComponent/Business";
import Offerings from "./pages/admin/TabsComponent/Offerings";
import Policies from "./pages/admin/TabsComponent/Policies";
import ChatLogs from "./pages/admin/TabsComponent/ChatLogs";
import CustomerLeads from "./pages/admin/TabsComponent/CustomerLeads";
import Booking from "./pages/admin/BookingComponent/Booking";
import BookingDashboardWrapper from "./pages/admin/BookingComponent/BookingDashboardWrapper";
import Login from "./pages/admin/Login";
import { useAdminStore } from "./store/useAdminStore";
import CreateNewBot from "./pages/admin/CreateNewBot";

// Add type definition for window
declare global {
  interface Window {
    setActiveAdminTab?: (tab: string) => void;
  }
}

function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdminLoggedIn, totalAgents, adminId, adminEmail, agents } =
    useAdminStore();

  console.log(totalAgents);
  console.log(isAdminLoggedIn);
  console.log(adminId);
  console.log(adminEmail);
  console.log(agents);

  // Handle redirect to signup when user has no agents
  useEffect(() => {
    if (!isAdminLoggedIn) {
      if (!location.pathname.includes("/admin/signup")) {
        navigate("/admin/signup");
      }
    }
  }, [isAdminLoggedIn, navigate, location.pathname]);

  // Check for redirect from public chat
  // useEffect(() => {
  //   // Check if we have a redirect parameter in localStorage
  //   const redirectAgentId = localStorage.getItem("redirectToAgentBooking");
  //   if (redirectAgentId) {
  //     console.log("Redirecting to booking tab for agent:", redirectAgentId);

  //     // Set the active bot ID
  //     setActiveBotId(redirectAgentId);

  //     // Set the active tab to booking
  //     setActiveTab("booking");

  //     // Clear the localStorage item
  //     localStorage.removeItem("redirectToAgentBooking");
  //   }
  // }, [setActiveBotId]);

  // Make setActiveTab function available to children through window
  // useEffect(() => {
  //   // Add the function to window so it can be called from within iframes
  //   window.setActiveAdminTab = (tab) => {
  //     if (tab === "booking") {
  //       setActiveTab("booking");
  //     }
  //   };

  //   // Clean up
  //   return () => {
  //     delete window.setActiveAdminTab;
  //   };
  // }, []);

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
        <Route path="business/orders" element={<Business />} />
        <Route path="business/email" element={<Business />} />
        <Route path="offerings" element={<Offerings />} />
        <Route path="offerings/add" element={<Offerings />} />
        <Route path="offerings/manage" element={<Offerings />} />

        {/* Modified Calendar Routes */}
        <Route
          path="offerings/calendar"
          element={<BookingDashboardWrapper />}
        />
        <Route
          path="offerings/calendar/edit"
          element={
            <Booking
              isEditMode={true}
              onSetupComplete={() => navigate("/admin/offerings/calendar")}
            />
          }
        />
        <Route
          path="offerings/calendar/new"
          element={
            <Booking
              isEditMode={false}
              onSetupComplete={() => navigate("/admin/offerings/calendar")}
            />
          }
        />
        <Route path="offerings/policies" element={<Policies />} />
        <Route path="crm/chat-logs" element={<ChatLogs />} />
        <Route path="crm/leads" element={<CustomerLeads />} />
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
        <Route path="/admin/signup" element={<Login />} />
        <Route path="/admin/dashboard/create-bot" element={<CreateNewBot />} />
        <Route path="/book/:agentId" element={<CustomerBookingPage />} />
        <Route
          path="/:botUsername"
          element={<PublicChat previewConfig={null} />}
        />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
