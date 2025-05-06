import { useLocation } from "react-router-dom";
import Payments from "./Payments";
import Integrations from "./Integrations";
import Embed from "./Embed";
import Orders from "./Orders";
import EmailTemplates from "./EmailTemplates";

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
    if (currentPath.includes("/business/orders")) {
      return <Orders />;
    }
    if (currentPath.includes("/business/email")) {
      return <EmailTemplates />;
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
