import React, { useState, useEffect } from "react";
import { useBotConfig } from "../../store/useBotConfig";
import { toast } from "react-hot-toast";
import { Plus, Trash2, User, Mail, Phone, MessageSquare } from "lucide-react";
import LeadsList from "./LeadsList";
import { backendApiUrl } from "../../utils/constants";

interface FormField {
  id: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio";
  label: string;
  required: boolean;
  options?: string[];
  isPrebuilt?: boolean;
  icon?: React.ReactNode;
}

interface FormData {
  id: string;
  name: string;
  fields: FormField[];
}

const prebuiltFields: FormField[] = [
  {
    id: "customer_name",
    type: "text",
    label: "Customer Name",
    required: true,
    isPrebuilt: true,
    icon: <User className="h-4 w-4 text-blue-500 mr-2" />,
  },
  {
    id: "email",
    type: "email",
    label: "Email",
    required: true,
    isPrebuilt: true,
    icon: <Mail className="h-4 w-4 text-blue-500 mr-2" />,
  },
  {
    id: "phone",
    type: "phone",
    label: "Phone Number",
    required: true,
    isPrebuilt: true,
    icon: <Phone className="h-4 w-4 text-blue-500 mr-2" />,
  },
  {
    id: "query",
    type: "textarea",
    label: "Query Message",
    required: true,
    isPrebuilt: true,
    icon: <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />,
  },
];

const Leads: React.FC = () => {
  const { activeBotId } = useBotConfig();
  const [forms, setForms] = useState<FormData[]>([]);
  const [activeTab, setActiveTab] = useState<"forms" | "leads">("forms");
  const [currentForm, setCurrentForm] = useState<FormData | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  useEffect(() => {
    // Always start with prebuilt fields
    setFormFields(prebuiltFields);
  }, []);

  const handleAddField = () => {
    setFormFields([
      ...formFields,
      {
        id: Date.now().toString(),
        type: "text",
        label: "",
        required: false,
      },
    ]);
  };

  const handleUpdateField = (id: string, updates: Partial<FormField>) => {
    setFormFields(
      formFields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleRemoveField = (id: string) => {
    // Prevent removing prebuilt fields
    if (prebuiltFields.some((f) => f.id === id)) return;
    setFormFields(formFields.filter((field) => field.id !== id));
  };

  const handleCreateForm = async () => {
    if (!activeBotId) {
      toast.error("Please select a bot first");
      return;
    }
    // Only custom fields are allowed to be empty label
    if (formFields.filter((f) => !f.isPrebuilt).some((f) => !f.label.trim())) {
      toast.error("Please enter a label for all custom fields");
      return;
    }
    try {
      const response = await fetch(`${backendApiUrl}/form/create-form`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agentId: activeBotId,
          formName: "Lead Form", // static name
          enabled: isEnabled,
          inputs: formFields.map((field) => ({
            name: field.label.toLowerCase().replace(/\s+/g, "_"),
            type: field.type,
            label: field.label,
            required: field.required,
            options: field.options,
          })),
          createdBy: "user",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create form: ${errorData.result || "Unknown error"}`
        );
      }
      const data = await response.json();
      setForms([data]);
      setCurrentForm(data);
      toast.success("Form saved successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save form"
      );
    }
  };

  if (!activeBotId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">
            No Bot Selected
          </h2>
          <p className="text-gray-500">
            Please select a bot to manage leads and forms
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lead Forms</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("forms")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "forms"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Forms
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-3 py-2 rounded-md ${
              activeTab === "leads"
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Leads
          </button>
        </div>
      </div>

      {activeTab === "forms" ? (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="font-medium text-gray-900">Form Status</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            {!isEnabled ? (
              <div className="text-center py-8 text-gray-500">
                Enable the form using the toggle above to start building your
                lead form
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {formFields.map((field, idx) => (
                    <div
                      key={field.id}
                      className="flex space-x-4 items-end bg-gray-50 border border-gray-200 rounded-lg shadow-sm p-4 mb-2 hover:border-blue-400 transition-all"
                    >
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          {field.isPrebuilt && field.icon}
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              label: e.target.value,
                            })
                          }
                          className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm px-3 py-2 bg-white ${
                            field.isPrebuilt
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }`}
                          placeholder="Enter field label"
                          disabled={field.isPrebuilt}
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              type: e.target.value as FormField["type"],
                            })
                          }
                          className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:text-sm px-2 py-2 bg-white ${
                            field.isPrebuilt
                              ? "bg-gray-100 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={field.isPrebuilt}
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="phone">Phone</option>
                          <option value="textarea">Textarea</option>
                          <option value="select">Select</option>
                          <option value="checkbox">Checkbox</option>
                          <option value="radio">Radio</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            handleUpdateField(field.id, {
                              required: e.target.checked,
                            })
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={field.isPrebuilt}
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Required
                        </label>
                      </div>
                      {!field.isPrebuilt && (
                        <button
                          onClick={() => handleRemoveField(field.id)}
                          className="text-red-500 hover:text-red-700 bg-white rounded-full p-2 border border-transparent hover:border-red-200 transition"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={handleAddField}
                    className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200 shadow-sm font-medium transition"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Field
                  </button>
                  <button
                    onClick={handleCreateForm}
                    className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md hover:from-blue-600 hover:to-blue-800 shadow-lg font-semibold transition"
                  >
                    Save Form
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <LeadsList />
      )}
    </div>
  );
};

export default Leads;
