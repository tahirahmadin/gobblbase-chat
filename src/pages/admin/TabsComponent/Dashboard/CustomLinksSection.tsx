import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateCustomHandles } from "../../../../lib/serverActions";
import styled from "styled-components";
import { Plus, X } from "lucide-react";
const Icon = styled.button`
  position: relative;
  width: 30px;
  height: 30px;
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
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);

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
    background: #d6ffe0;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
const CustomLinksSection = () => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
  const [customHandles, setCustomHandles] = useState([{ label: "", url: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<{
    [key: number]: { label?: string; url?: string };
  }>({});

  useEffect(() => {
    if (
      activeBotData?.customHandles &&
      activeBotData.customHandles.length > 0
    ) {
      setCustomHandles(activeBotData.customHandles);
    } else {
      setCustomHandles([]);
    }
  }, [activeBotData]);

  const validateUrl = (url: string): boolean => {
    if (!url) return false;

    // Basic URL validation
    try {
      const urlObj = new URL(url);

      // Check if domain has at least one dot (.) and proper TLD
      const domainRegex =
        /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
      const hostname = urlObj.hostname;

      // Remove 'www.' if present for domain validation
      const domain = hostname.replace(/^www\./, "");

      return domainRegex.test(domain);
    } catch {
      return false;
    }
  };

  const handleChange = (idx: number, field: "label" | "url", value: string) => {
    setCustomHandles((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );

    // Clear error when user starts typing
    setErrors((prev) => ({
      ...prev,
      [idx]: {
        ...prev[idx],
        [field]: undefined,
      },
    }));
  };

  const handleAdd = () => {
    setCustomHandles((prev) => [...prev, { label: "", url: "https://" }]);
  };

  const handleRemove = async (idx: number) => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    try {
      const newHandles = customHandles.filter((_, i) => i !== idx);
      setCustomHandles(newHandles);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to remove custom link");
      }
      // Revert the state if the backend update fails
      setCustomHandles(customHandles);
    }
  };

  const handleSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    // Validate all links
    const newErrors: { [key: number]: { label?: string; url?: string } } = {};
    let hasErrors = false;

    customHandles.forEach((handle, idx) => {
      const errors: { label?: string; url?: string } = {};

      if (!handle.label.trim()) {
        errors.label = "Label is required";
        hasErrors = true;
      }

      if (!handle.url.trim()) {
        errors.url = "URL is required";
        hasErrors = true;
      } else if (!validateUrl(handle.url)) {
        errors.url = "Please enter a valid URL (e.g., https://example.com)";
        hasErrors = true;
      }

      if (Object.keys(errors).length > 0) {
        newErrors[idx] = errors;
      }
    });

    if (hasErrors) {
      setErrors(newErrors);
      toast.error("Please fill in all required fields with valid URLs");
      return;
    }

    setIsSaving(true);
    try {
      await updateCustomHandles(activeBotId, customHandles);
      setRefetchBotData();
      toast.success("Custom links updated successfully");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update custom links");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pb-10">
      <div className="content flex justify-between items-center">
        <h3 className="main-font block text-md sm:text-xl font-bold text-[#000000]">
          Add Social Links to your Profile
        </h3>
        {/* <span className="para-font border border-[#7D7D7D] text-[#7D7D7D] px-4 py-0.5 rounded-xl -mr-6">
          Remove
        </span> */}
      </div>
      <div className="space-y-4 mt-4">
        {customHandles.map((item, idx) => (
          <div key={idx} className="flex flex-row items-start space-x-2">
            <div className="flex-1 space-y-2 flex flex-col py-4 px-4 bg-[#CEFFDC] rounded-lg">
              <label className="flex flex-col items-start xs:flex-row xs:items-center sm:gap-2">
                <span className="w-[80px] text-[#636363] font-semibold">
                  BUTTON
                </span>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="Label"
                    value={item.label}
                    onChange={(e) => handleChange(idx, "label", e.target.value)}
                    className={`px-2 py-1 border rounded w-[100%] border-2 ${
                      errors[idx]?.label ? "border-red-500" : "border-[#6AFF97]"
                    }`}
                  />
                  {errors[idx]?.label && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors[idx].label}
                    </p>
                  )}
                </div>
              </label>

              <label className="flex flex-col items-start xs:flex-row xs:items-center sm:gap-2">
                <span className="w-[80px] text-[#636363] font-semibold">
                  LINK
                </span>
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    placeholder="URL"
                    value={item.url}
                    onChange={(e) => handleChange(idx, "url", e.target.value)}
                    className={`px-2 py-1 border rounded w-[100%] border-2 ${
                      errors[idx]?.url ? "border-red-500" : "border-[#6AFF97]"
                    }`}
                  />
                  {errors[idx]?.url && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors[idx].url}
                    </p>
                  )}
                </div>
              </label>
            </div>
            <div style={{ zIndex: "4" }} className="icon mt-4 relative">
              <Icon
                onClick={() => handleRemove(idx)}
                className=""
                disabled={customHandles.length === 0}
              >
                <X className="w-4 h-4 text-black stroke-[4px]" />
              </Icon>
            </div>
          </div>
        ))}
        <div
          style={{ zIndex: "13" }}
          className="relative icon mt-4 flex items-center gap-2"
        >
          <Icon onClick={handleAdd} className="">
            <Plus className="w-4 h-4 text-black stroke-[4px]" />
          </Icon>
          <h2 className="font-bold pt-2">NEW</h2>
        </div>
      </div>
      <div className="flex justify-end relative z-10 mt-4">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className={`${isSaving ? "cursor-not-allowed" : ""}`}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
};
export default CustomLinksSection;
