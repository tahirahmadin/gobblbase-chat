import React, { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { updateSocialHandles } from "../../../../lib/serverActions";
import { useBotConfig } from "../../../../store/useBotConfig";
import toast from "react-hot-toast";

interface SocialMediaLinks {
  instagram: string;
  twitter: string;
  tiktok: string;
  facebook: string;
  youtube: string;
  linkedin: string;
  snapchat: string;
}

interface SocialMediaSectionProps {
  externalSocialMedia?: SocialMediaLinks;
  onExternalUpdate?: (socials: SocialMediaLinks) => void;
}

const SocialMediaSection = ({ externalSocialMedia, onExternalUpdate }: SocialMediaSectionProps = {}) => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
  const [isSavingSocials, setIsSavingSocials] = useState(false);
  
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

  const [socialMedia, setSocialMediaInternal] = useState<SocialMediaLinks>({
    instagram: "",
    twitter: "",
    tiktok: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    snapchat: "",
  });

  const setSocialMedia = (newSocials: SocialMediaLinks | ((prev: SocialMediaLinks) => SocialMediaLinks)) => {
    if (onExternalUpdate && externalSocialMedia) {
      if (typeof newSocials === 'function') {
        onExternalUpdate(newSocials(externalSocialMedia));
      } else {
        onExternalUpdate(newSocials);
      }
    } else {
      setSocialMediaInternal(newSocials);
    }
  };

  const actualSocialMedia = externalSocialMedia || socialMedia;

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
    if (activeBotData && !externalSocialMedia) {
      const socials = activeBotData.socials as SocialMediaLinks;
      
      if (socials) {
        const extractedSocials = {} as SocialMediaLinks;
        
        Object.entries(socials).forEach(([platform, url]) => {
          extractedSocials[platform as keyof SocialMediaLinks] = 
            socialMediaValidation.extractHandle(platform, url);
        });
        
        setSocialMediaInternal(extractedSocials);
      }
    }
  }, [activeBotData, externalSocialMedia]);

  const socialMediaValidation = {
    patterns: {
      instagram: /^[a-zA-Z0-9_.]{1,30}$/,
      twitter: /^[a-zA-Z0-9_]{1,15}$/,
      tiktok: /^[a-zA-Z0-9_.]{1,24}$/,
      facebook: /^[a-zA-Z0-9.]{5,50}$/,
      youtube: /^[a-zA-Z0-9_-]{1,30}$/,
      linkedin: /^[a-zA-Z0-9-]{3,100}$/,
      snapchat: /^[a-zA-Z0-9_.]{3,15}$/,
    },
    
    errorMessages: {
      instagram: "Instagram handles can only contain letters, numbers, underscores, and periods (max 30 chars)",
      twitter: "Twitter handles can only contain letters, numbers and underscores (max 15 chars)",
      tiktok: "TikTok handles can only contain letters, numbers, underscores, and periods (max 24 chars)",
      facebook: "Facebook handles can only contain letters, numbers and periods (min 5, max 50 chars)",
      youtube: "YouTube handles can only contain letters, numbers, underscores, and hyphens (max 30 chars)",
      linkedin: "LinkedIn handles can only contain letters, numbers, and hyphens (min 3, max 100 chars)",
      snapchat: "Snapchat handles can only contain letters, numbers, underscores, and periods (3-15 chars)",
    },
    
    extractHandle: (platform, input) => {
      if (!input) return "";
      
      const baseUrl = socialMediaBaseUrls[platform as keyof typeof socialMediaBaseUrls];
      if (!baseUrl) return input;
      
      if (platform === 'instagram' && input.includes('instagram.com/')) {
        const match = input.match(/instagram\.com\/([a-zA-Z0-9_.]{1,30})\/?/);
        return match ? match[1] : input;
      } 
      else if (platform === 'twitter' && (input.includes('twitter.com/') || input.includes('x.com/'))) {
        const match = input.match(/(?:twitter|x)\.com\/([a-zA-Z0-9_]{1,15})\/?/);
        return match ? match[1] : input;
      }
      else if (platform === 'tiktok' && input.includes('tiktok.com/@')) {
        const match = input.match(/tiktok\.com\/@([a-zA-Z0-9_.]{1,24})\/?/);
        return match ? match[1] : input;
      }
      else if (platform === 'facebook' && input.includes('facebook.com/')) {
        const match = input.match(/facebook\.com\/([a-zA-Z0-9.]{5,50})\/?/);
        return match ? match[1] : input;
      } 
      else if (platform === 'youtube' && input.includes('youtube.com/@')) {
        const match = input.match(/youtube\.com\/@([a-zA-Z0-9_-]{1,30})\/?/);
        return match ? match[1] : input;
      }
      else if (platform === 'linkedin' && input.includes('linkedin.com/')) {
        if (input.includes('/in/')) {
          const match = input.match(/linkedin\.com\/in\/([a-zA-Z0-9-]{3,100})\/?/);
          return match ? match[1] : input;
        } else if (input.includes('/company/')) {
          const match = input.match(/linkedin\.com\/company\/([a-zA-Z0-9-]{3,100})\/?/);
          return match ? match[1] : input;
        }
      }
      else if (platform === 'snapchat' && input.includes('snapchat.com/add/')) {
        const match = input.match(/snapchat\.com\/add\/([a-zA-Z0-9_.]{3,15})\/?/);
        return match ? match[1] : input;
      }
      
      if (input.startsWith(baseUrl)) {
        return input.slice(baseUrl.length).replace(/\/$/, '');
      }
      
      return input;
    },
    
    validate: (platform, handle) => {
      if (!handle) return true; 
      
      const pattern = socialMediaValidation.patterns[platform as keyof typeof socialMediaValidation.patterns];
      return pattern.test(handle);
    }
  };

  const handleSocialMediaChange = (platform, value) => {
    const extractedHandle = socialMediaValidation.extractHandle(platform, value);
    
    setSocialMedia({
      ...actualSocialMedia,
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
    
    let hasErrors = false;
    const newErrors = { ...socialMediaErrors };
    
    Object.entries(actualSocialMedia).forEach(([platform, handle]) => {
      if (handle && !socialMediaValidation.validate(platform, handle)) {
        newErrors[platform as keyof typeof newErrors] = true;
        hasErrors = true;
      } else {
        newErrors[platform as keyof typeof newErrors] = false;
      }
    });
    
    if (hasErrors) {
      setSocialMediaErrors(newErrors);
      toast.error("Please correct invalid social media handles");
      return;
    }
    
    const socialsWithUrls = {} as Record<string, string>;
    
    Object.entries(actualSocialMedia).forEach(([platform, handle]) => {
      if (handle) {
        const baseUrl = socialMediaBaseUrls[platform as keyof typeof socialMediaBaseUrls];
        socialsWithUrls[platform] = baseUrl + handle;
      } else {
        socialsWithUrls[platform] = "";
      }
    });
    
    try {
      setIsSavingSocials(true);
      await updateSocialHandles(
        activeBotId,
        socialsWithUrls
      );
      setRefetchBotData();
      toast.success("Social media links updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update social media links");
    } finally {
      setIsSavingSocials(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Social Media Handles
      </label>
      
      {Object.entries(actualSocialMedia).map(([platform, handle]) => {
        const baseUrl = socialMediaBaseUrls[platform as keyof typeof socialMediaBaseUrls];
        const hasError = socialMediaErrors[platform as keyof typeof socialMediaErrors];
        
        return (
          <div key={platform} className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shadow-sm">
                <img
                  src={socialMediaIcons[platform as keyof typeof socialMediaIcons]}
                  alt={platform}
                  className="w-5 h-5 object-contain"
                />
              </div>
              <div className={`flex-1 flex items-center border rounded-md overflow-hidden ${
                hasError ? "border-red-500" : "border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
              }`}>
                <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm whitespace-nowrap border-r border-gray-300">
                  {baseUrl}
                </span>
                <input
                  type="text"
                  value={handle}
                  onChange={(e) => handleSocialMediaChange(platform, e.target.value)}
                  onPaste={(e) => {
                    // Handle paste event for better UX with URL extraction
                    e.preventDefault();
                    const pastedText = e.clipboardData.getData('text');
                    handleSocialMediaChange(platform, pastedText);
                  }}
                  placeholder={`Enter ${platform} handle`}
                  className={`flex-1 px-3 py-2 focus:outline-none text-sm ${
                    hasError ? "bg-red-50" : ""
                  }`}
                />
                {handle && (
                  <div className="pr-2 flex items-center justify-center">
                    {hasError ? (
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100">
                        <X className="w-3 h-3 text-red-500" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 flex items-center justify-center rounded-full bg-green-100">
                        <Check className="w-3 h-3 text-green-500" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {hasError && (
              <div className="text-xs text-red-500 ml-10 mt-1">
                {socialMediaValidation.errorMessages[platform as keyof typeof socialMediaValidation.errorMessages]}
              </div>
            )}
          </div>
        );
      })}
      
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveSocials}
          disabled={isSavingSocials || Object.values(socialMediaErrors).some(error => error)}
          className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors ${
            isSavingSocials || Object.values(socialMediaErrors).some(error => error) 
              ? "opacity-50 cursor-not-allowed" 
              : ""
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
  );
};

export default SocialMediaSection;