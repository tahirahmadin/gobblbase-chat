import { useEffect, useState } from "react";
import { useBotConfig } from "../../../../store/useBotConfig";
import { useAdminStore } from "../../../../store/useAdminStore";
import TemplateEditor from "../Emails/TemplateEditor";
import { toast } from "react-hot-toast";
import { Eye } from "lucide-react";

interface EmailTemplate {
  subText: string;
  isActive: boolean;
  subject: string;
  body1: string;
  body2: string;
  body3: string;
}

interface EmailTemplatesResponse {
  [key: string]: EmailTemplate | string;
}

const EmailTemplates = () => {
  const [selectedId, setSelectedId] = useState<string>("physicalProduct");
  const { activeBotId } = useBotConfig();
  const [preview, setPreview] = useState(false);
  const [templatePreview, setTemplatePreview] = useState("");

  const {
    emailTemplates,
    fetchEmailTemplates,
    updateEmailTemplate,
    setEmailTemplates,
  } = useAdminStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (activeBotId && emailTemplates === null) {
      fetchEmailTemplates(activeBotId);
    }
  }, [activeBotId, fetchEmailTemplates]);

  const handleInputChange = (
    field: "subject" | "body1" | "body2" | "body3",
    value: string
  ) => {
    if (!emailTemplates) return;

    const template = emailTemplates[selectedId];
    if (!template || typeof template === "string") return;

    const updatedTemplate = {
      ...template,
      [field]: value,
    };

    const updatedTemplates: EmailTemplatesResponse = {
      ...emailTemplates,
      [selectedId]: updatedTemplate,
    };

    setEmailTemplates(updatedTemplates);
  };

  const handlePreview = () => {
    if (!emailTemplates) return;

    const template = emailTemplates[selectedId];
    if (!template || typeof template === "string") return;

    const previewText = `${template.body1}\n\n${template.body2}\n\n${template.body3}`;
    setTemplatePreview(previewText);
    setPreview(true);
  };

  const handleSave = async () => {
    if (!activeBotId || !emailTemplates) return;

    const template = emailTemplates[selectedId];
    if (!template || typeof template === "string") return;

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
    if (!emailTemplates || !activeBotId) return;

    const template = emailTemplates[templateKey];
    if (!template || typeof template === "string") return;

    const updatedTemplate = {
      ...template,
      isActive: !template.isActive,
    };

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

  if (!emailTemplates) {
    return <div>No templates found</div>;
  }

  const template = emailTemplates[selectedId];
  if (!template || typeof template === "string") {
    return <div>Template not found</div>;
  }

  return (
    <div className="max-full mx-auto h-full">
      <div className="mt-4 p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          Email Templates
        </h2>
        <p className="text-gray-600 mt-1">
          Tailor messages to match every customer action
        </p>
      </div>

      <div className="mb-4 flex flex-col md:flex-row gap-4 items-start justify-start w-full relative pb-20">
        {/* Sidebar with scrolling */}
        <div className="w-full md:w-1/3 p-6">
          <div className="space-y-2">
            {Object.entries(emailTemplates)
              .filter(([_, value]) => typeof value !== "string")
              .map(([key, value]) => {
                const template = value as EmailTemplate;
                console.log(template, "template");
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition border ${
                      selectedId === key && template.isActive
                        ? "bg-[#EAEFFF] border-[none] text-white rounded-[12px]"
                        : template.isActive
                        ? "bg-[#EAEFFF] border-[none] text-white rounded-[12px]"
                        : selectedId === key
                        ? "bg-[#CEFFDC] border-[#6AFF97] text-white rounded-[12px]"
                        : "bg-[transparent] border-[#000000] text-white rounded-[12px]"
                    }`}
                    onClick={() => handleSelect(key)}
                  >
                    <div>
                      <span
                        className={`para-font text-[1rem] text-black font-[500]`}
                      >
                        {template.subText}
                      </span>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={template.isActive}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggle(key);
                        }}
                        className="sr-only peer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div
                        className={`w-11 h-6 bg-[#CDCDCD] border border-black rounded-full relative transition-colors duration-200 peer-checked:bg-green-400`}
                      >
                        <div
                          className={`absolute border border-black -top-[1.2px] -left-[2px] w-[24px] h-[24px] bg-white rounded-full shadow transition-transform duration-200 ${
                            template.isActive ? "translate-x-[24px]" : ""
                          }`}
                        ></div>
                      </div>
                    </label>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Editor area with scrolling */}
        <div className="flex-1 md:py-6 md:pr-6">
          {!preview && (
            <div className="bg-[#EAEFFF] border-y md:border border-black md:rounded-[15px] p-6">
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
                <div className=" border border-[#7D7D7D] rounded-md bg-white max-h-96 overflow-y-auto">
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

              <div className="flex items-center justify-end gap-4 relative">
                <div className="relative z-10">
                  <div className="absolute left-[4px] top-[4px] -z-10 w-full h-full bg-[#AEB8FF] border border-black"></div>

                  <button
                    onClick={handlePreview}
                    className="para-font bg-[#AEB8FF] border border-black z-10 text-black px-2 py-1.5 text-[1rem]"
                  >
                    <Eye/>
                  </button>
                </div>
                <div className="relative z-10">
                  <div className="absolute left-[3.5px] top-[3.5px] -z-10 w-full h-full bg-[#6AFF97] border border-black"></div>

                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="ml-auto para-font bg-[#6AFF97] border border-black z-10 text-black px-4 py-1.5 text-[1rem] min-w-[120px]"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preview Panel */}
          {preview && (
            <div className="bg-[#EAEFFF] border border-[#7d7d7d] rounded-lg p-6">
              <div className="flex justify-between mb-4">
                <h3 className="font-semibold text-lg">Email Preview</h3>
                <button
                  className="text-blue-700 hover:text-blue-900"
                  onClick={() => setPreview(false)}
                >
                  Back to Edit
                </button>
              </div>

              <div className="border border-[#7d7d7d] rounded-lg overflow-hidden">
                <div className="bg-[#AEB8FF] text-black p-2">
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
    </div>
  );
};

export default EmailTemplates;
