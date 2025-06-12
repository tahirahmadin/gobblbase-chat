import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import TryFreeBanner from "./TryFreeBanner";
import { Product, Theme } from "../../types";
import BookingSection from "./BookingSection";
import ProductDetailPage from "./ProductDetailPage";
import { useBotConfig } from "../../store/useBotConfig";
import { Checkout } from "./checkoutComponent/Checkout";

interface BrowseSectionProps {
  theme: Theme;
  isPreview?: boolean;
  currentConfig?: {
    agentId?: string;
    name?: string;
    sessionName?: string;
    sessionPrice?: string;
    isFreeSession?: boolean;
    currency?: string;
  };
  showOnlyBooking?: boolean;
  isBookingConfigured?: boolean;
  containerStyle?: React.CSSProperties;
  setActiveScreen: (screen: "chat" | "book" | "browse") => void;
}

export default function BrowseSection({
  theme,
  currentConfig,
  showOnlyBooking = false,
  isBookingConfigured: propIsBookingConfigured,
  containerStyle,
  isPreview = false,
  setActiveScreen,
}: BrowseSectionProps) {
  const {
    products,
    getProductsInventory,
    selectedProduct,
    setSelectedProduct,
    cartView,
    setCartView,
  } = useCartStore();
  const { activeBotId } = useBotConfig();
  const { activeBotData } = useBotConfig();
  const globalCurrency = activeBotData?.currency || "USD";

  const [isBookingConfigured, setIsBookingConfigured] = useState(
    propIsBookingConfigured !== undefined ? propIsBookingConfigured : false
  );

  const [isBookingDropdownOpen, setIsBookingDropdownOpen] = useState(false);

  const sessionName = currentConfig?.sessionName || "Session Description";

  useEffect(() => {
    if (activeBotId) {
      getProductsInventory(activeBotId);
    }
  }, [activeBotId, getProductsInventory]);

  useEffect(() => {
    if (propIsBookingConfigured !== undefined) {
      setIsBookingConfigured(propIsBookingConfigured);
    }
  }, [propIsBookingConfigured]);

  const handleProductClick = (inputProduct: Product) => {
    setSelectedProduct({
      ...inputProduct,
    });
  };

  const handleBackToGrid = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (quantity: number, checkType: string) => {
    if (selectedProduct !== null) {
      setSelectedProduct({
        ...selectedProduct,
        quantity,
        checkType,
      });
      setCartView(true);
    }
  };

  const handleBookingDropdownToggle = (isOpen: boolean) => {
    setIsBookingDropdownOpen(isOpen);
  };

  // Special styles for when in chat or showOnlyBooking mode
  const inChatMode = showOnlyBooking && isBookingConfigured;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        ...containerStyle,
        position: "relative",
      }}
    >
      {/* Main content with scrolling */}
      <div
        className={`flex-grow overflow-y-auto h-full ${
          inChatMode ? "p-0 m-0" : "px-3"
        }`}
        style={{
          paddingBottom: showOnlyBooking ? "0" : "100px",
        }}
      >
        {cartView ? (
          <Checkout
            theme={theme}
            onBack={() => setCartView(false)}
            setActiveScreen={setActiveScreen}
          />
        ) : selectedProduct !== null ? (
          <ProductDetailPage
            theme={theme}
            onBack={handleBackToGrid}
            onAddToCart={handleAddToCart}
          />
        ) : (
          <>
            {/* Always show BookingSection if configured */}
            {isBookingConfigured && (
              <BookingSection
                theme={theme}
                businessId={currentConfig?.agentId || activeBotId || ""}
                sessionName={sessionName}
                isBookingConfigured={isBookingConfigured}
                showOnlyBooking={showOnlyBooking}
                onDropdownToggle={handleBookingDropdownToggle}
              />
            )}
            {/* Only show Browse content when booking dropdown is closed */}
            {!isBookingDropdownOpen && (
              <>
                <h2
                  className="text-md py-2 mt-4"
                  style={{
                    color: theme.isDark ? "#fff" : "#000",
                    fontWeight: 500,
                  }}
                >
                  Browse
                </h2>

                {/* Product grid always visible */} 
                <div className={` ${isPreview ? "grid grid-cols-2 gap-4 " : "flex flex-wrap gap-12"} px-4`}>
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="relative rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleProductClick(product)}
                      style={{
                        backgroundColor: theme.isDark ? "#000" : "#fff",
                        color: theme.isDark ? "#fff" : "#000",
                        maxWidth: "200px",
                        width: "100%",
                        minWidth: "145px",
                      }}
                    >
                      {/* Product Type Bubble */}
                      <div
                        className="absolute left-1 top-1 z-10 px-3 py-1 rounded-full text-xs font-semibold shadow"
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
                      <img
                        src={
                          product.images?.[0] || "https://i.imgur.com/EJLFNOwg.jpg"
                        }
                        alt={product.title}
                        className={`w-full object-cover px-6 py-4 ${isPreview ? "h-32" : " h-40 "}`}
                      />
                      <div className="px-6 py-2">
                        <h3
                          className="text-sm mb-1"
                          style={{ fontWeight: 500 }}
                        >
                          {product.title}
                        </h3>
                        <div className="flex justify-between items-center">
                          <span
                            className="text-md font-semibold"
                            style={{
                              color: theme.highlightColor,
                            }}
                          >
                            {product.priceType === "free"
                              ? "Free"
                              : `${product.price} ${globalCurrency}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Try Free Banner */}
      {/* {!inChatMode && <TryFreeBanner />} */}
    </div>
  );
}
