import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { useAdminStore } from "../../../store/useAdminStore";

type CheckoutStepProps = {
  form: any;
  setForm: React.Dispatch<any>;
  onNext: () => void;
  onBack: () => void;
};

const defaultCustomerFields = [
  "Customer Name",
  "Email",
  "Contact Number",
  "Shipping Address",
  "Billing Address",
];

const CheckoutStep: React.FC<CheckoutStepProps> = ({
  form,
  setForm,
  onNext,
  onBack,
}) => {
  // For all types, use customerDetails, customFields, customFieldInput, emailSubject, emailBody
  // If not present, initialize as needed
  const ensureField = (field: string, fallback: any) =>
    form[field] !== undefined ? form[field] : fallback;

  const customerDetails: string[] = ensureField("customerDetails", []);
  const customFields: string[] = ensureField("customFields", []);

  const toggleCustomerDetail = (field: string) => {
    setForm((prev: any) => {
      const exists = (prev.customerDetails || []).includes(field);
      return {
        ...prev,
        customerDetails: exists
          ? prev.customerDetails.filter((f: string) => f !== field)
          : [...(prev.customerDetails || []), field],
      };
    });
  };

  // Email template logic
  const { activeBotId } = useBotConfig();
  const {
    emailTemplates,
    emailTemplatesLoading,
    emailTemplatesError,
    fetchEmailTemplates,
    updateEmailTemplate,
  } = useAdminStore();

  // Map product types to template keys
  const templateKeyMap: Record<string, string> = {
    physical: "physicalProduct",
    digital: "digitalProduct",
    service: "serviceProduct",
    event: "eventProduct",
  };
  // Get the product type from the form (default to physical if missing)
  const productType = form.type || "physical";
  const templateKey = templateKeyMap[productType] || templateKeyMap["physical"];
  const template = emailTemplates.find((t) => t.rawKey === templateKey);
  const [localTemplate, setLocalTemplate] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activeBotId && emailTemplates.length === 0) {
      fetchEmailTemplates(activeBotId);
    }
  }, [activeBotId, fetchEmailTemplates]);

  useEffect(() => {
    if (template) {
      setLocalTemplate({ ...template });
    } else {
      setLocalTemplate(null);
    }
  }, [template]);

  const handleInputChange = (field: "subject" | "body", value: string) => {
    if (!localTemplate) return;
    setLocalTemplate({ ...localTemplate, [field]: value });
  };

  const handleSave = async () => {
    if (!localTemplate || !activeBotId) return;
    setSaving(true);
    setSuccess(false);
    try {
      const updatedData = {
        subText: localTemplate.name,
        isActive: localTemplate.enabled,
        subject: localTemplate.subject,
        body: localTemplate.body,
      };
      await updateEmailTemplate(activeBotId, updatedData, localTemplate.rawKey);
      setSuccess(true);
    } catch (err) {
      // error handled by store
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 mt-2 mx-auto">
      <div className="flex flex-col justify-start items-start mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← Back to Form
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="font-semibold mb-2">Choose Customer Details</div>
          <div className="flex flex-col gap-2">
            {defaultCustomerFields.map((field) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={customerDetails.includes(field)}
                  onChange={() => toggleCustomerDetail(field)}
                  className="accent-green-500 w-5 h-5"
                />
                {field}
              </label>
            ))}
          </div>

          <div className="mt-2 text-xs text-gray-600">
            {(customFields || []).map((f: string, i: number) => (
              <span
                key={i}
                className="inline-block bg-gray-100 px-2 py-1 rounded mr-1"
              >
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <div className="font-semibold mb-2">Confirmation Email</div>
          {emailTemplatesLoading && (
            <div className="p-2">Loading template...</div>
          )}
          {emailTemplatesError && (
            <div className="p-2 text-red-500">{emailTemplatesError}</div>
          )}
          {!emailTemplatesLoading && !emailTemplatesError && !localTemplate && (
            <div className="p-2 text-gray-500">
              No email template found for this product type.
            </div>
          )}
          {!emailTemplatesLoading && !emailTemplatesError && localTemplate && (
            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
              <div className="mb-2 text-gray-700 font-semibold">
                {localTemplate.category} &gt; {localTemplate.name}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={localTemplate.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                />
              </div>
              <div className="mb-2">
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
                  value={localTemplate.body}
                  onChange={(e) => handleInputChange("body", e.target.value)}
                  className="w-full min-h-[120px] border-t-0 border border-blue-300 rounded-b-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  placeholder="Type your message..."
                />
              </div>
              <div className="flex items-center gap-4 mt-2">
                <button
                  className="mx-auto bg-green-300 hover:bg-green-400 text-green-900 font-semibold px-6 py-1 rounded shadow"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Email"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
          onClick={onNext}
        >
          NEXT
        </button>
      </div>
    </div>
  );
};

export default CheckoutStep;
