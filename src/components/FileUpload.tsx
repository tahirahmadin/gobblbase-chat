import React from "react";
import { Upload, FileText, Globe, HelpCircle, Book, X } from "lucide-react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import { useUserStore } from "../store/useUserStore";
import { toast } from "react-hot-toast";
import { createNewAgent } from "../lib/serverActions";

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

export default function FileUpload({ onCancel }: FileUploadProps) {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("files");
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [extractedText, setExtractedText] = React.useState<string | null>(null);
  const [agentName, setAgentName] = React.useState("");
  const { addAgent, setActiveAgentId, clientId } = useUserStore();

  const tabs: SourceTab[] = [
    { id: "files", name: "Files", icon: <FileText className="h-5 w-5" /> },
    { id: "text", name: "Text", icon: <Book className="h-5 w-5" /> },
    { id: "website", name: "Website", icon: <Globe className="h-5 w-5" /> },
    { id: "qa", name: "Q&A", icon: <HelpCircle className="h-5 w-5" /> },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
      setMessage("");
      setProcessingProgress(0);
      setExtractedText(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !agentName || !clientId) return;

    setStatus("uploading");
    setProcessingProgress(0);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        let textContent = "";

        if (file.type === "application/pdf") {
          const pdf = await pdfjsLib.getDocument(
            event.target?.result as ArrayBuffer
          ).promise;
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent += text.items.map((item: any) => item.str).join(" ");
          }
        } else if (
          file.type ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "application/msword"
        ) {
          const result = await mammoth.extractRawText({
            arrayBuffer: event.target?.result as ArrayBuffer,
          });
          textContent = result.value;
        } else if (file.type === "text/plain") {
          textContent = event.target?.result as string;
        }

        setExtractedText(textContent);
        const response = await createNewAgent(textContent, agentName, clientId);

        if (!response.error) {
          let output = response.result;
          const newAgent = {
            name: agentName,
            collectionName: output.collectionName,
            id: output.agentId,
          };
          addAgent(newAgent);
          setStatus("success");
          setMessage("Agent created successfully!");
          // Set the active agent ID to the newly created agent
          setActiveAgentId(output.agentId);
          // Call onCancel to close the file upload view
          onCancel();
        } else {
          setStatus("error");
          setMessage("Failed to create agent");
        }
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      setStatus("error");
      setMessage("Error processing file");
      console.error(error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex">
        {/* Left sidebar */}
        <div className="w-64 pr-8">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md w-full
                  ${
                    activeTab === tab.id
                      ? "text-purple-600 bg-purple-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                <span
                  className={`mr-3 ${
                    activeTab === tab.id ? "text-purple-600" : "text-gray-400"
                  }`}
                >
                  {tab.icon}
                </span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Create New Agent
              </h2>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="agentName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Agent Name
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

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.txt"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, TXT up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {file && (
                <div className="text-sm text-gray-500">
                  Selected file: {file.name}
                </div>
              )}

              {status === "uploading" && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
              )}

              {message && (
                <div
                  className={`text-sm ${
                    status === "error" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {message}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    !file || !agentName || status === "uploading" || !clientId
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Agent
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
