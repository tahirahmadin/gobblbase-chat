import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBotConfig } from "../../../../store/useBotConfig";
import {
  getMainProducts,
  deleteMainProduct,
  pauseProduct,
} from "../../../../lib/serverActions";
import toast from "react-hot-toast";

const TABS = [
  { label: "Physical Goods", value: "physical" },
  { label: "Digital Goods", value: "digital" },
  { label: "Services", value: "service" },
  { label: "Events", value: "event" },
];

const Manage = () => {
  const navigate = useNavigate();
  const { activeBotId } = useBotConfig();
  const [tab, setTab] = useState("physical");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseProductId, setPauseProductId] = useState<string | null>(null);
  const [pauseProductStatus, setPauseProductStatus] = useState<boolean | null>(
    null
  );

  // Fetch products based on tab
  useEffect(() => {
    setLoading(true);
    if (activeBotId) {
      getMainProducts(activeBotId).then((all) => {
        setProducts(all);
        setLoading(false);
      });
    }
  }, [activeBotId]);

  // Fetch products based on tab
  useEffect(() => {
    setLoading(true);
    let filteredProducts = products.filter((p: any) => p.type === tab);
    console.log("filteredProducts", filteredProducts);
    console.log("products", products);
    setFilteredProducts(filteredProducts);
    setLoading(false);
  }, [tab, products]);

  const handleDelete = async (productId: string) => {
    if (!activeBotId) return;
    try {
      const data = await deleteMainProduct(productId, activeBotId);
      if (data && data.error === false) {
        toast.success("Product deleted successfully!");
        setProducts((prev) => prev.filter((p) => p._id !== productId));
      } else {
        toast.error("Failed to delete product.");
      }
    } catch (err: any) {
      toast.error("Error deleting product: " + (err.message || err));
    }
  };

  const openDeleteModal = (productId: string) => {
    setDeleteProductId(productId);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeleteProductId(null);
  };

  const confirmDelete = async () => {
    if (deleteProductId) {
      await handleDelete(deleteProductId);
      closeDeleteModal();
    }
  };

  const handleEdit = (product: any, type: string) => {
    // Store the product data in localStorage for the edit form
    localStorage.setItem(
      "editingProduct",
      JSON.stringify({
        product,
        type,
      })
    );
    navigate("/admin/commerce/add");
  };

  const handlePauseToggle = async (
    productId: string,
    currentStatus: boolean
  ) => {
    if (!activeBotId) return;

    setLoadingStates((prev) => ({ ...prev, [productId]: true }));
    try {
      const response = await pauseProduct(productId, !currentStatus);
      if (response) {
        toast.success(
          `Product ${currentStatus ? "activated" : "paused"} successfully!`
        );
        // Update the product status in the local state
        setProducts((prev) =>
          prev.map((p) =>
            p._id === productId ? { ...p, isPaused: !currentStatus } : p
          )
        );
      } else {
        toast.error("Failed to update product status.");
      }
    } catch (err: any) {
      toast.error("Error updating product status: " + (err.message || err));
    } finally {
      setLoadingStates((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const openPauseModal = (productId: string, currentStatus: boolean) => {
    setPauseProductId(productId);
    setPauseProductStatus(currentStatus);
    setShowPauseModal(true);
  };

  const closePauseModal = () => {
    setShowPauseModal(false);
    setPauseProductId(null);
    setPauseProductStatus(null);
  };

  const confirmPauseToggle = async () => {
    if (pauseProductId !== null && pauseProductStatus !== null) {
      await handlePauseToggle(pauseProductId, pauseProductStatus);
      closePauseModal();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Manage Offerings
        </h1>
        <button
          onClick={() => navigate("/admin/commerce/add")}
          className="bg-black text-white px-4 py-2 rounded font-semibold"
        >
          Add New Offering
        </button>
      </div>
      <div className="flex gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            className={`px-4 py-2 rounded font-semibold ${
              tab === t.value
                ? "bg-black text-white"
                : "bg-white border border-gray-300"
            }`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-0">
        <table className="w-full">
          <thead>
            <tr className="bg-green-100">
              <th className="py-2 px-4 text-left">CODE</th>
              <th className="py-2 px-4 text-left">ITEM NAME</th>
              <th className="py-2 px-4 text-left">PRICE</th>
              <th className="py-2 px-4 text-left">INVENTORY</th>
              <th className="py-2 px-4 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  Loading...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="py-2 px-4">{p.productId}</td>
                  <td className="py-2 px-4 flex items-center gap-2">
                    <img
                      src={
                        p.images[0] ||
                        "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                      }
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                    {p.title}
                  </td>
                  <td className="py-2 px-4">${p.price}</td>
                  <td className="py-2 px-4">
                    {p.quantityUnlimited === "true" ||
                    p.quantityUnlimited === true
                      ? "Unlimited"
                      : p.quantity}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      className="bg-blue-100 px-3 py-1 rounded"
                      onClick={() => handleEdit(p, p.type)}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openPauseModal(p._id, p.isPaused)}
                      disabled={loadingStates[p._id]}
                      className={`${
                        p.isPaused
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      } px-3 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50`}
                    >
                      {loadingStates[p._id]
                        ? "Updating..."
                        : p.isPaused
                        ? "Activate"
                        : "Pause"}
                    </button>
                    <button
                      className="bg-red-100 text-red-600 px-3 py-1 rounded border border-red-300"
                      onClick={() => openDeleteModal(p._id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to delete this product?
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 font-semibold"
                onClick={confirmDelete}
              >
                Yes, Delete
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause/Activate Confirmation Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] flex flex-col items-center">
            <div className="text-lg font-semibold mb-4 text-center">
              Are you sure you want to{" "}
              {pauseProductStatus ? "activate" : "pause"} this product?
            </div>
            <div className="flex gap-4 mt-2">
              <button
                className={`${
                  pauseProductStatus
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white px-4 py-2 rounded font-semibold`}
                onClick={confirmPauseToggle}
              >
                Yes, {pauseProductStatus ? "Activate" : "Pause"}
              </button>
              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 font-semibold"
                onClick={closePauseModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manage;
