import React, { useState } from "react";
import PhysicalProductForm from "./PhysicalProductForm";
import DigitalProductForm from "./DigitalProductForm";
import ServiceForm from "./ServiceForm";
import EventForm from "./EventForm";
import CheckoutStep from "./CheckoutStep";
import PreviewStep from "./PreviewStep";
import { addMainProduct } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import { ArrowLeftCircle, ArrowLeftIcon } from "lucide-react";

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
  const { activeBotId } = useBotConfig();

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

  const handleSubmit = async () => {
    let typeKey = "";
    let form: any = null;
    if (type === "Physical Product") {
      typeKey = "physical";
      form = physicalForm;
    } else if (type === "Digital Product") {
      typeKey = "digital";
      form = digitalForm;
    } else if (type === "Service") {
      typeKey = "service";
      form = serviceForm;
    } else if (type === "Event") {
      typeKey = "event";
      form = eventForm;
    }
    try {
      const data = await addMainProduct(type, form, activeBotId);
      if (data.error === false) {
        alert("Product added successfully!");
      } else {
        alert("Error: " + (data.result?.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
  };

  return (
    <div className="p-6 overflow-y-auto max-h-screen">
      <div className="flex justify-start items-center">
        <div
          className="relative w-6 h-6 flex items-center justify-center"
          onClick={onBack}
          style={{ cursor: "pointer" }}
        >
          {/* Outer Circle */}
          <div className="absolute inset-0 rounded-full border-2 border-black bg-[#f5f7ff]" />
          {/* Arrow (SVG) */}
          <svg
            className="relative z-10"
            width="18"
            height="18"
            viewBox="0 0 48 48"
            fill="none"
            stroke="black"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="30,12 18,24 30,36" />
          </svg>

          {/* Clickable area */}
          <button
            className="absolute inset-0 w-full h-full rounded-full focus:outline-none"
            aria-label="Back"
            style={{ background: "transparent" }}
          />
        </div>
        <h2 className="text-2xl font-bold text-black pl-2">New {type}</h2>
      </div>
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
    </div>
  );
};

export default NewOfferingForm;
