import React, { useEffect, useState } from "react";
import {
  Twitter,
  Instagram,
  Music,
  Facebook,
  Youtube,
  Linkedin,
  Link as LinkIcon,
} from "lucide-react";
import { Theme } from "../../types";
import TryFreeBanner from "./TryFreeBanner";
import { getAgentPolicies } from "../../lib/serverActions";

interface AboutSectionProps {
  currentConfig: {
    name?: string;
    logo?: string;
    bio?: string;
    agentId?: string;
  };
  theme: Theme;
  socials?: {
    instagram: string;
    tiktok: string;
    twitter: string;
    facebook: string;
    youtube: string;
    linkedin: string;
    snapchat: string;
    link: string;
  };
  onPolicyClick?: (
    policyKey: string,
    policy: PolicyContent,
    policyName: string
  ) => void;
}

interface PolicyContent {
  enabled: boolean;
  content: string;
}

export default function AboutSection({
  currentConfig,
  theme,
  socials,
  onPolicyClick,
}: AboutSectionProps) {
  const [policies, setPolicies] = useState<{ [key: string]: PolicyContent }>(
    {}
  );

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!currentConfig?.agentId) return;
      try {
        const response = await getAgentPolicies(currentConfig.agentId);
        if (!response.error) {
          setPolicies(response.result);
        }
      } catch (err) {
        // Optionally handle error
      }
    };
    fetchPolicies();
  }, [currentConfig?.agentId]);

  const policyNames: Record<string, string> = {
    shipping: "Shipping Policy",
    returns: "Returns & Refunds",
    privacy: "Privacy Policy",
    terms: "Terms & Conditions",
  };

  return (
    <div
      className="flex flex-col items-center h-full w-full"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        color: theme.isDark ? "white" : "black",
      }}
    >
      <div className="w-full flex flex-col justify-evenly h-full">
        {/* Profile Section */}
        <div className="flex flex-col items-center mt-8 space-y-4">
          {/* Profile Image */}
          <div className="w-20 h-20 rounded-full overflow-hidden">
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
            {socials?.twitter && (
              <a
                href={socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <Twitter className="w-5 h-5" />
              </a>
            )}
            {socials?.instagram && (
              <a
                href={socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {socials?.tiktok && (
              <a
                href={socials.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <Music className="w-5 h-5" />
              </a>
            )}
            {socials?.facebook && (
              <a
                href={socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {socials?.youtube && (
              <a
                href={socials.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <Youtube className="w-5 h-5" />
              </a>
            )}
            {socials?.linkedin && (
              <a
                href={socials.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            )}
            {socials?.link && (
              <a
                href={socials.link}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80"
              >
                <LinkIcon className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="w-full px-6 mt-4">
          <div
            className="rounded-xl p-4"
            style={{
              backgroundColor: !theme.isDark ? "white" : "black",
              color: theme.isDark ? "white" : "black",
            }}
          >
            <p className="text-sm text-center">
              {currentConfig?.bio || "Add your bio..."}
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="w-full px-6 mt-6 space-y-3">
          {socials?.instagram && (
            <a
              href={socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full font-medium block text-center"
              style={{
                backgroundColor: theme.mainDarkColor,
                color: !theme.isDark ? "white" : "black",
              }}
            >
              Follow on Instagram
            </a>
          )}
          {socials?.youtube && (
            <a
              href={socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-full font-medium block text-center"
              style={{
                backgroundColor: theme.mainDarkColor,
                color: !theme.isDark ? "white" : "black",
              }}
            >
              Subscribe on YouTube
            </a>
          )}
        </div>
        {/* Policies Section */}
        <div className="flex justify-center space-x-4 mt-4 mb-6">
          {Object.entries(policies)
            .filter(([_, p]) => p.enabled)
            .map(([key, p]) => (
              <button
                key={key}
                className="text-sm opacity-60 hover:opacity-100 underline"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "inherit",
                  cursor: "pointer",
                }}
                onClick={() =>
                  onPolicyClick?.(
                    key,
                    p,
                    policyNames[key] ||
                      key.charAt(0).toUpperCase() + key.slice(1)
                  )
                }
              >
                {policyNames[key] || key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
        </div>
      </div>
      <TryFreeBanner />
    </div>
  );
}
