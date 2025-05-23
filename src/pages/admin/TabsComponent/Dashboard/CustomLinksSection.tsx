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
  background: #4d65ff;
  padding: 1vh 2vw;
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
    top: 6px;
    right: -6px;
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

  useEffect(() => {
    if (activeBotData?.customHandles) {
      setCustomHandles(activeBotData.customHandles);
    }
  }, [activeBotData]);

  const handleChange = (idx: number, field: "label" | "url", value: string) => {
    setCustomHandles((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const handleAdd = () => {
    setCustomHandles((prev) => [...prev, { label: "", url: "" }]);
  };

  const handleRemove = (idx: number) => {
    setCustomHandles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
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
    <div>
      <div className="content flex justify-between items-center">
        <h3 className="main-font block text-md sm:text-xl font-bold text-[#000000]">
          Add Social Links to your Profile
        </h3>
        <span className="para-font border border-[#7D7D7D] text-[#7D7D7D] px-4 py-0.5 rounded-xl -mr-6">
          Remove
        </span>
      </div>
      <div className="space-y-4 mt-4">
        {customHandles.map((item, idx) => (
          <div key={idx} className="flex flex-row items-start space-x-2">
            <div className="flex-1 space-y-2 flex flex-col py-4 px-4 bg-[#CEFFDC] rounded-lg">
              <label className="flex flex-col items-start xs:flex-row xs:items-center sm:gap-2">
                <span className="w-[80px] text-[#636363] font-semibold">
                  BUTTON
                </span>
                <input
                  type="text"
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => handleChange(idx, "label", e.target.value)}
                  className="px-2 py-1 border rounded w-[100%] border-2 border-[#6AFF97]"
                />
              </label>

              <label className="flex flex-col items-start xs:flex-row xs:items-center sm:gap-2">
                <span className="w-[80px] text-[#636363] font-semibold">
                  LINK
                </span>
                <input
                  type="text"
                  placeholder="URL"
                  value={item.url}
                  onChange={(e) => handleChange(idx, "url", e.target.value)}
                  className="px-2 py-1 border rounded w-[100%] border-2 border-[#6AFF97]"
                />
              </label>
            </div>
            <div style={{ zIndex: "4" }} className="icon mt-4 relative">
              <Icon
                onClick={() => handleRemove(idx)}
                className=""
                disabled={customHandles.length === 1}
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
