import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { useAdminStore } from "../../../store/useAdminStore";

interface EmailTemplate {
  subText: string;
  isActive: boolean;
  subject: string;
  body1: string;
  body2: string;
  body3: string;
}

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

  const customFields: string[] = ensureField("customFields", []);

  // Use checkOutCustomerDetails as the source of checked fields
  const checkOutCustomerDetails: string[] = form.checkOutCustomerDetails || [];

  const toggleCheckOutCustomerDetail = (field: string) => {
    setForm((prev: any) => {
      const exists = (prev.checkOutCustomerDetails || []).includes(field);
      return {
        ...prev,
        checkOutCustomerDetails: exists
          ? prev.checkOutCustomerDetails.filter((f: string) => f !== field)
          : [...(prev.checkOutCustomerDetails || []), field],
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
    physicalProduct: "physicalProduct",
    digitalProduct: "digitalProduct",
    Service: "Service",
    Event: "Event_Booking_Confirmation",
  };
  // Get the product type from the form (default to physical if missing)

  const productType = form.type || "physicalProduct";
  const templateKey =
    templateKeyMap[productType] || templateKeyMap["physicalProduct"];
  const template = emailTemplates?.[templateKey] as EmailTemplate | undefined;
  const [localTemplate, setLocalTemplate] = useState<EmailTemplate | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Merge default fields and custom fields for selection, removing duplicates
  const mergedCustomerFields = Array.from(
    new Set([...defaultCustomerFields, ...(customFields || [])])
  );

  useEffect(() => {
    if (activeBotId && emailTemplates === null) {
      fetchEmailTemplates(activeBotId);
    }
  }, [activeBotId, emailTemplates]);

  useEffect(() => {
    if (template) {
      setLocalTemplate({ ...template });
    } else {
      setLocalTemplate(null);
    }
  }, [template]);

  const handleInputChange = (
    field: "subject" | "body1" | "body2" | "body3",
    value: string
  ) => {
    if (!localTemplate) return;
    setLocalTemplate({ ...localTemplate, [field]: value });
  };

  const handleSave = async () => {
    if (!localTemplate || !activeBotId) return;
    setSaving(true);
    setSuccess(false);
    try {
      await updateEmailTemplate(activeBotId, localTemplate, templateKey);
      setSuccess(true);
    } catch (err) {
      // error handled by store
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl p-2 lg:p-4 mx-auto">
      <div className="flex flex-col justify-start items-start mb-2">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← Back to Form
        </button>
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Checkout
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {/* <div className="flex-1">
          <div className="font-semibold mb-2">Choose Customer Details</div>
          <div className="flex flex-col gap-2">
            {mergedCustomerFields.map((field) => (
              <label key={field} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={checkOutCustomerDetails.includes(field)}
                  onChange={() => toggleCheckOutCustomerDetail(field)}
                  className="accent-green-500 w-5 h-5"
                />
                {field}
              </label>
            ))}
          </div>
        </div> */}
        <div className="flex-1">
          <div className="font-semibold mb-1">Confirmation Email</div>
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
                {localTemplate.subText}
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={localTemplate.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs lg:text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Body</label>

                <div className="border border-blue-300 rounded-md bg-white">
                  <div className="p-3">
                    <div className="mb-4">
                      <div className="whitespace-pre-line text-gray-700 mb-2 text-xs lg:text-sm">
                        {localTemplate.body1}
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-xs lg:text-sm font-medium mb-1">
                        Custom Message
                      </label>
                      <textarea
                        value={localTemplate.body2}
                        onChange={(e) =>
                          handleInputChange("body2", e.target.value)
                        }
                        className="w-full min-h-[80px] border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs lg:text-sm"
                        placeholder="Type your message..."
                      />
                    </div>

                    <div className="mb-4">
                      <div className="whitespace-pre-line text-gray-700 text-xs lg:text-sm">
                        {localTemplate.body3}
                      </div>
                    </div>
                  </div>
                </div>
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
