import React, { useState, useEffect } from "react";
import {
  Plus,
  Image as ImageIcon,
  X,
  Loader2,
  Pencil,
  ArrowLeft,
  Package,
  CreditCard,
  Receipt,
  Check,
} from "lucide-react";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  updateProductImage,
  updateStripeAccountIdCurrency,
  getTransactions,
} from "../lib/serverActions";
import { toast } from "react-hot-toast";
import { useBotConfig } from "../store/useBotConfig";

interface Product {
  _id?: string;
  title: string;
  image: string;
  price: string;
  currency: string;
  description: string;
  about?: string;
  stock: number;
  sold: number;
}

interface SubTab {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface TransactionItem {
  id: string;
  title: string;
  image: string;
  price: number;
  currency: string;
  quantity: number;
  description: string;
}

const Products: React.FC = () => {
  const { activeBotId, fetchBotData, activeBotData } = useBotConfig();
  const [activeSubTab, setActiveSubTab] = useState<string>("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState<Product>({
    title: "",
    image: "",
    price: "",
    currency: "USD",
    description: "",
    about: "",
    stock: 0,
    sold: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);
  const [stripeConfig, setStripeConfig] = useState<{
    isEnabled: boolean;
    sellerId: string;
  }>({ isEnabled: false, sellerId: "" });
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("INR");
  const [stripeIdLoading, setStripeIdLoading] = useState(false);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [stripeIdError, setStripeIdError] = useState<string | null>(null);
  const [currencyError, setCurrencyError] = useState<string | null>(null);
  const [expandedTransactionId, setExpandedTransactionId] = useState<
    string | null
  >(null);

  const subTabs: SubTab[] = [
    { id: "products", name: "Products", icon: <Package className="h-5 w-5" /> },
    {
      id: "payments",
      name: "Payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      id: "transactions",
      name: "Transactions",
      icon: <Receipt className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      if (!activeBotId) return;

      try {
        setIsLoading(true);
        const response = await getProducts(activeBotId);
        console.log(response);
        setProducts(response);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [activeBotId]);

  useEffect(() => {
    if (activeSubTab === "transactions" && activeBotId) {
      fetchTransactions();
    }
  }, [activeSubTab, activeBotId]);

  useEffect(() => {
    if (activeBotData) {
      setStripeConfig({
        isEnabled: activeBotData.stripeAccountId ? true : false,
        sellerId: activeBotData.stripeAccountId || "",
      });
      setSelectedCurrency(activeBotData.currency);
    }
  }, [activeBotData]);

  const fetchTransactions = async () => {
    if (!activeBotId) return;
    try {
      setIsLoadingTransactions(true);
      const data = await getTransactions(activeBotId);
      setTransactions(data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setStripeError("Failed to load transactions");
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const handleStripeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBotId) return;
    try {
      setStripeIdLoading(true);
      setStripeIdError(null);
      await updateStripeAccountIdCurrency({
        agentId: activeBotId,
        stripeAccountId: stripeConfig.sellerId,
        currency: selectedCurrency,
      });
      toast.success("Stripe account ID updated successfully");
    } catch (error) {
      console.error("Error updating Stripe ID:", error);
      setStripeIdError("Failed to update Stripe ID");
    } finally {
      setStripeIdLoading(false);
    }
  };

  const handleCurrencyUpdate = async () => {
    if (!activeBotId) return;
    try {
      setCurrencyLoading(true);
      setCurrencyError(null);
      await updateStripeAccountIdCurrency({
        agentId: activeBotId,
        stripeAccountId: stripeConfig.sellerId,
        currency: selectedCurrency,
      });
      toast.success("Currency updated successfully");
    } catch (error) {
      console.error("Error updating currency:", error);
      setCurrencyError("Failed to update currency");
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setNewProduct({ ...newProduct, image: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpdate = async (productId: string) => {
    if (!selectedFile || !activeBotId) return;

    try {
      setIsUpdatingImage(true);
      setError(null);
      const result = await updateProductImage({
        file: selectedFile,
        agentId: activeBotId,
        productId,
      });

      // Update the product in local state with new image URL
      setProducts(
        products.map((p) =>
          p._id === productId
            ? { ...p, image: result.image } // Assuming the API returns the new image URL
            : p
        )
      );
      setEditingProduct(result);

      setSelectedFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Error updating product image:", error);
      setError("Failed to update product image");
    } finally {
      setIsUpdatingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBotId) {
      setError("Missing required fields");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingProduct) {
        await updateProduct({
          productId: editingProduct._id!,
          title: newProduct.title,
          description: newProduct.description,
          price: newProduct.price,
          about: newProduct.about,
          agentId: activeBotId,
          stock: newProduct.stock,
        });
      } else {
        await addProduct({
          file: selectedFile!,
          title: newProduct.title,
          description: newProduct.description,
          image: newProduct.image,
          price: newProduct.price,
          about: newProduct.about || newProduct.description,
          agentId: activeBotId,
        });
      }

      // Refresh products after update/add
      const updatedProducts = await getProducts(activeBotId);
      setProducts(updatedProducts);

      // Reset form
      setNewProduct({
        title: "",
        image: "",
        price: "",
        currency: "USD",
        description: "",
        about: "",
        stock: 100,
        sold: 0,
      });
      setSelectedFile(null);
      setImagePreview(null);
      setEditingProduct(null);
      setIsFormVisible(false);
    } catch (err) {
      setError("Failed to save product. Please try again.");
      console.error("Error saving product:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!activeBotId) return;

    try {
      await deleteProduct(id, activeBotId);
      setProducts(products.filter((product) => product._id !== id));
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product");
    }
  };

  return (
    <div className="container py-4 px-4 bg-white">
      <div className="flex space-x-4 mb-8">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`
              flex items-center px-4 py-2 text-sm font-medium rounded-md
              ${
                activeSubTab === tab.id
                  ? "text-white bg-gray-800"
                  : "text-gray-600 hover:bg-gray-50"
              }
            `}
          >
            <span
              className={`mr-2 ${
                activeSubTab === tab.id ? "text-white" : "text-gray-400"
              }`}
            >
              {tab.icon}
            </span>
            {tab.name}
          </button>
        ))}
      </div>

      {activeSubTab === "products" && (
        <>
          {!isFormVisible ? (
            <>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900">
                  Products
                </h2>
                <button
                  onClick={() => {
                    setIsFormVisible(true);
                    setEditingProduct(null);
                    setNewProduct({
                      title: "",
                      image: "",
                      price: "",
                      currency: "USD",
                      description: "",
                      about: "",
                      stock: 0,
                      sold: 0,
                    });
                  }}
                  className="flex items-center space-x-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Create new product</span>
                </button>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                  <p className="text-gray-500">
                    No products found. Add your first product!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-gray-300 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => {
                              setIsFormVisible(true);
                              setEditingProduct(product);
                              setNewProduct({
                                title: product.title,
                                image: product.image,
                                price: product.price,
                                currency: product.currency,
                                description: product.description,
                                about: product.about || "",
                                stock: product.stock,
                                sold: product.sold,
                              });
                            }}
                            className="bg-white text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(product)}
                            className="bg-white text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors shadow-sm"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {product.title}
                        </h3>
                        <p className="text-gray-500 mb-4">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-medium text-gray-900">
                            {product.price} INR
                          </span>
                          <span className="text-sm text-gray-500">
                            Sold: {product.sold || 0}/{product.stock || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-8">
                <button
                  onClick={() => {
                    setIsFormVisible(false);
                    setEditingProduct(null);
                  }}
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-4 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back to Products
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="border border-gray-200 rounded-lg p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Product Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex-1">
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-300 transition-colors">
                          <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                          <span className="text-sm text-gray-500">
                            Choose a file or drag & drop it here
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            JPEG, PNG, PDF formats, up to 50MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            required={!editingProduct}
                          />
                        </div>
                      </label>
                      <div className="flex space-x-4">
                        {editingProduct && !imagePreview && (
                          <div className="w-24 h-24">
                            <img
                              src={editingProduct.image}
                              alt="Current"
                              className="w-full h-full object-cover rounded-md border border-gray-200"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              Current
                            </p>
                          </div>
                        )}
                        {imagePreview && (
                          <div className="w-24 h-24">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-full h-full object-cover rounded-md border border-gray-200"
                            />
                            <p className="text-xs text-gray-500 mt-1 text-center">
                              {editingProduct ? "New" : "Preview"}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    {editingProduct && selectedFile && (
                      <button
                        type="button"
                        onClick={() => handleImageUpdate(editingProduct._id!)}
                        disabled={isUpdatingImage}
                        className="mt-4 w-full px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                      >
                        {isUpdatingImage ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </span>
                        ) : (
                          "Update Image"
                        )}
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="border border-gray-200 rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title
                      </label>
                      <input
                        type="text"
                        value={newProduct.title}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            title: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price
                      </label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="border border-gray-200 rounded-lg p-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Available
                      </label>
                      <input
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            stock: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    rows={4}
                    required
                  />
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    About
                  </label>
                  <textarea
                    value={newProduct.about}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, about: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormVisible(false);
                      setEditingProduct(null);
                    }}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>
                          {editingProduct ? "Update Product" : "Add Product"}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {productToDelete && (
            <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Product
                  </h3>
                  <button
                    onClick={() => setProductToDelete(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{productToDelete.title}"?
                  This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setProductToDelete(null)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRemove(productToDelete._id!)}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeSubTab === "payments" && (
        <div className="mx-auto space-y-6">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <CreditCard className="h-6 w-6 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">
                  Stripe Integration
                </h3>
              </div>

              {stripeIdError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
                  {stripeIdError}
                </div>
              )}

              <form onSubmit={handleStripeSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stripe Seller ID
                    </label>
                    <input
                      type="text"
                      value={stripeConfig.sellerId}
                      onChange={(e) =>
                        setStripeConfig({
                          ...stripeConfig,
                          sellerId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      placeholder="Enter your Stripe Seller ID (e.g., acct_1234567890)"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={stripeIdLoading}
                      className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {stripeIdLoading ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-5 w-5" />
                          <span>Save Stripe ID</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Receipt className="h-6 w-6 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">
                  Payment Currency
                </h3>
              </div>

              {currencyError && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100">
                  {currencyError}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {["INR", "USD", "AED", "GBP"].map((currency) => (
                  <button
                    key={currency}
                    type="button"
                    onClick={() => setSelectedCurrency(currency)}
                    className={`
                      flex items-center justify-center px-4 py-3 rounded-md border-2 transition-all
                      ${
                        selectedCurrency === currency
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-300 text-gray-700"
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{currency}</span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleCurrencyUpdate}
                  disabled={currencyLoading}
                  className="flex items-center space-x-2 px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {currencyLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      <span>Save Currency</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === "transactions" && (
        <div className="mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Transaction History
              </h2>
            </div>

            {isLoadingTransactions ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      setExpandedTransactionId(
                        expandedTransactionId === transaction.id
                          ? null
                          : transaction.id
                      )
                    }
                  >
                    {/* Preview Card */}
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {transaction.items[0]?.title || "Multiple Items"}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {transaction.userEmail || "No email provided"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {transaction.totalAmount / 100} {transaction.currency}
                        </p>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.status === "COMPLETED"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          PAID
                        </span>
                      </div>
                    </div>

                    {/* Expanded View */}
                    {expandedTransactionId === transaction.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Order ID
                              </p>
                              <p className="text-sm text-gray-900">
                                {transaction.orderId}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">
                                Payment ID
                              </p>
                              <p className="text-sm text-gray-900">
                                {transaction.paymentId}
                              </p>
                            </div>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">
                              Items
                            </p>
                            <div className="space-y-2">
                              {transaction.items.map(
                                (item: TransactionItem, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-10 h-10 object-cover rounded-md"
                                      />
                                      <div>
                                        <p className="text-sm font-medium">
                                          {item.title}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                          {item.currency} {item.price}
                                        </p>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-900">
                                      x {item.quantity}
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <p className="text-sm font-medium text-gray-900">
                                Subtotal
                              </p>
                              <p className="text-sm text-gray-900">
                                {transaction.totalAmount / 100}{" "}
                                {transaction.currency}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
