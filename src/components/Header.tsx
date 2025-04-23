import { User, LogOut } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useAdminStore } from "../store/useAdminStore";
import { Link } from "react-router-dom";

export default function Header() {
  const {
    isAdminLoggedIn,
    adminEmail,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
    adminLogout,
  } = useAdminStore();

  return (
    <header className="bg-white border-b border-gray-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50">
                <img
                  src="https://gobbl-bucket.s3.ap-south-1.amazonaws.com/gobbl_token.png"
                  alt="KiFor.ai"
                  className="w-6 h-6"
                />
              </div>
              <span className="text-xl font-semibold bg-black  bg-clip-text text-transparent">
                KiFor.ai
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {isAdminLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-50">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium">{adminEmail}</span>
                </div>
                <button
                  onClick={adminLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">
                  Sign in to continue
                </span>
                <GoogleOAuthProvider
                  clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleLoginSuccess}
                    onError={handleGoogleLoginError}
                    useOneTap
                  />
                </GoogleOAuthProvider>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
