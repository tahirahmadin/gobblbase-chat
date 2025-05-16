import React, { useState, useEffect } from "react";
import { Upload, Link2, Copy, Check, X } from "lucide-react";
import PublicChat from "../../../chatbot/PublicChat";
import {
  uploadProfilePicture,
  updateAgentUsername,
  updateAgentNameAndBio,
  updateSocialHandles,
  updatePromotionalBanner,
} from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { calculateSmartnessLevel } from "../../../../utils/helperFn";
import { PERSONALITY_OPTIONS } from "../../../../utils/constants";

interface SocialMediaLinks {
  instagram: string;
  twitter: string;
  tiktok: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  snapchat: string;
  link: string;
}

const socialMediaIcons = {
  instagram: "https://cdn-icons-png.flaticon.com/512/174/174855.png",
  twitter: "https://cdn-icons-png.flaticon.com/512/733/733579.png",
  tiktok: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png",
  facebook: "https://cdn-icons-png.flaticon.com/512/124/124010.png",
  youtube: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png",
  linkedin: "https://cdn-icons-png.flaticon.com/512/174/174857.png",
  snapchat: "https://cdn-icons-png.flaticon.com/512/2111/2111890.png",
};

const socialMediaBaseUrls = {
  instagram: "https://www.instagram.com/",
  twitter: "https://twitter.com/",
  tiktok: "https://www.tiktok.com/@",
  facebook: "https://www.facebook.com/",
  youtube: "https://www.youtube.com/@",
  linkedin: "https://www.linkedin.com/in/",
  snapchat: "https://www.snapchat.com/add/",
};

