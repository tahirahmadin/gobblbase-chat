import React, { useState } from "react";
import { FaBox, FaFileAlt, FaCalendarAlt, FaUsers } from "react-icons/fa";
import NewOfferingForm, { ProductType } from "./NewOfferingForm";

const cardData = [
  {
    label: "Physical Product",
    icon: <FaBox size={40} />,
  },
  {
    label: "Digital Product",
    icon: <FaFileAlt size={40} />,
  },
  {
    label: "Service",
    icon: <FaCalendarAlt size={40} />,
  },
  {
    label: "Event",
    icon: <FaUsers size={40} />,
  },
];

const cardStyle: React.CSSProperties = {
  background: "#e7eafe",
  border: "1px solid #bfc6e0",
  borderRadius: 8,
  boxShadow: "2px 4px 0px #bfc6e0",
  width: 170,
  height: 170,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  margin: 16,
  cursor: "pointer",
  transition: "box-shadow 0.2s",
};

const cardContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  justifyContent: "flex-start",
  alignItems: "center",
  marginTop: 32,
};

const AddNew: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  if (selectedType) {
    return (
      <NewOfferingForm
        type={selectedType as ProductType}
        onBack={() => setSelectedType(null)}
      />
    );
  }

  return (
    <div style={{ padding: 32 }}>
      <h2 style={{ fontWeight: 700 }} className="text-2xl font-bold text-black">
        Add New Offering
      </h2>
      <div className="text-md font-semibold text-black mt-4">
        Select Product type
      </div>
      <div className="text-sm font-medium text-black">
        Choose the perfect format to showcase and sell your offering
      </div>
      <div style={cardContainerStyle}>
        {cardData.map((card) => (
          <div
            key={card.label}
            style={cardStyle}
            onClick={() => setSelectedType(card.label)}
          >
            {card.icon}
            <div style={{ marginTop: 18, fontWeight: 600, fontSize: 17 }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddNew;
