import React, { FC, useState } from "react";
import { addMainProduct, updateMainProduct } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Product, ProductType } from "../../../types";

// Helper for plus/minus icons
const PlusIcon = () => (
  <span className="inline-block font-bold text-lg">+</span>
);
const MinusIcon = () => (
  <span className="inline-block font-bold text-lg">-</span>
);
const LeftArrow = () => <span className="inline-block text-2xl">&#8592;</span>;
const RightArrow = () => <span className="inline-block text-2xl">&#8594;</span>;

type PreviewStepProps = {
  type: ProductType;
  form: any;
  onApprove: () => void;
  onBack?: () => void;
  editMode: boolean;
  editProduct: Product;
};

// Main PreviewStep
const PreviewStep: FC<PreviewStepProps> = ({
  type,
  form,
  onApprove,
  onBack,
  editMode,
  editProduct,
}) => {
  const { activeBotId } = useBotConfig();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Use form fields for each type
  let name = "";
  let price = 0;
  let priceType = "free";
  let cta = "";
  let description = "";
  let descriptionEnabled = true;
  let thumbnailUrl = "";
  let category = form.category || "<CATEGORY>";
  let quantity = form.quantity || 1;
  let size = "One Size";
  let totalCost = priceType === "paid" && price ? `$${price}` : "$22";

  if (type === "physical") {
    name = form.productTitle || "Product Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta || "BUY NOW";
    description =
      form.description ||
      "Product Bio\nProduct BioProduct BioProduct BioProduct BioProduct BioProduct Bio";
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl;
    category = form.category || "<CATEGORY>";
    quantity = form.quantity || 1;
    size =
      form.variedSizes && form.variedSizes.length > 0
        ? form.variedSizes[0]
        : "One Size";
    totalCost = priceType === "paid" && price ? `$${price}` : "$22";
  } else if (type === "digital") {
    name = form.productName || "Product Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl;
  } else if (type === "service") {
    name = form.serviceName || "Service Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl;
  } else if (type === "event") {
    name = "Event Name";
    price = 0;
    priceType = "free";
    cta = "Register";
    description = "Event description.";
    descriptionEnabled = true;
    thumbnailUrl = "";
  }

  // Approve handler
  const handleAddProduct = async () => {
    if (!activeBotId) return;
    setLoading(true);
    try {
      console.log("Adding/Updating product", form);
      console.log("activeBotId", activeBotId);

      let data;
      if (editMode) {
        // Update existing product
        data = await updateMainProduct(
          type,
          form,
          activeBotId,
          editProduct._id
        );
      } else {
        // Add new product
        data = await addMainProduct(type, form, activeBotId);
      }

      if (data && data.error === false) {
        toast.success(
          editMode
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        if (typeof onApprove === "function") onApprove();
        navigate("/admin/offerings/manage");
      } else {
        toast.error("Error: " + (data?.result?.error || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Network error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#e7eaff] rounded-xl p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
        >
          ← Back to Form
        </button>
        <h2 className="text-2xl font-semibold text-gray-900">Preview</h2>
      </div>
      <div className="flex flex-row gap-8 items-start">
        {/* Stepper & Card View */}
        <div className="flex flex-col items-start min-w-[180px]">
          <div className="font-semibold mb-2">Card View</div>
          <div className="border rounded-lg w-36 h-48 flex flex-col items-center justify-between bg-white shadow p-2 relative">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt="thumb"
                className="w-28 h-28 object-cover rounded mt-2"
              />
            ) : (
              <div className="w-28 h-28 bg-gray-200 rounded mt-2" />
            )}
            <div className="w-full px-1">
              <div className="font-semibold text-xs text-center truncate">
                {name}
              </div>
              <div className="text-xs text-center">
                {priceType === "paid" && price ? `$${price}` : "$0"}
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-yellow-400 rounded-full w-6 h-6 flex items-center justify-center shadow border border-yellow-500">
              <PlusIcon />
            </div>
          </div>
        </div>
        {/* Expanded View */}
        <div className="flex-1 flex flex-col items-center">
          <div className="font-semibold mb-2">Expanded View</div>
          <div className="border-4 border-black rounded-2xl w-80 h-[32rem] flex flex-col items-center bg-black text-white shadow relative p-0 overflow-hidden">
            {/* Category and Close */}
            <div className="flex justify-between items-center w-full px-4 pt-3 pb-1">
              <span className="text-xs font-bold tracking-widest">
                {category.toUpperCase()}
              </span>
              <button className="text-white text-xl font-bold">×</button>
            </div>
            {/* Image and Arrows */}
            <div className="flex items-center w-full justify-between px-2 mt-2">
              <button className="text-white opacity-70 hover:opacity-100">
                <LeftArrow />
              </button>
              <div className="w-36 h-28 bg-gray-700 flex items-center justify-center rounded">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt="thumb"
                    className="h-full object-contain rounded"
                  />
                ) : (
                  <span className="text-white">(400x400)</span>
                )}
              </div>
              <button className="text-white opacity-70 hover:opacity-100">
                <RightArrow />
              </button>
            </div>
            {/* Product Name */}
            <div className="p-2 text-lg font-bold text-center mt-2">{name}</div>
            {/* Description */}
            <div
              className="px-4 text-xs text-gray-300 text-center mb-2"
              style={{ minHeight: 48 }}
            >
              {descriptionEnabled && description
                ? description
                : `${type} & description, price, cta, etc.`}
            </div>
            {/* Size and Quantity Selectors */}
            <div className="flex flex-row justify-between w-full px-6 mt-2 mb-2 gap-4">
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-300 mb-1">SELECT SIZE</span>
                <button className="border border-yellow-400 bg-black text-yellow-400 rounded-full px-3 py-1 text-xs font-semibold">
                  {size}
                </button>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-xs text-gray-300 mb-1">
                  SELECT QUANTITY
                </span>
                <div className="flex items-center gap-2">
                  <button className="w-6 h-6 rounded-full bg-[#222] border border-gray-600 flex items-center justify-center text-yellow-400">
                    <MinusIcon />
                  </button>
                  <span className="text-white font-bold text-base">
                    {quantity}
                  </span>
                  <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                    <PlusIcon />
                  </button>
                </div>
              </div>
            </div>
            {/* Total Cost */}
            <div className="w-full px-6 mt-2 mb-2 flex justify-between items-center">
              <span className="text-xs text-gray-300">TOTAL COST</span>
              <span className="text-lg font-bold text-white">{totalCost}</span>
            </div>
            {/* Buy Now Button */}
            <div className="w-full flex justify-center mt-2 mb-4">
              <button className="bg-yellow-400 hover:bg-yellow-300 text-black rounded-full px-8 py-3 font-bold text-lg shadow-lg">
                {cta || "Buy Now"}
              </button>
            </div>
          </div>
        </div>
        {/* Approve the listing */}
        <div className="flex flex-col items-end flex-1 min-w-[180px]">
          <div className="font-semibold mb-2 text-right">
            Approve the listing
          </div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white rounded px-8 py-2 font-bold shadow border border-green-700"
            style={{ minWidth: 120 }}
            onClick={handleAddProduct}
            disabled={loading}
          >
            {loading ? "APPROVING..." : "APPROVE"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewStep;
