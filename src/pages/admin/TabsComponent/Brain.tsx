import React, { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
import { updateAgentBrain } from "../../../lib/serverActions";
import { toast } from "react-hot-toast";

interface UploadedFile {
  name: string;
  size: string;
}

const Brain = () => {
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const [smartnessLevel, setSmartNessLevel] = useState(30);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    { name: "inventorylist.pdf", size: "10MB" },
    { name: "salefullst.pdf", size: "560KB" },
  ]);
  const [smartenUpAnswers, setSmartenUpAnswers] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeBotData) {
      setSelectedLanguage(activeBotData.language || "English");
      if (activeBotData.smartenUpAnswers) {
        setSmartenUpAnswers(activeBotData.smartenUpAnswers);
      }
    }
  }, [activeBotData]);

  const handleAddLink = () => {
    if (newLink && !links.includes(newLink)) {
      setLinks([...links, newLink]);
      setNewLink("");
    }
  };

  const handleRemoveLink = (linkToRemove: string) => {
    setLinks(links.filter((link) => link !== linkToRemove));
  };

  const handleRemoveFile = (fileName: string) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...smartenUpAnswers];
    newAnswers[index] = value;
    setSmartenUpAnswers(newAnswers);
  };

  const handleSave = async () => {
    if (!activeBotData) {
      toast.error("No agent selected");
      return;
    }

    try {
      setIsSaving(true);
      await updateAgentBrain(
        activeBotData.agentId,
        selectedLanguage,
        smartenUpAnswers
      );
      setRefetchBotData();
      toast.success("Agent brain updated successfully");
    } catch (error: any) {
      console.error("Error updating agent brain:", error);
      toast.error(error.message || "Failed to update agent brain");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container grid grid-cols-2 gap-6 p-6">
      {/* Left Section - Power Your Agent's Intelligence */}
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">
            Power Your Agent's Intelligence
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            The more you share, the smarter your agent becomes. Each detail you
            provide enhances its ability to deliver precise, knowledgeable
            responses. Complete all sections to unlock your agent's full
            potential!
          </p>

          {/* Agent Smartness */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Agent Smartness
            </label>
            <div className="relative pt-1">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${smartnessLevel}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"
                />
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {smartnessLevel}% COMPLETE
                </span>
              </div>
            </div>
          </div>

          {/* Agent Language */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Agent Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
            </select>
          </div>

          {/* Add Links */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Add Links</label>
            <p className="text-xs text-gray-500 mb-2">
              Paste direct links to your website and online files
            </p>

            {/* Existing Links */}
            <div className="space-y-2 mb-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center bg-green-50 border border-green-100 rounded-md"
                >
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="flex-1 px-3 py-2 bg-transparent text-sm"
                  />
                  <button
                    onClick={() => handleRemoveLink(link)}
                    className="p-2 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* New Link Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Paste your link..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                onClick={handleAddLink}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                ADD LINK
              </button>
            </div>
          </div>

          {/* Upload Files */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Files
            </label>
            <div className="space-y-2 mb-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-green-50 border border-green-100 rounded-md px-3 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">{file.size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 text-sm hover:text-blue-800">
                      FILE SIZE
                    </button>
                    <button
                      onClick={() => handleRemoveFile(file.name)}
                      className="hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 space-y-2">
              <input
                type="file"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-gray-50 file:text-gray-700
                  hover:file:bg-gray-100"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Max File Size: 15MB | 5 Files Limit
                </span>
                <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
                  UPLOAD
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - SMARTEN UP */}
      <div className="p-6 rounded-lg" style={{ backgroundColor: "#eaefff" }}>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">SMARTEN UP</h2>
          <p className="text-sm text-gray-600">
            Share Your Insights to Unlock Your Agent's Full Potential
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              1. What makes you/your brand unique? The main USP:
            </label>
            <textarea
              value={smartenUpAnswers[0]}
              onChange={(e) => handleAnswerChange(0, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              2. How would your most loyal follower/customer describe you or
              your brand's personality?
            </label>
            <textarea
              value={smartenUpAnswers[1]}
              onChange={(e) => handleAnswerChange(1, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              3. What specific language, terms, or phrases should your AI agent
              use (or avoid) to authentically represent your brand voice?
            </label>
            <textarea
              value={smartenUpAnswers[2]}
              onChange={(e) => handleAnswerChange(2, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type here..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              4. What questions do your customers most frequently ask?
            </label>
            <textarea
              value={smartenUpAnswers[3]}
              onChange={(e) => handleAnswerChange(3, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type here..."
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

export default Brain;
