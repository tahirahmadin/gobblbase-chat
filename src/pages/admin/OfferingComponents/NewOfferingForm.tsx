import React, { useState } from "react";
import UnifiedProductForm from "./UnifiedProductForm";
import PreviewStep from "./PreviewStep";
import CheckoutStep from "./CheckoutStep";
import { ProductType } from "../../../types";
import { Check, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import styled from "styled-components";
const Icon = styled.button`
  position: relative;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #AEB8FF;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &:hover {
    background: #AEB8FF;
  }

  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -4.5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1; // place it behind the button
    background: #AEB8FF;
  }
`;
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
      // If there are varied quantities, automatically select those sizes
      const variedSizes = editProduct.variedQuantities
        ? Object.keys(editProduct.variedQuantities)
        : [];

      return {
        ...editProduct,
        descriptionEnabled: true,
        images: editProduct.images || [],
        imagesUrl: editProduct.imagesUrl || [],
        variedSizes: variedSizes,
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
      variedSizes: [],
      variedQuantities: {},
      // Service specific
      locationType: "online",
      address: "",
      // Event specific
      eventType: "",
      timeZone: "Asia/Calcutta (GMT +5:30)",
      slots: [
        {
          date: null,
          start: null,
          end: null,
          seatType: "unlimited",
          seats: 0,
        },
      ],
    };
  });

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1); // Move to next step
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    } else {
      onBack();
    }
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
            editMode={editMode}
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
    <div className="flex flex-col w-full">
      <div className="flex items-center gap-2 mb-2 flex-shrink-0 mt-6 ml-4">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-800 text-md lg:text-lg font-medium bg-[#EAEFFF] border border-black rounded-full p-1"
        >
          <ChevronLeft style={{strokeWidth: "2px"}} size={18}/>
        </button>
        <h1 className="text-lg lg:text-xl font-bold text-gray-900">
          <h1 className="text-lg lg:text-xl font-bold text-gray-900">
            {editMode
              ? `Edit ${productTypeMap[type]}`
              : `New ${productTypeMap[type]}`}
          </h1>
        </h1>
      </div>

      {/* Horizontal Stepper for Mobile */}
      {/* <div className="w-full px-4 py-4 md:hidden flex-shrink-0">
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
      </div> */}

      
        {/* Vertical Stepper Sidebar - Hidden on Mobile */}
        <div className="flex w-full flex-shrink-0 flex-col items-start md:pt-8 px-0 md:px-2 overflow-hidden">
          {steps.map((s, i) => {
            // Show only active step and next 2 steps
            if (i > step + 2) return null;

            const isCompleted = i < step;
            const isActive = i === step;

            return (
              <div key={s} className="mb-4 flex flex-col md:flex-row items-start w-full relative">
                <div
                  className={`flex items-center mx-auto h-12 z-30 ${
                    isActive
                      ? "bg-[#4D65FF] border-[#4f46e5] w-[80%] md:w-[fit-content] text-white rounded-full translate-y-8"
                      : isCompleted
                      ? "bg-[#CEFFDC] border-green-400 text-gray-500 w-[80%] md:w-[100%] rounded-full relative"
                      : "bg-[#EAEFFF] border-gray-300 text-gray-500 w-[80%] md:w-[100%] rounded-full z-[0] relative"
                  }`}
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-md font-[600] transition-all duration-200
                    ${
                      isActive
                        ? "bg-[#000] border-[#4f46e5] text-white"
                        : isCompleted
                        ? "bg-white border-4 border-[#6AFF97] text-white"
                        : "bg-[#D4DEFF] border-gray-300 text-gray-500"
                    }`}
                  >   
                  {isCompleted ? (
                    <span className="bg-black rounded-full p-[2px]">
                      <Check size={20} style={{color: "#6AFF97", strokeWidth: "4px"}}></Check>
                    </span>
                  ) : (
                    `${i + 1}`
                  )}
                    
                  </div>
                  <span
                    className={`para-font font-[500] text-[1rem] px-4 whitespace-nowrap ${
                      isActive
                        ? "text-[#fff]"
                        : isCompleted
                        ? "text-grey-600"
                        : "text-gray-500"
                    }`}
                  >
                    {isCompleted ? (
                      <div className="flex justify-between items-center w-full">
                          <span>{s}</span>
                          <span onClick={handleBack} className="absolute right-[3%] z-10">
                            <Icon>
                                <img src="/assets/icons/edit-icon.png" alt="" />
                            </Icon>
                          </span>
                      </div>
                  ) : (
                    
                    `${s}`
                  )}
                   
                  </span>
                </div>

                {/* Only show content for active step */}
                {isActive && (
                  <div className="z-10 bg-[#D4DEFF] md:rounded-xl py-20 px-4 md:py-6 md:px-8 mx-auto w-full md:translate-x-[-20px]">
                    {renderStepContent()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Card-like Step Content */}
        {/* <div className="flex-1 bg-[#e7eafe] rounded-xl p-4 md:p-6 max-w-[1200px] mx-auto w-full h-full overflow-y-auto">
          {renderStepContent()}
        </div> */}
      </div>
  );
};

export default NewOfferingForm;
