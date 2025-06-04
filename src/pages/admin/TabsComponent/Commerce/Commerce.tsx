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
    <div className="min-h-screen w-full lg:w-full overflow-y-scroll h-[100%]">
      <div>{renderContent()}</div>
    </div>
  );
};

export default Commerce;
