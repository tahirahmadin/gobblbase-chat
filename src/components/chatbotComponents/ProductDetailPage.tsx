import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Theme, Product } from "../../types";

interface ProductDetailPageProps {
  theme: Theme;
  product: Product;
  selectedProductIndex: number;
  totalProducts: number;
  onBack: () => void;
  onPrevProduct: () => void;
  onNextProduct: () => void;
  onAddToCart: (quantity: number) => void;
}

export default function ProductDetailPage({
  theme,
  product,
  selectedProductIndex,
  totalProducts,
  onBack,
  onPrevProduct,
  onNextProduct,
  onAddToCart,
}: ProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventSlot, setEventSlot] = useState("");

  // UI blocks
  let extraFields = null;
  if (product.type === "digital") {
    extraFields = (
      <>
        <div className="text-xs font-semibold mt-2 mb-1 text-left">
          AVAILABLE FORMATS
        </div>
        <div className="flex gap-2 mb-3">
          <button className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
            PDF
          </button>
          <button className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
            PNG
          </button>
        </div>
      </>
    );
  } else if (product.type === "service") {
    extraFields = (
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs font-semibold mb-1 text-left">LOCATION</div>
          <button className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
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
              className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
            >
              -
            </button>
            <span className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  } else if (product.type === "event") {
    extraFields = (
      <>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">DATE</div>
            <input
              type="text"
              placeholder="ddmmyyyy"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323] w-24"
            />
          </div>
          <div>
            <div className="text-xs font-semibold mb-1 text-left">TIMINGS</div>
            <input
              type="text"
              placeholder="HH:MM TO HH:MM"
              value={eventTime}
              onChange={(e) => setEventTime(e.target.value)}
              className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323] w-32"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              SLOTS AVAILABLE
            </div>
            <button className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
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
                className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
              >
                -
              </button>
              <span className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </>
    );
  } else if (product.type === "physical") {
    extraFields = (
      <div className="flex items-center justify-end mb-3">
        <div>
          <div className="text-xs font-semibold mb-1 text-left">
            SELECT QUANTITY
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
            >
              -
            </button>
            <span className="px-3 py-1 rounded-lg border border-[#fff] text-xs font-semibold bg-[#232323]">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
            >
              +
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-2">
      <div
        className="rounded-xl w-full max-w-full p-0 relative mt-2"
        style={{
          boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          backgroundColor: theme.isDark ? "#111" : "#111",
          border: `2px solid ${theme.highlightColor}`,
          color: "#fff",
        }}
      >
        {/* Back Button */}
        <button
          className="absolute top-3 left-3 z-10 flex items-center gap-1"
          style={{ color: theme.highlightColor }}
          onClick={onBack}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-md font-semibold">Back</span>
        </button>
        {/* Category */}
        <div className="text-xs font-semibold px-4 pt-4 pb-2 opacity-70 text-center">
          {product.type === "event" ? `<EVENT TYPE>` : `<CATEGORY>`}
        </div>
        {/* Image and navigation */}
        <div className="relative flex items-center justify-center">
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
            onClick={onPrevProduct}
            disabled={selectedProductIndex === 0}
            style={{ opacity: selectedProductIndex === 0 ? 0.3 : 1 }}
          >
            <ChevronLeft className="w-7 h-7 text-[#7a4fff]" />
          </button>
          <img
            src={product.images?.[0] || "/placeholder-image.png"}
            alt={product.name || "Product"}
            className="w-48 h-48 object-contain mx-auto rounded-xl"
            style={{ background: "#fff" }}
          />
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
            onClick={onNextProduct}
            disabled={selectedProductIndex === totalProducts - 1}
            style={{
              opacity: selectedProductIndex === totalProducts - 1 ? 0.3 : 1,
            }}
          >
            <ChevronRight className="w-7 h-7 text-[#7a4fff]" />
          </button>
        </div>
        {/* Product Info */}
        <div className="px-6 pt-4 pb-2 text-center">
          <div className="text-lg font-semibold mb-1">
            {product.name || "Product Name"}
          </div>
          <div className="w-10 mx-auto border-b-2 border-[#fff] mb-2 opacity-30" />
          <div className="text-sm mb-2 text-left opacity-80">
            {product.description ||
              "Product Bio Product BioProduct BioProduct BioProduct BioProduct BioProduct BioProduct Bio"}
          </div>
          {extraFields}
          <div className="flex justify-between items-center mt-4 mb-2">
            <div className="text-xs opacity-70 text-left">TOTAL COST</div>
            <div className="text-lg font-bold">${product.price ?? 0}</div>
          </div>
          <button
            className="w-full py-3 rounded-full text-md font-bold mt-2 mb-2"
            style={{
              backgroundColor: theme.highlightColor,
              color: "#222",
            }}
            onClick={() => onAddToCart(quantity)}
          >
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
