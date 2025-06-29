import React, { useEffect, useState } from "react";
import {
  Twitter,
  Instagram,
  Music,
  Facebook,
  Youtube,
  Linkedin,
  Link as LinkIcon,
  X,
  MessageCircle,
} from "lucide-react";
import { AdminAgent, Theme } from "../../types";
import TryFreeBanner from "./TryFreeBanner";
import { getAgentPolicies, saveCustomerLead } from "../../lib/serverActions";
import { toast } from "react-hot-toast";
import { PERSONALITY_OPTIONS } from "../../utils/constants";
import { useBotConfig } from "../../store/useBotConfig";
import { FaSnapchat } from "react-icons/fa";

interface AboutSectionProps {
  currentConfig: {
    name?: string;
    logo?: string;
    bio?: string;
    agentId?: string;
    customerLeadFlag?: boolean;
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
  customHandles?: { label: string; url: string }[];
  onPolicyClick?: (
    policyKey: string,
    policy: PolicyContent,
    policyName: string
  ) => void;
  showContactForm?: boolean;
  contactFormMessage?: string;
}

interface PolicyContent {
  enabled: boolean;
  content: string;
}

interface PolicyPopupProps {
  isOpen: boolean;
  onClose: () => void;
  policyName: string;
  policyContent: string;
  theme: Theme;
}

interface CustomerLeadFormProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  currentConfig: {
    agentId?: string;
  };
  initialMessage?: string;
}

const PolicyPopup: React.FC<PolicyPopupProps> = ({
  isOpen,
  onClose,
  policyName,
  policyContent,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-full max-w-md mx-4 rounded-xl p-6 relative"
        style={{
          backgroundColor: theme.isDark ? "black" : "white",
          color: theme.isDark ? "white" : "black",
          border: `1px solid ${theme.highlightColor}`,
        }}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-semibold mb-4">{policyName}</h3>
        <div className="text-sm whitespace-pre-wrap">{policyContent}</div>
      </div>
    </div>
  );
};

