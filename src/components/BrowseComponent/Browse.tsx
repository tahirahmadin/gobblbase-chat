import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductDetail from "./ProductDetail";
import Cart from "./Cart";
import { useCartStore } from "../../store/useCartStore";
import { ArrowLeft, Plus, Minus, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  title: string;
  image: string;
  price: string;
  currency: string;
  description: string;
}

interface BrowseProps {
  showCart?: boolean;
  onShowCart?: () => void;
  onOpenDrawer?: () => void;
}

const products: Product[] = [
  {
    id: 1,
    title: "30 Days Instagram Mastery",
    image:
      "https://images.indianexpress.com/2024/09/ankur-warikoo.jpg?resize=600,338",
    price: "20",
    currency: "USD",
    description:
      "Learn how to grow your Instagram following and engagement in just 30 days. Perfect for businesses and influencers.",
  },
  {
    id: 2,
    title: "10 Sessions Physiotherapy",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPUYFT5rbJvOct3cLleq9Haj4REW9ARN5kjA&s",
    price: "49",
    currency: "USD",
    description:
      "Professional physiotherapy sessions to help you recover from injuries and improve mobility.",
  },
  {
    id: 3,
    title: "1 month Personal Training",
    image:
      "https://true-elevate.com/wp-content/uploads/2024/04/360_F_317917629_HjBCyRlH1Hpwwg2HfEbExTdkbyWiGFuN.jpg",
    price: "49",
    currency: "USD",
    description:
      "One-on-one personal training sessions to help you achieve your fitness goals.",
  },
  {
    id: 4,
    title: "Personal Finance Ebook",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?ixlib=rb-4.0.3",
    price: "49",
    currency: "USD",
    description:
      "Comprehensive guide to managing your personal finances and building wealth.",
  },
];

const Browse: React.FC<BrowseProps> = ({
  showCart = false,
  onShowCart,
  onOpenDrawer,
}) => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const {
    items,
    addItem,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      for (let i = 0; i < quantity; i++) {
        addItem(selectedProduct);
      }
      setSelectedProduct(null);
      setQuantity(1);
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

  const handleRemoveFromCart = (productId: number) => {
    removeItem(productId);
  };

  const handleCheckout = () => {
    // Here you would typically integrate with a payment processor
    alert("Proceeding to checkout...");
    clearCart();
    if (onShowCart) {
      onShowCart();
    }
  };

  if (selectedProduct) {
    return (
      <div className="container py-4">
        <div className="flex items-center space-x-2 mb-6">
          <button
            onClick={() => setSelectedProduct(null)}
            className="text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">Product Details</h2>
        </div>

        <div className="bg-white rounded-lg p-4 mb-6">
          <img
            src={selectedProduct.image}
            alt={selectedProduct.title}
            className="w-full h-48 object-cover rounded-md mb-4"
          />
          <h3 className="text-lg font-medium mb-2">{selectedProduct.title}</h3>
          <p className="text-gray-600 mb-4">{selectedProduct.description}</p>
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">
              {selectedProduct.currency} {selectedProduct.price}
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
            onClick={handleAddToCart}
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>Add to Cart ({quantity})</span>
          </button>
        </div>
      </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
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
                  {product.currency} {product.price}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;
