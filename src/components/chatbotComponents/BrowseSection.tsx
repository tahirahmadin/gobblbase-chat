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
  currentConfig?: {
    agentId?: string;
    name?: string;
    sessionName?: string;
    sessionPrice?: string;
    isFreeSession?: boolean;
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
    setSelectedProduct(inputProduct);
  };

  const handleBackToGrid = () => {
    setSelectedProduct(null);
  };

  const handleAddToCart = (quantity: number) => {
    if (selectedProduct !== null) {
      setSelectedProduct({ ...selectedProduct, quantity });
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
            <h2
              className="text-md font-medium mb-2 py-2"
              style={{ color: theme.isDark ? "#fff" : "#000" }}
            >
              Browse
            </h2>
            {/* Product grid always visible */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 p-4">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="relative rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleProductClick(product)}
                  style={{
                    backgroundColor: theme.isDark ? "#000" : "#fff",
                    color: theme.isDark ? "#fff" : "#000",
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
                      product.images?.[0] ||
                      "https://karanzi.websites.co.in/obaju-turquoise/img/product-placeholder.png"
                    }
                    alt={product.title}
                    className="w-full h-36 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="text-sm font-medium mb-1">
                      {product.title}
                    </h3>
                    <div className="flex justify-between items-center">
                      <span
                        className="text-lg font-medium "
                        style={{
                          color: theme.highlightColor,
                        }}
                      >
                        ${product.price}
                      </span>
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
