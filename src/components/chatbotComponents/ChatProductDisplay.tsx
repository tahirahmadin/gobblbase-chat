import React, { useState, useEffect, useMemo } from "react";
import { useCartStore } from "../../store/useCartStore";
import { useBotConfig } from "../../store/useBotConfig";
import { Product, Theme } from "../../types";
import { ChevronRight, ChevronLeft, CreditCard, Wallet } from "lucide-react";
import toast from "react-hot-toast";

interface ChatProductDisplayProps {
  theme: Theme;
  currentConfig?: {
    agentId?: string;
    name?: string;
    sessionName?: string;
    sessionPrice?: string;
    isFreeSession?: boolean;
  };
  messageId: string;
  setActiveScreen?: (screen: "about" | "chat" | "browse") => void;
}

export default function ChatProductDisplay({
  theme,
  currentConfig,
  messageId,
  setActiveScreen,
}: ChatProductDisplayProps) {
  // Get products from cart store
  const { products, getProductsInventory, setCartView, setSelectedProduct } =
    useCartStore();
  const { activeBotData } = useBotConfig();

  // Local state - completely independent from the global state
  const [localSelectedProduct, setLocalSelectedProduct] =
    useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [view, setView] = useState<"grid" | "detail" | "checkout">("grid");
  const [viewMore, setViewMore] = useState(false);

  // Check if any payment method is enabled
  const availablePaymentMethods = useMemo(() => {
    if (!activeBotData?.paymentMethods) return [];

    const methods = [];
    if (activeBotData.paymentMethods.stripe?.enabled) methods.push("stripe");
    if (activeBotData.paymentMethods.razorpay?.enabled)
      methods.push("razorpay");
    if (activeBotData.paymentMethods.usdt?.enabled) methods.push("usdt");
    if (activeBotData.paymentMethods.usdc?.enabled) methods.push("usdc");

    return methods;
  }, [activeBotData?.paymentMethods]);

  const hasEnabledPaymentMethods = availablePaymentMethods.length > 0;

  // Fetch products when the component mounts
  useEffect(() => {
    if (currentConfig?.agentId) {
      getProductsInventory(currentConfig.agentId);
    }
  }, [currentConfig?.agentId, getProductsInventory]);

  // Product grid handlers
  const handleProductClick = (product: Product) => {
    setLocalSelectedProduct(product);
    setCurrentImageIndex(0);
    setQuantity(1);
    setView("detail");
  };

  const handleBack = () => {
    if (view === "checkout") {
      setView("detail");
    } else {
      setView("grid");
      setLocalSelectedProduct(null);
    }
  };

  // Modified Buy Now handler with payment method check
  const handleBuyNow = () => {
    if (localSelectedProduct) {
      const isFreeProduct =
        localSelectedProduct.priceType === "free" ||
        localSelectedProduct.price === 0;

      // Allow free products to proceed regardless of payment methods
      if (isFreeProduct) {
        try {
          if (typeof setSelectedProduct === "function") {
            setSelectedProduct({
              ...localSelectedProduct,
              quantity,
            });

            if (typeof setCartView === "function") {
              setCartView(true);
            }

            if (typeof setActiveScreen === "function") {
              setActiveScreen("browse");
            }
          } else {
            console.error("setSelectedProduct is not a function");
            if (typeof setActiveScreen === "function") {
              setActiveScreen("browse");
            }
          }
        } catch (error) {
          console.error("Error in handleBuyNow:", error);
          if (typeof setActiveScreen === "function") {
            setActiveScreen("browse");
          }
        }
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

      try {
        if (typeof setSelectedProduct === "function") {
          setSelectedProduct({
            ...localSelectedProduct,
            quantity,
          });

          if (typeof setCartView === "function") {
            setCartView(true);
          }

          if (typeof setActiveScreen === "function") {
            setActiveScreen("browse");
          }
        } else {
          console.error("setSelectedProduct is not a function");
          if (typeof setActiveScreen === "function") {
            setActiveScreen("browse");
          }
        }
      } catch (error) {
        console.error("Error in handleBuyNow:", error);
        if (typeof setActiveScreen === "function") {
          setActiveScreen("browse");
        }
      }
    }
  };

  // Image navigation handlers
  const handlePreviousImage = () => {
    if (
      localSelectedProduct?.images &&
      localSelectedProduct.images.length > 0
    ) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? localSelectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (
      localSelectedProduct?.images &&
      localSelectedProduct.images.length > 0
    ) {
      setCurrentImageIndex((prev) =>
        prev === localSelectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const toggleViewMore = () => {
    setViewMore(!viewMore);
  };

  // Rendering functions for each view
  const renderProductDetails = () => {
    if (!localSelectedProduct) return null;

    const isFreeProduct =
      localSelectedProduct.priceType === "free" ||
      localSelectedProduct.price === 0;
    const isBuyNowDisabled = !isFreeProduct && !hasEnabledPaymentMethods;

    // Sizes for the chat mode
    const imageSize = "w-36 h-36";
    const titleSize = "text-md";
    const descriptionSize = "text-xs leading-tight";
    const buttonSize = "text-xs py-1.5 px-4";
    const sectionPadding = "px-4";
    const borderWidth = "w-24";

    let extraFields = null;

    if (localSelectedProduct.type === "physicalProduct") {
      extraFields = (
        <div className="flex flex-row justify-between gap-2 py-2">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              SELECT SIZE
            </div>
            <button
              className="px-3 py-1 rounded-full border text-xs font-semibold"
              style={{
                color: theme.highlightColor,
                borderColor: theme.isDark ? "#fff" : "#000",
              }}
            >
              One Size
            </button>
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
                className="px-3 py-3 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: theme.mainLightColor,
                  color: !theme.isDark ? "#ffffff" : "#000000",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 rounded-full text-lg font-bold"
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
    } else if (localSelectedProduct.type === "digitalProduct") {
      extraFields = (
        <div className="flex flex-col gap-2 mb-2">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              AVAILABLE FORMATS
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold bg-[#232323]">
                PDF
              </button>
              <button className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold bg-[#232323]">
                PNG
              </button>
            </div>
          </div>
        </div>
      );
    } else if (localSelectedProduct.type === "Service") {
      extraFields = (
        <div className="flex flex-row justify-between gap-2 mb-1">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">LOCATION</div>
            <button
              className="px-3 py-1 rounded-full border text-xs font-semibold"
              style={{
                color: theme.highlightColor,
                borderColor: theme.isDark ? "#fff" : "#000",
              }}
            >
              Online
            </button>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1 text-left">d</div>
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
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: theme.mainLightColor,
                  color: !theme.isDark ? "#ffffff" : "#000000",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 rounded-full text-lg font-bold"
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
    } else if (localSelectedProduct.type === "Event") {
      extraFields = (
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex flex-row gap-4">
            <div>
              <div className="text-xs font-semibold mb-1 text-left">DATE</div>
              <input
                type="text"
                placeholder="ddmmyyyy"
                className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold bg-[#232323] w-24"
              />
            </div>
            <div>
              <div className="text-xs font-semibold mb-1 text-left">
                TIMINGS
              </div>
              <input
                type="text"
                placeholder="HH:MM TO HH:MM"
                className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold bg-[#232323] w-32"
              />
            </div>
          </div>
          <div className="flex flex-row justify-between gap-2">
            <div>
              <div className="text-xs font-semibold mb-1 text-left">
                SLOTS AVAILABLE
              </div>
              <button className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold bg-[#232323]">
                XXXX
              </button>
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
                  className="px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: theme.mainLightColor,
                    color: !theme.isDark ? "#ffffff" : "#000000",
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-2 py-1 rounded-full text-lg font-bold"
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
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div
          className="rounded-xl w-full relative mt-1"
          style={{
            color: theme.isDark ? "#fff" : "#000",
          }}
        >
          <div className="flex items-center justify-between pt-2">
            {/* Back Button */}
            <button
              className="flex items-center gap-1"
              style={{ color: theme.highlightColor }}
              onClick={handleBack}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back</span>
            </button>
            {/* Category */}
            <div className="text-xs font-semibold px-4 pb-2 opacity-70 text-center">
              {localSelectedProduct?.category}
            </div>
          </div>
          {/* Image and navigation */}
          <div className="relative flex items-center justify-center">
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
              onClick={handlePreviousImage}
              disabled={
                !localSelectedProduct?.images ||
                localSelectedProduct.images.length <= 1
              }
              style={{
                opacity:
                  !localSelectedProduct?.images ||
                  localSelectedProduct.images.length <= 1
                    ? 0.3
                    : 1,
              }}
            >
              <ChevronLeft className="w-6 h-6 text-[#7a4fff]" />
            </button>
            <img
              src={
                localSelectedProduct?.images?.[currentImageIndex] ||
                "https://i.imgur.com/EJLFNOwg.jpg"
              }
              alt={localSelectedProduct?.title || "Product"}
              className={`${imageSize} object-contain mx-auto rounded-xl`}
              style={{ background: "#fff" }}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
              onClick={handleNextImage}
              disabled={
                !localSelectedProduct?.images ||
                localSelectedProduct.images.length <= 1
              }
              style={{
                opacity:
                  !localSelectedProduct?.images ||
                  localSelectedProduct.images.length <= 1
                    ? 0.3
                    : 1,
              }}
            >
              <ChevronRight className="w-6 h-6 text-[#7a4fff]" />
            </button>
            {localSelectedProduct?.images &&
              localSelectedProduct.images.length > 1 && (
                <div className="absolute bottom-2 flex gap-1">
                  {localSelectedProduct.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full ${
                        index === currentImageIndex
                          ? "bg-[#7a4fff]"
                          : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
          </div>
          {/* Product Info */}
          <div className={`${sectionPadding} pt-3 pb-2 text-center`}>
            <div className={`${titleSize} font-bold mb-1`}>
              {localSelectedProduct?.title || "Product Name"}
            </div>
            <div
              className={`${borderWidth} mx-auto border-b-4 mb-2 opacity-90`}
              style={{ borderColor: theme.isDark ? "#fff" : "#000" }}
            />
            <div className={`${descriptionSize} mb-2 text-left opacity-90`}>
              {localSelectedProduct?.description || "Product Bio "}
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

            <div className="flex flex-row justify-between items-center py-1">
              <div className="flex flex-col justify-between items-start mt-2 mb-1">
                <div className="text-xs opacity-70 text-left">TOTAL COST</div>
                <div className="text-sm font-bold">
                  {localSelectedProduct?.priceType === "paid"
                    ? `${localSelectedProduct?.price ?? 0} ${
                        activeBotData?.currency
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
  };

  // Render product grid
  const renderProductGrid = () => {
    const displayProducts = viewMore ? products : products?.slice(0, 4);

    return (
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {displayProducts.map((product) => (
            <div
              key={`${messageId}-${product._id}`}
              className="rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleProductClick(product)}
              style={{
                backgroundColor: theme.isDark ? "#121212" : "#f5f5f5",
              }}
            >
              <div className="relative">
                <img
                  src={
                    product.images?.[0] || "https://i.imgur.com/EJLFNOwg.jpg"
                  }
                  alt={product.title}
                  className="w-full h-32 object-cover"
                />
                {product.category && (
                  <div
                    className="absolute top-2 right-2 bg-highlight text-white text-xs py-0.5 px-2 rounded-full"
                    style={{
                      backgroundColor: theme.isDark ? "#222" : "#f3f3f3",
                      color: theme.isDark ? theme.highlightColor : "#333",
                      border: `0.5px solid ${theme.highlightColor}`,
                      minWidth: "60px",
                      textAlign: "center",
                    }}
                  >
                    {product.category}
                  </div>
                )}
              </div>
              <div className="p-2 text-center">
                <h3
                  className="text-sm font-medium mb-1 truncate"
                  style={{ color: theme.isDark ? "white" : "black" }}
                >
                  {product.title}
                </h3>
                <div className="flex justify-between items-center">
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.highlightColor }}
                  >
                    {product.priceType === "paid" 
                      ? `${product.price} ${activeBotData?.currency || ''}` 
                      : "FREE"
                    }
                  </span>
                  <div
                    className="flex items-center text-xs"
                    style={{ color: theme.highlightColor }}
                  >
                    View <ChevronRight size={12} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length > 4 && (
          <div className="text-center mt-3 mb-1">
            <button
              className="text-xs py-1.5 px-4 rounded-full"
              style={{
                backgroundColor: theme.mainDarkColor,
                color: theme.isDark ? "white" : "black",
              }}
              onClick={toggleViewMore}
            >
              {viewMore ? "Show Less" : `View All ${products.length} Products`}
            </button>
          </div>
        )}
      </div>
    );
  };

  // Check for empty products
  const hasProducts = products && products.length > 0;
  if (!hasProducts) {
    return (
      <div
        className="w-full p-4 rounded-lg"
        style={{
          backgroundColor: theme.isDark ? "black" : "white",
          color: theme.isDark ? "white" : "black",
        }}
      >
        <div className="text-center py-4 px-2">
          <p className="text-md font-medium mb-2">No products available</p>
          <p className="text-sm opacity-80">
            Our product catalog is currently empty. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  // Main render based on current view
  return (
    <div
      className="w-full rounded-lg overflow-hidden"
      style={{
        backgroundColor: theme.isDark ? "black" : "white",
        color: theme.isDark ? "white" : "black",
      }}
    >
      {view === "detail" ? renderProductDetails() : renderProductGrid()}
    </div>
  );
}
