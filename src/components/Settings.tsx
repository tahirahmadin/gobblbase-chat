import React, { useState, useEffect } from "react";
import { CreditCard, BarChart2, Upload, Bot } from "lucide-react";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";
import {
  updateAgentUsername,
  uploadProfilePicture,
  updateCalendlyUrl,
} from "../lib/serverActions";

interface Plan {
  name: string;
  price: string;
  features: string[];
  current: boolean;
}

const SettingsPage: React.FC = () => {
  const { activeAgentId, activeAgentUsername, calendlyUrl, setCalendlyUrl } =
    useUserStore();

  const [isEnabled, setIsEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState("services");
  const [agentUsername, setAgentUsername] = useState(activeAgentUsername || "");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isUsernameChanged = agentUsername !== activeAgentUsername;

  const handleUsernameUpdate = async () => {
    if (!activeAgentId) {
      toast.error("No active agent selected");
      return;
    }

    setIsUpdating(true);
    try {
      await updateAgentUsername(activeAgentId, agentUsername);
      toast.success("Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!activeAgentId || !profilePicture) {
      toast.error("No active agent or profile picture selected");
      return;
    }

    setIsUpdating(true);
    try {
      await uploadProfilePicture(activeAgentId, profilePicture);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCalendlyUrlUpdate = async () => {
    if (!activeAgentId) {
      toast.error("No active agent selected");
      return;
    }

    setIsUpdating(true);
    try {
      await updateCalendlyUrl(activeAgentId, calendlyUrl);
      toast.success("Calendly URL updated successfully");
    } catch (error) {
      console.error("Error updating Calendly URL:", error);
      toast.error("Failed to update Calendly URL");
    } finally {
      setIsUpdating(false);
    }
  };

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
      case "services":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Agent Profile</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Agent Username
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={agentUsername}
                      onChange={(e) => setAgentUsername(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter agent username"
                    />
                    <button
                      onClick={handleUsernameUpdate}
                      disabled={
                        isUpdating || !agentUsername || !isUsernameChanged
                      }
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Update"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        id="profile-picture"
                      />
                      <label
                        htmlFor="profile-picture"
                        className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span>
                          {profilePicture
                            ? profilePicture.name
                            : "Choose a profile picture"}
                        </span>
                      </label>
                    </div>
                    {profilePicturePreview && (
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <button
                      onClick={handleProfilePictureUpload}
                      disabled={isUpdating || !profilePicture}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Uploading..." : "Upload"}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calendly URL
                  </label>
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={calendlyUrl}
                      onChange={(e) => setCalendlyUrl(e.target.value)}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Enter your Calendly URL"
                    />
                    <button
                      onClick={handleCalendlyUrlUpdate}
                      disabled={isUpdating || !calendlyUrl}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? "Updating..." : "Update"}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    You can get your Calendly URL by visiting{" "}
                    <a
                      href="https://calendly.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600"
                    >
                      https://calendly.com/
                    </a>
                  </p>
                </div>
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
            onClick={() => setActiveTab("services")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              activeTab === "services"
                ? "bg-blue-50 text-blue-600 border-l-4 border-blue-500"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Bot className="h-5 w-5" />
            <span>Services</span>
          </button>
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
        </div>
      </div>
      <div className="flex-1">{renderTabContent()}</div>
    </div>
  );
};

export default SettingsPage;
