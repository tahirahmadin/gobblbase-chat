import React from "react";
import { Upload, FileText, Globe, HelpCircle, Book } from "lucide-react";
import { uploadFile } from "../actions/serverActions";
import Playground from "./Playground";
import mammoth from "mammoth";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc =
  "/node_modules/pdfjs-dist/build/pdf.worker.min.js";

interface SourceTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export default function FileUpload() {
  const [file, setFile] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<
    "idle" | "uploading" | "success" | "error"
  >("idle");
  const [message, setMessage] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("files");

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
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        let textContent = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const text = await page.getTextContent();
          textContent +=
            text.items.map((item: any) => item.str).join(" ") + "\n";
        }

        if (!textContent.trim()) {
          throw new Error("No text content could be extracted from the PDF.");
        }
        return textContent;
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });

        if (!result.value.trim()) {
          throw new Error(
            "No text content could be extracted from the document."
          );
        }
        return result.value;
      } else if (file.type === "text/plain") {
        const text = await file.text();

        if (!text.trim()) {
          throw new Error("The text file is empty.");
        }
        return text;
      } else {
        throw new Error(
          "Unsupported file type. Please upload a PDF, DOC/DOCX, or TXT file."
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to extract text: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      console.log("file", file);
      extractTextFromFile(file);
      setStatus("uploading");

      // if (response.success) {
      //   setStatus('success');
      //   setMessage(response.message);
      // } else {
      //   throw new Error(response.message);
      // }
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Upload failed");
    }
  };

  if (status === "success") {
    return <Playground fileName={file?.name || ""} />;
  }

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
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Files</h2>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <div className="text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleFileChange}
                    className="sr-only"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-1 text-sm text-gray-500">
                      Drag & drop files here, or click to select files
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Supported File Types: .pdf, .doc, .docx, .txt
                    </p>
                  </label>
                </div>
              </div>

              {file && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Selected file: {file.name}
                  </p>
                  <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {status === "uploading" ? "Uploading..." : "Upload"}
                  </button>
                </div>
              )}

              {status === "error" && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 mt-8 text-center">
                If you are uploading a PDF, make sure you can select/highlight
                the text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
