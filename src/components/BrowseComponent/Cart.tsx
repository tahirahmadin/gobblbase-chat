import React, { useState } from "react";
import { X, ShoppingCart, ArrowLeft, Plus, Minus } from "lucide-react";
import Payment from "./Payment";
import { useCartStore } from "../../store/useCartStore";

interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  currency: string;
  description: string;
  quantity: number;
}

interface CartProps {
  items: Product[];
  onRemoveItem: (productId: number) => void;
  onCheckout: () => void;
  totalItems: number;
  totalPrice: number;
  onBack: () => void;
  onOpenDrawer?: () => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  onRemoveItem,
  onCheckout,
  totalItems,
  totalPrice,
  onBack,
  onOpenDrawer,
}) => {
  const [showPayment, setShowPayment] = useState(false);
  const { updateQuantity } = useCartStore();

  const handleIncrement = (productId: number, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: number, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity - 1);
  };

  if (showPayment) {
    return (
      <Payment
        onBack={() => setShowPayment(false)}
        onOpenDrawer={onOpenDrawer}
      />
    );
  }

  return (
    <div className="container py-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
        </div>
        <div className="flex items-center space-x-2">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-sm font-medium">{totalItems} items</span>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-white p-3 rounded-md"
          >
            <div className="flex items-center space-x-3">
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-12 object-cover rounded-md"
              />
              <div>
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="text-xs text-gray-500">
                  {item.currency} {item.price}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecrement(item.id, item.quantity)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="text-sm font-medium">{item.quantity}</span>
                <button
                  onClick={() => handleIncrement(item.id, item.quantity)}
                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium">Total</span>
            <span className="text-lg font-semibold">
              USD {totalPrice.toFixed(2)}
            </span>
          </div>
          <button
            onClick={() => setShowPayment(true)}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            Proceed to Checkout
          </button>
        </div>
      )}

      {items.length === 0 && (
        <div className="text-center py-8">
          <ShoppingCart className="h-12 w-12 mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Your cart is empty</p>
        </div>
      )}
    </div>
  );
};

export default Cart;
