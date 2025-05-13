import { useLocation } from "react-router-dom";
import AddNew from "./AddNew";
import Manage from "./Manage";

const Commerce = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath.includes("/commerce/add")) {
      return <AddNew />;
    }
    return <Manage />;
  };

  return (
    <div className="container bg-white min-h-screen">
      <div className="p-6">{renderContent()}</div>
    </div>
  );
};

export default Commerce;
