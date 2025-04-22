import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cart from "./Cart";
import Payment from "./Payment";
import { useCartStore } from "../../store/useCartStore";
import { ArrowLeft, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useBotConfig } from "../../store/useBotConfig";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  title: string;
  image: string;
  price: string;
  description: string;
  about?: string;
}

interface BrowseProps {
  showCart?: boolean;
  onShowCart?: () => void;
  onOpenDrawer?: () => void;
}

const Browse: React.FC<BrowseProps> = ({
  showCart = false,
  onShowCart,
  onOpenDrawer,
}) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAddedToCart, setJustAddedToCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { config, activeBotId, products, isProductsLoading, fetchProducts } =
    useBotConfig();

  const {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  useEffect(() => {
    if (config?.agentId) {
      fetchProducts(config?.agentId);
    }
  }, [config, fetchProducts]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          id: selectedProduct._id,
          title: selectedProduct.title,
          image: selectedProduct.image,
          price: selectedProduct.price,
          currency: "USD",
          description: selectedProduct.description,
        });
      }
      toast.success("Added to cart!");
      setJustAddedToCart(true);
    }
  };

  const handleViewCart = () => {
    if (onShowCart) {
      onShowCart();
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleGoBack = () => {
    setSelectedProduct(null);
  };

  const handleRemoveFromCart = (productId: string) => {
    removeItem(productId);
  };

  const handleCheckout = () => {
    setShowPayment(true);
  };

  const handleBackFromPayment = () => {
    setShowPayment(false);
  };

  if (selectedProduct) {
    return (
      <div className="container py-2">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setSelectedProduct(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Back</h2>
        </div>

        <div className="bg-white rounded-lg p-4 mb-4">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium mb-2">{selectedProduct.title}</h3>
          <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              USD {selectedProduct.price}
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={decrementQuantity}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={justAddedToCart ? handleViewCart : handleAddToCart}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>
              {justAddedToCart ? "View Cart" : `Add to Cart (${quantity})`}
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (showPayment) {
    return (
      <Payment onBack={handleBackFromPayment} onOpenDrawer={onOpenDrawer} />
    );
  }

  if (showCart) {
    return (
      <div>
        <Cart
          items={items}
          onRemoveItem={handleRemoveFromCart}
          onCheckout={handleCheckout}
          totalItems={getTotalItems()}
          totalPrice={getTotalPrice()}
          onBack={onShowCart || (() => {})}
          onOpenDrawer={onOpenDrawer}
        />
      </div>
    );
  }

  return (
    <div className="container py-2">
      {/* <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">
          Creative tools for
        </h1>
        <h2 className="text-2xl font-medium text-gray-900">
          endless imagination
        </h2>
      </div> */}

      {isProductsLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="group cursor-pointer bg-white p-2 rounded-md"
              onClick={() => handleProductClick(product)}
            >
              <div className="bg-gray-500 rounded-md overflow-hidden mb-3">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-24 object-cover"
                />
              </div>

              <div className="px-1">
                <h2 className="text-xs font-semibold text-gray-900 mb-1">
                  {product.title}
                </h2>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-orange-500 font-semibold">
                    {product.price} {config?.currency}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;
