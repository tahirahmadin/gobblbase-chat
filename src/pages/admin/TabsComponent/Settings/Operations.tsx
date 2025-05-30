import { useLocation } from "react-router-dom";
import Integrations from "../Integrations";
import Embed from "./Embed";
import Orders from "./Orders";
import EmailTemplates from "./EmailTemplates";

const Operations = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath.includes("/operations/integrations")) {
      return <Integrations />;
    }
    if (currentPath.includes("/operations/embed")) {
      return <Embed />;
    }
    if (currentPath.includes("/operations/orders")) {
      return <Orders />;
    }
    if (currentPath.includes("/operations/email")) {
      return <EmailTemplates />;
    }
  };

  return (
    <div className="container min-h-screen w-screen lg:w-full">
      <div>{renderContent()}</div>
    </div>
  );
};

export default Operations;
