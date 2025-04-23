import React, { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Globe,
  Book,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { toast } from "react-hot-toast";
import { createNewAgent } from "../lib/serverActions";
import { useBotConfig } from "../store/useBotConfig";
import { useAdminStore } from "../store/useAdminStore";

// Set the PDF worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface SourceTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FileUploadProps {
  onCancel: () => void;
}

const sourceTabs: SourceTab[] = [
  { id: "file", name: "File", icon: <FileText className="h-5 w-5" /> },
  { id: "website", name: "Website", icon: <Globe className="h-5 w-5" /> },
  { id: "text", name: "Text", icon: <Book className="h-5 w-5" /> },
];

export default function FileUpload({ onCancel }: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [agentName, setAgentName] = useState("");
  const [activeTab, setActiveTab] = useState("file");
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { activeBotId, setActiveBotId, fetchBotData } = useBotConfig();
  const { adminId } = useAdminStore();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        // 10MB limit
        setErrorMessage("File size should be less than 10MB");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setErrorMessage("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 10 * 1024 * 1024) {
        setErrorMessage("File size should be less than 10MB");
        setFile(null);
        return;
      }
      setFile(droppedFile);
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentName.trim()) {
      setErrorMessage("Agent name is required");
      return;
    }

    if (activeTab === "file" && !file) {
      setErrorMessage("Please upload a file");
      return;
    }

    if (activeTab === "website" && !websiteUrl.trim()) {
      setErrorMessage("Website URL is required");
      return;
    }

    if (activeTab === "text" && !textInput.trim()) {
      setErrorMessage("Text content is required");
      return;
    }

    setStatus("processing");
    setUploadProgress(0);
    setErrorMessage("");

    try {
      let content = "";
      if (activeTab === "file" && file) {
        const fileType = file.type;
        if (fileType === "application/pdf") {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            content += textContent.items.map((item: any) => item.str).join(" ");
            setUploadProgress((i / pdf.numPages) * 100);
          }
        } else if (
          fileType ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          content = result.value;
          setUploadProgress(100);
        } else {
          content = await file.text();
          setUploadProgress(100);
        }
      } else if (activeTab === "website") {
        // Simulate website content fetching
        setUploadProgress(50);
        content = websiteUrl;
        setUploadProgress(100);
      } else {
        content = textInput;
        setUploadProgress(100);
      }

      if (!adminId) {
        throw new Error("Client ID is required");
      }

      const response = await createNewAgent(adminId, agentName, content);

      if (!response.error) {
        let output = response.result;
        await fetchBotData(output.agentId, false);

        setStatus("success");
        toast.success("Agent created successfully!");
        setTimeout(() => {
          setActiveBotId(output.agentId);
          onCancel();
        }, 1500);
      } else {
        setStatus("error");
        setErrorMessage("Failed to create agent");
        toast.error("Failed to create agent");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("An error occurred while processing your request");
      toast.error("An error occurred while processing your request");
    }
  };

  const isFormValid = () => {
    if (!agentName.trim()) return false;
    if (activeTab === "file" && !file) return false;
    if (activeTab === "website" && !websiteUrl.trim()) return false;
    if (activeTab === "text" && !textInput.trim()) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4">
        {sourceTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-md ${
              activeTab === tab.id
                ? "bg-indigo-100 text-indigo-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="agentName"
            className="block text-sm font-medium text-gray-700"
          >
            Agent Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="agentName"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter agent name"
            required
          />
        </div>

        {activeTab === "file" && (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center space-x-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                <span className="text-sm text-gray-600">{file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="text-sm text-gray-600">
                  Drag and drop a file here, or click to select
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOCX, TXT (max 10MB)
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "website" && (
          <div>
            <label
              htmlFor="websiteUrl"
              className="block text-sm font-medium text-gray-700"
            >
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              id="websiteUrl"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="https://example.com"
              required
            />
          </div>
        )}

        {activeTab === "text" && (
          <div>
            <label
              htmlFor="textInput"
              className="block text-sm font-medium text-gray-700"
            >
              Text Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="textInput"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Enter your text content here..."
              required
            />
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            {errorMessage}
          </div>
        )}

        {status === "processing" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Processing...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span>Agent created successfully!</span>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isFormValid() || status === "processing"}
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              !isFormValid() || status === "processing"
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            }`}
          >
            {status === "processing" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Agent"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
