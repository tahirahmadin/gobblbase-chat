import { useLocation } from "react-router-dom";
import Integrations from "../Integrations";
import Embed from "../Dashboard/Embed";
import Orders from "./Orders";
import EmailTemplates from "../Commerce/EmailTemplates";

const Operations = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath.includes("/business/integrations")) {
      return <Integrations />;
    }

    if (currentPath.includes("/business/orders")) {
      return <Orders />;
    }
    if (currentPath.includes("/business/email")) {
      return <EmailTemplates />;
    }
  };

  return (
    <div className="min-h-screen w-full lg:w-full overflow-y-scroll h-[100%]">
      <div>{renderContent()}</div>
    </div>
  );
};

export default Operations;
