import React, { useState, useEffect, useMemo } from "react";
import { useCartStore } from "../../store/useCartStore";
import { useUserStore } from "../../store/useUserStore";
import { Product, Theme } from "../../types";
import { ChevronRight, ChevronLeft, CreditCard, Wallet } from "lucide-react";
import toast from "react-hot-toast";

interface ChatProductDisplayProps {
  theme: Theme;
  currentConfig?: {
    agentId?: string;
    name?: string;
    sessionName?: string;
    sessionPrice?: string;
    isFreeSession?: boolean;
  };
  messageId: string;
  setActiveScreen?: (screen: "about" | "chat" | "browse") => void;
}

// List of countries for shipping form
const countries = [
  "United States",
  "United Kingdom",
  "United Arab Emirates",
  "India",
  "Canada",
  "Australia",
];

export default function ChatProductDisplay({
  theme,
  currentConfig,
  messageId,
  setActiveScreen,
}: ChatProductDisplayProps) {
  // Get products from cart store
  const { products, getProductsInventory } = useCartStore();
  const { isLoggedIn } = useUserStore();
  
  // Local state - completely independent from the global state
  const [localSelectedProduct, setLocalSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [view, setView] = useState<'grid' | 'detail' | 'shipping' | 'payment' | 'success'>('grid');
  const [viewMore, setViewMore] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  // Shipping form state
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

  // Fetch products when the component mounts
  useEffect(() => {
    if (currentConfig?.agentId) {
      getProductsInventory(currentConfig.agentId);
    }
  }, [currentConfig?.agentId, getProductsInventory]);

  // Product grid handlers
  const handleProductClick = (product: Product) => {
    setLocalSelectedProduct(product);
    setCurrentImageIndex(0);
    setQuantity(1);
    setView('detail');
  };

  const handleBack = () => {
    if (view === 'shipping') {
      setView('detail');
    } else if (view === 'payment') {
      setView('shipping');
    } else if (view === 'success') {
      setView('grid');
      setLocalSelectedProduct(null);
    } else if (view === 'detail') {
      setView('grid');
      setLocalSelectedProduct(null);
    } else {
      setView('grid');
      setLocalSelectedProduct(null);
    }
  };

  // Buy Now handler - will take user to shipping details
  const handleBuyNow = () => {
    if (localSelectedProduct) {
      setView('shipping');
    }
  };

  // Shipping form handlers
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
    setView('payment');
  };

  const handleCompletePurchase = () => {
    if (localSelectedProduct) {
      setOrderDetails({
        product: localSelectedProduct,
        total: localSelectedProduct.price * quantity,
        orderId: 'ORD-' + Math.floor(Math.random() * 1000000),
        paymentMethod: "Credit Card",
        paymentDate: new Date().toLocaleDateString()
      });
      setView('success');
    }
  };

  const handleContinueShopping = () => {
    setView('grid');
    setLocalSelectedProduct(null);
    setOrderDetails(null);
    
    // Reset shipping form
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

  // Image navigation handlers
  const handlePreviousImage = () => {
    if (localSelectedProduct?.images && localSelectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? localSelectedProduct.images.length - 1 : prev - 1
      );
    }
  };

  const handleNextImage = () => {
    if (localSelectedProduct?.images && localSelectedProduct.images.length > 0) {
      setCurrentImageIndex((prev) =>
        prev === localSelectedProduct.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const toggleViewMore = () => {
    setViewMore(!viewMore);
  };

  // Common styling variables for consistent UI
  const sectionPadding = "px-4";
  const titleSize = "text-md";
  const subtitleSize = "text-sm";
  const textSize = "text-xs leading-tight";
  const buttonSize = "text-xs py-1.5 px-4";
  const borderWidth = "w-10";
  const inputBgColor = theme.mainLightColor;
  const inputTextColor = !theme.isDark ? "#fff" : "#000";

  // Rendering functions for each view
  const renderProductDetails = () => {
    if (!localSelectedProduct) return null;
    
    // Sizes for the chat mode
    const imageSize = "w-36 h-36";

    // Extra fields based on product type
    let extraFields = null;
    
    if (localSelectedProduct.type === "physical") {
      extraFields = (
        <div className="flex flex-row justify-between gap-2 py-2">
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              SELECT SIZE
            </div>
            <button
              className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold"
              style={{
                color: theme.highlightColor,
              }}
            >
              One Size
            </button>
          </div>
          <div>
            <div className="text-xs font-semibold mb-1 text-left">
              SELECT QUANTITY
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold bg-[#232323]"
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "#fff" : "#000000",
                }}
              >
                -
              </button>
              <span
                className="px-3 py-1 rounded-full border border-[#fff] text-xs font-semibold "
                style={{
                  backgroundColor: theme.mainLightColor,
                  color: !theme.isDark ? "#fff" : "#000000",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-2 py-1 rounded-full border border-[#fff] text-lg font-bold "
                style={{
                  backgroundColor: theme.highlightColor,
                  color: !theme.isDark ? "#fff" : "#000000",
                }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div
          className="rounded-xl w-full relative mt-1"
          style={{
            color: "#fff",
          }}
        >
          <div className="flex items-center justify-between pt-2">
            {/* Back Button */}
            <button
              className="flex items-center gap-1"
              style={{ color: theme.highlightColor }}
              onClick={handleBack}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back</span>
            </button>
            {/* Category */}
            <div className="text-xs font-semibold px-4 pb-2 opacity-70 text-center">
              {localSelectedProduct?.category}
            </div>
          </div>
          {/* Image and navigation */}
          <div className="relative flex items-center justify-center">
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
              onClick={handlePreviousImage}
              disabled={
                !localSelectedProduct?.images || localSelectedProduct.images.length <= 1
              }
              style={{
                opacity:
                  !localSelectedProduct?.images || localSelectedProduct.images.length <= 1
                    ? 0.3
                    : 1,
              }}
            >
              <ChevronLeft className="w-6 h-6 text-[#7a4fff]" />
            </button>
            <img
              src={
                localSelectedProduct?.images?.[currentImageIndex] ||
                "/placeholder-image.png"
              }
              alt={localSelectedProduct?.title || "Product"}
              className={`${imageSize} object-contain mx-auto rounded-xl`}
              style={{ background: "#fff" }}
            />
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none"
              onClick={handleNextImage}
              disabled={
                !localSelectedProduct?.images || localSelectedProduct.images.length <= 1
              }
              style={{
                opacity:
                  !localSelectedProduct?.images || localSelectedProduct.images.length <= 1
                    ? 0.3
                    : 1,
              }}
            >
              <ChevronRight className="w-6 h-6 text-[#7a4fff]" />
            </button>
            {localSelectedProduct?.images && localSelectedProduct.images.length > 1 && (
              <div className="absolute bottom-2 flex gap-1">
                {localSelectedProduct.images.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1 h-1 rounded-full ${
                      index === currentImageIndex ? "bg-[#7a4fff]" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Product Info */}
          <div className={`${sectionPadding} pt-3 pb-2 text-center`}>
            <div className={`${titleSize} font-semibold mb-1`}>
              {localSelectedProduct?.title || "Product Name"}
            </div>
            <div className={`${borderWidth} mx-auto border-b-4 border-[#fff] mb-2 opacity-90`} />
            <div className={`${textSize} mb-2 text-left opacity-90`}>
              {localSelectedProduct?.description || "Product description"}
            </div>
            
            {extraFields}
            
            <div className="flex flex-row justify-between items-center py-1">
              <div className="flex flex-col justify-between items-start mt-2 mb-1">
                <div className="text-xs opacity-70 text-left">TOTAL COST</div>
                <div className="text-sm font-bold">
                  {localSelectedProduct?.priceType === "paid"
                    ? `$${localSelectedProduct?.price ?? 0}`
                    : "FREE"}
                </div>
              </div>
              <button
                className={`w-fit ${buttonSize} rounded-full font-bold`}
                style={{
                  backgroundColor: theme.highlightColor,
                  color: "#222",
                }}
                onClick={handleBuyNow}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render shipping form - styled similar to product details
  const renderShipping = () => {
    if (!localSelectedProduct) return null;

    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div
          className="rounded-xl w-full relative mt-1"
          style={{
            color: "#fff",
          }}
        >
          {/* Header with back button */}
          <div className="flex items-center justify-between pt-2">
            <button
              className="flex items-center gap-1"
              style={{ color: theme.highlightColor }}
              onClick={handleBack}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back</span>
            </button>
            <div className="text-xs font-semibold px-4 pb-2 opacity-70 text-center">
              Shipping Details
            </div>
          </div>

          {/* Shipping Content */}
          <div className={`${sectionPadding} pt-2 pb-3`}>
            {/* Title and divider */}
            <div className={`${titleSize} font-semibold mb-1 text-center`}>
              {localSelectedProduct?.title || "Product Name"}
            </div>
            <div className={`${borderWidth} mx-auto border-b-4 border-[#fff] mb-3 opacity-90`} />

            {/* Order summary */}
            <div className="bg-opacity-10 bg-white p-2 rounded-lg mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className={`${textSize}`}>
                  {localSelectedProduct.title} x {quantity}
                </div>
                <div className={`${textSize} font-medium`}>
                  ${localSelectedProduct.price * quantity}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className={`${textSize} font-medium`}>
                  Total Amount
                </div>
                <div className={`${subtitleSize} font-bold`} style={{ color: "#FFD700" }}>
                  ${localSelectedProduct.price * quantity}
                </div>
              </div>
            </div>

            {/* Shipping form */}
            <div className="space-y-2">
              <div className="mb-3">
                <div className={`${textSize} font-medium mb-1`}>Shipping Address</div>
                
                <div className="space-y-2">
                  <div className="mb-2">
                    <div className="text-xs font-semibold mb-1 text-left">FULL NAME</div>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={shipping.name}
                      onChange={handleShippingChange}
                      className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-xs font-semibold mb-1 text-left">EMAIL</div>
                    <input
                      type="email"
                      name="email"
                      placeholder="Your email address"
                      value={shipping.email}
                      onChange={handleShippingChange}
                      className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    />
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-xs font-semibold mb-1 text-left">PHONE</div>
                    <div className="flex gap-2">
                      <select
                        name="phoneCode"
                        className="w-20 p-2 rounded-lg text-xs"
                        style={{
                          backgroundColor: inputBgColor,
                          color: inputTextColor,
                        }}
                      >
                        <option>+1</option>
                        <option>+44</option>
                        <option>+91</option>
                        <option>+971</option>
                      </select>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        className="flex-1 p-2 rounded-lg placeholder:text-gray-400 text-xs"
                        style={{
                          backgroundColor: inputBgColor,
                          color: inputTextColor,
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-xs font-semibold mb-1 text-left">COUNTRY</div>
                    <select
                      name="country"
                      value={shipping.country}
                      onChange={handleShippingChange}
                      className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    >
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mb-2">
                    <div className="text-xs font-semibold mb-1 text-left">ADDRESS</div>
                    <input
                      type="text"
                      name="address1"
                      placeholder="Address Line 1"
                      value={shipping.address1}
                      onChange={handleShippingChange}
                      className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs mb-2"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    />
                    <input
                      type="text"
                      name="address2"
                      placeholder="Address Line 2 (Optional)"
                      value={shipping.address2}
                      onChange={handleShippingChange}
                      className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                      style={{
                        backgroundColor: inputBgColor,
                        color: inputTextColor,
                      }}
                    />
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <div className="flex-1">
                      <div className="text-xs font-semibold mb-1 text-left">CITY</div>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={shipping.city}
                        onChange={handleShippingChange}
                        className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                        style={{
                          backgroundColor: inputBgColor,
                          color: inputTextColor,
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-semibold mb-1 text-left">ZIP</div>
                      <input
                        type="text"
                        name="zipcode"
                        placeholder="ZIP Code"
                        value={shipping.zipcode}
                        onChange={handleShippingChange}
                        className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                        style={{
                          backgroundColor: inputBgColor,
                          color: inputTextColor,
                        }}
                      />
                    </div>
                  </div>
                  
                  <label className="flex items-center gap-2 mb-3">
                    <input
                      type="checkbox"
                      name="saveDetails"
                      checked={shipping.saveDetails}
                      onChange={handleShippingChange}
                      className="accent-[#7a4fff]"
                    />
                    <span className="text-xs">
                      Save my details for next time
                    </span>
                  </label>
                </div>
              </div>
              
              <div className="flex flex-row justify-end">
                <button
                  type="button"
                  onClick={handleContinueToPayment}
                  className={`w-full ${buttonSize} rounded-full font-bold`}
                  style={{
                    backgroundColor: theme.highlightColor,
                    color: "#222",
                  }}
                >
                  Continue to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render payment form - styled like product details
  const renderPayment = () => {
    if (!localSelectedProduct) return null;

    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div
          className="rounded-xl w-full relative mt-1"
          style={{
            color: "#fff",
          }}
        >
          {/* Header with back button */}
          <div className="flex items-center justify-between pt-2">
            <button
              className="flex items-center gap-1"
              style={{ color: theme.highlightColor }}
              onClick={handleBack}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back</span>
            </button>
            <div className="text-xs font-semibold px-4 pb-2 opacity-70 text-center">
              Payment Details
            </div>
          </div>

          {/* Payment Content */}
          <div className={`${sectionPadding} pt-2 pb-3`}>
            {/* Title and divider */}
            <div className={`${titleSize} font-semibold mb-1 text-center`}>
              {localSelectedProduct?.title || "Product Name"}
            </div>
            <div className={`${borderWidth} mx-auto border-b-4 border-[#fff] mb-3 opacity-90`} />

            {/* Order summary */}
            <div className="bg-opacity-10 bg-white p-2 rounded-lg mb-3">
              <div className="flex justify-between items-center mb-1">
                <div className={`${textSize}`}>
                  {localSelectedProduct.title} x {quantity}
                </div>
                <div className={`${textSize} font-medium`}>
                  ${localSelectedProduct.price * quantity}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className={`${textSize} font-medium`}>
                  Total Amount
                </div>
                <div className={`${subtitleSize} font-bold`} style={{ color: "#FFD700" }}>
                  ${localSelectedProduct.price * quantity}
                </div>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="mb-3">
              <div className={`${textSize} font-medium mb-2`}>Payment Method</div>
              <div className="flex gap-2 mb-3">
                <button
                  className="flex-1 p-2 rounded-lg flex items-center justify-center gap-2 bg-yellow-500 text-black text-xs"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Credit Card</span>
                </button>
              </div>
            </div>
            
            {/* Payment card details */}
            <div className="space-y-2 mb-3">
              <div className="mb-2">
                <div className="text-xs font-semibold mb-1 text-left">CARD NUMBER</div>
                <input
                  type="text"
                  placeholder="4242 4242 4242 4242"
                  className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                  }}
                />
              </div>
              
              <div className="mb-2">
                <div className="text-xs font-semibold mb-1 text-left">NAME ON CARD</div>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                  style={{
                    backgroundColor: inputBgColor,
                    color: inputTextColor,
                  }}
                />
              </div>
              
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-xs font-semibold mb-1 text-left">EXPIRY</div>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                    }}
                  />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold mb-1 text-left">CVC</div>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full p-2 rounded-lg placeholder:text-gray-400 text-xs"
                    style={{
                      backgroundColor: inputBgColor,
                      color: inputTextColor,
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex flex-row justify-end">
              <button
                onClick={handleCompletePurchase}
                className={`w-full ${buttonSize} rounded-full font-bold`}
                style={{
                  backgroundColor: theme.highlightColor,
                  color: "#222",
                }}
              >
                Complete Purchase
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render success screen - styled like product details
  const renderOrderSuccess = () => {
    if (!orderDetails) return null;

    return (
      <div className="flex flex-col items-center justify-center w-full">
        <div
          className="rounded-xl w-full relative mt-1"
          style={{
            color: "#fff",
          }}
        >
          {/* Success Content */}
          <div className={`${sectionPadding} pt-4 pb-3 text-center`}>
            {/* Success icon */}
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
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
            
            {/* Title and divider */}
            <div className={`${titleSize} font-semibold mb-1`}>
              Order Successful!
            </div>
            <div className={`${borderWidth} mx-auto border-b-4 border-[#fff] mb-2 opacity-90`} />
            
            <div className={`${textSize} mb-3 text-center opacity-90`}>
              Thank you for your purchase. Your order has been confirmed.
            </div>
            
            {/* Order details */}
            <div className="bg-opacity-10 bg-white p-3 rounded-lg mb-4 text-left">
              <div
                className="flex justify-between items-center py-1 border-b border-white border-opacity-10 mb-2"
              >
                <div className="flex items-center">
                  <span className="mr-2">•</span>
                  <span className="text-xs">{quantity}x {orderDetails.product.title}</span>
                </div>
                <span className="text-xs">${(orderDetails.product.price * quantity).toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className="text-xs">
                  <span className="opacity-70">Order ID:</span>
                </div>
                <div className="text-xs text-right">
                  {orderDetails.orderId}
                </div>
                
                <div className="text-xs">
                  <span className="opacity-70">Product:</span>
                </div>
                <div className="text-xs text-right">
                  {orderDetails.product.title}
                </div>
                
                <div className="text-xs">
                  <span className="opacity-70">Total Amount:</span>
                </div>
                <div className="text-xs text-right font-semibold" style={{ color: "#FFD700" }}>
                  ${orderDetails.total}
                </div>
                
                <div className="text-xs">
                  <span className="opacity-70">Payment Method:</span>
                </div>
                <div className="text-xs text-right">
                  {orderDetails.paymentMethod}
                </div>
                
                <div className="text-xs">
                  <span className="opacity-70">Date:</span>
                </div>
                <div className="text-xs text-right">
                  {orderDetails.paymentDate}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleContinueShopping}
              className={`w-full ${buttonSize} rounded-full font-bold`}
              style={{
                backgroundColor: theme.highlightColor,
                color: "#222",
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render product grid
  const renderProductGrid = () => {
    const displayProducts = viewMore ? products : products?.slice(0, 4);
    
    return (
      <div className="p-3">
        <div className="grid grid-cols-2 gap-3">
          {displayProducts.map((product) => (
            <div
            key={`${messageId}-${product._id}`}
            className="rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow bg-[#121212]"
            onClick={() => handleProductClick(product)}
            style={{
              backgroundColor: theme.isDark ? "#121212" : "#f5f5f5",
            }}
          >
            <div className="relative">
              <img
                src={product.images?.[0] || "/placeholder-image.png"}
                alt={product.title}
                className="w-full h-32 object-cover"
              />
              {product.category && (
                <div 
                  className="absolute top-2 right-2 bg-black/60 text-white text-xs py-0.5 px-2 rounded-full"
                  style={{ color: theme.highlightColor }}
                >
                  {product.category}
                </div>
              )}
            </div>
            <div className="p-2 text-center">
              <h3 className="text-sm font-medium mb-1 truncate" style={{ color: theme.isDark ? "white" : "black" }}>
                {product.title}
              </h3>
              <div className="flex justify-between items-center">
                <span
                  className="text-sm font-medium"
                  style={{ color: theme.highlightColor }}
                >
                  ${product.price}
                </span>
                <div 
                  className="flex items-center text-xs"
                  style={{ color: theme.highlightColor }}
                >
                  View <ChevronRight size={12} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {products.length > 4 && (
        <div className="text-center mt-3 mb-1">
          <button 
            className="text-xs py-1.5 px-4 rounded-full"
            style={{
              backgroundColor: theme.mainDarkColor,
              color: theme.isDark ? "white" : "black",
            }}
            onClick={toggleViewMore}
          >
            {viewMore ? "Show Less" : `View All ${products.length} Products`}
          </button>
        </div>
      )}
    </div>
  );
};

// Check for empty products
const hasProducts = products && products.length > 0;
if (!hasProducts) {
  return (
    <div 
      className="w-full p-4 rounded-lg" 
      style={{ 
        backgroundColor: theme.isDark ? "black" : "white",
        color: theme.isDark ? "white" : "black"
      }}
    >
      <div className="text-center py-4 px-2">
        <p className="text-md font-medium mb-2">No products available</p>
        <p className="text-sm opacity-80">Our product catalog is currently empty. Please check back later.</p>
      </div>
    </div>
  );
}

// Main render based on current view
return (
  <div 
    className="w-full rounded-lg overflow-hidden" 
    style={{ 
      backgroundColor: theme.isDark ? "black" : "white",
      color: theme.isDark ? "white" : "black"
    }}
  >
    {view === 'success' ? renderOrderSuccess() : 
     view === 'payment' ? renderPayment() :
     view === 'shipping' ? renderShipping() :
     view === 'detail' ? renderProductDetails() : 
     renderProductGrid()}
  </div>
);
}