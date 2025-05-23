import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateCustomHandles } from "../../../../lib/serverActions";

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
      <h3 className="text-lg font-semibold mb-2">Custom Links</h3>
      <div className="space-y-4">
        {customHandles.map((item, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Label"
              value={item.label}
              onChange={(e) => handleChange(idx, "label", e.target.value)}
              className="px-2 py-1 border rounded w-1/3"
            />
            <input
              type="text"
              placeholder="URL"
              value={item.url}
              onChange={(e) => handleChange(idx, "url", e.target.value)}
              className="px-2 py-1 border rounded w-2/3"
            />
            <button
              onClick={() => handleRemove(idx)}
              className="text-red-500 hover:text-red-700"
              disabled={customHandles.length === 1}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          onClick={handleAdd}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Link
        </button>
      </div>
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default CustomLinksSection;
