import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Booking from "../BookingComponent/Booking";
import BookingDashboard from "../BookingComponent/BookingDashboard";
import AddNew from "../OfferingComponents/AddNew";
import { useBotConfig } from "../../../store/useBotConfig";
import { getMainProducts } from "../../../lib/serverActions";

const TABS = [
  { label: "Digital Goods", value: "digital" },
  { label: "Physical Goods", value: "physical" },
  { label: "Services", value: "service" },
  { label: "Events", value: "event" },
];

const ManageOfferingsTable = () => {
  const { activeBotId } = useBotConfig();
  const [tab, setTab] = useState("digital");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (activeBotId) {
      getMainProducts(activeBotId).then((all) => {
        setProducts(all.filter((p: any) => p.type === tab));
        setLoading(false);
      });
    }
  }, [tab, activeBotId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">
        Manage Offerings
      </h1>
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
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p._id} className="border-t">
                  <td className="py-2 px-4">{p.code || p._id}</td>
                  <td className="py-2 px-4 flex items-center gap-2">
                    <img
                      src={p.imageUrl || p.thumbnailUrl || "/placeholder.png"}
                      alt=""
                      className="w-10 h-10 rounded object-cover"
                    />
                    {p.name || p.productName || p.serviceName || p.eventName}
                  </td>
                  <td className="py-2 px-4">${p.price}</td>
                  <td className="py-2 px-4">
                    {p.quantityUnlimited === "true" ||
                    p.quantityUnlimited === true
                      ? "Unlimited"
                      : p.quantity}
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button className="bg-blue-100 px-3 py-1 rounded">
                      Edit
                    </button>
                    <button className="bg-blue-100 px-3 py-1 rounded">
                      Pause
                    </button>
                    <button className="bg-red-100 text-red-600 px-3 py-1 rounded border border-red-300">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const Offerings = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    switch (true) {
      case currentPath.includes("/offerings/add"):
        return <AddNew />;

      case currentPath.includes("/offerings/manage"):
        return <ManageOfferingsTable />;

      case currentPath.includes("/offerings/calendar"):
        if (
          currentPath === "/admin/offerings/calendar" ||
          currentPath === "/admin/offerings/calendar/"
        ) {
          return <BookingDashboard />;
        }
        return null;

      case currentPath.includes("/offerings/policies"):
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Offering Policies
            </h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">
                Set up and manage your offering policies
              </p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">
              Offerings Overview
            </h1>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-600">
                Select a section from the sidebar to get started
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container min-h-screen bg-gray-50 py-4">
      {renderContent()}
    </div>
  );
};

export default Offerings;
