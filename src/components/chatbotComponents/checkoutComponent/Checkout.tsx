import React, { useState } from "react";
import { useCartStore } from "../../../store/useCartStore";
import { useBotConfig } from "../../../store/useBotConfig";
import { useUserStore } from "../../../store/useUserStore";
import toast from "react-hot-toast";
import { LoginCard } from "../otherComponents/LoginCard";
import { OrderSuccessScreen } from "../otherComponents/OrderSuccessScreen";
import { Cross, CrossIcon, X } from "lucide-react";
import { PaymentSection } from "./PaymentSection";

interface CheckoutProps {
  theme: any;
  onBack: () => void;
  setActiveScreen: (screen: "chat" | "book" | "browse") => void;
}

const countries = [
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "India",
  "Canada",
  "Australia",
];

export function Checkout({ theme, onBack }: CheckoutProps) {
  const { selectedProduct, setCartView, setSelectedProduct } = useCartStore();
  const [step, setStep] = useState<1 | 2>(1);
  const [shipping, setShipping] = useState({
    name: "",
    email: "",
    phone: "",
    country: "United States",
    address1: "",
    address2: "",
    city: "",
    zipcode: "",
    saveDetails: false,
  });
  const { isLoggedIn } = useUserStore();
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState<{
    product: any;
    items: { title: string; quantity: number; price: number }[];
    total: number;
    orderId?: string;
    paymentMethod?: string;
    paymentDate?: string;
  } | null>(null);

  const handleShippingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setShipping((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleContinueToPayment = () => {
    if (!isLoggedIn) {
      toast.error("Please log in to continue with payment");
      return;
    }
    setStep(2);
  };

  const handleContinueShopping = () => {
    setIsSuccess(false);
    setOrderDetails(null);
    setStep(1);
    setCartView(false);
    setSelectedProduct(null);
    setShipping({
      name: "",
      email: "",
      phone: "",
      country: "United States",
      address1: "",
      address2: "",
      city: "",
      zipcode: "",
      saveDetails: false,
    });
  };

  const handleOrderDetails = (details: {
    product: any;
    total: number;
    orderId?: string;
    paymentMethod?: string;
    paymentDate?: string;
  }) => {
    setOrderDetails({
      ...details,
      items: [
        {
          title: details.product.title,
          quantity: details.product.quantity || 1,
          price: details.product.price,
        },
      ],
    });
  };

  if (isSuccess && orderDetails) {
    return (
      <OrderSuccessScreen
        theme={theme}
        onContinueShopping={handleContinueShopping}
        orderDetails={orderDetails}
      />
    );
  }

  return (
    <div
      className="flex flex-col "
      style={{ backgroundColor: theme.isDark ? "#1c1c1c" : "#ffffff" }}
    >
      {/* Header */}
      <div
        className="p-4 border-b"
        style={{ borderColor: theme.isDark ? "#333" : "#eee" }}
      >
        <button
          onClick={onBack}
          className="flex items-center text-sm"
          style={{ color: theme.isDark ? "#fff" : "#000" }}
        >
          <span>‹BACK</span>
        </button>
      </div>

      {!isLoggedIn ? (
        <LoginCard theme={theme} />
      ) : !selectedProduct ? (
        <div className="flex flex-col items-center justify-center p-8 min-h-[60vh]">
          <div
            className="w-full max-w-md p-8 rounded-xl text-center"
            style={{
              backgroundColor: theme.isDark ? "#232323" : "#f3f3f3",
              border: `1px solid ${theme.highlightColor}`,
            }}
          >
            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: theme.isDark ? "white" : "black" }}
            >
              No Product Selected
            </h2>
            <p
              className="text-sm mb-6"
              style={{ color: theme.isDark ? "#e0e0e0" : "#666666" }}
            >
              Please select a product to proceed with checkout
            </p>
            <button
              onClick={handleContinueShopping}
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
      ) : (
        <div className="flex flex-col h-full">
          {/* Order Summary */}
          <div className="p-4 h-full">
            <div className="flex justify-between items-center mb-4">
              <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                {selectedProduct.quantity || 1}x {selectedProduct.title}
              </div>
              <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                ${selectedProduct.price * (selectedProduct.quantity || 1)}
              </div>
            </div>
            <div className="flex justify-between items-center mb-4 font-bold">
              <div style={{ color: theme.isDark ? "#fff" : "#000" }}>
                Total Amount
              </div>
              <div style={{ color: "#FFD700" }}>
                ${selectedProduct.price * (selectedProduct.quantity || 1)}
              </div>
            </div>
          </div>

          {/* Form Steps */}
          {step === 1 ? (
            <div className="p-4 h-full">
              <h3 className="mb-4" style={{ color: theme.mainLightColor }}>
                Shipping Address
              </h3>
              <form className="space-y-2 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <label
                    className="min-w-[90px] text-sm font-medium"
                    style={{ color: theme.isDark ? "#fff" : "#000" }}
                  >
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="NAME"
                    value={shipping.name}
                    onChange={handleShippingChange}
                    className="flex-1 p-2 rounded-lg placeholder:text-gray-400"
                    style={{
                      backgroundColor: theme.mainLightColor,
                      color: !theme.isDark ? "#fff" : "#000",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    className="min-w-[90px] text-sm font-medium"
                    style={{ color: theme.isDark ? "#fff" : "#000" }}
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="EMAIL"
                    value={shipping.email}
                    onChange={handleShippingChange}
                    className="flex-1 p-2 rounded-lg placeholder:text-gray-400"
                    style={{
                      backgroundColor: theme.mainLightColor,
                      color: !theme.isDark ? "#fff" : "#000",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    className="min-w-[90px] text-sm font-medium"
                    style={{ color: theme.isDark ? "#fff" : "#000" }}
                  >
                    PHONE
                  </label>
                  <select
                    name="phone"
                    className="w-15 p-2 rounded-lg"
                    style={{
                      backgroundColor: theme.mainLightColor,
                      color: !theme.isDark ? "#fff" : "#000",
                    }}
                  >
                    <option>+971</option>
                  </select>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="PHONE"
                    value={shipping.phone}
                    onChange={handleShippingChange}
                    className="flex-1 p-2 rounded-lg placeholder:text-gray-400 w-12"
                    style={{
                      backgroundColor: theme.mainLightColor,
                      color: !theme.isDark ? "#fff" : "#000",
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    className="min-w-[90px] text-sm font-medium"
                    style={{ color: theme.isDark ? "#fff" : "#000" }}
                  >
                    COUNTRY
                  </label>
                  <select
                    name="country"
                    value={shipping.country}
                    onChange={handleShippingChange}
                    className="flex-1 p-2 rounded-lg placeholder:text-gray-400"
                    style={{
                      backgroundColor: theme.mainLightColor,
                      color: !theme.isDark ? "#fff" : "#000",
                    }}
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="gap-2 mb-2">
                  <label
                    className="min-w-[90px] text-sm font-medium"
                    style={{ color: theme.isDark ? "#fff" : "#000" }}
                  >
                    ADDRESS
                  </label>
                  <div className="flex-1 flex flex-col gap-2 mt-2">
                    <input
                      type="text"
                      name="address1"
                      placeholder="Address Line 1"
                      value={shipping.address1}
                      onChange={handleShippingChange}
                      className="p-2 rounded-lg placeholder:text-gray-400"
                      style={{
                        backgroundColor: theme.mainLightColor,
                        color: !theme.isDark ? "#fff" : "#000",
                      }}
                    />
                    <input
                      type="text"
                      name="address2"
                      placeholder="Address Line 2"
                      value={shipping.address2}
                      onChange={handleShippingChange}
                      className="p-2 rounded-lg placeholder:text-gray-400"
                      style={{
                        backgroundColor: theme.mainLightColor,
                        color: !theme.isDark ? "#fff" : "#000",
                      }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1">
                    <label
                      className="min-w-[90px] text-sm font-medium"
                      style={{ color: theme.isDark ? "#fff" : "#000" }}
                    >
                      CITY
                    </label>
                    <input
                      type="text"
                      name="city"
                      placeholder="CITY"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      className="flex-1 p-2 rounded-lg placeholder:text-gray-400 w-full"
                      style={{
                        backgroundColor: theme.mainLightColor,
                        color: !theme.isDark ? "#fff" : "#000",
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      className="min-w-[90px] text-sm font-medium ml-2"
                      style={{ color: theme.isDark ? "#fff" : "#000" }}
                    >
                      ZIPCODE
                    </label>
                    <input
                      type="text"
                      name="zipcode"
                      placeholder="ZIPCODE"
                      value={shipping.zipcode}
                      onChange={handleShippingChange}
                      className="flex-1 p-2 rounded-lg placeholder:text-gray-400 w-full"
                      style={{
                        backgroundColor: theme.mainLightColor,
                        color: !theme.isDark ? "#fff" : "#000",
                      }}
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="saveDetails"
                    checked={shipping.saveDetails}
                    onChange={handleShippingChange}
                  />
                  <span style={{ color: theme.isDark ? "#fff" : "#000" }}>
                    Save for my details for next time
                  </span>
                </label>
                <button
                  onClick={handleContinueToPayment}
                  className="w-full p-3 rounded font-medium"
                  style={{
                    backgroundColor: "#FFD700",
                    color: "#000",
                  }}
                >
                  {selectedProduct.priceType === "free"
                    ? "PROCEED"
                    : "CONTINUE TO PAYMENT"}
                </button>
              </form>
            </div>
          ) : (
            <PaymentSection
              theme={theme}
              onSuccess={() => setIsSuccess(true)}
              onOrderDetails={handleOrderDetails}
              product={selectedProduct}
              shipping={shipping}
            />
          )}
        </div>
      )}
    </div>
  );
}
