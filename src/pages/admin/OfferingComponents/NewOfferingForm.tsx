import React, { useState } from "react";
import UnifiedProductForm from "./UnifiedProductForm";
import PreviewStep from "./PreviewStep";
import CheckoutStep from "./CheckoutStep";
import { ProductType } from "../../../types";

type NewOfferingFormProps = {
  type: ProductType;
  onBack: () => void;
  editProduct?: any;
  editMode?: boolean;
};

const steps = ["Product Details", "Checkout", "Preview"];

const NewOfferingForm: React.FC<NewOfferingFormProps> = ({
  type,
  onBack,
  editProduct,
  editMode = false,
}) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(() => {
    if (editProduct) {
      return {
        ...editProduct,
        descriptionEnabled: true,
        images: editProduct.images || [],
        imagesUrl: editProduct.imagesUrl || [],
      };
    }
    return {
      title: "",
      category: "",
      description: "",
      descriptionEnabled: true,
      price: "0",
      priceType: "free",
      cta: "Buy Now",
      thumbnail: null,
      thumbnailUrl: "",
      images: [],
      imagesUrl: [],
      quantityType: "unlimited",
      quantity: 0,
      // Digital Product specific
      fileFormat: "",
      uploadType: "upload",
      file: null,
      fileUrl: "",
      // Physical Product specific
      customQuantity: "",
      variedSizes: [],
      // Service specific
      locationType: "online",
      address: "",
      // Event specific
      eventType: "",
      timeZone: "Asia/Calcutta (GMT +5:30)",
      slots: [
        {
          date: "",
          start: "",
          end: "",
          seatType: "unlimited",
          seats: 0,
        },
      ],
    };
  });

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleApprove = () => {
    // Handle form submission
    console.log("Form submitted:", form);
  };

  const renderStepContent = () => {
    switch (step) {
      case 0:
        return (
          <UnifiedProductForm
            type={type}
            form={form}
            setForm={setForm}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <CheckoutStep
            form={form}
            setForm={setForm}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <PreviewStep
            form={form}
            type={type}
            onApprove={handleApprove}
            onBack={handleBack}
            editMode={editMode}
            editProduct={editProduct}
          />
        );
      default:
        return null;
    }
  };

  const productTypeMap = {
    physicalProduct: "Physical Product",
    digitalProduct: "Digital Product",
    Service: "Service",
    Event: "Event",
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 text-md lg:text-lg font-medium"
        >
          ← Back
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-gray-900">
          {editMode
            ? `Edit ${productTypeMap[type]}`
            : `Add New ${productTypeMap[type]}`}
        </h1>
      </div>

      {/* Horizontal Stepper for Mobile */}
      <div className="w-full px-4 py-4 md:hidden flex-shrink-0">
        <div className="flex justify-between items-center">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-md font-bold transition-all duration-200
                ${
                  i === step
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : i < step
                    ? "bg-green-400 border-green-400 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }
              `}
              >
                {i + 1}
              </div>
              <span
                className={`mt-1 text-xs font-semibold text-center ${
                  i === step
                    ? "text-[#4f46e5]"
                    : i < step
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-1 h-full">
        {/* Vertical Stepper Sidebar - Hidden on Mobile */}
        <div className="hidden md:flex w-42 flex-shrink-0 flex-col items-start pt-8 px-2">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center mb-8">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 text-md font-bold transition-all duration-200
                ${
                  i === step
                    ? "bg-[#4f46e5] border-[#4f46e5] text-white"
                    : i < step
                    ? "bg-green-400 border-green-400 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }
              `}
              >
                {i + 1}
              </div>
              <span
                className={`ml-2 text-base font-semibold ${
                  i === step
                    ? "text-[#4f46e5]"
                    : i < step
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {s}
              </span>
            </div>
          ))}
        </div>

        {/* Card-like Step Content */}
        <div
          className="flex-1 bg-[#e7eafe] rounded-xl p-4 md:p-6 max-w-[1200px] mx-auto w-full "
          style={{ height: "100%" }}
        >
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default NewOfferingForm;
