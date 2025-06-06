import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { updateSocialHandles } from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";
import { SocialMediaLinks } from "../../../../types";
import styled from "styled-components";

const Button = styled.button`
  position: relative;
  background: #4d65ff;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  color: white;
  @media (max-width: 600px) {
    min-width: 120px;
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
    background: #6aff97;
  }

  &:disabled {
    background: #d4deff;
    color: #b0b0b0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d4deff;
  }
`;
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
  linkedin: "https://www.linkedin.com/",
  snapchat: "https://www.snapchat.com/add/",
};

const SocialMediaSection = () => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
  const [isSavingSocials, setIsSavingSocials] = useState(false);

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

  const [originalSocialMedia, setOriginalSocialMedia] =
    useState<SocialMediaLinks>({
      instagram: "",
      twitter: "",
      tiktok: "",
      facebook: "",
      youtube: "",
      linkedin: "",
      snapchat: "",
      link: "",
    });

  const [socialMediaErrors, setSocialMediaErrors] = useState({
    instagram: false,
    twitter: false,
    tiktok: false,
    facebook: false,
    youtube: false,
    linkedin: false,
    snapchat: false,
  });

  useEffect(() => {
    if (activeBotData?.socials) {
      const socialsData = activeBotData.socials as any;
      setSocialMedia({ ...socialsData });
      setOriginalSocialMedia({ ...socialsData });
    }
  }, [activeBotData]);

  const socialMediaValidation = {
    patterns: {
      instagram: /^[a-zA-Z0-9_.]{1,30}$/,
      twitter: /^[a-zA-Z0-9_]{1,15}$/,
      tiktok: /^[a-zA-Z0-9_.]{1,24}$/,
      facebook: /^[a-zA-Z0-9.]{5,50}$/,
      youtube: /^[a-zA-Z0-9_-]{1,30}$/,
      linkedin: /^(?:in\/[a-zA-Z0-9-]{3,100}|company\/[a-zA-Z0-9-]{3,100})$/,
      snapchat: /^[a-zA-Z0-9_.]{3,15}$/,
    },

    errorMessages: {
      instagram:
        "Instagram username can only contain letters, numbers, underscores, and periods (max 30 chars)",
      twitter:
        "Twitter username can only contain letters, numbers and underscores (max 15 chars)",
      tiktok:
        "TikTok username can only contain letters, numbers, underscores, and periods (max 24 chars)",
      facebook:
        "Facebook username can only contain letters, numbers and periods (min 5, max 50 chars)",
      youtube:
        "YouTube username can only contain letters, numbers, underscores, and hyphens (max 30 chars)",
      linkedin:
        "LinkedIn handle should be in format 'in/username' for personal profiles or 'company/username' for company pages (3-100 chars)",
      snapchat:
        "Snapchat username can only contain letters, numbers, underscores, and periods (3-15 chars)",
    },

    extractHandle: (platform: string, input: string): string => {
      if (!input) return "";

      // Remove any URLs and extract just the username
      const baseUrl =
        socialMediaBaseUrls[platform as keyof typeof socialMediaBaseUrls];
      if (!baseUrl) return input;

      // Remove the base URL if present
      if (input.startsWith(baseUrl)) {
        return input.slice(baseUrl.length).replace(/\/$/, "");
      }

      // Remove any other URL patterns
      const urlPatterns = [
        /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.]{1,30})\/?$/,
        /^(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]{1,15})\/?$/,
        /^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([a-zA-Z0-9_.]{1,24})\/?$/,
        /^(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9.]{5,50})\/?$/,
        /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([a-zA-Z0-9_-]{1,30})\/?$/,
        /^(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|company)\/([a-zA-Z0-9-]{3,100})\/?$/,
        /^(?:https?:\/\/)?(?:www\.)?snapchat\.com\/add\/([a-zA-Z0-9_.]{3,15})\/?$/,
      ];

      for (const pattern of urlPatterns) {
        const match = input.match(pattern);
        if (match) {
          return match[1];
        }
      }

      return input;
    },

    validate: (platform: string, handle: string): boolean => {
      if (!handle) return true;
      const pattern =
        socialMediaValidation.patterns[
          platform as keyof typeof socialMediaValidation.patterns
        ];
      return pattern.test(handle);
    },
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    const extractedHandle = socialMediaValidation.extractHandle(
      platform,
      value
    );

    setSocialMedia({
      ...socialMedia,
      [platform]: extractedHandle,
    });

    const isValid = socialMediaValidation.validate(platform, extractedHandle);
    setSocialMediaErrors({
      ...socialMediaErrors,
      [platform]: !isValid && extractedHandle !== "",
    });
  };

  const handleSaveSocials = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    console.log("Current state before save:", socialMedia);

    // Validate standard social media handles
    let hasErrors = false;
    const newErrors = { ...socialMediaErrors };

    Object.entries(socialMedia).forEach(([platform, handle]) => {
      if (
        handle &&
        !socialMediaValidation.validate(platform, handle as string)
      ) {
        newErrors[platform as keyof typeof newErrors] = true;
        hasErrors = true;
      } else {
        newErrors[platform as keyof typeof newErrors] = false;
      }
    });

    if (hasErrors) {
      toast.error("Please correct invalid social media handles");
      return;
    }

    // Prepare the payload
    const socialsWithHandles: Record<string, string> = {};

    // Add standard social media handles
    Object.entries(socialMedia).forEach(([platform, handle]) => {
      socialsWithHandles[platform] = handle as string;
    });

    console.log("Final payload:", socialsWithHandles);

    try {
      setIsSavingSocials(true);
      await updateSocialHandles(activeBotId, socialsWithHandles);
      setRefetchBotData();
      toast.success("Social media handles updated successfully");
    } catch (error: any) {
      console.error("Error saving social media:", error);
      toast.error(error.message || "Failed to update social media handles");
    } finally {
      setIsSavingSocials(false);
    }
  };

  const hasSocialsChanged = () => {
    return Object.keys(socialMedia).some(
      (key) =>
        socialMedia[key as keyof SocialMediaLinks] !==
        originalSocialMedia[key as keyof SocialMediaLinks]
    );
  };

  return (
    <div className="space-y-4 pt-8">
      <h1 className="main-font block text-md sm:text-xl font-bold text-[#000000]">
        Social Media(URL)
      </h1>

      {Object.entries(socialMedia).map(([platform, handle]) => {
        const baseUrl =
          socialMediaBaseUrls[platform as keyof typeof socialMediaBaseUrls];
        const hasError =
          socialMediaErrors[platform as keyof typeof socialMediaErrors];

        return (
          <div key={platform} className="space-y-1 w-[100%]">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src={
                    socialMediaIcons[platform as keyof typeof socialMediaIcons]
                  }
                  alt={platform}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div
                className={`flex-1 flex flex-col xs:flex-row items-center border rounded-md overflow-hidden 
                  ${hasError ? "border-red-500" : ""} 
                  ${handle ? "border-2 border-[#78FFC5]" : "border-gray-300"}
                 
                  `}
              >
                <span className="truncate px-3 py-2 bg-gray-100 text-gray-500 text-sm whitespace-nowrap border-r border-gray-300 w-[100%] xs:w-[220px] flex items-center">
                  {baseUrl}
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) =>
                    handleSocialMediaChange(platform, e.target.value)
                  }
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData("text");
                    handleSocialMediaChange(platform, pastedText);
                  }}
                  placeholder={`Enter ${platform} handle`}
                  className={`flex-1 px-3 py-2 focus:outline-none text-sm w-full xs:w-[280px] 
                    ${hasError ? "bg-red-50" : "border-[#78FFC5] bg-[#CEFFDC]"} 
                    ${
                      handle
                        ? "border-[#78FFC5] bg-[#CEFFDC]"
                        : "border-[] bg-[#FFFFFF]"
                    }`}
                />
                <div className="w-[30px] hidden sm:block">
                  {handle && (
                    <div
                      className={`icon w-[30px] h-full py-2 flex items-center justify-center
                      ${
                        hasError ? "bg-red-50" : "border-[#78FFC5] bg-[#CEFFDC]"
                      } 
                      ${
                        handle
                          ? "border-[#78FFC5] bg-[#CEFFDC]"
                          : "border-[] bg-[#FFFFFF]"
                      }
                    `}
                    >
                      {hasError ? (
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-black">
                          <X className="w-4 h-4 text-red-500 stroke-[4px]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 flex items-center justify-center rounded-full bg-black">
                          <Check className="w-4 h-4 text-[#4DFFB2] stroke-[4px]" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {hasError && (
              <p className="text-xs text-red-500 mt-1">
                {
                  socialMediaValidation.errorMessages[
                    platform as keyof typeof socialMediaValidation.errorMessages
                  ]
                }
              </p>
            )}
          </div>
        );
      })}

      <div className="flex justify-end relative z-10 mt-4">
        <Button
          onClick={handleSaveSocials}
          disabled={isSavingSocials || !hasSocialsChanged()}
          className={`transition-colors ${
            isSavingSocials || !hasSocialsChanged()
              ? "cursor-not-allowed"
              : ""
          }`}
        >
          {isSavingSocials ? (
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
  );
};

export default SocialMediaSection;
