import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaFileAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import NewOfferingForm from "../../OfferingComponents/NewOfferingForm";
import { ProductType } from "../../../../types";
import { useInventoryStore } from "../../../../store/useInventoryStore";

const cardData = [
  {
    label: "Physical Product",
    icon: <FaBox size={40} />,
    type: "physical",
  },
  {
    label: "Digital Product",
    icon: <FaFileAlt size={40} />,
    type: "digital",
  },
  {
    label: "Service",
    icon: <FaCalendarAlt size={40} />,
    type: "service",
  },
  {
    label: "Event",
    icon: <FaUsers size={40} />,
    type: "event",
  },
];

const AddNew = () => {
  const navigate = useNavigate();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  useEffect(() => {
    // Check if we're in edit mode
    const storedEditData = localStorage.getItem("editingProduct");
    if (storedEditData) {
      const { product, type } = JSON.parse(storedEditData);
      setEditData(product);
      setSelectedType(type);
    }
  }, []);

  const handleBack = () => {
    if (editData) {
      localStorage.removeItem("editingProduct");
    }
    navigate("/admin/commerce/manage");
  };

  return (
    <div className="min-h-screen h-full w-full overflow-x-hidden">
      <div className="max-w-[1200px] mx-auto px-4">
        {selectedType ? (
          <div>
            <NewOfferingForm
              type={selectedType as ProductType}
              onBack={handleBack}
              editProduct={editData}
              editMode={!!editData}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Add New Offering
            </h2>
            <div className="text-md font-semibold text-gray-700 mb-1">
              Select Product type
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Choose the perfect format to showcase and sell your offering
            </div>
            <div className="flex flex-wrap gap-6 justify-start">
              {cardData.map((card) => (
                <button
                  key={card.label}
                  className="flex flex-col items-center justify-center w-44 h-44 bg-[#e7eafe] border border-[#bfc6e0] rounded-lg shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => setSelectedType(card.type)}
                  type="button"
                >
                  {card.icon}
                  <span className="mt-4 font-semibold text-lg text-gray-900">
                    {card.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNew;
