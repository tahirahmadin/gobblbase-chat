import { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { useAdminStore } from "../../../store/useAdminStore";
import TemplateEditor from "./Emails/TemplateEditor";
import { toast } from "react-hot-toast";

interface EmailTemplate {
  subText: string;
  isActive: boolean;
  subject: string;
  body1: string;
  body2: string;
  body3: string;
}

const EmailTemplates = () => {
  const [selectedId, setSelectedId] = useState<string>("physicalProduct");
  const { activeBotId } = useBotConfig();
  const [preview, setPreview] = useState(false);
  const [templatePreview, setTemplatePreview] = useState("");

  const {
    emailTemplates,
    emailTemplatesLoading,
    emailTemplatesError,
    fetchEmailTemplates,
    updateEmailTemplate,
    setEmailTemplates,
  } = useAdminStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeBotId) {
      fetchEmailTemplates(activeBotId);
    }
  }, [activeBotId, fetchEmailTemplates]);

  const handleInputChange = (
    field: "subject" | "body1" | "body2" | "body3",
    value: string
  ) => {
    if (!emailTemplates?.result) return;

    const template = emailTemplates.result[selectedId] as EmailTemplate;
    if (!template) return;

    const updatedTemplate = {
      ...template,
      [field]: value,
    };

    const updatedTemplates = {
      ...emailTemplates,
      result: {
        ...emailTemplates.result,
        [selectedId]: updatedTemplate,
      },
    };

    setEmailTemplates(updatedTemplates);
  };

  const handlePreview = () => {
    if (!emailTemplates?.result) return;

    const template = emailTemplates.result[selectedId] as EmailTemplate;
    if (!template) return;

    const previewText = `${template.body1}\n\n${template.body2}\n\n${template.body3}`;
    setTemplatePreview(previewText);
    setPreview(true);
  };

  const handleSave = async () => {
    if (!activeBotId || !emailTemplates?.result) return;

    const template = emailTemplates.result[selectedId] as EmailTemplate;
    if (!template) return;

    setSaving(true);
    try {
      await updateEmailTemplate(activeBotId, template, selectedId);
      toast.success("Template updated successfully");
    } catch (error) {
      toast.error("Failed to update template");
    } finally {
      setSaving(false);
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setPreview(false);
  };

  const handleToggle = async (templateKey: string) => {
    if (!emailTemplates?.result || !activeBotId) return;

    const template = emailTemplates.result[templateKey] as EmailTemplate;
    if (!template) return;

    const updatedTemplate = {
      ...template,
      isActive: !template.isActive,
    };

    const updatedTemplates = {
      ...emailTemplates,
      result: {
        ...emailTemplates.result,
        [templateKey]: updatedTemplate,
      },
    };

    setEmailTemplates(updatedTemplates);

    // Save the changes to the backend
    setSaving(true);
    try {
      await updateEmailTemplate(activeBotId, updatedTemplate, templateKey);
      toast.success("Template status updated successfully");
    } catch (error) {
      toast.error("Failed to update template status");
      // Revert the change if save fails
      setEmailTemplates(emailTemplates);
    } finally {
      setSaving(false);
    }
  };

  if (emailTemplatesLoading) {
    return <div>Loading...</div>;
  }

  if (emailTemplatesError) {
    return <div>Error: {emailTemplatesError}</div>;
  }

  if (!emailTemplates?.result) {
    return <div>No templates found</div>;
  }

  const template = emailTemplates.result[selectedId] as EmailTemplate;
  if (!template) {
    return <div>Template not found</div>;
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6 h-screen overflow-hidden">
      {/* Sidebar with scrolling */}
      <div className="w-full md:w-1/3 max-w-xs h-full overflow-y-auto">
        <h2 className="text-xl font-bold text-black">Email Templates</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Tailor messages to match every customer action
        </p>
        <div className="space-y-2">
          {Object.entries(emailTemplates.result)
            .filter(([key]) => key !== "agentId")
            .map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition border ${
                  selectedId === key
                    ? "bg-green-50 border-green-400"
                    : "bg-white border-gray-200"
                }`}
                onClick={() => handleSelect(key)}
              >
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      selectedId === key ? "text-green-700" : "text-gray-800"
                    }`}
                  >
                    {(value as EmailTemplate).subText}
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(value as EmailTemplate).isActive}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleToggle(key);
                    }}
                    className="sr-only peer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div
                    className={`w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200 peer-focus:outline-none peer-checked:bg-green-400`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                        (value as EmailTemplate).isActive ? "translate-x-5" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </div>
            ))}
        </div>
      </div>

      {/* Editor area with scrolling */}
      <div className="flex-1 h-full overflow-y-auto">
        {!preview && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
            <div className="mb-4 text-gray-700 font-semibold">
              {template.subText}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                Subject:
              </label>
              <div className="whitespace-pre-line text-gray-700 mb-2">
                {template.subject}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">Body</label>
              <div className=" border border-blue-300 rounded-md bg-white max-h-96 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-4">
                    <div className="whitespace-pre-line text-gray-700 mb-2">
                      {template.body1}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                      Custom Message
                    </label>
                    <TemplateEditor
                      template={template.body2}
                      onChange={(value) => handleInputChange("body2", value)}
                    />
                  </div>

                  <div className="mb-4">
                    <div className="whitespace-pre-line text-gray-700">
                      {template.body3}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handlePreview}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1.5 text-sm"
              >
                Preview Email
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="ml-auto bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded shadow disabled:opacity-50"
              >
                {saving ? "Saving..." : "SAVE TEMPLATE"}
              </button>
            </div>
          </div>
        )}

        {/* Preview Panel */}
        {preview && (
          <div className="bg-white border border-blue-300 rounded-lg p-6 max-h-full overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">Email Preview</h3>
              <button
                className="text-blue-700 hover:text-blue-900"
                onClick={() => setPreview(false)}
              >
                Back to Edit
              </button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-2">
                <h2 className="text-xl font-bold text-center">
                  {template.subject}
                </h2>
              </div>

              <div className="p-6 bg-white border-t border-gray-200 max-h-96 overflow-y-auto">
                <div
                  className="whitespace-pre-line text-gray-700"
                  dangerouslySetInnerHTML={{
                    __html: templatePreview.replace(/\n/g, "<br>"),
                  }}
                />
              </div>

              <div className="bg-gray-100 p-4 text-center text-sm text-gray-500">
                <p>
                  &copy; {new Date().getFullYear()} Your Company. All rights
                  reserved.
                </p>
                <p>This is an automated message. Please do not reply.</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <p>
                Note: This is a simplified preview. The actual email will
                include your full branding and formatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
