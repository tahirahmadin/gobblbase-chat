import React from "react";
import { Twitter, Instagram, Music } from "lucide-react";
import { Theme } from "../../types";
import TryFreeBanner from "./TryFreeBanner";

interface AboutSectionProps {
  currentConfig: {
    name?: string;
    logo?: string;
    bio?: string;
    socialLinks?: {
      twitter?: string;
      instagram?: string;
      tiktok?: string;
    };
  };
  theme: Theme;
}

export default function AboutSection({
  currentConfig,
  theme,
}: AboutSectionProps) {
  return (
    <div
      className="flex flex-col items-center h-full"
      style={{ backgroundColor: theme.chatBackgroundColor }}
    >
      <div className="shadow-lg">
        {/* Profile Section */}
        <div className="flex flex-col items-center mt-8 space-y-4">
          {/* Profile Image */}
          <div className="w-16 h-16 rounded-full overflow-hidden">
            <img
              src={
                currentConfig?.logo ||
                "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
              }
              alt="Agent"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Agent Name */}
          <h2 className="text-xl font-medium">
            {currentConfig?.name || "Agent Name"}
          </h2>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a
              href={currentConfig?.socialLinks?.twitter || "#"}
              className="hover:opacity-80"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href={currentConfig?.socialLinks?.instagram || "#"}
              className="hover:opacity-80"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href={currentConfig?.socialLinks?.tiktok || "#"}
              className="hover:opacity-80"
            >
              <Music className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bio Section */}
        <div className="w-full px-6 mt-4">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: theme.mainDarkBackgroundColor,
              color: theme.mainDarkTextColor,
            }}
          >
            <p className="text-sm text-center">
              {currentConfig?.bio ||
                "User Bio User Bio qwerty qwerty qwerty qwerty qwerty"}
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="w-full px-6 mt-6 space-y-3 ">
          <button className="w-full py-3 rounded-full bg-yellow-400 text-black font-medium">
            Social Link 1
          </button>
          <button className="w-full py-3 rounded-full bg-yellow-400 text-black font-medium">
            Social Link 2
          </button>
        </div>
        <div className="flex justify-center space-x-4 mt-4 mb-6">
          <a href="/privacy" className="text-sm opacity-60 hover:opacity-100">
            Privacy Policy
          </a>
          <a href="/shipping" className="text-sm opacity-60 hover:opacity-100">
            Shipping & Returns
          </a>
        </div>
      </div>
      <TryFreeBanner />
    </div>
  );
}
