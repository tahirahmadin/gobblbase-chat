import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import {
  createNewAgentWithDocumentId,
  addDocumentToAgent,
  removeDocumentFromAgent,
  listAgentDocuments,
  getPlans,
  updateDocumentInAgent,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";
import { useBotConfig } from "../../../../store/useBotConfig";
import { updateAgentBrain } from "../../../../lib/serverActions";
import { calculateSmartnessLevel } from "../../../../utils/helperFn";
import { backendApiUrl } from "../../../../utils/constants";

pdfjsLib.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;

interface UploadedFile {
  name: string;
  size: string;
  sizeInBytes?: number;
  documentId?: string;
}

interface Document {
  documentId: string;
  title: string;
  size: number;
  addedAt: string;
  updatedAt: string;
}

interface BrainProps {
  onCancel?: () => void;
}

interface PlanData {
  id: string;
  name: string;
  price: number;
  totalPrice: number;
  totalDocSize: number;
  currency: string;
  credits: number;
  recurrence: string;
  description: string;
  isCurrentPlan: boolean;
  agentLimit: number;
  features: string[];
}

const Brain: React.FC<BrainProps> = ({ onCancel }) => {
  const { activeBotData, setRefetchBotData } = useBotConfig();
  const [smartnessLevel, setSmartnessLevel] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [agentName, setAgentName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [processingFile, setProcessingFile] = useState<string | null>(null);
  const [insightsData, setInsightsData] = useState({
    usp: "",
    brandPersonality: "",
    languageTerms: "",
    frequentQuestions: "",
  });
  const [smartenUpAnswers, setSmartenUpAnswers] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<PlanData | null>(null);
  const [totalDocumentsSize, setTotalDocumentsSize] = useState(0);
  const [isFetchingPlan, setIsFetchingPlan] = useState(false);

  useEffect(() => {
    if (activeBotData) {
      setSelectedLanguage(activeBotData.language || "English");

      if (
        activeBotData.smartenUpAnswers &&
        activeBotData.smartenUpAnswers.length >= 4
      ) {
        setSmartenUpAnswers(activeBotData.smartenUpAnswers);

        // Initialize insightsData from smartenUpAnswers
        setInsightsData({
          usp: activeBotData.smartenUpAnswers[0] || "",
          brandPersonality: activeBotData.smartenUpAnswers[1] || "",
          languageTerms: activeBotData.smartenUpAnswers[2] || "",
          frequentQuestions: activeBotData.smartenUpAnswers[3] || "",
        });
      }

      const newSmartnessLevel = calculateSmartnessLevel(activeBotData);
      setSmartnessLevel(newSmartnessLevel);
    }
  }, [activeBotData]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { adminId } = useAdminStore();
  const { activeBotId, setActiveBotId, fetchBotData } = useBotConfig();

  // Fetch the user's current plan
  useEffect(() => {
    if (adminId) {
      fetchCurrentPlan();
    }
  }, [adminId]);

  // Fetch agent documents and calculate total size
  useEffect(() => {
    if (activeBotId) {
      fetchAgentDocuments();
    }
  }, [activeBotId]);

  const fetchCurrentPlan = async () => {
    if (!adminId) return;

    try {
      setIsFetchingPlan(true);
      const plans = await getPlans(adminId);
      const userPlan = plans.find((plan) => plan.isCurrentPlan);

      if (userPlan) {
        setCurrentPlan(userPlan);
      }
    } catch (error) {
      console.error("Error fetching current plan:", error);
      toast.error("Failed to fetch your current plan");
    } finally {
      setIsFetchingPlan(false);
    }
  };

  const fetchAgentDocuments = async () => {
    if (!activeBotId) return;

    try {
      const response = await listAgentDocuments(activeBotId);

      if (!response.error && typeof response.result !== "string") {
        const allDocs = response.result.documents as Document[];

        const totalSize = allDocs.reduce((total, doc) => total + doc.size, 0);
        setTotalDocumentsSize(totalSize);

        const filteredDocs = allDocs.filter(
          (doc) => doc.title !== "Brand Insights"
        );

        const docs = filteredDocs.map((doc) => ({
          name: truncateFileName(doc.title, 30),
          size: formatFileSize(doc.size),
          sizeInBytes: doc.size,
          documentId: doc.documentId,
        }));

        setUploadedFiles(docs);
      }
    } catch (error) {
      console.error("Error fetching agent documents:", error);
      toast.error("Failed to load agent documents");
    }
  };

  // Truncate filename for display
  const truncateFileName = (fileName: string, maxLength: number): string => {
    if (fileName.length <= maxLength) return fileName;

    const extension =
      fileName.lastIndexOf(".") > 0
        ? fileName.substring(fileName.lastIndexOf("."))
        : "";
    const nameWithoutExt = fileName.substring(
      0,
      fileName.lastIndexOf(".") > 0
        ? fileName.lastIndexOf(".")
        : fileName.length
    );

    if (nameWithoutExt.length <= maxLength - 3 - extension.length)
      return fileName;

    return (
      nameWithoutExt.substring(0, maxLength - 3 - extension.length) +
      "..." +
      extension
    );
  };

  // Handle adding links
  const handleAddLink = () => {
    if (!newLink) {
      toast.error("Please enter a valid URL");
      return;
    }

    // Basic URL validation
    try {
      // Add protocol if missing
      const urlToAdd = newLink.startsWith("http")
        ? newLink
        : `https://${newLink}`;
      new URL(urlToAdd); // Will throw if invalid

      if (!links.includes(urlToAdd)) {
        setLinks([...links, urlToAdd]);
        setNewLink("");
      } else {
        toast.error("This URL is already added");
      }
    } catch (e) {
      toast.error("Please enter a valid URL");
    }
  };

  // Handle removing links
  const handleRemoveLink = (linkToRemove: string) => {
    setLinks(links.filter((link) => link !== linkToRemove));
  };

  const handleRemoveFile = async (fileName: string, documentId?: string) => {
    if (!documentId || !activeBotId) {
      setUploadedFiles(uploadedFiles.filter((file) => file.name !== fileName));
      setSelectedFiles(selectedFiles.filter((file) => file.name !== fileName));
      return;
    }

    try {
      setProcessingFile(fileName);

      const removeResponse = await removeDocumentFromAgent(
        activeBotId,
        documentId
      );

      if (!removeResponse.error) {
        const removedFile = uploadedFiles.find(
          (file) => file.documentId === documentId
        );
        const removedSize = removedFile?.sizeInBytes || 0;

        const updatedFiles = uploadedFiles.filter(
          (file) => file.documentId !== documentId
        );
        setUploadedFiles(updatedFiles);

        setTotalDocumentsSize((prevSize) => prevSize - removedSize);

        if (updatedFiles.length === 0) {
          toast.success(
            "All documents removed. Please add at least one document for the agent to be queryable."
          );
        } else {
          toast.success("Document removed successfully");
        }
      } else {
        const errorMsg =
          typeof removeResponse.result === "string"
            ? removeResponse.result
            : "Failed to remove document";

        toast.error(errorMsg);
      }
    } catch (error) {
      console.error("Error removing document:", error);
      toast.error("Failed to remove document");
    } finally {
      setProcessingFile(null);
    }
  };

  // Extract text from different file types
  const extractTextFromFile = async (file: File): Promise<string | null> => {
    const fileType = file.type;
    let extractedText = "";

    try {
      // PDF extraction
      if (fileType === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          extractedText += textContent.items
            .map((item: any) => item.str)
            .join(" ");
        }
      }
      // Word document extraction
      else if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        extractedText = result.value;
      }
      // Text files or other formats
      else {
        extractedText = await file.text();
      }

      // Check if extracted text is empty
      if (!extractedText.trim()) {
        return null;
      }

      return extractedText;
    } catch (error) {
      console.error("Error extracting text from file:", error);
      return null;
    }
  };

  // Check if adding new files would exceed the plan's document size limit
  const checkSizeLimits = (newFiles: File[]): boolean => {
    if (!currentPlan) return true; // Allow if we don't have plan info yet

    const newFilesSize = newFiles.reduce((total, file) => total + file.size, 0);
    const projectedTotalSize = totalDocumentsSize + newFilesSize;

    if (projectedTotalSize > currentPlan.totalDocSize) {
      const overageInBytes = projectedTotalSize - currentPlan.totalDocSize;
      const formattedOverage = formatFileSize(overageInBytes);

      toast.error(
        `Upload exceeds your plan's storage limit by ${formattedOverage}. Please upgrade your plan or remove some documents.`
      );
      return false;
    }

    return true;
  };

  // Auto-upload on file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);

    // Check file types
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const invalidFiles = newFiles.filter((f) => !allowedTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error(
        `Only PDF, DOCX, and TXT files are supported: ${invalidFiles
          .map((f) => truncateFileName(f.name, 20))
          .join(", ")}`
      );
      return;
    }

    // Check if adding these files would exceed the plan's document size limit
    if (!checkSizeLimits(newFiles)) {
      return;
    }

    // Add new files to the selected files array and automatically upload
    setSelectedFiles(newFiles);

    // Auto-trigger upload if we have an active bot ID
    if (activeBotId) {
      await handleUpload(newFiles);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);

      // Check file types
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      const invalidFiles = newFiles.filter(
        (f) => !allowedTypes.includes(f.type)
      );
      if (invalidFiles.length > 0) {
        toast.error(
          `Only PDF, DOCX, and TXT files are supported: ${invalidFiles
            .map((f) => truncateFileName(f.name, 20))
            .join(", ")}`
        );
        return;
      }

      // Check if adding these files would exceed the plan's document size limit
      if (!checkSizeLimits(newFiles)) {
        return;
      }

      // Add new files and auto-upload if we have an active bot
      setSelectedFiles(newFiles);

      if (activeBotId) {
        await handleUpload(newFiles);
      }
    }
  };

  // Handle updating insights data
  const handleInsightsChange = (
    field: keyof typeof insightsData,
    value: string
  ) => {
    setInsightsData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle file upload - Enhanced with automatic processing
  const handleUpload = async (filesToUpload: File[] = selectedFiles) => {
    if (!adminId) {
      toast.error("Admin ID is required");
      return;
    }

    if (filesToUpload.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    // Check if adding these files would exceed the plan's document size limit
    if (!checkSizeLimits(filesToUpload)) {
      return;
    }

    // For new agent, validate name
    if (!activeBotId && !agentName.trim()) {
      toast.error("Agent name is required");
      return;
    }

    setIsUploading(true);

    try {
      // If we don't have an agent yet, create one with the first file
      if (!activeBotId) {
        try {
          setProcessingFile(filesToUpload[0].name);

          // Extract text from the first file
          const firstFileContent = await extractTextFromFile(filesToUpload[0]);

          if (!firstFileContent) {
            toast.error(
              `Could not extract text from ${truncateFileName(
                filesToUpload[0].name,
                20
              )}. The file may be empty or corrupted.`
            );
            // If this is the only file, we can't proceed
            if (filesToUpload.length === 1) {
              return;
            }
            // Otherwise, continue with other files
          } else {
            // Prepare combined content with insights if available
            let combinedContent = firstFileContent;

            // Add insights data if available
            const insights = [];
            if (insightsData.usp)
              insights.push(`Brand USP: ${insightsData.usp}`);
            if (insightsData.brandPersonality)
              insights.push(
                `Brand Personality: ${insightsData.brandPersonality}`
              );
            if (insightsData.languageTerms)
              insights.push(`Brand Language: ${insightsData.languageTerms}`);
            if (insightsData.frequentQuestions)
              insights.push(
                `Frequent Questions: ${insightsData.frequentQuestions}`
              );

            // First, create a new agent (without document)
            const response = await createNewAgentWithDocumentId(
              adminId,
              agentName.trim(),
              {
                name: selectedLanguage,
                value: [],
              },
              {
                mainDarkColor: "#000000",
                mainLightColor: "#ffffff",
                highlightColor: "#3b82f6",
                isDark: false,
              }
            );

            if (response.error) {
              throw new Error(
                typeof response.result === "string"
                  ? response.result
                  : "Failed to create agent"
              );
            }

            const newAgentId =
              typeof response.result !== "string"
                ? response.result.agentId
                : "";

            if (!newAgentId) {
              throw new Error("Invalid response from server");
            }

            // Add first file to the list
            setUploadedFiles([
              {
                name: truncateFileName(filesToUpload[0].name, 30),
                size: formatFileSize(filesToUpload[0].size),
                sizeInBytes: filesToUpload[0].size,
                documentId: newAgentId, // Use agentId as documentId for now
              },
            ]);

            // Update total documents size
            setTotalDocumentsSize(filesToUpload[0].size);

            // Upload remaining files
            let successCount = 1; // First file already processed
            let failCount = 0;

            if (filesToUpload.length > 1) {
              for (let i = 1; i < filesToUpload.length; i++) {
                try {
                  const result = await uploadFileToAgent(
                    filesToUpload[i],
                    newAgentId
                  );
                  if (result) {
                    successCount++;
                  } else {
                    failCount++;
                  }
                } catch (error) {
                  failCount++;
                  console.error(
                    `Error uploading ${filesToUpload[i].name}:`,
                    error
                  );
                }
              }
            }

            // Upload links as separate documents if available
            if (links.length > 0) {
              for (const link of links) {
                try {
                  await uploadLinkToAgent(link, newAgentId);
                  successCount++;
                } catch (error) {
                  failCount++;
                  console.error(`Error uploading link ${link}:`, error);
                }
              }
            }

            // Show success message with counts
            if (failCount > 0) {
              toast.success(
                `Agent created with ${successCount} document(s). ${failCount} document(s) failed.`
              );
            } else {
              toast.success("Agent created successfully!");
            }

            // Update active bot ID
            setRefetchBotData();

            // Close modal if needed
            if (onCancel) {
              setTimeout(() => {
                onCancel();
              }, 1500);
            }
          }
        } catch (error) {
          console.error("Error creating agent:", error);
          toast.error(
            error instanceof Error ? error.message : "Failed to create agent"
          );
        }
      }
      // If we already have an agent, add files to it
      else {
        // Process all selected files
        let successCount = 0;
        let failCount = 0;

        // Process files one by one to handle errors individually
        for (const file of filesToUpload) {
          try {
            const result = await uploadFileToAgent(file, activeBotId);
            if (result) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
            console.error(`Error uploading ${file.name}:`, error);
          }
        }

        // Upload links as separate documents if available
        if (links.length > 0) {
          for (const link of links) {
            try {
              await uploadLinkToAgent(link, activeBotId);
              successCount++;
            } catch (error) {
              failCount++;
              console.error(`Error uploading link ${link}:`, error);
            }
          }
        }

        // Show success message with counts
        if (successCount > 0) {
          if (failCount > 0) {
            toast.success(
              `Uploaded ${successCount} document(s). ${failCount} document(s) failed.`
            );
          } else {
            toast.success(`${successCount} document(s) uploaded successfully!`);
          }
        } else if (failCount > 0) {
          toast.error(`Failed to upload ${failCount} document(s).`);
        }
      }

      // Reset file input and selected files
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedFiles([]);
      setLinks([]);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setProcessingFile(null);
    }
  };

  // Upload a single file to an agent
  const uploadFileToAgent = async (
    file: File,
    agentId: string
  ): Promise<boolean> => {
    setProcessingFile(file.name);

    try {
      // Extract text from file
      const textContent = await extractTextFromFile(file);

      // If text content is empty or null, skip this file
      if (!textContent) {
        toast.error(
          `Could not extract text from ${truncateFileName(
            file.name,
            20
          )}. The file may be empty or corrupted.`
        );
        return false;
      }

      // Upload to agent
      const response = await addDocumentToAgent(
        agentId,
        textContent,
        file.name,
        file.size
      );

      if (response.error) {
        throw new Error(
          typeof response.result === "string"
            ? response.result
            : `Failed to upload ${file.name}`
        );
      }

      const documentId =
        typeof response.result !== "string" ? response.result.documentId : "";

      if (!documentId) {
        throw new Error("Invalid response from server");
      }

      // Add to uploaded files list
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: truncateFileName(file.name, 30),
          size: formatFileSize(file.size),
          sizeInBytes: file.size,
          documentId,
        },
      ]);

      // Update total size
      setTotalDocumentsSize((prev) => prev + file.size);

      return true;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      toast.error(`Failed to upload ${truncateFileName(file.name, 20)}`);
      return false;
    } finally {
      setProcessingFile(null);
    }
  };

  // Upload a link to an agent by extracting its content
  const uploadLinkToAgent = async (
    link: string,
    agentId: string
  ): Promise<string> => {
    try {
      // You need to implement this function in your serverActions.js
      // It should call your backend API that handles content extraction from URLs
      const extractionResponse = await fetch(
        `${backendApiUrl}/content/extract`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: link }),
        }
      );

      if (!extractionResponse.ok) {
        throw new Error(`Failed to extract content from ${link}`);
      }

      const extractionData = await extractionResponse.json();

      if (!extractionData.success || !extractionData.content) {
        throw new Error(`No content extracted from ${link}`);
      }
      const contentSize = new TextEncoder().encode(
        extractionData.content
      ).length;

      // Check if adding this content would exceed the plan's document size limit
      if (
        currentPlan &&
        totalDocumentsSize + contentSize > currentPlan.totalDocSize
      ) {
        const overageInBytes =
          totalDocumentsSize + contentSize - currentPlan.totalDocSize;
        const formattedOverage = formatFileSize(overageInBytes);
        toast.error(
          `Extract from ${link} exceeds your plan's storage limit by ${formattedOverage}. Please upgrade your plan or remove some documents.`
        );
        throw new Error("Content size exceeds plan limit");
      }

      // Get URL hostname for document title
      const urlObj = new URL(link);
      const hostname = urlObj.hostname;

      // Upload extracted content to agent
      const response = await addDocumentToAgent(
        agentId,
        extractionData.content,
        `Web: ${hostname}`,
        contentSize
      );

      if (response.error) {
        throw new Error(
          typeof response.result === "string"
            ? response.result
            : `Failed to upload ${link}`
        );
      }

      const documentId =
        typeof response.result !== "string" ? response.result.documentId : "";

      if (!documentId) {
        throw new Error("Invalid response from server");
      }

      // Add to uploaded files list
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: `Web: ${hostname}`,
          size: formatFileSize(contentSize),
          sizeInBytes: contentSize,
          documentId,
        },
      ]);

      // Update total size
      setTotalDocumentsSize((prev) => prev + contentSize);

      return documentId;
    } catch (error) {
      console.error(`Error uploading link ${link}:`, error);
      toast.error(`Failed to extract and upload content from ${link}`);
      throw error;
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Validation function for insights data
  const validateInsightsData = (): {
    isValid: boolean;
    missingFields: string[];
  } => {
    const fields = [
      { key: "usp", label: "Brand USP" },
      { key: "brandPersonality", label: "Brand Personality" },
      { key: "languageTerms", label: "Brand Language Terms" },
      { key: "frequentQuestions", label: "Frequent Questions" },
    ];

    const missingFields: string[] = [];

    fields.forEach((field) => {
      const value = insightsData[field.key as keyof typeof insightsData];
      const wordCount = value
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      if (wordCount < 5) {
        missingFields.push(field.label);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  const handleSave = async () => {
    if (!activeBotData) {
      toast.error("No agent selected");
      return;
    }

    // Validate insights data
    const validation = validateInsightsData();
    if (!validation.isValid) {
      toast.error(
        "Please complete all insights fields with at least 5 words each before saving"
      );
      return;
    }

    try {
      setIsSaving(true);

      const updatedAnswers = [
        insightsData.usp || "",
        insightsData.brandPersonality || "",
        insightsData.languageTerms || "",
        insightsData.frequentQuestions || "",
      ];

      await updateAgentBrain(
        activeBotData.agentId,
        selectedLanguage,
        updatedAnswers
      );

      const formattedInsights = `
  BRAND INSIGHTS:
  
  1. What makes you/your brand unique? The main USP:
  ${insightsData.usp}
  
  2. How would your most loyal follower/customer describe you or your brand's personality?
  ${insightsData.brandPersonality}
  
  3. What specific language, terms, or phrases should your AI agent use (or avoid) to authentically represent your brand voice?
  ${insightsData.languageTerms}
  
  4. What questions do your customers most frequently ask?
  ${insightsData.frequentQuestions}
  `.trim();

      if (formattedInsights.trim().length > 0) {
        const docSize = new TextEncoder().encode(formattedInsights).length;

        try {
          const existingDocuments = await listAgentDocuments(
            activeBotData.agentId
          );
          let existingInsightsDoc = null;

          if (
            !existingDocuments.error &&
            typeof existingDocuments.result !== "string"
          ) {
            const documents = existingDocuments.result.documents;
            existingInsightsDoc = documents.find(
              (doc) => doc.title === "Brand Insights"
            );
          }

          if (existingInsightsDoc) {
            const removeResponse = await removeDocumentFromAgent(
              activeBotData.agentId,
              existingInsightsDoc.documentId
            );

            if (removeResponse.error) {
              console.warn(
                "Could not remove existing Brand Insights document:",
                typeof removeResponse.result === "string"
                  ? removeResponse.result
                  : "Unknown error"
              );
            }
          }

          const addResponse = await addDocumentToAgent(
            activeBotData.agentId,
            formattedInsights,
            "Brand Insights",
            docSize
          );

          if (addResponse.error) {
            console.error(
              "Failed to add Brand Insights document:",
              typeof addResponse.result === "string"
                ? addResponse.result
                : "Unknown error"
            );
          }
        } catch (docError) {
          console.error("Error managing Brand Insights document:", docError);
        }
      }

      setRefetchBotData();
      toast.success("Agent brain updated successfully");
    } catch (error: any) {
      console.error("Error updating agent brain:", error);
      toast.error(error.message || "Failed to update agent brain");
    } finally {
      setIsSaving(false);
    }
  };

  const getRemainingStorage = (): string => {
    if (!currentPlan) return "Calculating...";

    const remainingBytes = Math.max(
      0,
      currentPlan.totalDocSize - totalDocumentsSize
    );
    return formatFileSize(remainingBytes);
  };

  return (
    <div className="container grid grid-cols-2 gap-6 p-6 h-full overflow-y-auto">
      {/* Left Section - Power Your Agent's Intelligence */}
      <div className="space-y-6 ">
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

          {/* Agent Name (if creating new agent) */}
          {!activeBotId && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter agent name"
              />
            </div>
          )}

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
            {/* <label className="block text-sm font-medium mb-2">Add Links</label>
            <p className="text-xs text-gray-500 mb-2">
              Paste direct links to your website and online files
            </p> */}

            {/* Existing Links */}
            {/* <div className="space-y-2 mb-3">
              {links.map((link, index) => (
                <div
                  key={index}
                  className="flex items-center bg-green-50 border border-green-100 rounded-md"
                >
                  <input
                    type="text"
                    value={link}
                    readOnly
                    className="flex-1 px-3 py-2 bg-transparent text-sm overflow-x-auto"
                  />
                  <button
                    onClick={() => handleRemoveLink(link)}
                    className="p-2 hover:text-red-600"
                    aria-label="Remove link"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div> */}

            {/* New Link Input */}
            {/* <div className="flex space-x-2">
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
            </div> */}
          </div>

          {/* Upload Files */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Files
            </label>
            <div className="space-y-2 mb-3">
              {uploadedFiles.map((file) => (
                <div
                  key={file.name + (file.documentId || "")}
                  className="flex items-center justify-between bg-green-50 border border-green-100 rounded-md px-3 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">{file.size}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {processingFile === file.name ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <button
                        onClick={() =>
                          handleRemoveFile(file.name, file.documentId)
                        }
                        className="hover:text-red-600"
                        disabled={isUploading || processingFile !== null}
                        aria-label="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Show selected files that haven't been uploaded yet */}
              {selectedFiles.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-md px-3 py-2"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {truncateFileName(file.name, 30)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-xs text-blue-500">(Selected)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedFiles(
                            selectedFiles.filter((f) => f.name !== file.name)
                          );
                        }}
                        className="hover:text-red-600"
                        disabled={isUploading}
                        aria-label="Remove selected file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-3 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.docx,.txt"
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-1">
                  Click to select files or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: PDF, DOCX, TXT
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  You can select multiple files at once
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {!isFetchingPlan && currentPlan ? (
                  <>
                    Max total size: {formatFileSize(currentPlan.totalDocSize)} |
                    Available: {getRemainingStorage()} | At least one document
                    is required
                  </>
                ) : (
                  <>Loading storage information...</>
                )}
              </span>

              {/* Only show upload button for new agents since existing ones auto-upload */}
              {!activeBotId && (
                <button
                  onClick={() => handleUpload()}
                  disabled={
                    isUploading ||
                    processingFile !== null ||
                    selectedFiles.length === 0
                  }
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {processingFile
                        ? `UPLOADING ${truncateFileName(processingFile, 15)}...`
                        : "UPLOADING..."}
                    </>
                  ) : (
                    `CREATE AGENT${
                      selectedFiles.length > 0
                        ? ` WITH ${selectedFiles.length} FILES`
                        : ""
                    }`
                  )}
                </button>
              )}
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
              value={insightsData.usp}
              onChange={(e) => handleInsightsChange("usp", e.target.value)}
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
              value={insightsData.brandPersonality}
              onChange={(e) =>
                handleInsightsChange("brandPersonality", e.target.value)
              }
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
              value={insightsData.languageTerms}
              onChange={(e) =>
                handleInsightsChange("languageTerms", e.target.value)
              }
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
              value={insightsData.frequentQuestions}
              onChange={(e) =>
                handleInsightsChange("frequentQuestions", e.target.value)
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Type here..."
            />
          </div>

          {/* Validation Message */}
          {(() => {
            const validation = validateInsightsData();
            if (!validation.isValid) {
              return (
                <div className="flex items-start space-x-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-700">
                    <p className="font-medium mb-1">
                      Complete all insights to save your progress
                    </p>
                    <p>
                      Please provide at least 5 words for each field to help
                      your agent deliver more personalized and effective
                      responses.
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !validateInsightsData().isValid}
              className={`px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm font-semibold transition-colors ${
                isSaving || !validateInsightsData().isValid
                  ? "opacity-50 cursor-not-allowed"
                  : ""
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
