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
      setCartView(true);
    }
  };

  // Special styles for when in chat or showOnlyBooking mode
  const inChatMode = showOnlyBooking && isBookingConfigured;

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        ...containerStyle,
        position: "relative",
      }}
    >
      {/* Main content with scrolling */}
      <div
        className={`flex-grow overflow-y-auto h-full ${
          inChatMode ? "p-0 m-0" : "px-1"
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
        ) : showOnlyBooking && isBookingConfigured ? (
          <BookingSection
            theme={theme}
            businessId={currentConfig?.agentId || activeBotId || ""}
            sessionName={sessionName}
            isBookingConfigured={isBookingConfigured}
            showOnlyBooking={showOnlyBooking}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProductClick(product)}
              >
                <img
                  src={product.images?.[0] || "/placeholder-image.png"}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {product.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">
                      ${product.price}
                    </span>
                    <button
                      className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(product);
                      }}
                    >
                      <Plus className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Try Free Banner */}
      {/* {!inChatMode && <TryFreeBanner />} */}
    </div>
  );
}
