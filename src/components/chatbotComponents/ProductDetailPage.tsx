import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Theme, Product } from "../../types";
import { useCartStore } from "../../store/useCartStore";
import toast from "react-hot-toast";

interface ProductDetailPageProps {
  theme: Theme;
  onBack: () => void;
  onAddToCart: (quantity: number) => void;
}

export default function ProductDetailPage({
  theme,
  onBack,
  onAddToCart,
}: ProductDetailPageProps) {
  const { selectedProduct, setCartView } = useCartStore();
  const [quantity, setQuantity] = useState(1);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const handleBuyNow = () => {
    onAddToCart(quantity);
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

  // UI blocks

  console.log("selectedProduct");
  console.log(selectedProduct);
  let extraFields = null;
  if (selectedProduct?.type === "physical") {
    extraFields = (
      <div className="flex flex-row justify-between gap-2 py-3">
        <div>
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT SIZE
          </div>
          <button
            className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold"
            style={{
              color: theme.highlightColor,
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
              className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              -
            </button>
            <span
              className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold "
              style={{
                backgroundColor: theme.mainLightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold "
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
  } else if (selectedProduct?.type === "digital") {
    extraFields = (
      <div className="flex flex-col gap-3 mb-3">
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
  } else if (selectedProduct?.type === "service") {
    extraFields = (
      <div className="flex flex-row justify-between gap-2 mb-2">
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
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT QUANTITY
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-2 py-1 rounded-full border text-lg font-bold"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000000",
              }}
            >
              -
            </button>
            <span
              className="px-3 py-1 rounded-full border  text-xs font-semibold"
              style={{
                backgroundColor: theme.mainLightColor,
                color: theme.isDark ? "#fff" : "#000000",
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
  } else if (selectedProduct?.type === "event") {
    extraFields = (
      <div className="flex flex-col gap-3 mb-3">
        <div className="flex flex-row gap-4">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">DATE</div>
            <input
              type="text"
              placeholder="ddmmyyyy"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold bg-[#232323] w-24"
            />
          </div>
          <div>
            <div className="text-xs font-semibold mb-1 text-left">TIMINGS</div>
            <input
              type="text"
              placeholder="HH:MM TO HH:MM"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
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
                className="px-2 py-1 rounded-full   text-lg font-bold"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "#fff" : "#000000",
                }}
              >
                -
              </button>
              <span
                className="px-3 py-1 rounded-full  text-xs font-semibold"
                style={{
                  backgroundColor: theme.mainLightColor,
                  color: theme.isDark ? "#fff" : "#000000",
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
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div
        className="rounded-xl w-full max-w-full relative mt-2"
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
            <ChevronLeft className="w-5 h-5" />
            <span className="text-md font-semibold">Back</span>
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
            <ChevronLeft className="w-7 h-7 text-[#7a4fff]" />
          </button>
          <img
            src={
              selectedProduct?.images?.[currentImageIndex] ||
              "https://i.imgur.com/EJLFNOwg.jpg"
            }
            alt={selectedProduct?.title || "Product"}
            className="w-48 h-48 object-contain mx-auto rounded-xl"
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
            <ChevronRight className="w-7 h-7 text-[#7a4fff]" />
          </button>
          {selectedProduct?.images && selectedProduct.images.length > 1 && (
            <div className="absolute bottom-2 flex gap-1">
              {selectedProduct.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full ${
                    index === currentImageIndex ? "bg-[#7a4fff]" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
        {/* Product Info */}
        <div className="px-6 pt-4 pb-2 text-center">
          <div className="text-lg font-semibold mb-1">
            {selectedProduct?.title || "Product Name"}
          </div>
          <div
            className="w-12 mx-auto border-b-4 mb-2 opacity-90"
            style={{ borderColor: theme.isDark ? "#fff" : "#000" }}
          />
          <div className="text-xs mb-2 text-left opacity-90">
            {selectedProduct?.description || "Product Bio "}
          </div>
          {extraFields}
          <div className="flex flex-row justify-between items-center py-2">
            <div className="flex flex-col justify-between items-start mt-4 mb-2">
              <div className="text-xs opacity-70 text-left">TOTAL COST</div>
              <div className="text-md font-bold">
                {selectedProduct?.priceType === "paid"
                  ? `$${selectedProduct?.price ?? 0}`
                  : "FREE"}
              </div>
            </div>
            <button
              className="w-fit px-5 py-2 rounded-full text-sm font-bold"
              style={{
                backgroundColor: theme.highlightColor,
                color: !theme.isDark ? "#fff" : "#000",
              }}
              onClick={handleBuyNow}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
