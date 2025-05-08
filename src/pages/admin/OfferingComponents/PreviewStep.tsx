import React from "react";
import { ProductType } from "./CheckoutStep";

type PreviewStepProps = {
  type: ProductType;
  form: any;
};

const PreviewStep: React.FC<PreviewStepProps> = ({ type, form }) => {
  // Use form fields for each type
  let name = "";
  let price = 0;
  let priceType = "free";
  let cta = "";
  let description = "";
  let descriptionEnabled = true;
  let thumbnailUrl = "";
  let fileFormat: string[] = [];

  if (type === "Physical Product") {
    name = form.productName || "Product Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl;
  } else if (type === "Digital Product") {
    name = form.productName || "Product Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl;
    fileFormat = form.fileFormat || [];
  } else if (type === "Service") {
    name = form.serviceName || "Service Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl;
  } else if (type === "Event") {
    name = "Event Name";
    price = 0;
    priceType = "free";
    cta = "Register";
    description = "Event description.";
    descriptionEnabled = true;
    thumbnailUrl = "";
  }

  return (
    <div className="bg-indigo-100 rounded-2xl p-8 mt-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Card View */}
        <div>
          <div className="font-semibold mb-2">Card View</div>
          <div className="border rounded w-32 h-40 flex flex-col items-center justify-center bg-white shadow p-2">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="thumb"
                className="w-20 h-20 object-cover rounded mb-2"
              />
            ) : (
              <div className="w-20 h-20 bg-gray-200 rounded mb-2" />
            )}
            <div className="font-semibold text-xs text-center">{name}</div>
            <div className="text-xs">
              {priceType === "paid" && price ? `$${price}` : "$0"}
            </div>
          </div>
        </div>
        {/* Expanded View */}
        <div>
          <div className="font-semibold mb-2">Expanded View</div>
          <div className="border-2 border-blue-500 rounded w-64 h-96 flex flex-col items-center bg-black text-white shadow relative p-2">
            <div className="w-full h-32 bg-gray-700 flex items-center justify-center mb-2">
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt="thumb"
                  className="h-full object-contain"
                />
              ) : (
                <span className="text-white">(400x400)</span>
              )}
            </div>
            <div className="p-2 text-lg font-bold text-center">{name}</div>
            <div className="p-2 text-xs text-gray-300 text-center">
              {descriptionEnabled && description
                ? description
                : `${type} & description, price, cta, etc.`}
            </div>
            {type === "Digital Product" && (
              <div className="text-xs text-gray-400 mt-1">
                AVAILABLE AS: {fileFormat.length ? fileFormat.join(", ") : "-"}
              </div>
            )}
            <button className="bg-yellow-400 text-black px-4 py-2 rounded mt-2 font-semibold">
              {cta}
            </button>
            <div className="mt-2">
              Total Cost: {priceType === "paid" && price ? `$${price}` : "$22"}
            </div>
            <button className="absolute top-2 right-2 text-white">✕</button>
          </div>
        </div>
        {/* Approve */}
        <div className="flex flex-col justify-between">
          <button
            className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-semibold shadow"
            style={{ marginTop: 0 }}
          >
            APPROVE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
