import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import TryFreeBanner from "./TryFreeBanner";
import { Theme } from "../../types";

interface BrowseSectionProps {
  theme: Theme;
}

export default function BrowseSection({ theme }: BrowseSectionProps) {
  const { products } = useCartStore();

  return (
    <div
      className="flex flex-col h-full"
      style={{
        backgroundColor: theme.isDark ? "#1c1c1c" : "#e9e9e9",
      }}
    >
      {/* Book Meeting Section */}
      <div className="mb-6 pt-4 px-4">
        <h2 className="text-sm font-medium mb-2 ">Book Session</h2>
        <button
          className="w-full rounded-xl p-4 flex items-center justify-between"
          style={{
            backgroundColor: theme.isDark ? "#000000" : "#ffffff",
            color: !theme.isDark ? "#000000" : "#ffffff",
          }}
        >
          <div>
            <div className="text-sm font-medium">Session Description</div>
            <div className="text-md font-medium  text-left">$20</div>
          </div>
          <ChevronRight className="w-5 h-5 text-yellow-400" />
        </button>
      </div>

      {/* Browse Products Section */}
      <div className="px-4">
        <h2 className="text-sm font-medium mb-2">Browse</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="rounded-xl overflow-hidden"
              style={{
                backgroundColor: theme.isDark ? "#000000" : "#ffffff",
                color: !theme.isDark ? "#000000" : "#ffffff",
              }}
            >
              {/* Product Image */}
              <div className="aspect-square">
                <img
                  src={
                    product.image ||
                    "https://image.made-in-china.com/2f0j00vYDGElfRmuko/Customize-9cm-Small-Tea-Spoon-Natural-Bamboo-Spoon.jpg"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover p-2 rounded-xl"
                />
              </div>
              {/* Product Info */}
              <div className="px-3 flex items-center justify-between">
                <div>
                  <div className="text-sm line-clamp-2">{product.title}</div>
                  <div className="text-sm font-semibold py-2">
                    ${product.price}
                  </div>
                </div>
                <button className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-black" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TryFreeBanner />
    </div>
  );
}
