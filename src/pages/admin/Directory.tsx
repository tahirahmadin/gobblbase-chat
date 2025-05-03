import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Link as LinkIcon,
  ChevronRight,
  X,
  Save,
  Instagram,
  Youtube,
  Linkedin,
  Facebook,
  Twitter,
  MessageSquare,
  Globe,
  Edit2,
  Check,
} from "lucide-react";
import { updateSocialHandles } from "../../lib/serverActions";
import { useBotConfig } from "../../store/useBotConfig";
import { toast } from "react-hot-toast";

interface SocialLink {
  id: string;
  name: string;
  url: string;
  type:
    | "instagram"
    | "tiktok"
    | "x"
    | "facebook"
    | "youtube"
    | "linkedin"
    | "snapchat"
    | "custom";
}

const SOCIAL_FIELDS = [
  {
    type: "instagram",
    label: "Instagram",
    icon: Instagram,
    placeholder: "Enter url",
    prefix: "https://instagram.com/",
  },
  {
    type: "tiktok",
    label: "TikTok",
    icon: MessageSquare,
    placeholder: "Enter url",
    prefix: "https://tiktok.com/@",
  },
  {
    type: "x",
    label: "X",
    icon: Twitter,
    placeholder: "Enter url",
    prefix: "https://x.com/",
  },
  {
    type: "facebook",
    label: "Facebook",
    icon: Facebook,
    placeholder: "Enter url",
    prefix: "",
  },
  {
    type: "youtube",
    label: "YouTube",
    icon: Youtube,
    placeholder: "Enter url",
    prefix: "",
  },
  {
    type: "linkedin",
    label: "LinkedIn",
    icon: Linkedin,
    placeholder: "Enter url",
    prefix: "",
  },
  {
    type: "snapchat",
    label: "Snapchat",
    icon: MessageSquare,
    placeholder: "Enter url",
    prefix: "",
  },
];

const SOCIAL_API_KEYS: { [key: string]: string } = {
  instagram: "instagram",
  tiktok: "tiktok",
  x: "twitter",
  facebook: "facebook",
  youtube: "youtube",
  linkedin: "linkedin",
  snapchat: "snapchat",
};

