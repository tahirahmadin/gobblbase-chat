import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBox, FaFileAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import NewOfferingForm from "../../OfferingComponents/NewOfferingForm";
import { ProductType } from "../../../../types";
import { useBotConfig } from "../../../../store/useBotConfig";
import styled from "styled-components";

const AddNewButton = styled.button`
    &::before{
      content: "";
      height: 100%;
      width: 100%;
      position: absolute;
      left:4px;
      top: 4px;
      background: #D4DEFF;
      border: 1px solid black;
      z-index: -1;
    }
      &:hover{
        background: #CEFFDC;
      }
      &:hover:before{
        background: #6AFF97;
      }
`;
const cardData = [
  {
    label: "Physical Product",
    icon: <FaBox size={40} />,
    type: "physicalProduct",
  },
  {
    label: "Digital Product",
    icon: <FaFileAlt size={40} />,
    type: "digitalProduct",
  },
  {
    label: "Service",
    icon: <FaCalendarAlt size={40} />,
    type: "Service",
  },
  {
    label: "Event",
    icon: <FaUsers size={40} />,
    type: "Event",
  },
];

const AddNew = () => {
  const navigate = useNavigate();
  const { activeBotId } = useBotConfig();

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

    // Cleanup function to clear edit data when component unmounts
    return () => {
      localStorage.removeItem("editingProduct");
    };
  }, []);

  const handleBack = () => {
    if (editData) {
      localStorage.removeItem("editingProduct");
      navigate("/admin/commerce/manage");
    } else {
      setSelectedType(null);
    }
  };

  return (
    <div className="w-[100vw] lg:w-full overflow-x-hidden py-2 md:px-2 lg:p-6 h-[90vh]">
      <div className="mx-auto">
        {selectedType ? (
          <div className="w-full overflow-x-hidden">
            <NewOfferingForm
              type={selectedType as ProductType}
              onBack={handleBack}
              editProduct={editData}
              editMode={!!editData}
            />
          </div>
        ) : (
          <div className="px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Add New Offering
            </h2>
            <div className="text-md font-semibold text-gray-700 mb-1">
              Select Product type
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Choose the perfect format to showcase and sell your offering
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:flex md:flex-wrap gap-4 md:gap-6 justify-start">
              {cardData.map((card) => (
                <div  key={card.label} className="relative z-10">
                  <AddNewButton
                    className="flex flex-col items-center justify-center w-full md:w-44 h-44 bg-[#e7eafe] border border-[#000]  shadow hover:shadow-lg transition-shadow duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    onClick={() => setSelectedType(card.type)}
                    type="button"
                  >
                    {card.icon}
                    <span className="mt-4 font-semibold text-lg text-gray-900">
                      {card.label}
                    </span>
                  </AddNewButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddNew;
