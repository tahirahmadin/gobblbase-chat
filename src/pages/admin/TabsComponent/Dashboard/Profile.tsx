import React, { useState, useEffect } from "react";
import { Upload, Link2, Copy, Check, X } from "lucide-react";
import PublicChat from "../../../chatbot/PublicChat";
import {
  uploadProfilePicture,
  updateAgentUsername,
  updateAgentNameAndBio,
  updatePromotionalBanner,
} from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { calculateSmartnessLevel } from "../../../../utils/helperFn";
import { PERSONALITY_OPTIONS } from "../../../../utils/constants";
import SocialMediaSection from "./SocialMediaSection";
import CustomLinksSection from "./CustomLinksSection";
import styled from "styled-components";
const Lable = styled.label`
  position: relative;
  width: 35px;
  height: 35px;
  border: 2px solid black;
  display: grid;
  place-items: center;
  background: #aeb8ff;
  overflow: none;
  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
  }
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #aeb8ff;
  }

  .btn-container {
    z-index: 2;
  }
`;
const Icon = styled.button`
  position: relative;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #aeb8ff;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &:hover {
    background: #aeb8ff;
  }

  @media (max-width: 600px) {
    width: 30px;
    height: 30px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #aeb8ff;
  }
`;

const Button = styled.button`
  position: relative;
  background: #4d65ff;
  padding: 0.6vh 3vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  color: white;
  &::before {
    content: "";
    position: absolute;
    top: 6px;
    right: -6px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #6aff97;
  }
  @media (max-width: 600px) {
    min-width: 100px;
  }
  &:disabled {
    background: #d6ffe0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    activeBotId,
    activeBotData,
    setRefetchBotData,
    updateBotLogoViaStore,
  } = useBotConfig();
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
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
        setAgentPicture(logoObj.image);
      } else {
        setAgentPicture("/assets/voice/friend.png");
      }
    }
  }, [activeBotData?.logo, activeBotData?.personalityType?.name]);

  useEffect(() => {
    if (activeBotData) {
      setAgentUsername(activeBotData.username);
      setAgentName(activeBotData.name);
      setAgentBio(activeBotData.bio);
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
      let response = await updateAgentUsername(activeBotId, agentUsername);
      console.log(response);
      setRefetchBotData();
      setIsEditingUrl(false);
      setUrlAvailable(true);
      toast.success("Agent URL updated successfully");
    } catch (error: any) {
      console.error("Error updating agent username:", error);
      setUrlAvailable(false);
      console.log(error);
      toast.error("Username already exists!");
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
        await updateBotLogoViaStore(activeBotId, file);

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

  const handlePromoBannerChange = (value: string) => {
    if (promotionalBanner === "" && value.length > 0) {
      setIsPromoBannerEnabled(true);
    }
    setPromotionalBanner(value);
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-5 w-full bg-white overflow-scroll lg:overflow-hidden"
      style={{ height: "calc(100vh - 64px)" }}
    >
      <div className="col-span-1 lg:col-span-3 h-full sm:px-6 lg:overflow-auto">
        <div className="max-w-3xl mx-auto p-4 lg:p-0 space-y-6 ">
          <div className="w-full flex flex-col sm:flex-row sm:items-end sm:gap-8">
            {/* Profile Image Upload */}
            <div className="flex items-start mt-16 pb-4">
              <div className="relative flex flex-col items-center gap-2">
                <div className="w-20 h-20 lg:h-24 lg:w-24 shadow-[1px_1px_4px_0_#0C0C0D0D] outline outline-[1px] outline-offset-4 rounded-full bg-white flex items-center justify-center overflow-hidden">
                  {isUploading ? (
                    <div className="animate-pulse bg-gray-200 w-full h-full" />
                  ) : profileImage ? (
                    <img
                      src={profileImage}
                      alt="Agent"
                      className="w-full h-full object-coverc"
                    />
                  ) : (
                    <img
                      src={agentPicture || "/assets/voice/friend.png"}
                      alt="Agent"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="relative flex gap-2 mt-3  pb-4 ">
                  <div style={{ zIndex: "2" }}>
                    <Lable
                      className={`${
                        isUploading ? "bg-gray-400" : ""
                      } flex items-center justify-center`}
                    >
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleImageUpload}
                        accept="image/*"
                        disabled={isUploading}
                      />
                      <Upload
                        style={{ strokeWidth: "4px" }}
                        className="w-4 h-4"
                      />
                    </Lable>
                  </div>
                  {profileImage && (
                    <div style={{ zIndex: "2" }} className="icon">
                      <Icon
                        className="w-5 h-5 bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                        onClick={handleRemoveImage}
                        disabled={isUploading}
                      >
                        <X style={{ strokeWidth: "4px" }} className="w-4 h-4" />
                      </Icon>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Agent Name */} {/* Agent URL */}
            <div className="overflow-hidden w-full name-and-url lg:mt-8 ">
              <div className="mb-4 pr-4">
                <h3 className="main-font block text-md md:text-lg font-medium text-[#000000]">
                  Agent Name
                </h3>
                <div className="flex flex-col space-y-2 xs:flex-row xs:items-center xs:space-x-2 xs:space-y-0 lg:items-end lg:flex-col lg:space-y-2 xl:flex-row">
                  <input
                    type="text"
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="Type your name or brand"
                    className="truncate w-full flex-1 px-3 py-2 border border-[#7D7D7D] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <div className="flex justify-end relative z-10">
                    <Button
                      onClick={handleSaveName}
                      disabled={isSavingName}
                      className={`${isSavingName ? " cursor-not-allowed" : ""}`}
                    >
                      {isSavingName ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Saving...</span>
                        </div>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="truncate pr-4">
                <h3 className="main-font block text-md md:text-lg font-medium text-[#000000]">
                  Agent URL
                </h3>
                {!isEditingUrl ? (
                  <div className="space-y-2 pb-4">
                    <div className="flex flex-col space-y-2 xs:flex-row xs:items-center xs:space-x-2 xs:space-y-0 lg:items-end lg:flex-col lg:space-y-2 xl:flex-row">
                      <div className="flex-1 w-full sm:w-fit lg:w-full relative">
                        <div className="flex items-center border border-[#7D7D7D] w-[100%] overflow-hidden">
                          <span className=" pr-1 py-2 bg-gray-100 text-gray-500 text-sm border-r">
                            <h2 className="pl-3 truncate max:w-[80%]">{baseUrl}</h2>
                          </span>
                            <h2 className="truncate w-[8z`0%] flex-1 px-3 py-2 focus:outline-none text-sm">
                              {agentUsername} 
                            </h2>
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
                      <div className="flex justify-end relative z-10">
                        <Button onClick={handleUrlEdit} className="">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-2 xs:flex-row xs:items-center xs:space-x-2 xs:space-y-0 lg:items-end lg:flex-col lg:space-y-2 xl:flex-row">
                      <div className="flex-1 w-full sm:w-fit lg:w-full relative">
                        <div className="flex items-center border border-[#7D7D7D] overflow-hidden">
                          <span className="pl-3 pr-1 py-2 bg-gray-100 text-gray-500 text-sm border-r">
                            <h2 className="truncate max-[80%]">{baseUrl}</h2>
                          </span>
                          <input
                            type="text"
                            value={agentUsername}
                            onChange={handleUsernameChange}
                            placeholder="your-username"
                            className="truncate w-[80%] flex-1 px-3 py-2 focus:outline-none text-sm"
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
                              <span className="hidden sm:block text-xs">
                                Username not available
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end relative z-10">
                        <Button
                          onClick={handleUrlSave}
                          disabled={isCheckingUrl}
                          className={`
                            ${isCheckingUrl ? " cursor-not-allowed" : ""}`}
                        >
                          {isCheckingUrl ? (
                            <div className="flex items-center space-x-2">
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              <span>Checking...</span>
                            </div>
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="truncate w-[100%] text-xs text-gray-500">
                      Username must be 3-30 characters and can only contain
                      letters, numbers, underscores, and hyphens
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agent Bio */}
          <div className="">
            <div>
              <div className="flex justify-between mb-1 pt-4">
                <h3 className="main-font block text-md md:text-lg font-medium text-[#000000]">
                  Agent Bio
                </h3>
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
                  className="w-full px-3 py-2 border border-[#7D7D7D] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <div className="flex justify-end relative z-10">
                  <Button
                    onClick={handleSaveBio}
                    disabled={isSavingBio}
                    className={` ${isSavingBio ? " cursor-not-allowed" : ""}`}
                  >
                    {isSavingBio ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Agent Smartness */}
          <div className="bg-[#D4DEFF] p-4 rounded-lg flex flex-col sm:flex-row w-full gap-5">
            <div className="smartness-details w-full">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  AGENT SMARTNESS
                </span>
                <span className="text-sm text-[#0D0D0D]">
                  {smartnessLevel}% COMPLETE
                </span>
              </div>
              <div className="relative pt-1">
                <div className="overflow-hidden h-[10px] text-xs flex rounded-lg bg-[#FFFFFF] shadow-[inset_0_3px_3px_0_rgba(0,0,0,0.25)]">
                  <div
                    style={{ width: `${smartnessLevel}%` }}
                    className="shadow-none h-[10px] flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#4D65FF] border-2 border-[#135220] rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div style={{ zIndex: 10 }} className="btn-container z-10 relative">
              <Button
                className=""
                onClick={() => {
                  navigate("/admin/dashboard/brain");
                }}
              >
                SMARTEN
              </Button>
            </div>
          </div>

          {/* Promotional Banner */}
          <div className="bg-[#CDCDCD] p-4 rounded-[10px]">
            <div className="mb-2">
              <div className="title flex w-full justify-between items-center">
                <h1 className="main-font block text-md md:text-xl font-medium text-[#000000]">
                  Promotional Banner
                </h1>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPromoBannerEnabled}
                    onChange={(e) => setIsPromoBannerEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-[#CDCDCD] peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-[#000000] rounded-full peer peer-checked:after:translate-x-full border-[#000000] peer-checked:after:border-[#000000] after:content-[''] after:absolute after:top-[2px] after:border-[#000000] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex w-full justify-between items-center space-x-2 mt-4">
                <span className="text-xs text-gray-500">
                  Display banner under the main header
                </span>
                <span className="text-xs text-gray-500">MAX 50 CHARACTERS</span>
              </div>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={promotionalBanner}
                onChange={(e) => handlePromoBannerChange(e.target.value)}
                placeholder="Type your promotional text..."
                maxLength={50}
                className="w-full px-3 py-2 border border-[#7D7D7D] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex justify-end relative z-10">
                <Button
                  onClick={handleSavePromoBanner}
                  disabled={isSavingPromoBanner}
                  className={` ${
                    isSavingPromoBanner ? " cursor-not-allowed" : ""
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
                </Button>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="">
            <SocialMediaSection />
          </div>
          {/* Custom Links Section */}
          <div className="p-3">
            <CustomLinksSection />
          </div>
        </div>
      </div>

      <div
        style={{ backgroundColor: "#eaefff" }}
        className="col-span-1 lg:col-span-2 hidden lg:block"
      >
        <div
          className="mx-auto pt-10 pb-16"
          style={{
            maxWidth: 400,
            width: "80%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <PublicChat
            screenName={"about"}
            previewConfig={{
              ...activeBotData,
              isPromoBannerEnabled: isPromoBannerEnabled,
              promotionalBanner: promotionalBanner,
              bio: agentBio,
              name: agentName,
              username: agentUsername,
            }}
            chatHeight={null}
            isPreview={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;
