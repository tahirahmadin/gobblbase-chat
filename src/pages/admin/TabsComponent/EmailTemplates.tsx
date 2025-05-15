import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { useAdminStore } from "../../../store/useAdminStore";

const EmailTemplates = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const { activeBotId } = useBotConfig();

  const {
    emailTemplates,
    emailTemplatesLoading,
    emailTemplatesError,
    fetchEmailTemplates,
    updateEmailTemplate,
    setEmailTemplates,
  } = useAdminStore();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activeBotId && emailTemplates.length === 0) {
      fetchEmailTemplates(activeBotId);
    }
  }, [activeBotId, fetchEmailTemplates]);

  const selectedTemplate = emailTemplates.find((t) => t.id === selectedId);

  const handleToggle = (id: number) => {
    setEmailTemplates(
      emailTemplates.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handleInputChange = (field: "subject" | "body", value: string) => {
    setEmailTemplates(
      emailTemplates.map((t) =>
        t.id === selectedId ? { ...t, [field]: value } : t
      )
    );
  };

  const handleRestore = () => {
    if (activeBotId) {
      fetchEmailTemplates(activeBotId);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      if (!selectedTemplate || !activeBotId)
        throw new Error("No template selected");
      const updatedData = {
        subText: selectedTemplate.name,
        isActive: selectedTemplate.enabled,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
      };
      await updateEmailTemplate(
        activeBotId,
        updatedData,
        selectedTemplate.rawKey
      );
      setSuccess(true);
    } catch (err: any) {
      // error handled by store
    } finally {
      setSaving(false);
    }
  };

  if (emailTemplatesLoading)
    return <div className="p-6">Loading templates...</div>;
  if (emailTemplatesError)
    return <div className="p-6 text-red-500">{emailTemplatesError}</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-6">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 max-w-xs">
        <h2 className="text-xl font-bold text-black">Email Templates</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Tailor messages to match every customer action
        </p>
        <div className="space-y-2">
          {emailTemplates.map((template) => (
            <div
              key={template.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition border ${
                selectedId === template.id
                  ? "bg-green-50 border-green-400"
                  : "bg-white border-gray-200"
              }`}
              onClick={() => handleSelect(template.id)}
            >
              <div>
                <div
                  className={`text-sm font-semibold ${
                    selectedId === template.id
                      ? "text-green-700"
                      : "text-gray-800"
                  }`}
                >
                  {template.category}
                </div>
                <div
                  className={`text-xs ${
                    selectedId === template.id
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {template.name}
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggle(template.id);
                  }}
                  className="sr-only peer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className={`w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200 peer-focus:outline-none peer-checked:bg-green-400`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      template.enabled ? "translate-x-5" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
      {/* Editor */}
      <div className="flex-1">
        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
            <div className="mb-4 text-gray-700 font-semibold">
              {selectedTemplate.category} &gt; {selectedTemplate.name}
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Body</label>
              <div className="bg-blue-100 rounded-t-md px-2 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <button className="hover:text-blue-700">
                    <b>B</b>
                  </button>
                  <button className="hover:text-blue-700">
                    <i>I</i>
                  </button>
                  <button className="hover:text-blue-700">U</button>
                  <button className="hover:text-blue-700">S</button>
                  <button className="hover:text-blue-700">&#128279;</button>
                </div>
                <select className="bg-blue-100 text-gray-700 text-sm rounded px-2 py-1">
                  <option>Personalize</option>
                  <option>&lt;My Username&gt;</option>
                  <option>&lt;order number&gt;</option>
                </select>
              </div>
              <textarea
                value={selectedTemplate.body}
                onChange={(e) => handleInputChange("body", e.target.value)}
                className="w-full min-h-[160px] border-t-0 border border-blue-300 rounded-b-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="Type your message..."
              />
            </div>
            <div className="flex items-center gap-4">
              {/* <button
                className="border border-gray-400 rounded px-4 py-1 text-sm hover:bg-gray-100"
                onClick={handleRestore}
              >
                Restore Template
              </button> */}
              {emailTemplatesError && (
                <div className="mt-2 text-red-500">{emailTemplatesError}</div>
              )}
              {success && (
                <div className="mt-2 text-green-600">Saved successfully!</div>
              )}
              <button
                className="ml-auto bg-green-300 hover:bg-green-400 text-green-900 font-semibold px-8 py-2 rounded shadow"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "SAVE"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
