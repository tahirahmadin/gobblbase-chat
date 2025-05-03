import React from "react";
import { X, User, LogOut } from "lucide-react";
import { useUserStore } from "../../../store/useUserStore";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose }) => {
  const { userEmail, logout } = useUserStore();
  const [activeTab, setActiveTab] = React.useState<
    "profile" | "bookings" | "orders"
  >("profile");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-lg">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{userEmail}</p>
                <p className="text-sm text-gray-500">View Profile</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-2 border-b">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "profile"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "bookings"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
              >
                Bookings
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === "orders"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500"
                }`}
              >
                Orders
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Account Details</h3>
                  <p className="text-sm text-gray-600">Email: {userEmail}</p>
                </div>
              </div>
            )}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Upcoming Bookings</h3>
                  <p className="text-sm text-gray-600">No upcoming bookings</p>
                </div>
              </div>
            )}
            {activeTab === "orders" && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Recent Orders</h3>
                  <p className="text-sm text-gray-600">No recent orders</p>
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
