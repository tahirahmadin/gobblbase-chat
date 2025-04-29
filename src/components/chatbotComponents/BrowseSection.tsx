import React from "react";
import { ChevronRight, Plus } from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import TryFreeBanner from "./TryFreeBanner";

interface Product {
  name: string;
  price: number;
  image: string;
}

interface BrowseSectionProps {
  currentConfig: {
    name?: string;
    sessionPrice?: number;
    sessionDescription?: string;
    products?: Product[];
  };
}

export default function BrowseSection({ currentConfig }: BrowseSectionProps) {
  const { products } = useCartStore();

  return (
    <div className="flex flex-col h-full p-4">
      {/* Book Meeting Section */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2">Book Meeting</h2>
        <button className="w-full bg-black rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-sm">Session Description</div>
            <div className="text-lg font-medium">
              ${currentConfig.sessionPrice || 20}
            </div>
          </div>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Browse Products Section */}
      <div>
        <h2 className="text-sm font-medium mb-2">Browse</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product, index) => (
            <div key={index} className="bg-black rounded-xl overflow-hidden">
              {/* Product Image */}
              <div className="aspect-square bg-gray-800">
                <img
                  src={
                    product.image ||
                    "https://image.made-in-china.com/2f0j00vYDGElfRmuko/Customize-9cm-Small-Tea-Spoon-Natural-Bamboo-Spoon.jpg"
                  }
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Product Info */}
              <div className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white">{product.title}</div>
                  <div className="text-sm font-medium text-yellow-400">
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
