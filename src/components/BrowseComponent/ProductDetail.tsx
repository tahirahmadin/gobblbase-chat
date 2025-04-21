import React from "react";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  currency: string;
  description: string;
}

interface ProductDetailProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  handleGoBack: () => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({
  product,
  onAddToCart,
  handleGoBack,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => handleGoBack()}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="rounded-md overflow-hidden">
            <img
              src={product.image}
              alt={product.title}
              className="w-full object-contain"
            />
            {/* Right Column - Product Info */}
            <div className="py-4">
              <h1 className="text-xl font-medium text-gray-900 mb-1">
                {product.title}
              </h1>

              <div className="text-xl text-orange-500 font-semibold mb-2">
                {product.currency} {product.price}
              </div>

              <div className="mb-4">
                <p className="text-gray-500 leading-relaxed">
                  {product.description}
                </p>
              </div>

              <div className="space-y-6">
                <button
                  onClick={() => onAddToCart(product)}
                  className="w-full bg-gray-900 text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Add to Cart
                </button>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Product Details
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li>• Instant digital delivery</li>
                    <li>• Lifetime access</li>
                    <li>• 30-day money-back guarantee</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
