import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { ArrowLeft, Plus } from "lucide-react";
import { backendApiUrl } from "../../utils/constants";

interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

interface QueryCollectionProps {
  agentId: string;
  onClose?: () => void;
}

const defaultFields: FormField[] = [
  {
    id: "customerName",
    name: "customerName",
    type: "text",
    label: "Customer Name",
    required: true,
    placeholder: "Enter your name",
  },
  {
    id: "email",
    name: "email",
    type: "email",
    label: "Email",
    required: true,
    placeholder: "Enter your email",
  },
  {
    id: "phone",
    name: "phone",
    type: "tel",
    label: "Phone Number",
    required: true,
    placeholder: "Enter your phone number",
  },
  {
    id: "query",
    name: "query",
    type: "textarea",
    label: "Query Message",
    required: true,
    placeholder: "Enter your query",
  },
];

const QueryCollection: React.FC<QueryCollectionProps> = ({
  agentId,
  onClose,
}) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [fields, setFields] = useState<FormField[]>(defaultFields);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [newField, setNewField] = useState<Partial<FormField>>({
    type: "text",
    required: false,
  });

  // Initialize form data with empty values for all fields
  React.useEffect(() => {
    const initialData: Record<string, string> = {};
    fields.forEach((field) => {
      initialData[field.name] = "";
    });
    setFormData(initialData);
  }, [fields]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddField = () => {
    if (!newField.name || !newField.label) {
      toast.error("Field name and label are required");
      return;
    }

    const id = `custom_${Date.now()}`;
    setFields((prev) => [
      ...prev,
      { ...newField, id, name: newField.name || "" } as FormField,
    ]);
    setNewField({ type: "text", required: false });
    setShowAddField(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = fields
      .filter((field) => field.required && !formData[field.name])
      .map((field) => field.label);

    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.join(", ")}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${backendApiUrl}/form/submit-lead/${agentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            isEnabled,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      toast.success("Form submitted successfully");

      // Reset form
      const resetData: Record<string, string> = {};
      fields.forEach((field) => {
        resetData[field.name] = "";
      });
      setFormData(resetData);

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Failed to submit form. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Lead Form Builder</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
        )}
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
        <div>
          <h3 className="font-medium text-gray-900">Form Status</h3>
          <p className="text-sm text-gray-500">
            {isEnabled
              ? "Form is currently enabled and visible to users"
              : "Form is currently disabled"}
          </p>
        </div>
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
          Enable the form using the toggle above to start building your lead
          form
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  rows={4}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required={field.required}
                />
              )}
            </div>
          ))}

          {!showAddField && (
            <button
              type="button"
              onClick={() => setShowAddField(true)}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </button>
          )}

          {showAddField && (
            <div className="space-y-4 p-4 border border-gray-200 rounded-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Label
                </label>
                <input
                  type="text"
                  value={newField.label || ""}
                  onChange={(e) =>
                    setNewField((prev) => ({
                      ...prev,
                      label: e.target.value,
                      name: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    }))
                  }
                  placeholder="Enter field label"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Field Type
                </label>
                <select
                  value={newField.type}
                  onChange={(e) =>
                    setNewField((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Text Area</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={newField.required}
                  onChange={(e) =>
                    setNewField((prev) => ({
                      ...prev,
                      required: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Required field
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleAddField}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Add Field
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddField(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Save Form"}
          </button>
        </form>
      )}
    </div>
  );
};

export default QueryCollection;
