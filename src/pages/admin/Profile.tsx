import React, { useState } from "react";
import { Upload, Link2, Copy, Check, X } from "lucide-react";
import PublicChat from "../chatbot/PublicChat";

interface SocialMediaLinks {
  instagram: string;
  twitter: string;
  tiktok: string;
  facebook: string;
  youtube: string;
}

const Profile = () => {
  const [agentName, setAgentName] = useState("");
  const [agentUsername, setAgentUsername] = useState("");
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [urlAvailable, setUrlAvailable] = useState<boolean | null>(null);
  const [agentBio, setAgentBio] = useState("");
  const [promotionalBanner, setPromotionalBanner] = useState("");
  const [smartnessLevel, setSmartNessLevel] = useState(30);
  const [socialMedia, setSocialMedia] = useState<SocialMediaLinks>({
    instagram: "",
    twitter: "",
    tiktok: "",
    facebook: "",
    youtube: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const baseUrl = "http://www.kifor.ai/";

  const handleUrlEdit = () => {
    setIsEditingUrl(true);
  };

  const handleUrlSave = () => {
    // Here you would typically check URL availability
    setIsEditingUrl(false);
    // Simulate URL check - replace with actual API call
    setUrlAvailable(true);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(baseUrl + agentUsername);
  };

  const handleVisitUrl = () => {
    window.open(baseUrl + agentUsername, "_blank");
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container grid grid-cols-5 w-full bg-white">
      <div className="col-span-3">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          <div className="p-6 shadow-sm">
            {/* Profile Image Upload */}
            <div className="flex items-start mb-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Agent"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/default-agent-avatar.png"
                      alt="Default Agent"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="absolute -top-1 -right-1 flex space-x-1">
                  <label className="w-5 h-5 bg-blue-600 flex items-center justify-center cursor-pointer hover:bg-blue-700">
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                    <Upload className="w-3 h-3 text-white" />
                  </label>
                  <button
                    className="w-5 h-5 bg-red-600 flex items-center justify-center hover:bg-red-700"
                    onClick={() => setProfileImage(null)}
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Agent Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                placeholder="Type your name or brand"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
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
                        className="w-5 h-5 bg-gray-100 flex items-center justify-center hover:bg-gray-200 rounded-sm"
                        title="Copy URL"
                      >
                        <Copy className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={handleVisitUrl}
                        className="w-5 h-5 bg-gray-100 flex items-center justify-center hover:bg-gray-200 rounded-sm"
                        title="Visit URL"
                      >
                        <Link2 className="w-3 h-3 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={handleUrlEdit}
                    className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                      <span className="px-3 py-2 bg-gray-100 text-gray-500 text-sm border-r">
                        {baseUrl}
                      </span>
                      <input
                        type="text"
                        value={agentUsername}
                        onChange={(e) => setAgentUsername(e.target.value)}
                        placeholder="your-username"
                        className="flex-1 px-3 py-2 focus:outline-none text-sm"
                      />
                    </div>
                    {urlAvailable !== null && (
                      <div
                        className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center ${
                          urlAvailable ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {urlAvailable ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <span className="text-xs">URL Unavailable</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleUrlSave}
                    className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
                  >
                    Save
                  </button>
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
              <textarea
                value={agentBio}
                onChange={(e) => setAgentBio(e.target.value)}
                placeholder="Describe your agent purpose or business..."
                maxLength={150}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
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
            <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
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
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            <div>
              <input
                type="text"
                value={promotionalBanner}
                onChange={(e) => setPromotionalBanner(e.target.value)}
                placeholder="Type your text..."
                maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <div className="flex space-x-1">
                <button className="w-8 h-8 rounded flex items-center justify-center bg-yellow-400">
                  <span className="text-sm">$</span>
                </button>
                {["A", "A", "A", "A", "A", "A", "A"].map((letter, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded flex items-center justify-center bg-gray-200 hover:bg-gray-300"
                  >
                    <span className="text-sm">{letter}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Social Media Links */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Social Media(URL)
            </label>
            {Object.entries(socialMedia).map(([platform, url]) => (
              <div key={platform} className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <img
                    src={`/${platform}-icon.png`}
                    alt={platform}
                    className="w-4 h-4"
                  />
                </div>
                <input
                  type="text"
                  value={url}
                  onChange={(e) =>
                    setSocialMedia({
                      ...socialMedia,
                      [platform]: e.target.value,
                    })
                  }
                  placeholder={`${
                    platform.charAt(0).toUpperCase() + platform.slice(1)
                  }`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  <Check className="w-4 h-4 text-green-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="col-span-2 pt-6" style={{ backgroundColor: "#eaefff" }}>
        <div className="mx-auto" style={{ maxWidth: 440 }}>
          <PublicChat agentUsernamePlayground={null} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
