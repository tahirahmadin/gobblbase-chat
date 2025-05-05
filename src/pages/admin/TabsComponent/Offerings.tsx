import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Booking from "../BookingComponent/Booking"; 
import BookingDashboard from "../BookingComponent/BookingDashboard";

const Offerings = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const renderContent = () => {
    switch (true) {
      case currentPath.includes("/offerings/add"):
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Add New Offering
            </h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">
                Create a new product or service offering
              </p>
            </div>
          </div>
        );

      case currentPath.includes("/offerings/manage"):
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Manage Offerings
            </h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">
                View and manage your existing offerings
              </p>
            </div>
          </div>
        );

        case currentPath.includes("/offerings/calendar"):
        // Only show the BookingDashboard at exactly /offerings/calendar
        if (currentPath === "/admin/offerings/calendar" || 
            currentPath === "/admin/offerings/calendar/") {
          return <BookingDashboard />;
        }
        // For other calendar paths, let the router handle it
        return null;

      case currentPath.includes("/offerings/policies"):
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Offering Policies
            </h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">
                Set up and manage your offering policies
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Offerings Overview
            </h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">
                Select a section from the sidebar to get started
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container min-h-screen bg-gray-50 py-4">
      {renderContent()}
    </div>
  );
};

export default Offerings;