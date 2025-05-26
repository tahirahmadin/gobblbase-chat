import React from "react";
import { useBotConfig } from "../../../store/useBotConfig";

interface OrderSuccessScreenProps {
  theme: any;
  onContinueShopping: () => void;
  orderDetails: {
    product: {
      title: string;
      price: number;
      // ...other fields
    };
    total: number;
    orderId?: string;
    paymentMethod?: string;
    paymentDate?: string;
  };
}

export function OrderSuccessScreen({
  theme,
  onContinueShopping,
  orderDetails,
}: OrderSuccessScreenProps) {
  const { activeBotData } = useBotConfig();
  return (
    <div
      className="flex flex-col items-center justify-center p-8 min-h-[60vh]"
      style={{ backgroundColor: theme.isDark ? "#1c1c1c" : "#ffffff" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-xl text-center"
        style={{
          backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
          border: `1px solid ${theme.highlightColor}`,
        }}
      >
        <div
          className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: theme.highlightColor }}
        >
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: theme.isDark ? "white" : "black" }}
        >
          Order Successful!
        </h2>
        <p
          className="text-sm mb-6"
          style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
        >
          Thank you for your purchase. Your order has been confirmed.
        </p>
        <div className="mb-6 text-left">
          <div
            className="flex justify-between items-center py-2"
            style={{ color: theme.isDark ? "#e0e0e0" : "#333333" }}
          >
            <div className="flex items-center">
              <span className="mr-2">•</span>
              <span>1x {orderDetails.product.title}</span>
            </div>
            <span>${orderDetails.product.price.toFixed(2)}</span>
          </div>
          <p
            className="text-sm mb-2"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            <strong>Order ID:</strong> {orderDetails.orderId}
          </p>
          <p
            className="text-sm mb-2"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            <strong>Product:</strong> {orderDetails.product.title}
          </p>
          <p
            className="text-sm mb-2"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            <strong>Total Amount:</strong> {orderDetails.total}
            {activeBotData?.currency}
          </p>
          <p
            className="text-sm mb-2"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            <strong>Payment Method:</strong> {orderDetails.paymentMethod}
          </p>
          <p
            className="text-sm"
            style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
          >
            <strong>Date:</strong> {orderDetails.paymentDate}
          </p>
        </div>
        <button
          onClick={onContinueShopping}
          className="w-full py-3 rounded-lg font-medium"
          style={{
            backgroundColor: theme.highlightColor,
            color: theme.isDark ? "black" : "white",
          }}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
