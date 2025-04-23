import React, { useState, useEffect } from "react";
import {
  CreditCard,
  BarChart2,
  Upload,
  Bot,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { uploadProfilePicture } from "../lib/serverActions";
import { useBotConfig } from "../store/useBotConfig";

interface Plan {
  name: string;
  price: string;
  features: string[];
  current: boolean;
}

const SettingsPage: React.FC = () => {
  const { activeBotData, updateBotUsernameViaStore, updateBotLogoViaStore } =
    useBotConfig();

  const [activeTab, setActiveTab] = useState("services");
  const [agentUsername, setAgentUsername] = useState(
    activeBotData?.username || ""
  );
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState<
    string | null
  >(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(true);

  const isUsernameChanged = agentUsername !== activeBotData?.username;

  const handleUsernameUpdate = async () => {
    if (!activeBotData?.agentId) {
      toast.error("No active agent selected");
      return;
    }

    if (!isUsernameValid) {
      return;
    }

    setIsUpdating(true);
    try {
      console.log("calling updateBotUsernameViaStore");
      await updateBotUsernameViaStore(activeBotData?.agentId, agentUsername);
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
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!activeBotData?.agentId || !profilePicture) {
      toast.error("No active agent or profile picture selected");
      return;
    }

    setIsUpdating(true);
    try {
      await updateBotLogoViaStore(activeBotData?.agentId, profilePicture);
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.error("Failed to upload profile picture");
    } finally {
      setIsUpdating(false);
    }
  };

  const validateUsername = (username: string) => {
    const regex = /^[a-zA-Z0-9]+$/;
    const isValid = regex.test(username) && username.length >= 3;
    setIsUsernameValid(isValid);
  };

  useEffect(() => {
    validateUsername(agentUsername);
  }, [agentUsername]);

  const plans: Plan[] = [
    {
      name: "Free",
      price: "$0/month",
      features: ["Basic features", "Limited usage", "Booking features"],
      current: true,
    },
    {
      name: "Pro",
      price: "$20/month",
      features: [
        "Advanced features",
        "Higher usage limits",
        "Priority support",
        "Custom integrations",
      ],
      current: false,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "billing":
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Current Plan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        );
      case "usage":
        return (
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Coming soon</h3>
          </div>
        );
      case "services":
        return (
          <div className="space-y-6">
            {/* Username Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="h-6 w-6 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bot Handle
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Choose a unique handle for your bot. This will be used in your
                  bot's URL: KiFor.ai/#chat/
                  <span className="font-mono text-gray-900">
                    {agentUsername || "your-handle"}
                  </span>
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={agentUsername}
                      onChange={(e) => {
                        setAgentUsername(e.target.value);
                        validateUsername(e.target.value);
                      }}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        !isUsernameValid
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-200 focus:ring-gray-900"
                      } focus:outline-none focus:ring-2`}
                      placeholder="Enter bot handle"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {!isUsernameValid ? (
                        <AlertCircle className="h-5 w-5 text-red-500" />
                      ) : agentUsername.length >= 3 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  {!isUsernameValid && (
                    <p className="text-sm text-red-500 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Username must contain only letters and numbers (minimum 3
                      characters)
                    </p>
                  )}

                  <button
                    onClick={handleUsernameUpdate}
                    disabled={
                      isUpdating || !isUsernameValid || !isUsernameChanged
                    }
                    className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                      isUpdating || !isUsernameValid || !isUsernameChanged
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {isUpdating ? "Updating..." : "Update Bot Handle"}
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Picture Section */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Bot className="h-6 w-6 text-gray-900" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Bot Avatar
                  </h2>
                </div>
                <p className="text-gray-600 mb-6">
                  Upload a profile picture for your bot. This will be displayed
                  in conversations and on your bot's page.
                </p>
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 shadow-lg">
                      {profilePicturePreview ? (
                        <img
                          src={profilePicturePreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : activeBotData?.logo ? (
                        <img
                          src={activeBotData.logo}
                          alt="Current profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "";
                            target.parentElement!.innerHTML = `
                              <div class="w-full h-full bg-gray-50 flex items-center justify-center">
                                <Bot class="h-16 w-16 text-gray-400" />
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <Bot className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label
                      htmlFor="profile-picture"
                      className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-800 transition-colors"
                    >
                      <Upload className="h-5 w-5 text-white" />
                    </label>
                  </div>
                  <div className="space-y-4 w-full max-w-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                      id="profile-picture"
                    />
                    {profilePicture && (
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={handleProfilePictureUpload}
                          disabled={isUpdating}
                          className={`flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                            isUpdating
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gray-900 hover:bg-gray-800"
                          }`}
                        >
                          {isUpdating ? "Uploading..." : "Update Avatar"}
                        </button>
                        <button
                          onClick={() => {
                            setProfilePicture(null);
                            setProfilePicturePreview(null);
                          }}
                          className="flex-1 py-3 px-4 rounded-lg text-gray-700 font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 text-center">
                      Recommended: Square image (512x512px)
                      <br />
                      Maximum file size: 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "SERVICES":
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Horizontal Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex">
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "services"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            }`}
          >
            <Bot className="h-5 w-5" />
            <span>Configurations</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "billing"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span>Billing & Plans</span>
          </button>
          <button
            onClick={() => setActiveTab("usage")}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "usage"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
            }`}
          >
            <BarChart2 className="h-5 w-5" />
            <span>Usage</span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-6">{renderTabContent()}</div>
    </div>
  );
};

export default SettingsPage;
