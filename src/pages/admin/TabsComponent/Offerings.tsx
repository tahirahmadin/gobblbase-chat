import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Users } from "lucide-react";

const Offerings = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [selectedBookingType, setSelectedBookingType] = useState("individual");
  const [slotsPerSession, setSlotsPerSession] = useState(2);

  const renderCalendarSetup = () => {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-900">
              Set up Calendar
            </h1>
            <p className="text-gray-600 mt-1">
              Configure your calendar for appointments & 1:1 meetings
            </p>
          </div>

          {/* Steps Container */}
          <div className="space-y-4">
            {/* Step 1: Booking Type */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <h2 className="ml-3 text-lg font-medium">Booking Type</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Individual Sessions Option */}
                <div
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedBookingType === "individual"
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-white border border-gray-200"
                  }`}
                  onClick={() => setSelectedBookingType("individual")}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <h3 className="font-medium">Individual 1:1 Sessions</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ideal for Consultants, Coaches and Freelancers
                  </p>
                </div>

                {/* Multiple Slots Option */}
                <div
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedBookingType === "multiple"
                      ? "bg-green-100 border-2 border-green-500"
                      : "bg-white border border-gray-200"
                  }`}
                  onClick={() => setSelectedBookingType("multiple")}
                >
                  <div className="flex items-center mb-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-600" />
                    </div>
                  </div>
                  <h3 className="font-medium">Multiple Slots per Session</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Ideal for large-size service providers like Salons & Clinics
                  </p>

                  {selectedBookingType === "multiple" && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-600">
                        SLOTS PER SESSION
                      </label>
                      <div className="flex items-center mt-2">
                        <button
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                          onClick={() =>
                            setSlotsPerSession(Math.max(1, slotsPerSession - 1))
                          }
                        >
                          -
                        </button>
                        <span className="mx-4 font-medium">
                          {slotsPerSession}
                        </span>
                        <button
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center"
                          onClick={() =>
                            setSlotsPerSession(slotsPerSession + 1)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Next
                </button>
              </div>
            </div>

            {/* Step 2: Duration */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-400">
                  Duration
                </h2>
              </div>
            </div>

            {/* Step 3: Availability */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-400">
                  Availability
                </h2>
              </div>
            </div>

            {/* Step 4: Location */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <h2 className="ml-3 text-lg font-medium text-gray-400">
                  Location
                </h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        return renderCalendarSetup();

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
    <div className="container min-h-screen bg-gray-50 py-8">
      {renderContent()}
    </div>
  );
};

export default Offerings;
