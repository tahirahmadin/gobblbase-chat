import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import TryFreeBanner from "./TryFreeBanner";
import { Theme } from "../../types";
import BookingSection from "./BookingSection";
import ProductDetailPage from "./ProductDetailPage";
import { useBotConfig } from "../../store/useBotConfig";

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
}

export default function BrowseSection({
  theme,
  currentConfig,
  showOnlyBooking = false,
  isBookingConfigured: propIsBookingConfigured,
}: BrowseSectionProps) {
  const { products, addItem, getProductsInventory } = useCartStore();
  const { activeBotId } = useBotConfig();
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);
  const [isBookingConfigured, setIsBookingConfigured] = useState(
    propIsBookingConfigured !== undefined ? propIsBookingConfigured : false
  );

  const sessionName = currentConfig?.sessionName || "Session Description";

  useEffect(() => {
    if (activeBotId) {
      getProductsInventory(activeBotId);
    }
  }, [activeBotId]);
  useEffect(() => {
    if (propIsBookingConfigured !== undefined) {
      setIsBookingConfigured(propIsBookingConfigured);
    }
  }, [propIsBookingConfigured]);

  const handleProductClick = (index: number) => {
    setSelectedProductIndex(index);
  };
  const handleBackToGrid = () => {
    setSelectedProductIndex(null);
  };
  const handlePrevProduct = () => {
    if (selectedProductIndex !== null && selectedProductIndex > 0) {
      setSelectedProductIndex(selectedProductIndex - 1);
    }
  };
  const handleNextProduct = () => {
    if (
      selectedProductIndex !== null &&
      selectedProductIndex < products.length - 1
    ) {
      setSelectedProductIndex(selectedProductIndex + 1);
    }
  };
  const handleAddToCart = (quantity: number) => {
    if (selectedProductIndex !== null) {
      for (let i = 0; i < quantity; i++) {
        addItem(products[selectedProductIndex]);
      }
    }
  };

  return (
    <div
      className="flex flex-col px-4 overflow-y-auto h-full"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
        paddingBottom: "100px",
      }}
    >
      {/* Product Details Page (not modal) */}
      {selectedProductIndex !== null ? (
        <ProductDetailPage
          theme={theme}
          product={products[selectedProductIndex]}
          selectedProductIndex={selectedProductIndex}
          totalProducts={products.length}
          onBack={handleBackToGrid}
          onPrevProduct={handlePrevProduct}
          onNextProduct={handleNextProduct}
          onAddToCart={handleAddToCart}
        />
      ) : (
        <>
          {/* Book Meeting Section - Only show if booking is configured */}
          {isBookingConfigured && (
            <BookingSection
              theme={theme}
              businessId={activeBotId || ""}
              sessionName={sessionName}
              isBookingConfigured={isBookingConfigured}
              showOnlyBooking={showOnlyBooking}
            />
          )}
          {/* Browse Products Section - Always show when not in booking view */}
          {(!showOnlyBooking || !isBookingConfigured) && (
            <div className="px-4 mt-6">
              <h2
                className="text-md font-medium mb-2"
                style={{ color: theme.isDark ? "#fff" : "#000" }}
              >
                Browse
              </h2>
              <div className="grid grid-cols-2 gap-6 ">
                {products.map((product, index) => (
                  <div
                    key={index}
                    className="rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      backgroundColor: theme.isDark ? "#000000" : "#ffffff",
                      color: !theme.isDark ? "#000000" : "#ffffff",
                    }}
                    onClick={() => handleProductClick(index)}
                  >
                    {/* Product Image */}
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                        }
                        alt={product.name || "Product"}
                        className="absolute inset-0 w-full h-full object-cover p-4 rounded-3xl"
                      />
                    </div>
                    {/* Product Info */}
                    <div className="px-3 flex items-center justify-between">
                      <div>
                        <div
                          className="text-xs line-clamp-2"
                          style={{ color: theme.isDark ? "#fff" : "#000" }}
                        >
                          {product.title}
                        </div>
                        <div
                          className="text-sm font-semibold py-2"
                          style={{ color: theme.isDark ? "#fff" : "#000" }}
                        >
                          ${product.price}
                        </div>
                      </div>
                      <button
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: theme.highlightColor }}
                        // onClick={(e) => {
                        //   e.stopPropagation();
                        //   handleProductClick(index);
                        // }}
                      >
                        <Plus className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      {/* Always show TryFreeBanner */}
      <TryFreeBanner />
    </div>
  );
}
