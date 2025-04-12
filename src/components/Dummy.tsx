import React, { FormEvent, useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import mammoth from "mammoth";
import { toast } from "sonner";
import useUploadStatus from "@/store/useUploadStatus";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

const handleDocumentProcessing = async (textContent: string) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_MILVUS_PROCESS_API_URL}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ textContent }),
      }
    );
    if (!response.ok) {
      throw new Error("Error processing document");
    }
    const data = await response.json();
    return data.collectionName || "";
  } catch (error) {
    console.error("Error processing document:", error);
    throw error;
  }
};

type MyDropzoneProps = {
  FileUpload: {
    File: File | null;
    collectionName: string;
  };
  setFileUpload: (file: { File: File | null; collectionName: string }) => void;
};

function MyDropzone({ FileUpload, setFileUpload }: MyDropzoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUploading, setUploadProgress, uploadProgress } = useUploadStatus();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null); // Reset error state
      acceptedFiles.forEach(async (file) => {
        setIsUploading(true);
        setUploadProgress(0);
        setUploading(true);
        setFileUpload({ File: file, collectionName: "" });
        toast.info("File upload in progress. Please wait...");
        try {
          const reader = new FileReader();

          reader.onload = async (event) => {
            let textContent = "";

            if (file.type === "application/pdf") {
              const loader = new WebPDFLoader(file);
              const docs = await loader.load();
              textContent = docs.map((doc) => doc.pageContent).join("\n");
              console.log("PDF Content:", textContent);
            } else if (
              file.type ===
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
              file.type === "application/msword"
            ) {
              const result = await mammoth.extractRawText({
                arrayBuffer: event?.target?.result as ArrayBuffer,
              });
              textContent = result.value;
              console.log("DOCX/DOC Content:", textContent);
            } else if (file.type === "text/plain") {
              textContent = event?.target?.result as string;
              console.log("TXT Content:", textContent);
            }

            try {
              const collectionName = await handleDocumentProcessing(
                textContent
              );
              setFileUpload({ File: file, collectionName });
              toast.success("File processed successfully!");
            } catch (error) {
              console.error("Error while processing document:", error);
              setError(
                "Error processing document: " + (error as Error).message
              );
              toast.error("Error processing document!");
            }

            // Simulate progress
            let progress = 0;
            const interval = setInterval(() => {
              progress += 10;
              setUploadProgress(progress);
              if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                setUploading(false);
                toast.success("File upload completed!");
              }
            }, 500);
          };

          reader.readAsArrayBuffer(file);
        } catch (error) {
          setError("Error processing file: " + (error as Error).message);
          setIsUploading(false);
          setUploading(false);
        }
      });
    },
    [setFileUpload, setUploadProgress, setUploading]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "text/plain": [".txt"],
    },
    maxFiles: 1,
    maxSize: 5242880,
    multiple: false,
  });

  const handleRemoveFile = (e: FormEvent) => {
    e.stopPropagation();
    setFileUpload({ File: null, collectionName: "" });
    setIsUploading(false);
    setUploadProgress(0);
    setUploading(false);
  };

  return (
    <div
      className="border-primary  p-4 bg-modal-inputBox rounded-xl  shadow-md"
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <div className="  lg:px-24 cursor-pointer flex flex-col text-primary items-center">
          <CloudUpload className="w-8 h-8 text-muted-foreground animate-pulse" />
          <p className="text-center break-words text-sm animate-pulse">
            Drop the file here
          </p>
        </div>
      ) : (
        <>
          {FileUpload.File ? (
            <>
              <div className=" px-10 lg:px-24 cursor-pointer flex flex-col text-primary items-center">
                <CloudUpload className="w-8 h-8 text-muted-foreground" />
                <p className="text-center break-words text-sm">
                  {FileUpload.File.name}
                </p>
                <button
                  type="button"
                  className="mt-2 flex items-center justify-center text-red-500"
                  onClick={handleRemoveFile}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Remove File
                </button>
              </div>
              {isUploading && (
                <div className="w-full mt-6">
                  <Progress
                    value={uploadProgress}
                    color="primary"
                    className="w-full h-2 text-primary"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="px-8 lg:px-24 cursor-pointer flex flex-col text-primary items-center">
              <CloudUpload className="w-8 h-8 text-muted-foreground animate-pulse" />
              <p className="text-center break-words text-sm animate-pulse">
                Upload file
              </p>
              <p className="text-center break-words text-xs text-muted-foreground mt-2">
                Drop or upload your pdf, docx, doc, txt file here.
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 text-red-500 text-center">{error}</div>
          )}
        </>
      )}
    </div>
  );
}

export default MyDropzone;
