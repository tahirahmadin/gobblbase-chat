import React from "react";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";

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
    product: {
      title: string;
      price: number;
      quantity: number;
    };
  };
}

export const OrderSuccessScreen: React.FC<OrderSuccessScreenProps> = ({
  theme,
  onContinueShopping,
  orderDetails,
}) => {
  const { activeBotData } = useBotConfig();

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[80vh]">
      <div
        className="w-full max-w-2xl p-4 rounded-xl"
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
            className="text-sm text-center"
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
            <div className="mb-6 text-left">
              <div
                className="flex justify-between items-center py-2"
                style={{ color: theme.isDark ? "#e0e0e0" : "#333333" }}
              >
                <div className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>
                    {orderDetails.product.quantity}x{" "}
                    {orderDetails.product.title}
                  </span>
                </div>
                <span>
                  {orderDetails.product.price.toFixed(2)}{" "}
                  {activeBotData?.currency}{" "}
                </span>
              </div>
              <p
                className="text-sm mb-2"
                style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
              >
                <span className="mr-2">•</span>
                <strong>Total Amount:</strong> {orderDetails.total}{" "}
                {activeBotData?.currency}
              </p>
              <p
                className="text-sm mb-2"
                style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
              >
                <span className="mr-2">•</span>
                <strong>Payment Id:</strong> {orderDetails.orderId}{" "}
              </p>
              <p
                className="text-sm mb-2"
                style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
              >
                {" "}
                <span className="mr-2">•</span>
                <strong>Payment Method:</strong> {orderDetails.paymentMethod}
              </p>
              <p
                className="text-sm"
                style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
              >
                <span className="mr-2">•</span>
                <strong>Date:</strong> {orderDetails.paymentDate}
              </p>
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
