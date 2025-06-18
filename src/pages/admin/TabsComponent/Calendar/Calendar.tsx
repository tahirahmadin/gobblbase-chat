import { useLocation } from "react-router-dom";
import EmailTemplates from "../Commerce/EmailTemplates";
import BookingDashboardWrapper from "../../BookingComponent/BookingDashboardWrapper";

const Calendar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const renderContent = () => {
    if (currentPath.includes("/calendar/manage")) {
      return <BookingDashboardWrapper />;
    }

    if (currentPath.includes("/calendar/email")) {
      return <EmailTemplates isCommerce={false} />;
    }
  };

  return (
    <div className="min-h-screen w-full lg:w-full overflow-y-scroll h-[100%]">
      <div>{renderContent()}</div>
    </div>
  );
};

export default Calendar;
