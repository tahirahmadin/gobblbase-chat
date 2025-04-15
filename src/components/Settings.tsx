import React, { useState } from "react";
import {
  CreditCard,
  BarChart2,
  Settings,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

interface Plan {
  name: string;
  price: string;
  features: string[];
  current: boolean;
}

const SettingsPage: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("billing");

  const plans: Plan[] = [
    {
      name: "Free",
      price: "$0/month",
      features: ["Basic features", "Limited usage", "Community support"],
      current: true,
    },
    {
      name: "Pro",
      price: "$29/month",
      features: [
        "Advanced features",
        "Higher usage limits",
        "Priority support",
        "Custom integrations",
      ],
      current: false,
    },
    {
      name: "Enterprise",
      price: "Custom",
      features: [
        "All Pro features",
        "Unlimited usage",
        "Dedicated support",
        "Custom development",
      ],
      current: false,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "billing":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Current Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.name}
                    className={`border rounded-lg p-4 ${
                      plan.current
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <h4 className="font-semibold">{plan.name}</h4>
                    <p className="text-2xl font-bold my-2">{plan.price}</p>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {!plan.current && (
                      <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                        Upgrade
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
              <div className="flex items-center space-x-4">
                <CreditCard className="h-8 w-8 text-gray-400" />
                <span>Visa ending in 4242</span>
                <button className="text-blue-500 hover:text-blue-600">
                  Update
                </button>
              </div>
            </div>
          </div>
        );
      case "usage":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">Usage Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="text-gray-500">API Calls</h4>
                <p className="text-2xl font-bold">1,234</p>
                <p className="text-sm text-gray-500">This month</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-gray-500">Storage</h4>
                <p className="text-2xl font-bold">2.5 GB</p>
                <p className="text-sm text-gray-500">of 10 GB used</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="text-gray-500">Active Users</h4>
                <p className="text-2xl font-bold">45</p>
                <p className="text-sm text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Notifications</h4>
                  <p className="text-sm text-gray-500">
                    Receive email notifications about your account
                  </p>
                </div>
                <button
                  onClick={() => setIsEnabled(!isEnabled)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  {isEnabled ? (
                    <ToggleRight className="h-6 w-6 text-blue-500" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="text-blue-500 hover:text-blue-600">
                  Enable
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex space-x-6">
      <div className="w-64 flex-shrink-0">
        <div className="space-y-1">
          <button
            onClick={() => setActiveTab("billing")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              activeTab === "billing"
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Billing & Plans</span>
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              activeTab === "usage"
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Usage</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              activeTab === "settings"
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
};

export default SettingsPage;
