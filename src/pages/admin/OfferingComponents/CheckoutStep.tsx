import React from "react";

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

  const customerDetails: string[] = ensureField("customerDetails", [
    "Customer Name",
    "Email",
  ]);
  const customFields: string[] = ensureField("customFields", []);
  const customFieldInput: string = ensureField("customFieldInput", "");
  const emailSubject: string = ensureField("emailSubject", "");
  const emailBody: string = ensureField("emailBody", "");

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
      <div className="flex flex-col md:flex-row gap-8">
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
          <input
            className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Subject"
            value={emailSubject}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, emailSubject: e.target.value }))
            }
          />
          <textarea
            className="w-full border border-gray-300 rounded p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Email Body"
            value={emailBody}
            onChange={(e) =>
              setForm((f: any) => ({ ...f, emailBody: e.target.value }))
            }
          />
          <div className="text-xs text-blue-700 cursor-pointer hover:underline">
            Edit text from main database
          </div>
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
