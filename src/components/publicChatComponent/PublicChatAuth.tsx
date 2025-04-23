import React from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useBotConfig } from "../../store/useBotConfig";
import PublicChat from "../PublicChat";
import { Bot } from "lucide-react";

interface PublicChatAuthProps {
  agentUsernamePlayground: string | null;
}

export default function PublicChatAuth({
  agentUsernamePlayground,
}: PublicChatAuthProps) {
  const {
    isBotUserLoggedIn,
    botUserEmail,
    handleGoogleLoginSuccess,
    handleGoogleLoginError,
  } = useBotConfig();

  if (!isBotUserLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6">
              <div className="flex items-center justify-center space-x-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white">
                  <Bot className="h-8 w-8 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  Welcome to KiFor.ai
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Sign in to continue
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  Access your AI agents and start building amazing experiences
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full">
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xs">
                      <GoogleOAuthProvider
                        clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
                      >
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
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <PublicChat agentUsernamePlayground={agentUsernamePlayground} />;
}