const Profile = () => {
  const navigate = useNavigate();
  const [agentName, setAgentName] = useState("");
  const [agentUsername, setAgentUsername] = useState("");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  const [isCheckingUrl, setIsCheckingUrl] = useState(false);
  const [agentBio, setAgentBio] = useState("");
  const [promotionalBanner, setPromotionalBanner] = useState("");
  const [isPromoBannerEnabled, setIsPromoBannerEnabled] = useState(false);
  const [smartnessLevel, setSmartnessLevel] = useState(30);
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    instagram: "",
    twitter: "",
    tiktok: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    snapchat: "",
    link: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { activeBotId, activeBotData, setRefetchBotData, refetchBotData } =
    useBotConfig();
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  const [isSavingPromoBanner, setIsSavingPromoBanner] = useState(false);

  const [agentPicture, setAgentPicture] = useState<string | null>(null);

  const baseUrl = "http://www.kifor.ai/";

  useEffect(() => {
    if (activeBotData?.logo) {
      setAgentPicture(activeBotData?.logo);
    } else if (activeBotData?.personalityType?.name) {
      let voiceName = activeBotData?.personalityType?.name;

      const logoObj = PERSONALITY_OPTIONS.find(
        (model) => model.title === voiceName
      );

      if (logoObj) {
        setAgentPicture(logoObj?.image);
      } else {
        setAgentPicture(
          "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
        );
      }
    }
  }, [activeBotData?.logo, activeBotData?.personalityType?.name]);

  // Initialize username from activeBotData
  useEffect(() => {
    if (activeBotData) {
      setAgentUsername(activeBotData.username);
      setAgentName(activeBotData.name);
      setAgentBio(activeBotData.bio);
      const socials = activeBotData.socials as SocialMediaLinks;
      setSocialMedia(socials);
      setPromotionalBanner(activeBotData.promotionalBanner || "");
      setIsPromoBannerEnabled(activeBotData.isPromoBannerEnabled);

      // Calculate and set smartness level
      const newSmartnessLevel = calculateSmartnessLevel(activeBotData);
      setSmartnessLevel(newSmartnessLevel);
    }
  }, [activeBotData]);

  const handleUrlEdit = () => {
    setIsEditingUrl(true);
    setUrlAvailable(null);
  };

  const validateUsername = (username: string) => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
    return usernameRegex.test(username);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUsername = e.target.value.toLowerCase();
    setAgentUsername(newUsername);
    setUrlAvailable(null);
  };

  const handleUrlSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    if (!validateUsername(agentUsername)) {
      toast.error(
        "Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens"
      );
      return;
    }

    try {
      setIsCheckingUrl(true);
      await updateAgentUsername(activeBotId, agentUsername);
      setRefetchBotData();
      setIsEditingUrl(false);
      setUrlAvailable(true);
      toast.success("Agent URL updated successfully");
    } catch (error: any) {
      console.error("Error updating agent username:", error);
      setUrlAvailable(false);
      toast.error(error.message || "Failed to update agent URL");
    } finally {
      setIsCheckingUrl(false);
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(baseUrl + agentUsername);
    toast.success("URL copied to clipboard");
  };

  const handleVisitUrl = () => {
    window.open(baseUrl + agentUsername, "_blank");
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && activeBotId) {
      try {
        setIsUploading(true);
        // First update the UI with a preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Then upload to server
        await uploadProfilePicture(activeBotId, file);
        setRefetchBotData();
        toast.success("Profile picture updated successfully");
      } catch (error) {
        console.error("Error uploading profile picture:", error);
        toast.error("Failed to update profile picture");
        // Revert the preview on error
        setProfileImage(null);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = async () => {
    setProfileImage(null);
    // You might want to add an API call here to remove the profile picture from the server
  };

  const handleSaveName = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    try {
      setIsSavingName(true);
      await updateAgentNameAndBio(activeBotId, agentName);
      setRefetchBotData();
      toast.success("Agent name updated successfully");
    } catch (error: any) {
      console.error("Error updating agent name:", error);
      toast.error(error.message || "Failed to update agent name");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveBio = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    try {
      setIsSavingBio(true);
      await updateAgentNameAndBio(activeBotId, undefined, agentBio);
      setRefetchBotData();
      toast.success("Agent bio updated successfully");
    } catch (error: any) {
      console.error("Error updating agent bio:", error);
      toast.error(error.message || "Failed to update agent bio");
    } finally {
      setIsSavingBio(false);
    }
  };

  const handleSaveSocials = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }
    try {
      setIsSavingSocials(true);
      await updateSocialHandles(
        activeBotId,
        socialMedia as unknown as Record<string, string>
      );
      setRefetchBotData();
      toast.success("Social media links updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update social media links");
    } finally {
      setIsSavingSocials(false);
    }
  };

  const handleSavePromoBanner = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    try {
      setIsSavingPromoBanner(true);
      await updatePromotionalBanner(
        activeBotId,
        promotionalBanner,
        isPromoBannerEnabled
      );
      setRefetchBotData();
      toast.success("Promotional banner updated successfully");
    } catch (error: any) {
      console.error("Error updating promotional banner:", error);
      toast.error(error.message || "Failed to update promotional banner");
    } finally {
      setIsSavingPromoBanner(false);
    }
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-5 w-full bg-white"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="col-span-1 lg:col-span-3 overflow-y-auto h-full">
        <div className="max-w-3xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="p-6 shadow-sm">
            {/* Profile Image Upload */}
            <div className="flex items-start mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {isUploading ? (
                    <div className="animate-pulse bg-gray-200 w-full h-full" />
                  ) : profileImage ? (
                    <img
                      src={profileImage}
                      alt="Agent"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={agentPicture}
                      alt="Default Agent"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 flex space-x-1">
                  <label
                    className={`w-5 h-5 ${
                      isUploading
                        ? "bg-gray-400"
                        : "bg-blue-600 hover:bg-blue-700"
                    } flex items-center justify-center cursor-pointer transition-colors`}
                  >
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                      disabled={isUploading}
                    />
                    <Upload className="w-3 h-3 text-white" />
                  </label>
                  {profileImage && (
                    <button
                      className="w-5 h-5 bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Agent Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  placeholder="Type your name or brand"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <button
                  onClick={handleSaveName}
                  disabled={isSavingName}
                  className={`px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors ${
                    isSavingName ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSavingName ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>

            {/* Agent URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent URL
              </label>
              {!isEditingUrl ? (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-gray-50">
                      <span className="text-gray-500">{baseUrl}</span>
                      <span>{agentUsername}</span>
                    </div>
                    <div className="absolute right-1 top-1/2 -translate-y-1/2 flex space-x-1">
                      <button
                        onClick={handleCopyUrl}
                        className="w-5 h-5 bg-gray-100 flex items-center justify-center hover:bg-gray-200 rounded-sm transition-colors"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={handleVisitUrl}
                        className="w-5 h-5 bg-gray-100 flex items-center justify-center hover:bg-gray-200 rounded-sm transition-colors"
                        title="Visit URL"
                      >
                        <Link2 className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleUrlEdit}
                    className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                        <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm border-r">
                          {baseUrl}
                        </span>
                        <input
                          type="text"
                          value={agentUsername}
                          onChange={handleUsernameChange}
                          placeholder="your-username"
                          className="flex-1 px-3 py-2 focus:outline-none text-sm"
                          disabled={isCheckingUrl}
                        />
                      </div>
                      {urlAvailable !== null && !isCheckingUrl && (
                        <div
                          className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center ${
                            urlAvailable ? "text-green-500" : "text-red-500"
                          }`}
                        >
                          {urlAvailable ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-xs">
                              Username not available
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleUrlSave}
                      disabled={isCheckingUrl}
                      className={`px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors
                        ${
                          isCheckingUrl ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                      {isCheckingUrl ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Checking...</span>
                        </div>
                      ) : (
                        "Save"
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Username must be 3-30 characters and can only contain
                    letters, numbers, underscores, and hyphens
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Agent Bio */}
          <div className="p-6 shadow-sm">
            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Agent Bio
                </label>
                <span className="text-xs text-gray-500">
                  MAX 150 CHARACTERS
                </span>
              </div>
              <div className="space-y-2">
                <textarea
                  value={agentBio}
                  onChange={(e) => setAgentBio(e.target.value)}
                  placeholder="Describe your agent purpose or business..."
                  maxLength={150}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className={`px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors ${
                      isSavingBio ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSavingBio ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Smartness */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                AGENT SMARTNESS
              </span>
              <span className="text-sm text-gray-500">
                {smartnessLevel}% COMPLETE
              </span>
            </div>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${smartnessLevel}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                />
              </div>
            </div>
            <button
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              onClick={() => {
                navigate("/admin/dashboard/brain");
              }}
            >
              SMARTEN
            </button>
          </div>

          {/* Promotional Banner */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Promotional Banner
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">MAX 50 CHARACTERS</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPromoBannerEnabled}
                    onChange={(e) => setIsPromoBannerEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={promotionalBanner}
                onChange={(e) => setPromotionalBanner(e.target.value)}
                placeholder="Type your promotional text..."
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleSavePromoBanner}
                  disabled={isSavingPromoBanner}
                  className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors ${
                    isSavingPromoBanner ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSavingPromoBanner ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Social Media Handles */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Social Media Handles
            </label>
            {Object.entries(socialMedia).map(([platform, url]) => {
              // Extract username from full URL if it exists
              const baseUrl =
                socialMediaBaseUrls[
                  platform as keyof typeof socialMediaBaseUrls
                ];
              const username = url.startsWith(baseUrl)
                ? url.slice(baseUrl.length)
                : url;

              return (
                <div key={platform} className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img
                      src={
                        socialMediaIcons[
                          platform as keyof typeof socialMediaIcons
                        ]
                      }
                      alt={platform}
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <div className="flex-1 flex items-center border border-gray-300 rounded-md overflow-hidden">
                    <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm whitespace-nowrap">
                      {baseUrl}
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) =>
                        setSocialMedia({
                          ...socialMedia,
                          [platform]: e.target.value,
                        })
                      }
                      placeholder={`Enter ${platform} handle`}
                      className="flex-1 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              );
            })}
            <div className="flex justify-end">
              <button
                onClick={handleSaveSocials}
                disabled={isSavingSocials}
                className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors mt-2 ${
                  isSavingSocials ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSavingSocials ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "SAVE"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="hidden lg:block col-span-2 h-full sticky top-0 flex items-center justify-center"
        style={{ backgroundColor: "#eaefff" }}
      >
        <div
          className="mx-auto"
          style={{
            maxWidth: 400,
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PublicChat previewConfig={activeBotData} chatHeight={null} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
