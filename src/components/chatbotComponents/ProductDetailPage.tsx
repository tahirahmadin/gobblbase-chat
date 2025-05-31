import React, { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Theme } from "../../types";
import { useCartStore } from "../../store/useCartStore";
import { useBotConfig } from "../../store/useBotConfig";
import toast from "react-hot-toast";

interface ProductDetailPageProps {
  theme: Theme;
  onBack: () => void;
  onAddToCart: (quantity: number, checkType: string) => void;
  inChatMode?: boolean;
}

export default function ProductDetailPage({
  theme,
  onBack,
  onAddToCart,
  inChatMode = false,
}: ProductDetailPageProps) {
  const { selectedProduct, setCartView } = useCartStore();
  const { activeBotData } = useBotConfig();

  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isSlotDropdownOpen, setIsSlotDropdownOpen] = useState(false);

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Get max quantity based on selected size
  const maxQuantity = useMemo(() => {
    console.log(selectedProduct);
    if (selectedProduct?.quantityType === "variedSizes" && selectedSize) {
      return selectedProduct.variedQuantities?.[selectedSize] || 0;
    }
    return selectedProduct?.quantity || 0;
  }, [selectedProduct, selectedSize]);

  // Update quantity when size changes
  useEffect(() => {
    if (selectedProduct?.quantityType === "variedSizes" && selectedSize) {
      setQuantity(1);
    }
  }, [selectedSize, selectedProduct?.quantityType]);

  // Check if any payment method is enabled
  const availablePaymentMethods = useMemo(() => {
    if (!activeBotData?.paymentMethods) return [];

    const methods = [];
    if (activeBotData.paymentMethods.stripe?.enabled) methods.push("stripe");
    if (activeBotData.paymentMethods.razorpay?.enabled)
      methods.push("razorpay");
    if (activeBotData.paymentMethods.crypto?.enabled) methods.push("crypto");

    return methods;
  }, [activeBotData?.paymentMethods]);

  const hasEnabledPaymentMethods = availablePaymentMethods.length > 0;
  const isFreeProduct =
    selectedProduct?.priceType === "free" || selectedProduct?.price === 0;

  const handleBuyNow = () => {
    // Allow free products to proceed regardless of payment methods
    if (isFreeProduct) {
      if (selectedProduct?.type === "Event" && selectedSlot) {
        // For events, include the selected slot's start time
        const checkType = selectedSlot.start;
        onAddToCart(quantity, checkType);
      } else if (
        selectedProduct?.quantityType === "variedSizes" &&
        selectedSize
      ) {
        // Only send the selected size's quantity
        const checkType = selectedSize;
        onAddToCart(quantity, checkType);
      } else {
        onAddToCart(quantity, "");
      }
      setCartView(true);
      return;
    }

    // Check if payment methods are enabled for paid products
    if (!hasEnabledPaymentMethods) {
      toast.error(
        "Payment methods are not enabled. Please contact the admin.",
        {
          duration: 4000,
          style: {
            background: theme.isDark ? "#2d1b1b" : "#fef2f2",
            color: theme.isDark ? "#fca5a5" : "#dc2626",
            border: "1px solid #ef4444",
          },
        }
      );
      return;
    }

    if (selectedProduct?.type === "Event" && selectedSlot) {
      // For events, include the selected slot's start time
      const checkType = selectedSlot.start;
      onAddToCart(quantity, checkType);
    } else if (
      selectedProduct?.quantityType === "variedSizes" &&
      selectedSize
    ) {
      // Only send the selected size's quantity
      const checkType = selectedSize;
      onAddToCart(quantity, checkType);
    } else {
      onAddToCart(quantity, "");
    }
    setCartView(true);
  };

  const handlePreviousImage = () => {
    if (selectedProduct?.images && selectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? selectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (selectedProduct?.images && selectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === selectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Adjust sizes based on inChatMode
  const imageSize = inChatMode ? "w-36 h-36" : "w-48 h-48";
  const titleSize = inChatMode ? "text-md" : "text-lg";
  const buttonSize = inChatMode ? "text-xs py-1.5 px-4" : "text-sm py-2 px-5";
  const sectionPadding = inChatMode ? "px-4" : "px-6";

  const contentMaxWidth = inChatMode ? "max-w-full" : "max-w-full";

  // Determine if Buy Now button should be disabled
  const isBuyNowDisabled =
    (!isFreeProduct && !hasEnabledPaymentMethods) ||
    (selectedProduct?.quantityType === "variedSizes" && !selectedSize) ||
    (selectedProduct?.type === "Event" &&
      selectedSlot &&
      (selectedSlot.seatType === "unlimited"
        ? false
        : selectedSlot.seats === 0));

  // UI blocks
  let extraFields = null;
  if (selectedProduct?.type === "physicalProduct") {
    extraFields = (
      <div
        className={`flex flex-row justify-between gap-2 ${
          inChatMode ? "py-2" : "py-3"
        }`}
      >
        <div>
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT SIZE
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedProduct.quantityType === "variedSizes" ? (
              Object.entries(selectedProduct.variedQuantities || {}).map(
                ([size, qty]) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold ${
                      selectedSize === size ? "border-2" : "border"
                    }`}
                    style={{
                      color:
                        selectedSize === size
                          ? theme.highlightColor
                          : theme.isDark
                          ? "#fff"
                          : "#000",
                      borderColor:
                        selectedSize === size
                          ? theme.highlightColor
                          : theme.isDark
                          ? "#fff"
                          : "#000",
                      backgroundColor:
                        selectedSize === size
                          ? theme.isDark
                            ? "#1a1a1a"
                            : "#f5f5f5"
                          : "transparent",
                    }}
                  >
                    {size}
                  </button>
                )
              )
            ) : (
              <button
                className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold"
                style={{
                  color: theme.highlightColor,
                }}
              >
                One Size
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT QUANTITY
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 rounded-full text-lg font-bold bg-[#232323]"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              -
            </button>
            <span
              className="px-3 py-1 rounded-full  text-sm font-semibold"
              style={{
                backgroundColor: theme.mainLightColor,
                color: !theme.isDark ? "#ffffff" : "#000000",
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="px-3 py-1 rounded-full text-lg font-bold"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
              disabled={quantity >= maxQuantity}
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  } else if (selectedProduct?.type === "digitalProduct") {
    extraFields = (
      <div
        className={`flex flex-row justify-between gap-2 ${
          inChatMode ? "py-2" : "py-3"
        }`}
      >
        <div
          className={`flex flex-col gap-${inChatMode ? "2" : "3"} mb-${
            inChatMode ? "2" : "3"
          }`}
        >
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              AVAILABLE FORMATS
            </div>
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold "
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "#fff" : "#000000",
                }}
              >
                {selectedProduct?.fileFormat}
              </button>
            </div>
          </div>
        </div>
        {/* <div>
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT QUANTITY
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1 rounded-full text-lg font-bold bg-[#232323]"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              -
            </button>
            <span
              className="px-3 py-1 rounded-full  text-sm font-semibold"
              style={{
                backgroundColor: theme.mainLightColor,
                color: !theme.isDark ? "#ffffff" : "#000000",
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
              className="px-3 py-1 rounded-full text-lg font-bold"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
              disabled={quantity >= maxQuantity}
            >
              +
            </button>
          </div>
        </div> */}
      </div>
    );
  } else if (selectedProduct?.type === "Service") {
    extraFields = (
      <div
        className={`flex flex-row justify-between gap-2 mb-${
          inChatMode ? "1" : "2"
        }`}
      >
        <div>
          <div className="text-xs font-semibold mb-1 text-left">LOCATION</div>
          {selectedProduct.locationType === "offline" && (
            <div
              className=" py-1  text-xs font-semibold text-left"
              style={{
                color: theme.highlightColor,
                borderColor: theme.isDark ? "#fff" : "#000",
              }}
            >
              {selectedProduct.address}
            </div>
          )}
          {selectedProduct.locationType === "online" && (
            <button
              className="px-3 py-1 rounded-full border text-xs font-semibold text-left"
              style={{
                color: theme.highlightColor,
                borderColor: theme.isDark ? "#fff" : "#000",
              }}
            >
              ONLINE
            </button>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT QUANTITY
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-2 py-1 rounded-full text-lg font-bold"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              -
            </button>
            <span
              className="px-3 py-1 rounded-full   text-sm font-semibold"
              style={{
                backgroundColor: theme.mainLightColor,
                color: !theme.isDark ? "#ffffff" : "#000000",
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2 py-1 rounded-full  text-lg font-bold"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  } else if (selectedProduct?.type === "Event") {
    extraFields = (
      <div
        className={`flex flex-col gap-${inChatMode ? "2" : "3"} mb-${
          inChatMode ? "2" : "3"
        }`}
      >
        <div className="flex flex-col gap-2">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              SELECT SLOT
            </div>
            <div className="relative">
              <button
                onClick={() => setIsSlotDropdownOpen(!isSlotDropdownOpen)}
                className="w-full px-3 py-2 rounded-lg border text-left text-sm font-medium flex justify-between items-center"
                style={{
                  borderColor: theme.isDark ? "#fff" : "#000",
                  backgroundColor: theme.isDark ? "#232323" : "#fff",
                  color: theme.isDark ? "#fff" : "#000",
                }}
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
                <ChevronDown className="w-4 h-4" />
              </button>

              {isSlotDropdownOpen && (
                <div
                  className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  style={{
                    backgroundColor: theme.isDark ? "#232323" : "#fff",
                    border: `1px solid ${theme.isDark ? "#fff" : "#000"}`,
                  }}
                >
                  {selectedProduct.slots?.map((slot: any, index: number) => {
                    const start = formatDateTime(slot.start);
                    const end = formatDateTime(slot.end);
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setSelectedSlot(slot);
                          setIsSlotDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                        style={{
                          color: theme.isDark ? "#fff" : "#000",
                          backgroundColor:
                            selectedSlot === slot
                              ? theme.highlightColor
                              : "transparent",
                        }}
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

          {selectedSlot && (
            <div className="flex flex-row justify-between gap-2">
              <div>
                <div className="text-xs font-semibold mb-1 text-left">
                  SLOTS AVAILABLE
                </div>
                <div
                  className="px-3 py-1 rounded-full border text-xs font-semibold"
                  style={{
                    borderColor: theme.isDark ? "#fff" : "#000",
                    backgroundColor: theme.isDark ? "#232323" : "#fff",
                    color: theme.isDark ? "#fff" : "#000",
                  }}
                >
                  {selectedSlot.seatType === "unlimited"
                    ? "Unlimited "
                    : selectedSlot.seats}
                  seats
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold mb-1 text-left">
                  SELECT QUANTITY
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 py-1 rounded-full text-lg font-bold"
                    style={{
                      backgroundColor: theme.highlightColor,
                      color: !theme.isDark ? "#fff" : "#000000",
                    }}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: theme.mainLightColor,
                      color: !theme.isDark ? "#ffffff" : "#000000",
                    }}
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        selectedSlot.seatType === "unlimited"
                          ? q + 1
                          : Math.min(selectedSlot.seats, q + 1)
                      )
                    }
                    className="px-2 py-1 rounded-full text-lg font-bold"
                    style={{
                      backgroundColor: theme.highlightColor,
                      color: !theme.isDark ? "#fff" : "#000000",
                    }}
                    disabled={
                      selectedSlot.seatType !== "unlimited" &&
                      quantity >= selectedSlot.seats
                    }
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className={`rounded-xl w-full ${contentMaxWidth} relative ${
          inChatMode ? "mt-1" : "mt-2"
        }`}
        style={{
          color: theme.isDark ? "#fff" : "#000",
        }}
      >
        <div className="flex items-center justify-between pt-2">
          {/* Back Button */}
          <button
            className="flex items-center gap-1"
            style={{ color: theme.highlightColor }}
            onClick={onBack}
          >
            <ChevronLeft className={inChatMode ? "w-4 h-4" : "w-5 h-5"} />
            <span
              className={
                inChatMode ? "text-sm font-semibold" : "text-md font-semibold"
              }
            >
              Back
            </span>
          </button>
          {/* Category */}
          <div className="text-xs font-semibold px-4 pb-2 opacity-70 text-center">
            {selectedProduct?.category}
          </div>
        </div>
        {/* Image and navigation */}
        <div className="relative flex items-center justify-center">
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
            onClick={handlePreviousImage}
            disabled={
              !selectedProduct?.images || selectedProduct.images.length <= 1
            }
            style={{
              opacity:
                !selectedProduct?.images || selectedProduct.images.length <= 1
                  ? 0.3
                  : 1,
            }}
          >
            <ChevronLeft
              className={
                inChatMode ? "w-6 h-6 text-[#7a4fff]" : "w-7 h-7 text-[#7a4fff]"
              }
            />
          </button>
          <img
            src={
              selectedProduct?.images?.[currentImageIndex] ||
              "https://i.imgur.com/EJLFNOwg.jpg"
            }
            alt={selectedProduct?.title || "Product"}
            className={`${imageSize} object-contain mx-auto rounded-xl`}
            style={{ background: "#fff" }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
            onClick={handleNextImage}
            disabled={
              !selectedProduct?.images || selectedProduct.images.length <= 1
            }
            style={{
              opacity:
                !selectedProduct?.images || selectedProduct.images.length <= 1
                  ? 0.3
                  : 1,
            }}
          >
            <ChevronRight
              className={
                inChatMode ? "w-6 h-6 text-[#7a4fff]" : "w-7 h-7 text-[#7a4fff]"
              }
            />
          </button>
          {selectedProduct?.images && selectedProduct.images.length > 1 && (
            <div className="absolute bottom-2 flex gap-1">
              {selectedProduct.images.map((_, index) => (
                <div
                  key={index}
                  className={`${
                    inChatMode ? "w-1 h-1" : "w-1.5 h-1.5"
                  } rounded-full ${
                    index === currentImageIndex ? "bg-[#7a4fff]" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Product Info */}
        <div
          className={`${sectionPadding} ${
            inChatMode ? "pt-3 pb-2" : "pt-4 pb-2"
          } text-center`}
        >
          <div className={`${titleSize} font-bold mb-1`}>
            {selectedProduct?.title || "Product Name"}
          </div>
          <div
            className="w-24 mx-auto border-b-4 mb-2 opacity-90"
            style={{ borderColor: theme.isDark ? "#fff" : "#000" }}
          />
          <div className="text-sm mb-2 text-left opacity-90 text-wrap truncate">
            {selectedProduct?.description || "Product Bio "}
          </div>
          {extraFields}

          {/* Payment Warning for Paid Products */}
          {!isFreeProduct && !hasEnabledPaymentMethods && (
            <div
              className="mb-3 p-2 rounded-lg border text-center text-xs"
              style={{
                backgroundColor: theme.isDark ? "#2d1b1b" : "#fef2f2",
                borderColor: "#ef4444",
                color: theme.isDark ? "#fca5a5" : "#dc2626",
              }}
            >
              ⚠️ Payment methods not available. Contact admin to enable
              purchases.
            </div>
          )}

          <div
            className={`flex flex-row justify-between items-center ${
              inChatMode ? "py-1" : "py-2"
            }`}
          >
            <div
              className={`flex flex-col justify-between items-start ${
                inChatMode ? "mt-2 mb-1" : "mt-4 mb-2"
              }`}
            >
              <div className="text-xs opacity-70 text-left">TOTAL COST</div>
              <div
                className={
                  inChatMode ? "text-sm font-bold" : "text-md font-bold"
                }
              >
                {selectedProduct?.priceType === "paid"
                  ? `${(selectedProduct?.price ?? 0) * quantity} ${
                      activeBotData?.currency || "USD"
                    }`
                  : "FREE"}
              </div>
            </div>
            <button
              className={`w-fit ${buttonSize} rounded-full font-bold transition-all duration-200 ${
                isBuyNowDisabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                backgroundColor: isBuyNowDisabled
                  ? theme.isDark
                    ? "#444"
                    : "#ccc"
                  : theme.highlightColor,
                color: isBuyNowDisabled
                  ? theme.isDark
                    ? "#888"
                    : "#666"
                  : !theme.isDark
                  ? "#fff"
                  : "#000",
                opacity: isBuyNowDisabled ? 0.6 : 1,
              }}
              onClick={handleBuyNow}
              disabled={isBuyNowDisabled}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