const CustomerLeadForm: React.FC<CustomerLeadFormProps> = ({
  isOpen,
  onClose,
  theme,
  currentConfig,
  initialMessage = "",
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: initialMessage,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    phone?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return ""; // Phone is optional
    const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return "Please enter a valid phone number (e.g., 123-456-7890)";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData({ ...formData, email: newEmail });
    setValidationErrors({
      ...validationErrors,
      email: validateEmail(newEmail),
    });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value;
    setFormData({ ...formData, phone: newPhone });
    setValidationErrors({
      ...validationErrors,
      phone: validatePhone(newPhone),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);

    if (emailError || phoneError) {
      setValidationErrors({
        email: emailError,
        phone: phoneError,
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await saveCustomerLead(currentConfig?.agentId || "", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        queryMessage: formData.message,
        createdAt: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.result || "Failed to submit form");
      }

      // Reset form and close
      setFormData({ name: "", email: "", phone: "", message: "" });
      setValidationErrors({});
      toast.success("Message sent successfully! We'll get back to you soon.");
      onClose();
    } catch (err) {
      setError("Failed to submit form. Please try again.");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-full max-w-md mx-4 rounded-xl p-6 relative shadow-2xl"
        style={{
          backgroundColor: theme.isDark ? "black" : "white",
          color: theme.isDark ? "white" : "black",
          border: `1px solid ${theme.highlightColor}`,
        }}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-2xl font-semibold mb-6 text-center">Contact Us</h3>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-opacity-50"
              style={{
                backgroundColor: theme.isDark ? "#333" : "white",
                borderColor: theme.isDark ? "#444" : "#ddd",
                color: theme.isDark ? "white" : "black",
              }}
              placeholder="Enter your name"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-opacity-50 ${
                validationErrors.email ? "border-red-500" : ""
              }`}
              style={{
                backgroundColor: theme.isDark ? "#333" : "white",
                borderColor: validationErrors.email
                  ? "#ef4444"
                  : theme.isDark
                  ? "#444"
                  : "#ddd",
                color: theme.isDark ? "white" : "black",
              }}
              placeholder="Enter your email"
              required
            />
            {validationErrors.email && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              className={`w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-opacity-50 ${
                validationErrors.phone ? "border-red-500" : ""
              }`}
              style={{
                backgroundColor: theme.isDark ? "#333" : "white",
                borderColor: validationErrors.phone
                  ? "#ef4444"
                  : theme.isDark
                  ? "#444"
                  : "#ddd",
                color: theme.isDark ? "white" : "black",
              }}
              placeholder="Enter your phone number (e.g., 123-456-7890)"
            />
            {validationErrors.phone && (
              <p className="text-red-500 text-xs mt-1">
                {validationErrors.phone}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className="w-full px-4 py-3 rounded-lg border transition-all focus:ring-2 focus:ring-opacity-50 resize-none"
              style={{
                backgroundColor: theme.isDark ? "#333" : "white",
                borderColor: theme.isDark ? "#444" : "#ddd",
                color: theme.isDark ? "white" : "black",
              }}
              placeholder="How can we help you?"
              rows={4}
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg font-medium transition-all transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
            style={{
              backgroundColor: theme.highlightColor,
              color: !theme.isDark ? "white" : "black",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function AboutSection({
  currentConfig,
  theme,
  socials,
  onPolicyClick,
  showContactForm,
  contactFormMessage,
  customHandles,
}: AboutSectionProps) {
  const { activeBotData } = useBotConfig();
  const [policies, setPolicies] = useState<{ [key: string]: PolicyContent }>(
    {}
  );
  const [selectedPolicy, setSelectedPolicy] = useState<{
    key: string;
    content: string;
    name: string;
  } | null>(null);
  const [showContactFormState, setShowContactFormState] = useState(
    showContactForm || false
  );
  const [agentPicture, setAgentPicture] = useState<string | null>(null);

  useEffect(() => {
    if (activeBotData?.logo) {
      if (agentPicture === activeBotData?.logo) {
        return;
      }
      const logoWithTimestamp = `${activeBotData.logo}?t=${Date.now()}`;
      setAgentPicture(logoWithTimestamp);
    } else if (activeBotData?.personalityType?.name) {
      let voiceName = activeBotData.personalityType.name;

      const logoObj = PERSONALITY_OPTIONS.find(
        (model) => model.title === voiceName
      );

      if (logoObj) {
        setAgentPicture(logoObj.image);
      } else {
        setAgentPicture(
          "https://t4.ftcdn.net/jpg/08/04/36/29/360_F_804362990_0n7bGLz9clMBi5ajG52k8OAUQTneMbj4.jpg"
        );
      }
    }
  }, [activeBotData]);

  useEffect(() => {
    if (showContactForm !== undefined) {
      setShowContactFormState(showContactForm);
    }
  }, [showContactForm]);

  //Fetching policies from the database
  useEffect(() => {
    const fetchPolicies = async () => {
      if (!activeBotData?.agentId) return;
      try {
        const response = await getAgentPolicies(activeBotData.agentId);
        if (response.error) throw new Error("Failed to fetch policies");

        const data = response.result;
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

  const handlePolicyClick = (key: string, policy: PolicyContent) => {
    const policyName =
      policyNames[key] || key.charAt(0).toUpperCase() + key.slice(1);
    setSelectedPolicy({
      key,
      content: policy.content,
      name: policyName,
    });
    onPolicyClick?.(key, policy, policyName);
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        color: theme.isDark ? "white" : "black",
      }}
    >
      {/* Main content with overflow */}
      <div className="flex-grow overflow-y-auto pb-16">
        <div className="flex flex-col items-center w-full">
          {/* Profile Section */}
          <div className="flex flex-col items-center mt-8 space-y-2">
            {/* Profile Image */}
            <div className="w-24 h-24 rounded-full overflow-hidden">
              <img
                src={agentPicture || ""}
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
                  href={
                    typeof socials.twitter === "string" &&
                    (socials.twitter || "").startsWith("http")
                      ? socials.twitter
                      : `https://twitter.com/${(socials.twitter || "").replace(
                          /^@/,
                          ""
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {socials?.instagram && (
                <a
                  href={
                    typeof socials.instagram === "string" &&
                    socials.instagram.startsWith("http")
                      ? socials.instagram
                      : `https://instagram.com/${(
                          socials.instagram || ""
                        ).replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {socials?.tiktok && (
                <a
                  href={
                    typeof socials.tiktok === "string" &&
                    socials.tiktok.startsWith("http")
                      ? socials.tiktok
                      : `https://tiktok.com/@${(socials.tiktok || "").replace(
                          /^@/,
                          ""
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <Music className="w-5 h-5" />
                </a>
              )}
              {socials?.facebook && (
                <a
                  href={
                    typeof socials.facebook === "string" &&
                    socials.facebook.startsWith("http")
                      ? socials.facebook
                      : `https://facebook.com/${(
                          socials.facebook || ""
                        ).replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {socials?.youtube && (
                <a
                  href={
                    typeof socials.youtube === "string" &&
                    socials.youtube.startsWith("http")
                      ? socials.youtube
                      : `https://youtube.com/${(socials.youtube || "").replace(
                          /^@/,
                          ""
                        )}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {socials?.linkedin && (
                <a
                  href={
                    typeof socials.linkedin === "string" &&
                    socials.linkedin.startsWith("http")
                      ? socials.linkedin
                      : socials.linkedin.startsWith("company/")
                      ? `https://linkedin.com/${socials.linkedin.replace(
                          "company/",
                          ""
                        )}`
                      : `https://linkedin.com/${(
                          socials.linkedin || ""
                        ).replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {socials?.snapchat && (
                <a
                  href={
                    typeof socials.snapchat === "string" &&
                    socials.snapchat.startsWith("http")
                      ? socials.snapchat
                      : `https://www.snapchat.com/add/${(
                          socials.snapchat || ""
                        ).replace(/^@/, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80"
                >
                  <FaSnapchat className="w-5 h-5" />
                </a>
              )}
              {socials?.link && (
                <a
                  href={socials.link || ""}
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
          {currentConfig?.bio && (
            <div className="w-full px-6 mt-4">
              <div
                className="rounded-xl p-4"
                style={{
                  backgroundColor: !theme.isDark ? "white" : "black",
                  color: theme.isDark ? "white" : "black",
                }}
              >
                <p className="text-sm text-center">{currentConfig.bio}</p>
              </div>
            </div>
          )}

          {/* Contact Us Button - New Prominent Position */}
          {currentConfig?.customerLeadFlag && (
            <div className="w-full px-6 mt-4">
              <button
                onClick={() => setShowContactFormState(true)}
                className="w-full py-3 rounded-full font-medium flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "white" : "black",
                }}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contact Us</span>
              </button>
            </div>
          )}

          {/* Social Links */}
          <div className="w-full px-6 mt-4 space-y-3">
            {customHandles?.map((handle) => (
              <a
                key={handle.label}
                href={handle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full font-medium block text-center"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "white" : "black",
                }}
              >
                {handle.label}
              </a>
            ))}
          </div>

          {/* Policies Section */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mt-4 mb-6 px-4 max-w-md mx-auto">
            {Object.entries(policies)
              .filter(([_, p]) => p.enabled)
              .map(([key, p]) => (
                <button
                  key={key}
                  className="text-sm opacity-60 hover:opacity-100 underline text-center"
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    color: "inherit",
                    cursor: "pointer",
                  }}
                  onClick={() => handlePolicyClick(key, p)}
                >
                  {policyNames[key] ||
                    key.charAt(0).toUpperCase() + key.slice(1)}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Banner at the bottom */}
      <TryFreeBanner />

      {/* Policy Popup */}
      <PolicyPopup
        isOpen={!!selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
        policyName={selectedPolicy?.name || ""}
        policyContent={selectedPolicy?.content || ""}
        theme={theme}
      />

      {/* Customer Lead Form */}
      <CustomerLeadForm
        isOpen={showContactFormState}
        onClose={() => setShowContactFormState(false)}
        theme={theme}
        currentConfig={currentConfig}
        initialMessage={contactFormMessage || ""}
      />
    </div>
  );
}
