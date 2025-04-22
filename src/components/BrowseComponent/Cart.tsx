import React from "react";
import {
  X,
  ShoppingCart,
  ArrowLeft,
  Plus,
  Minus,
  CreditCard,
} from "lucide-react";
import { useCartStore } from "../../store/useCartStore";
import { CartProps } from "../../types/cart";

const Cart: React.FC<CartProps> = ({
  items,
  onRemoveItem,
  onCheckout,
  totalItems,
  totalPrice,
  onBack,
  onOpenDrawer,
}) => {
  const { updateQuantity } = useCartStore();

  const handleIncrement = (productId: string, currentQuantity: number) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const handleDecrement = (productId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    }
  };

  return (
    <div className="container py-4">
      <div className="flex items-center space-x-2 mb-6">
        <button onClick={onBack} className="text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold">Your Cart</h2>
      </div>

      <div className="bg-white rounded-lg p-4 mb-6">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-12 object-cover rounded-md"
                />
                <div>
                  <h4 className="text-sm font-medium">{item.title}</h4>
                  <p className="text-xs text-gray-500">
                    {item.currency} {item.price} x {item.quantity}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDecrement(item.id, item.quantity)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm">{item.quantity}</span>
                <button
                  onClick={() => handleIncrement(item.id, item.quantity)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemoveItem(item.id)}
                  className="p-1 rounded-full hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total</span>
            <span className="text-lg font-semibold">
              AED {totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={onCheckout}
        className="w-full bg-orange-500 text-white py-3 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
      >
        <CreditCard className="h-5 w-5" />
        <span>Proceed to Payment</span>
      </button>
    </div>
  );
};

export default Cart;
