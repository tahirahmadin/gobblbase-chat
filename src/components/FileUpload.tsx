import React from "react";
import { Upload, FileText, Globe, HelpCircle, Book } from "lucide-react";
import Playground from "./Playground";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Set the PDF worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';


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
  const [processingProgress, setProcessingProgress] = React.useState(0);
  const [extractedText, setExtractedText] = React.useState<string | null>(null);

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

  const extractTextFromFile = async (file: File): Promise<string | null> => {
    try {
      setProcessingProgress(5);

      if (file.type === "application/pdf") {
        // Use PDF.js for PDF extraction
        setProcessingProgress(30);
        console.log("Attempting to extract PDF text using pdfjs-dist...");

        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let textContent = "";

        // Loop over all pages in the PDF
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Concatenate all text items from the page
          const pageText = content.items.map((item: any) => item.str).join(" ");
          textContent += pageText + "\n";

          // Update progress based on current page
          setProcessingProgress(Math.floor(30 + (i / pdf.numPages) * 70));
        }
        setProcessingProgress(100);
        return textContent.trim();
      } else if (
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        file.type === "application/msword"
      ) {
        // Use mammoth for Word documents
        const arrayBuffer = await file.arrayBuffer();
        setProcessingProgress(30);
        const result = await mammoth.extractRawText({ arrayBuffer });
        setProcessingProgress(90);

        console.log(
          "Word document text extracted (first 500 chars):",
          result.value.slice(0, 500)
        );
        console.log("Total extracted text length:", result.value.length);

        if (!result.value.trim()) {
          console.warn("No text content could be extracted from the document.");
          return null;
        }
        return result.value;
      } else if (file.type === "text/plain") {
        // Plain text file extraction
        const text = await file.text();
        setProcessingProgress(90);

        console.log("Text file content (first 500 chars):", text.slice(0, 500));
        console.log("Total text length:", text.length);

        if (!text.trim()) {
          console.warn("The text file is empty.");
          return null;
        }
        return text;
      } else {
        console.warn("Unsupported file type, proceeding without text extraction.");
        return null;
      }
    } catch (error) {
      console.error("Text extraction error:", error);
      return null;
    } finally {
      setProcessingProgress(100);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setStatus("uploading");
      setProcessingProgress(0);
      console.log("Processing file:", file.name, "Type:", file.type);
      
      // Extract text if possible
      const text = await extractTextFromFile(file);
      setExtractedText(text);
      
      if (text) {
        console.log("Text extraction successful");
        console.log("-------- EXTRACTED TEXT (FULL) --------");
        console.log(text);
        console.log("-------- END OF EXTRACTED TEXT --------");
      } else {
        console.log("No text was extracted from this file");
      }
      
      // Proceed to Playground regardless of extraction result
      setStatus("success");
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("error");
      setMessage("An error occurred during file processing. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <Playground 
        fileName={file?.name || ""} 
        fileType={file?.type || ""} 
        extractedText={extractedText || ""} 
      />
    );
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
                  <p className="text-xs text-gray-500 mt-2">
                    Text extraction results will be logged to the browser console (F12 or right-click &gt; Inspect &gt; Console)
                  </p>
                  <button
                    onClick={handleUpload}
                    disabled={status === "uploading"}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {status === "uploading" ? "Processing..." : "Upload File"}
                  </button>
                </div>
              )}

              {status === "uploading" && (
                <div className="mt-4">
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-600 bg-purple-200">
                          Processing
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-purple-600">
                          {processingProgress}%
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-purple-200">
                      <div
                        style={{ width: `${processingProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500 transition-all duration-300"
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="mt-4 p-4 bg-red-50 rounded-md">
                  <p className="text-sm text-red-700">{message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
