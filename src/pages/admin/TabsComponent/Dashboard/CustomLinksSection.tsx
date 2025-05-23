import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateCustomHandles } from "../../../../lib/serverActions";
import { Plus, Trash2 } from "lucide-react";

const CustomLinksSection = () => {
  const { activeBotId, activeBotData, setRefetchBotData } = useBotConfig();
  const [customHandles, setCustomHandles] = useState([{ label: "", url: "" }]);
  const [isSaving, setIsSaving] = useState(false);

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
      <h3 className="text-lg font-semibold mb-4">Custom Links</h3>
      <div className="space-y-4">
        {customHandles.length === 0 && (
          <div className="text-gray-400 text-sm mb-2">
            No custom links added yet.
          </div>
        )}
        {customHandles.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row items-stretch md:items-center bg-gray-50 border border-gray-200 rounded-lg p-4 gap-2 md:gap-4 shadow-sm relative"
          >
            <input
              type="text"
              placeholder="Label"
              value={item.label}
              onChange={(e) => handleChange(idx, "label", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm mb-2 md:mb-0"
            />
            <input
              type="text"
              placeholder="URL"
              value={item.url}
              onChange={(e) => handleChange(idx, "url", e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm mb-2 md:mb-0"
            />
            <button
              onClick={() => handleRemove(idx)}
              className="flex items-center justify-center text-red-500 hover:text-red-700 p-2 rounded transition-colors border border-transparent hover:border-red-200 bg-white"
              title="Remove link"
              type="button"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mt-2"
          type="button"
        >
          <Plus className="w-4 h-4" /> Add Link
        </button>
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={isSaving || customHandles.length === 0}
          className={`px-5 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm transition-colors font-medium ${
            isSaving || customHandles.length === 0
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
};

export default CustomLinksSection;
