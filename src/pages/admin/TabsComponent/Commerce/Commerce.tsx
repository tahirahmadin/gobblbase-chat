import { useLocation } from "react-router-dom";
import AddNew from "./AddNew";
import Manage from "./Manage";
import Policies from "./Policies";
import EmailTemplates from "./EmailTemplates";

const Commerce = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath.includes("/commerce/add")) {
      return <AddNew />;
    } else if (currentPath.includes("/commerce/manage")) {
      return <Manage />;
    } else if (currentPath.includes("/commerce/policies")) {
      return <Policies />;
    } else if (currentPath.includes("/commerce/email")) {
      return <EmailTemplates isCommerce={true} />;
    }
    return <AddNew />;
  };

  return (
    <div className="min-h-screen w-full lg:w-full overflow-y-scroll h-[100%]">
      <div>{renderContent()}</div>
    </div>
  );
};

export default Commerce;
