import React, { useState } from "react";
import PhysicalProductForm from "./PhysicalProductForm";
import DigitalProductForm from "./DigitalProductForm";
import ServiceForm from "./ServiceForm";
import EventForm from "./EventForm";
import CheckoutStep from "./CheckoutStep";
import PreviewStep from "./PreviewStep";

export type ProductType =
  | "Physical Product"
  | "Digital Product"
  | "Service"
  | "Event";

interface NewOfferingFormProps {
  type: ProductType;
  onBack: () => void;
}

const steps = ["Product Details", "Checkout", "Preview"];

const NewOfferingForm: React.FC<NewOfferingFormProps> = ({ type, onBack }) => {
  const [step, setStep] = useState(0);

  const [physicalForm, setPhysicalForm] = useState({
    productName: "",
    category: "",
    description: "",
    descriptionEnabled: true,
    quantityType: "unlimited",
    quantity: "",
    customQuantity: "",
    priceType: "free",
    price: "",
    cta: "Buy Now",
    thumbnail: null as File | null,
    thumbnailUrl: "",
    images: [null, null, null] as (File | null)[],
    imagesUrl: ["", "", ""] as string[],
    customerDetails: ["Customer Name", "Email"],
    customFields: [] as string[],
    customFieldInput: "",
    emailSubject: "",
    emailBody: "",
  });

  const [digitalForm, setDigitalForm] = useState({
    productName: "",
    category: "",
    description: "",
    descriptionEnabled: true,
    fileFormat: [] as string[],
    uploadType: "file",
    file: null as File | null,
    fileUrl: "",
    quantityType: "unlimited",
    quantity: "",
    priceType: "free",
    price: "",
    cta: "Buy Now",
    thumbnail: null as File | null,
    thumbnailUrl: "",
    images: [null, null, null] as (File | null)[],
    imagesUrl: ["", "", ""] as string[],
    customerDetails: ["Customer Name", "Email"],
    customFields: [] as string[],
    customFieldInput: "",
    emailSubject: "",
    emailBody: "",
  });

  const [serviceForm, setServiceForm] = useState({
    serviceName: "",
    category: "",
    description: "",
    descriptionEnabled: true,
    quantityType: "unlimited",
    quantity: "",
    locationType: "online",
    address: "",
    priceType: "free",
    price: "",
    cta: "Buy Now",
    thumbnail: null as File | null,
    thumbnailUrl: "",
    images: [null, null, null] as (File | null)[],
    imagesUrl: ["", "", ""] as string[],
  });

  const [eventForm, setEventForm] = useState({
    eventName: "",
    eventType: "",
    eventTypeOther: "",
    description: "",
    descriptionEnabled: true,
    timeZone: "Asia/Calcutta (GMT +5:30)",
    slots: [
      {
        date: "",
        start: "",
        end: "",
        seatType: "unlimited",
        seats: "",
      },
    ],
    thumbnail: null,
    thumbnailUrl: "",
    images: [null, null, null],
    imagesUrl: ["", "", ""],
    priceType: "free",
    price: "",
    cta: "Reserve your Spot",
  });

  const getCurrentForm = () => {
    switch (type) {
      case "Physical Product":
        return physicalForm;
      case "Digital Product":
        return digitalForm;
      case "Service":
        return serviceForm;
      case "Event":
        return eventForm;
    }
  };
  const getCurrentSetForm = () => {
    switch (type) {
      case "Physical Product":
        return setPhysicalForm;
      case "Digital Product":
        return setDigitalForm;
      case "Service":
        return setServiceForm;
      case "Event":
        return setEventForm;
    }
  };

  const renderStepContent = () => {
    if (step === 0) {
      switch (type) {
        case "Physical Product":
          return (
            <PhysicalProductForm
              form={physicalForm}
              setForm={setPhysicalForm}
              onNext={() => setStep(1)}
            />
          );
        case "Digital Product":
          return (
            <DigitalProductForm
              form={digitalForm}
              setForm={setDigitalForm}
              onNext={() => setStep(1)}
            />
          );
        case "Service":
          return (
            <ServiceForm
              form={serviceForm}
              setForm={setServiceForm}
              onNext={() => setStep(1)}
            />
          );
        case "Event":
          return (
            <EventForm
              form={eventForm}
              setForm={setEventForm}
              onNext={() => setStep(1)}
            />
          );
        default:
          return null;
      }
    }
    if (step === 1) {
      return (
        <CheckoutStep
          type={type}
          form={getCurrentForm()}
          setForm={getCurrentSetForm()}
          onNext={() => setStep(2)}
        />
      );
    }
    if (step === 2) {
      return <PreviewStep type={type} form={getCurrentForm()} />;
    }
    return null;
  };

  return (
    <div className="p-6 overflow-y-auto max-h-screen">
      <h2 className="text-2xl font-bold text-black mb-4">New {type}</h2>
      {/* Stepper */}
      <div className="flex gap-4 mt-6 mb-8">
        {steps.map((s, i) => (
          <div
            key={s}
            className={`flex items-center gap-2 ${
              i === step ? "text-green-700 font-bold" : "text-gray-500"
            }`}
          >
            <div
              className={`rounded-full w-7 h-7 flex items-center justify-center border-2 ${
                i <= step
                  ? "bg-green-200 border-green-500"
                  : "bg-white border-gray-300"
              }`}
            >
              {i + 1}
            </div>
            <span>{s}</span>
            {i < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-300 mx-2" />
            )}
          </div>
        ))}
      </div>
      {/* Step Content */}
      {renderStepContent()}
      {/* Navigation */}
      <div className="flex justify-between mt-8 max-w-4xl mx-auto">
        <button
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          onClick={step === 0 ? onBack : () => setStep(step - 1)}
        >
          {step === 0 ? "Back" : "Previous"}
        </button>
        {step < steps.length - 1 ? (
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            onClick={() => setStep(step + 1)}
          >
            Next
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            // onClick={handleSubmit}
          >
            Approve
          </button>
        )}
      </div>
    </div>
  );
};

export default NewOfferingForm;
