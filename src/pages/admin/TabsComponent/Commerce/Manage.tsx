import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useBotConfig } from "../../../../store/useBotConfig";
import {
  getMainProducts,
  deleteMainProduct,
  pauseProduct,
} from "../../../../lib/serverActions";
import toast from "react-hot-toast";
import styled from "styled-components";
const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  font-weight: 600;
  min-width: 120px;
  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1;
    background: #6aff97;
  }

  &:disabled {
    background: #6aff97;
    cursor: not-allowed;
    color: black;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;
const TABS = [
  {
    label: "All",
    value: "ALL",
  },
  {
    label: "Physical Goods",
    value: "physicalProduct",
    blackSvgIcon: "/assets/icons/black-physical-goods.svg",
    greenSvgIcon: "/assets/icons/green-physical-goods.svg",
  },
  {
    label: "Digital Goods",
    value: "digitalProduct",
    blackSvgIcon: "/assets/icons/black-digital-product.svg",
    greenSvgIcon: "/assets/icons/green-digital-product.svg",
  },
  {
    label: "Services",
    value: "Service",
    blackSvgIcon: "/assets/icons/black-calendar-icon.svg",
    greenSvgIcon: "/assets/icons/calendar-icon.svg",
  },
  {
    label: "Events",
    value: "Event",
    blackSvgIcon: "/assets/icons/black-peoples.svg",
    greenSvgIcon: "/assets/icons/green-peoples.svg",
  },
];

const Manage = () => {
  const navigate = useNavigate();
  const { activeBotId, activeBotData } = useBotConfig();
  const [tab, setTab] = useState("ALL");
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
    if (tab === "ALL") {
      setFilteredProducts(products);
    } else {
      let filteredProducts = products.filter((p: any) => p.type === tab);
      console.log("filteredProducts", filteredProducts);
      console.log("products", products);
      setFilteredProducts(filteredProducts);
    }
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
    <div className="w-[100vw] lg:w-full overflow-x-hidden h-[100%] overflow-y-auto">
      <div className="flex justify-between items-center lg:w-[98%] mx-auto px-6 pt-8 pb-4 lg:p-6">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Manage Offerings
        </h1>
        <div className="relative z-10">
          <Button
            onClick={() => navigate("/admin/commerce/add")}
            className=""
          >
            + New
          </Button>
        </div>
      </div>
      <div className="flex gap-1 lg:gap-2 mb-4 max-w-screen lg:w-[98%] mx-auto px-6 pb-4 lg:p-6">
       {TABS.map((t) => {
            const isActive = tab === t.value;
            const iconSrc = isActive ? t.greenSvgIcon : t.blackSvgIcon;

            return (
              <button
                key={t.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  isActive
                    ? "bg-black text-[#6AFF97]"
                    : "bg-white border border-black text-black"
                }`}
                onClick={() => setTab(t.value)}
              >
                {/* Mobile view icon (only if icon is available) */}
                {iconSrc && (
                  <span className="block sm:hidden">
                    {tab === t.value ? (
                      <span className="flex items-center gap-2">
                        <img width={25} src={iconSrc} alt={`${t.label} icon`} />
                        <h1 className="hidden xs:block whitespace-nowrap">{t.label}</h1>
                      </span>
                    ) : (<img width={25} src={iconSrc} alt={`${t.label} icon`} />
                    ) }
                     
                  </span>
                )}

                {/* Label */}
                <span className={iconSrc ? "hidden sm:block" : "block"}>
                  {t.label}
                </span>
              </button>
            );
          })}
      </div>
      {/* product manage table  */}
      <div className="bg-[#EEEEEE] border border-gray-200 lg:w-[95%] mx-auto px-6 pt-8 pb-24 md:pb-4 lg:p-6 ">
        <div className="">
          {/* products manage in mob  table for large file  */}
          <div className="hidden md:block max-h-[calc(100vh-250px)] overflow-y-auto">
            <table className="w-full min-w-[500px] border-separate border-spacing-y-2">
              <thead className="sticky top-0  rounded-t-lg bg-[#CEFFDC] z-5 ">
                <tr className="">
                  <th className="py-1.5 px-2 text-left text-sm rounded-l-[12px] text-center">
                    CODE
                  </th>
                  <th className="py-1.5 px-2 text-left text-sm text-center">
                    ITEM NAME
                  </th>
                  <th className="py-1.5 px-2 text-left text-sm text-center">
                    PRICE
                  </th>

                  <th className=" py-1.5 px-2 text-left text-sm rounded-r-[12px] text-center">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-sm">
                      Loading...
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-sm">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p._id} className="border-t text-center">
                      <td className="py-1.5 px-2 text-sm rounded-l-[12px] text-center">
                        {p.productId}
                      </td>
                      <td className="py-1.5 px-2 text-sm text-center w-fit">
                        <div className="flex items-center gap-1.5 justify-center">
                          <img
                            src={
                              p.images[0] ||
                              "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                            }
                            alt=""
                            className="w-8 h-8 lg:w-10 lg:h-10 rounded object-cover"
                          />
                          <div>
                            <div className="uppercase text-[0.9rem]">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-[0.7rem] text-gray-500">
                              Qty:
                              {p.quantityType === "variedSizes" &&
                                Object.entries(p.variedQuantities)
                                  .map(
                                    ([size, quantity]) => `${size}: ${quantity}`
                                  )
                                  .join(", ")}
                              {p.quantityType === "oneSize" &&
                                p.quantityUnlimited === false &&
                                p.quantity}
                              {p.quantityUnlimited === true && "Unlimited"}
                              {p.type === "Event" && " Multiple slots"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-1.5 px-2 text-sm ">
                        <span className="inline-block text-center whitespace-nowrap border border-[#7D7D7D] w-[100px] rounded-lg py-1">
                          {p.priceType === "paid"
                            ? `${p.price} ${activeBotData?.currency}`
                            : `Free`}
                        </span>
                      </td>

                      <td className="py-1.5 px-2 rounded-r-[12px] ">
                        <div className="flex gap-1.5 items-center justify-center">
                          <button
                            className="bg-[#D4DEFF] w-24 py-2 rounded-full border border-[#7D7D7D] text-sm"
                            onClick={() => handleEdit(p, p.type)}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openPauseModal(p._id, p.isPaused)}
                            disabled={loadingStates[p._id]}
                            className={`${
                              p.isPaused
                                ? "bg-green-200 text-black border-[#7D7D7D]"
                                : "bg-blue-100 text-black border-[#7D7D7D]"
                            } w-24 py-2 rounded-full border hover:opacity-80 transition-opacity disabled:opacity-50 text-sm`}
                          >
                            {loadingStates[p._id]
                              ? "Updating..."
                              : p.isPaused
                              ? "Activate"
                              : "Pause"}
                          </button>
                          <button
                            className="bg-[#EAEFFF] text-[#CF0000] w-24 py-2 rounded-full border border-[#CF0000] text-sm"
                            onClick={() => openDeleteModal(p._id)}
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* products manage in mob */}
          <div className="flex md:hidden flex-col gap-10">
            {loading ? (
              <h1 className="text-[1.5rem] text-black bg-white border rounded-lg p-4 flex flex-col gap-4">
                Loading Products
              </h1>
            ) : filteredProducts.length === 0 ? (
              <h1 className="text-[1.5rem] text-black bg-white border rounded-lg p-4 flex flex-col gap-4">
                No Products Founds
              </h1>
            ) : (
              filteredProducts.map((p) => (
                <div
                  className="bg-white border rounded-lg p-4 flex flex-col gap-4"
                  key={p._id}
                >
                  <div className="flex items-center gap-2 justify-start">
                    <img
                      src={
                        p.images[0] ||
                        "https://media.istockphoto.com/id/1409329028/vector/no-picture-available-placeholder-thumbnail-icon-illustration-design.jpg?s=612x612&w=0&k=20&c=_zOuJu755g2eEUioiOUdz_mHKJQJn-tDgIAhQzyeKUQ="
                      }
                      alt=""
                      className="w-20 h-20 lg:w-10 lg:h-10 rounded object-cover"
                    />
                    <div>
                      <h1 className="main-font uppercase text-[1.1rem] font-[500]">
                        {p.title}
                      </h1>
                      <p className="text-[0.8rem]">
                        Qty:
                        {p.quantityType === "variedSizes" &&
                          Object.entries(p.variedQuantities)
                            .map(([size, quantity]) => `${size}: ${quantity}`)
                            .join(", ")}
                        {p.quantityType === "oneSize" &&
                          p.quantityUnlimited === false &&
                          p.quantity}
                        {p.quantityUnlimited === true && "Unlimited"}
                        {p.type === "Event" && " Multiple slots"}
                      </p>
                    </div>
                  </div>
                  <div className="price">
                    <h2 className="para-font text-[1.2rem]">Price</h2>
                    <span className="inline-block text-center whitespace-nowrap border border-[#7D7D7D] w-[140px] rounded-lg py-1">
                      {p.priceType === "paid"
                        ? `${p.price} ${activeBotData?.currency}`
                        : `Free`}
                    </span>
                  </div>
                  <div className="actions flex-col xs:flex-row flex items-center justify-between gap-4 py-4 border-t border-black">
                    <h2 className="">ACTIONS</h2>
                    <div className="flex gap-1.5 items-center justify-center flex-row [@media(max-width:370px)]:flex-col">
                      <button
                        className="bg-[#D4DEFF] w-24 py-1 md:py-2 rounded-full border border-[#7D7D7D] text-sm lg:text-sm"
                        onClick={() => handleEdit(p, p.type)}
                      >
                        Edit
                      </button>
                      {/* pause btn in mob  */}
                      <button
                        onClick={() => openPauseModal(p._id, p.isPaused)}
                        disabled={loadingStates[p._id]}
                        className={`${
                          p.isPaused
                            ? "bg-green-200 text-black border-[#7D7D7D]"
                            : "bg-[#D4DEFF] text-black border-[#7D7D7D]"
                        } w-24 py-1 md:py-2 rounded-full border hover:opacity-80 transition-opacity disabled:opacity-50 text-sm lg:text-sm`}
                      >
                        {loadingStates[p._id]
                          ? "Updating..."
                          : p.isPaused
                          ? "Activate"
                          : "Pause"}
                      </button>
                      {/* delete btn in mob  */}
                      <button
                        className="bg-[#FF9797] text-[#000] w-24 py-1 md:py-2 rounded-full border border-[#000] text-sm lg:text-sm"
                        onClick={() => openDeleteModal(p._id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {}
          </div>
        </div>
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
