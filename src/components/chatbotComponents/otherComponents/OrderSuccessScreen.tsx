import React from "react";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";

interface OrderSuccessScreenProps {
  theme: {
    isDark: boolean;
    highlightColor: string;
    mainLightColor: string;
  };
  onContinueShopping: () => void;
  orderDetails: {
    items: Array<{
      title: string;
      quantity: number;
      price: number;
    }>;
    total: number;
    orderId?: string;
    paymentMethod?: string;
    paymentDate?: string;
  };
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  theme,
  onContinueShopping,
  orderDetails,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[80vh]">
      <div
        className="w-full max-w-2xl p-8 rounded-xl"
        style={{
          backgroundColor: theme.isDark ? "#232323" : "#ffffff",
          border: `1px solid ${theme.highlightColor}`,
        }}
      >
        {/* Success Icon and Message */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#4CAF50" }}
          >
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: theme.isDark ? "white" : "black" }}
          >
            Order Successful!
          </h2>
          <p
            className="text-sm"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>

        {/* Order Summary */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: theme.isDark ? "white" : "black" }}
          >
            Order Summary
          </h3>
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              backgroundColor: theme.isDark ? "#1a1a1a" : "#f8f8f8",
            }}
          >
            {orderDetails.items.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-2"
                style={{ color: theme.isDark ? "#e0e0e0" : "#333333" }}
              >
                <div className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>
                    {item.quantity}x {item.title}
                  </span>
                </div>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div
              className="border-t mt-2 pt-2 flex justify-between items-center font-semibold"
              style={{
                borderColor: theme.isDark ? "#333" : "#e0e0e0",
                color: theme.isDark ? "white" : "black",
              }}
            >
              <span>Total</span>
              <span>${orderDetails.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="mb-8">
          <h3
            className="text-lg font-semibold mb-4"
            style={{ color: theme.isDark ? "white" : "black" }}
          >
            Payment Details
          </h3>
          <div
            className="rounded-lg p-4"
            style={{
              backgroundColor: theme.isDark ? "#1a1a1a" : "#f8f8f8",
            }}
          >
            <div
              className="flex justify-between items-center py-2"
              style={{ color: theme.isDark ? "#e0e0e0" : "#333333" }}
            >
              <span>Order ID</span>
              <span>{orderDetails.orderId || "N/A"}</span>
            </div>
            <div
              className="flex justify-between items-center py-2"
              style={{ color: theme.isDark ? "#e0e0e0" : "#333333" }}
            >
              <span>Payment Method</span>
              <span>{orderDetails.paymentMethod || "Credit Card"}</span>
            </div>
            <div
              className="flex justify-between items-center py-2"
              style={{ color: theme.isDark ? "#e0e0e0" : "#333333" }}
            >
              <span>Payment Date</span>
              <span>{orderDetails.paymentDate}</span>
            </div>
          </div>
        </div>

        {/* Call to Action Button */}
        <button
          onClick={onContinueShopping}
          className="w-full py-4 rounded-lg font-medium flex items-center justify-center space-x-2"
          style={{
            backgroundColor: theme.highlightColor,
            color: theme.isDark ? "black" : "white",
          }}
        >
          <ShoppingBag className="h-5 w-5" />
          <span>Continue Shopping</span>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