const Directory: React.FC = () => {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customLink, setCustomLink] = useState({ name: "", url: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const { activeBotId } = useBotConfig();

  const handleSocialLinkChange = (type: SocialLink["type"], value: string) => {
    const updatedLinks = [...links];
    const existingIndex = updatedLinks.findIndex((link) => link.type === type);

    if (value) {
      const prefix =
        SOCIAL_FIELDS.find((field) => field.type === type)?.prefix || "";
      const fullUrl = prefix ? `${prefix}${value}` : value;

      if (existingIndex >= 0) {
        updatedLinks[existingIndex] = {
          ...updatedLinks[existingIndex],
          name: SOCIAL_FIELDS.find((field) => field.type === type)?.label || "",
          url: fullUrl,
        };
      } else {
        updatedLinks.push({
          id: Date.now().toString(),
          name: SOCIAL_FIELDS.find((field) => field.type === type)?.label || "",
          url: fullUrl,
          type,
        });
      }
    } else if (existingIndex >= 0) {
      updatedLinks.splice(existingIndex, 1);
    }

    setLinks(updatedLinks);
  };

  const handleEditLink = (link: SocialLink) => {
    setEditingLink(link.id);
    setEditingValue(
      link.url.replace(
        SOCIAL_FIELDS.find((field) => field.type === link.type)?.prefix || "",
        ""
      )
    );
  };

  const handleSaveEdit = (link: SocialLink) => {
    const updatedLinks = links.map((l) => {
      if (l.id === link.id) {
        const prefix =
          SOCIAL_FIELDS.find((field) => field.type === link.type)?.prefix || "";
        return {
          ...l,
          url: prefix ? `${prefix}${editingValue}` : editingValue,
        };
      }
      return l;
    });
    setLinks(updatedLinks);
    setEditingLink(null);
  };

  const handleCustomLinkChange = (field: "name" | "url", value: string) => {
    setCustomLink((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCustomLink = () => {
    if (customLink.name && customLink.url) {
      const updatedLinks = [...links];
      const existingIndex = updatedLinks.findIndex(
        (link) => link.type === "custom"
      );

      if (existingIndex >= 0) {
        updatedLinks[existingIndex] = {
          ...updatedLinks[existingIndex],
          name: customLink.name,
          url: customLink.url,
        };
      } else {
        updatedLinks.push({
          id: Date.now().toString(),
          name: customLink.name,
          url: customLink.url,
          type: "custom",
        });
      }

      setLinks(updatedLinks);
      setCustomLink({ name: "", url: "" });
      setShowCustomForm(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    if (!activeBotId) {
      toast.error("No active agent selected");
      return;
    }

    try {
      setIsLoading(true);
      const updatedLinks = links.filter((link) => link.id !== id);
      const directoryLinks = updatedLinks.map((link) => ({
        label: link.name,
        url: link.url,
      }));

      await updateSocialHandles(activeBotId, {
        instagram: "",
        tiktok: "",
        x: "",
        facebook: "",
        youtube: "",
        linkedin: "",
        snapchat: "",
      });
      setLinks(updatedLinks);
      toast.success("Link deleted successfully");
    } catch (error) {
      console.error("Error deleting link:", error);
      toast.error("Failed to delete link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLinks = async () => {
    if (!activeBotId) {
      toast.error("No active agent selected");
      return;
    }

    try {
      setIsLoading(true);
      // Prepare socials object for API
      const socials = Object.keys(SOCIAL_API_KEYS).reduce((acc, key) => {
        const link = links.find((l) => l.type === key);
        acc[SOCIAL_API_KEYS[key]] = link ? link.url : "";
        return acc;
      }, {} as Record<string, string>);

      // Save social handles to API
      await updateSocialHandles(activeBotId, socials);

      toast.success("Links saved successfully");
    } catch (error) {
      console.error("Error saving links:", error);
      toast.error("Failed to save links");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-900">Directory</h2>
        <button
          onClick={handleSaveLinks}
          disabled={isLoading}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={16} />
          {isLoading ? "Saving..." : "Save Links"}
        </button>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SOCIAL_FIELDS.map((field) => {
            const Icon = field.icon;
            const existingLink = links.find((link) => link.type === field.type);
            return (
              <div
                key={field.type}
                className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <label className="text-sm font-medium text-gray-700">
                    {field.label}
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={
                      existingLink
                        ? existingLink.url.replace(field.prefix, "")
                        : ""
                    }
                    onChange={(e) =>
                      handleSocialLinkChange(
                        field.type as SocialLink["type"],
                        e.target.value
                      )
                    }
                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                  />
                  {existingLink && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditLink(existingLink)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Edit link"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLink(existingLink.id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove link"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
                {existingLink && editingLink === existingLink.id ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                    />
                    <button
                      onClick={() => handleSaveEdit(existingLink)}
                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                      title="Save changes"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  existingLink && (
                    <a
                      href={existingLink.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-gray-900 hover:underline flex items-center gap-1 mt-2"
                    >
                      {existingLink.url}
                      <ChevronRight size={14} />
                    </a>
                  )
                )}
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-600" />
              <h3 className="text-sm font-medium text-gray-700">Custom Link</h3>
            </div>
            <button
              onClick={() => setShowCustomForm(!showCustomForm)}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <Plus size={14} />
              {showCustomForm ? "Cancel" : "Add Custom Link"}
            </button>
          </div>

          {showCustomForm && (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <input
                    type="text"
                    placeholder="Link name"
                    value={customLink.name}
                    onChange={(e) =>
                      handleCustomLinkChange("name", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="URL"
                    value={customLink.url}
                    onChange={(e) =>
                      handleCustomLinkChange("url", e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm"
                  />
                </div>
              </div>
              <button
                onClick={handleAddCustomLink}
                disabled={!customLink.name || !customLink.url}
                className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <Plus size={14} />
                Add Custom Link
              </button>
            </div>
          )}

          {links
            .filter((link) => link.type === "custom")
            .map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white mt-4"
              >
                <div className="flex items-center gap-3">
                  <LinkIcon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {link.name}
                    </h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-gray-900 hover:underline flex items-center gap-1"
                    >
                      {link.url}
                      <ChevronRight size={14} />
                    </a>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditLink(link)}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Edit link"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteLink(link.id)}
                    disabled={isLoading}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete link"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Directory;
