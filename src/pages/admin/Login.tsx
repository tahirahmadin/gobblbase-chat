import React, { useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useUserStore } from "../../store/useUserStore";
import { useNavigate } from "react-router-dom";
import { useAdminStore } from "../../store/useAdminStore";
import CreateNewBot from "./CreateNewBot";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAdminLoggedIn,
    agents,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    adminLogout,
  } = useAdminStore();

  useEffect(() => {
    adminLogout();
  }, []);

  useEffect(() => {
    if (isAdminLoggedIn && agents.length > 0) {
      navigate("/admin/dashboard/profile");
    }
  }, [isAdminLoggedIn, agents, navigate]);

  const renderSignUpCard = () => (
    <div className="w-[600px] h-[370px] bg-[#dde6fa] border-2 border-[#222b5f] shadow-[4px_4px_0_0_#222b5f] rounded-none flex flex-col justify-center items-center relative">
      <h2 className="absolute left-6 top-6 text-2xl font-bold">Sign Up</h2>
      <div className="flex justify-center items-center flex-col gap-4 w-[340px] mt-12">
        <h2 className="text-sm font-bold text-center">
          Signup/SignIn to the KiFor.ai
        </h2>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
            useOneTap
            theme="filled_blue"
            size="large"
            width="100%"
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );

  // --- CONDITIONAL RENDER ---
  const renderContent = () => {
    if (!isAdminLoggedIn) {
      return renderSignUpCard();
    }
    if (isAdminLoggedIn && agents.length === 0) {
      return <CreateNewBot />;
    }
    return null;
  };

  // --- MAIN LAYOUT ---
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Black top strip */}
      <div className="w-full bg-black py-3 px-8 flex items-center">
        <span className="text-white text-2xl font-bold tracking-tight">
          kifor
        </span>
      </div>
      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center">
        {renderContent()}
      </div>
    </div>
  );
};

export default Login;
