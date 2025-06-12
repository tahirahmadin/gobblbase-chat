import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { useAdminStore } from "../../../store/useAdminStore";
import styled from "styled-components";
const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  font-weight: 400;
  font-family: "DM Sans", sans-serif;

  min-width: 120px;

  &::before {
    content: "";
    position: absolute;
    top: 4px;
    left: 4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1;
    background: #6aff97;
  }

  &:disabled {
    background: #6aff97;
    cursor: not-allowed;
    color: black;
  }
  &:disabled::before {
    background: #6aff97;
  }
`;
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

  // Email template logic
  const { activeBotId } = useBotConfig();
  const { emailTemplates, fetchEmailTemplates, updateEmailTemplate } =
    useAdminStore();

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
    <div className="rounded-2xl mx-auto">
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

          {!localTemplate && (
            <div className="p-2 text-gray-500">
              No email template found for this product type.
            </div>
          )}
          {localTemplate && (
            <div className="bg-[#FFFFFF] border border-black rounded-lg p-4">
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
                  className="w-full bg-[#DFDFDF] px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-xs lg:text-sm"
                />
              </div>
              <div className="mb-2">
                <label className="block text-sm font-medium mb-1">Body</label>

                <div className="bg-[#DFDFDF]">
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
              <div className="flex items-center justify-center gap-4 mt-2 z-10 relative">
                <Button
                  className=""
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Email"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end mt-8 relative z-10">
        <Button
          className=""
          onClick={onNext}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
};

export default CheckoutStep;
