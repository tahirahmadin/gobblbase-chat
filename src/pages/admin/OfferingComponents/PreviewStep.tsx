import React, { FC, useState } from "react";
import {
  savePhysicalProduct,
  saveDigitalProduct,
  saveServiceProduct,
  saveEventProduct,
} from "../../../lib/serverActions";
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
  const { activeBotId, activeBotData } = useBotConfig();
  const [loading, setLoading] = useState(false);
  const [isSlotDropdownOpen, setIsSlotDropdownOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const navigate = useNavigate();
  // Use form fields for each type
  let name = "";
  let price = form.price;
  let priceType = form.priceType;
  let cta = form.cta;
  let description = form.description;
  let descriptionEnabled = form.descriptionEnabled;
  let thumbnailUrl = form.thumbnailUrl || form.images?.[0];
  let category = form.category || "<CATEGORY>";
  let quantity = form.quantity || 1;
  let size = "One Size";
  let totalCost = priceType === "paid" && price ? price : "Free";

  const formatDateTime = (date: Date | string | null) => {
    try {
      if (!date) return { date: "", time: "" };

      // Debug log
      console.log("Input date:", date, "Type:", typeof date);

      // Handle string dates
      if (typeof date === "string") {
        const parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          console.log("Invalid string date");
          return { date: "", time: "" };
        }
        return {
          date: parsedDate.toLocaleDateString(),
          time: parsedDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }

      // Handle Date objects
      if (date instanceof Date) {
        if (isNaN(date.getTime())) {
          console.log("Invalid Date object");
          return { date: "", time: "" };
        }
        return {
          date: date.toLocaleDateString(),
          time: date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }

      // Handle any other type
      console.log("Unhandled date type");
      return { date: "", time: "" };
    } catch (error) {
      console.error("Error formatting date:", error);
      return { date: "", time: "" };
    }
  };

  if (type === "physicalProduct") {
    name = form.title || "Product Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta || "BUY NOW";
    description =
      form.description ||
      "Product Bio\nProduct BioProduct BioProduct BioProduct BioProduct BioProduct Bio";
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl || form.images?.[0];
    category = form.category || "<CATEGORY>";
    quantity = form.quantity || 1;
    size =
      form.variedSizes && form.variedSizes.length > 0
        ? form.variedSizes[0]
        : "One Size";
    totalCost = priceType === "paid" && price ? price : "Free";
  } else if (type === "digitalProduct") {
    name = form.title || "Product Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl || form.images?.[0];
  } else if (type === "Service") {
    name = form.title || "Service Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description;
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl || form.images?.[0];
  } else if (type === "Event") {
    name = form.title || "Event Name";
    price = form.price;
    priceType = form.priceType;
    cta = form.cta;
    description = form.description || "Event description.";
    descriptionEnabled = form.descriptionEnabled;
    thumbnailUrl = form.thumbnailUrl || form.images?.[0];
  }

  // Approve handler
  const handleAddProduct = async () => {
    if (!activeBotId) return;
    setLoading(true);

    try {
      let data;
      if (type === "physicalProduct") {
        data = await savePhysicalProduct(
          form,
          activeBotId,
          editMode ? editProduct.productId : undefined
        );
      } else if (type === "digitalProduct") {
        data = await saveDigitalProduct(
          form,
          activeBotId,
          editMode ? editProduct.productId : undefined
        );
      } else if (type === "Service") {
        data = await saveServiceProduct(
          form,
          activeBotId,
          editMode ? editProduct.productId : undefined
        );
      } else if (type === "Event") {
        data = await saveEventProduct(
          form,
          activeBotId,
          editMode ? editProduct.productId : undefined
        );
      }

      if (data && data.error === false) {
        toast.success(
          editMode
            ? "Product updated successfully!"
            : "Product added successfully!"
        );
        if (typeof onApprove === "function") onApprove();
        navigate("/admin/commerce/manage");
      } else {
        toast.error("Error: " + (data?.result?.error || "Unknown error"));
      }
    } catch (err: any) {
      toast.error("Network error: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  {
    console.log(type);
  }
  return (
    <div className="h-full">
      <div className="flex flex-col md:flex-row gap-2 items-star">
        {/* Stepper & Card View */}
        <div className="flex flex-1 flex-col items-center justify-start min-w-[180px]">
          <div className="font-semibold mb-2">Card View</div>
          <div className="border rounded-lg w-36  flex flex-col items-center justify-between bg-white shadow p-3 relative">
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
              <div className=" text-xs text-left py-1 ">
                {form.title || "Product Name"}
              </div>
              <div className="text-xs text-left font-bold  text-orange-500">
                {priceType === "paid" && price
                  ? `${price} ${activeBotData?.currency}`
                  : "Free"}
              </div>
            </div>
          </div>
        </div>
        {/* Expanded View */}
        <div className="flex-1 flex flex-col items-center justify-start">
          <div className="font-semibold mb-2">Expanded View</div>
          <div className="border-4 border-black rounded-2xl w-80 h-[30rem] flex flex-col items-center bg-black text-white shadow relative p-0 overflow-hidden">
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
              <div className="w-36 h-28 flex items-center justify-center rounded">
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
            <div className="p-2 text-lg font-bold text-center mt-2">
              {form.title || "Product Name"}
            </div>
            {/* Description */}
            <div
              className="px-4 text-xs text-gray-300 text-center mb-2 line-clamp-4"
              style={{
                minHeight: 48,
                wordBreak: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {descriptionEnabled && description
                ? description
                : `${type} & description, price, cta, etc.`}
            </div>
            {/* Dynamic Controls by Type */}
            {type === "Event" && (
              <div className="flex flex-col w-full px-6 mb-2 gap-2">
                <div className="text-xs font-semibold mb-1 text-left">
                  SELECT SLOT
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsSlotDropdownOpen(!isSlotDropdownOpen)}
                    className="w-full px-3 py-2 rounded-lg border text-left text-sm font-medium flex justify-between items-center bg-black border-gray-600 text-white"
                  >
                    {selectedSlot ? (
                      <span>
                        {formatDateTime(selectedSlot.start).date} -{" "}
                        {formatDateTime(selectedSlot.start).time} to{" "}
                        {formatDateTime(selectedSlot.end).time}
                      </span>
                    ) : (
                      <span className="opacity-70">Select a slot</span>
                    )}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {isSlotDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-black rounded-lg shadow-lg max-h-60 overflow-y-auto border border-gray-600 overflow-y-auto h-[100px]">
                      {form.slots?.map((slot: any, index: number) => {
                        // Debug log
                        console.log("Slot:", slot);

                        // Safely format dates
                        const start = formatDateTime(slot?.start);
                        const end = formatDateTime(slot?.end);

                        return (
                          <button
                            key={index}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setIsSlotDropdownOpen(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-800 text-white"
                          >
                            <div className="font-medium">{start.date}</div>
                            <div className="text-xs opacity-70">
                              {start.time} - {end.time}
                            </div>
                            <div className="text-xs opacity-70">
                              Available Seats:{" "}
                              {slot.seatType === "unlimited"
                                ? "Unlimited"
                                : slot.seats}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
            {type === "physicalProduct" &&
              form.quantityType === "variedSizes" &&
              form.variedQuantities && (
                <div className="flex flex-row justify-between w-full px-6 mt-2 mb-2 gap-4">
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-300 mb-1">
                      SELECT SIZE
                    </span>
                    <div className="flex gap-1">
                      {Object.entries(
                        form.variedQuantities as Record<string, number>
                      ).map(([size]) => (
                        <button
                          key={size}
                          className="border border-yellow-400 bg-black text-yellow-400 rounded-full px-2 py-1 text-xs font-semibold"
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-300 mb-1">
                      SELECT QUANTITY
                    </span>
                    <div className="flex flex-row justify-end items-center gap-2">
                      <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                        <MinusIcon />
                      </button>
                      <span className="text-white font-bold text-base">1</span>
                      <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            {type === "physicalProduct" &&
              form.quantityType !== "variedSizes" && (
                <div className="flex flex-row justify-between w-full px-6 mt-2 mb-2 gap-4">
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-300 mb-1">
                      TOTAL QUANTITY
                    </span>
                    <button className="border border-yellow-400 bg-black text-yellow-400 rounded-full px-3 py-1 text-xs font-semibold">
                      {form.quantityUnlimited === true
                        ? "Unlimited"
                        : form.quantity}
                    </button>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-300 mb-1">
                      SELECT QUANTITY
                    </span>
                    <div className="flex flex-row justify-end items-center gap-2">
                      <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                        <MinusIcon />
                      </button>
                      <span className="text-white font-bold text-base">1</span>
                      <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            {type === "digitalProduct" && (
              <div className="flex flex-row justify-between w-full px-6 mt-2 mb-2 gap-4">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-300 mb-1">
                    TOTAL QUANTITY
                  </span>
                  <button className="border border-yellow-400 bg-black text-yellow-400 rounded-full px-3 py-1 text-xs font-semibold">
                    {form.quantityUnlimited === true
                      ? "Unlimited"
                      : form.quantity}
                  </button>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-300 mb-1">
                    SELECT QUANTITY
                  </span>
                  <div className="flex flex-row justify-end items-center gap-2">
                    <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                      <MinusIcon />
                    </button>
                    <span className="text-white font-bold text-base">1</span>
                    <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {type === "Service" && (
              <div className="flex flex-row justify-between w-full px-6 mt-2 mb-2 gap-4">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-300 mb-1">LOCATION</span>
                  <div className=" text-yellow-400  text-xs font-semibold  max-w-[130px] line-clamp-3">
                    {form.locationType === "offline"
                      ? form.address || "Offline"
                      : "Online"}
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-300 mb-1">
                    SELECT QUANTITY
                  </span>
                  <div className="flex flex-row justify-end items-center gap-2">
                    <button className="w-6 h-6 rounded-full bg-yellow-400 text-black border border-gray-600 flex items-center justify-center ">
                      <MinusIcon />
                    </button>
                    <span className="text-white font-bold text-base">1</span>
                    <button className="w-6 h-6 rounded-full bg-yellow-400 border border-yellow-500 flex items-center justify-center text-black">
                      <PlusIcon />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* {form.fileFormat && type === "digitalProduct" && (
              <div className="flex flex-row justify-between w-full px-6 mt-2 mb-2 gap-4">
                <div className="flex flex-col items-start">
                  <span className="text-xs text-gray-300 mb-1">
                    AVAILABLE FORMAT
                  </span>
                  <div className="flex gap-2">
                    <button className="border border-white bg-black text-white rounded-full px-3 py-1 text-xs font-semibold">
                      {form.fileFormat}
                    </button>
                  </div>
                </div>
              </div>
            )} */}
            {/* Total Cost and Buy Now */}
            <div className="w-full flex flex-row items-center">
              {/* Total Cost */}
              <div className="w-full px-6 mt-2 mb-2 flex flex-col justify-between items-start">
                <span className="text-xs text-gray-300">TOTAL COST</span>
                <span className="text-lg font-bold text-white">
                  {totalCost}{" "}
                  {totalCost === "Free" ? "" : activeBotData?.currency}
                </span>
              </div>
              {/* Buy Now Button */}
              <div className="w-full flex justify-center mt-4 mb-4">
                <button className="bg-yellow-400 hover:bg-yellow-300 text-black rounded-full px-4 py-2 font-semibold text-md shadow-lg">
                  {cta || "Buy Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Approve the listing */}
        <div className="flex flex-col items-center justify-start flex-1 min-w-[180px]">
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
