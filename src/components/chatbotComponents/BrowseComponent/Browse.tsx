import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cart from "./Cart";
import Payment from "./Payment";
import { useCartStore } from "../../../store/useCartStore";
import { ArrowLeft, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";
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
  setActiveScreen: (screen: "chat" | "book" | "browse" | "cart") => void;
}

const Browse: React.FC<BrowseProps> = ({
  showCart = false,
  onShowCart,
  onOpenDrawer,
  setActiveScreen,
}) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAddedToCart, setJustAddedToCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { activeBotData, activeBotId } = useBotConfig();
  const { getProductsInventory, isProductsLoading, products } = useCartStore();

  const {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  useEffect(() => {
    if (activeBotId) {
      getProductsInventory(activeBotId);
    }
  }, [activeBotId, getProductsInventory]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      for (let i = 0; i < quantity; i++) {
        addItem({
          _id: selectedProduct._id,
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
      <div className="container py-2 px-2">
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setSelectedProduct(null)}
            style={{
              color: activeBotData?.themeColors?.headerIconColor,
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2
            className="text-lg font-semibold"
            style={{
              color: activeBotData?.themeColors?.headerIconColor,
            }}
          >
            Back
          </h2>
        </div>

        <div
          className="bg-white rounded-lg p-4 mb-4"
          style={{
            backgroundColor: activeBotData?.themeColors?.bubbleAgentBgColor,
            color: activeBotData?.themeColors?.bubbleAgentTextColor,
          }}
        >
          <img
            src={selectedProduct.image}
            alt={selectedProduct.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium mb-2">{selectedProduct.title}</h3>
          <p className="mb-4">{selectedProduct.description}</p>
          <p className="mb-4">{selectedProduct.about}</p>
          <div className="flex justify-between items-center mb-4">
            <span
              className="text-lg font-semibold"
              style={{
                color: activeBotData?.themeColors?.headerIconColor,
              }}
            >
              USD {selectedProduct.price}
            </span>
            <div className="flex items-center space-x-4">
              <button
                onClick={decrementQuantity}
                className="p-2 rounded-full"
                style={{
                  backgroundColor: activeBotData?.themeColors?.headerColor,
                  color: activeBotData?.themeColors?.headerIconColor,
                }}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-medium">{quantity}</span>
              <button
                onClick={incrementQuantity}
                className="p-2 rounded-full"
                style={{
                  backgroundColor: activeBotData?.themeColors?.headerColor,
                  color: activeBotData?.themeColors?.headerIconColor,
                }}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          <button
            onClick={justAddedToCart ? handleViewCart : handleAddToCart}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
            style={{
              backgroundColor: activeBotData?.themeColors?.headerIconColor,
              color: activeBotData?.themeColors?.headerColor,
            }}
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
      <Payment
        onBack={handleBackFromPayment}
        onOpenDrawer={onOpenDrawer}
        setActiveScreen={setActiveScreen}
      />
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
              className="group cursor-pointer  p-2 rounded-md"
              onClick={() => handleProductClick(product)}
              style={{
                backgroundColor: activeBotData?.themeColors?.bubbleAgentBgColor,
                color: activeBotData?.themeColors?.bubbleAgentTextColor,
              }}
            >
              <div className="rounded-md overflow-hidden mb-3">
                <img
                  src={
                    product.image != ""
                      ? product.image
                      : "https://image.made-in-china.com/202f0j00vYDGElfRmuko/Customize-9cm-Small-Tea-Spoon-Natural-Bamboo-Spoon.webp"
                  }
                  alt={product.title}
                  className="w-full h-24 object-cover"
                />
              </div>

              <div className="px-1">
                <h2 className="text-xs font-semibold  mb-1">{product.title}</h2>
                <div className="flex justify-between items-center">
                  <span
                    className="text-sm font-semibold"
                    style={{
                      color:
                        activeBotData?.themeColors?.bubbleAgentTimeTextColor,
                    }}
                  >
                    {product.price} {activeBotData?.currency}
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
