import React from "react";
import { useLocation } from "react-router-dom";
import Payments from "./Payments";
import Integrations from "./Integrations";
import Embed from "./Embed";

const Business = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath.includes("/business/integrations")) {
      return <Integrations />;
    }
    if (currentPath.includes("/business/embed")) {
      return <Embed />;
    }
    return <Payments />;
  };

  return (
    <div className="container bg-white min-h-screen">
      <div className="py-6">{renderContent()}</div>
    </div>
  );
};

export default Business;
