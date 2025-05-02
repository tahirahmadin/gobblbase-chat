import React, { useState, useEffect } from "react";
import { updateAgentWelcomeMessage } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import toast from "react-hot-toast";

const Welcome = () => {
  const { activeBotId, activeBotData } = useBotConfig();
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeBotData?.welcomeMessage) {
      setWelcomeMessage(activeBotData.welcomeMessage);
    }
  }, [activeBotData]);

  const handleSave = async () => {
    if (!activeBotId) {
      toast.error("No agent selected");
      return;
    }

    try {
      setIsSaving(true);
      await updateAgentWelcomeMessage(activeBotId, welcomeMessage);
      toast.success("Welcome message updated successfully");
    } catch (error: any) {
      console.error("Error updating welcome message:", error);
      toast.error(error.message || "Failed to update welcome message");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">Welcome Message</h2>
        <p className="text-sm text-gray-600 mt-1">
          Customize the message that users see when they first interact with
          your agent
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Welcome Message
            </label>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type your welcome message here..."
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors ${
                isSaving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSaving ? (
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
      </div>
    </div>
  );
};

export default Welcome;
