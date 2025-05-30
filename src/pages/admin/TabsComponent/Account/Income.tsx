import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useBotConfig } from "../../../../store/useBotConfig";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import styled from "styled-components";
import {
  enableStripePayment,
  completeStripeOnboarding,
} from "../../../../lib/serverActions";
import { useAdminStore } from "../../../../store/useAdminStore";

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  white-space: nowrap;
  @media (max-width: 600px) {
    min-width: 120px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1;
    background: #6aff97;
  }

  &:disabled {
    background: #d6ffe0;
    cursor: not-allowed;
    color: black;
  }
  &:disabled::before {
    background: #d6ffe0;
  }
`;

const StripePaymentConfig = () => {
  const { activeBotData } = useBotConfig();
  const { adminId, clientData } = useAdminStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isStripeEnabled, setIsStripeEnabled] = useState(false);
  const [isStripeActive, setIsStripeActive] = useState(false);

  useEffect(() => {
    if (clientData) {
      setIsStripeEnabled(clientData.paymentMethods.stripe.enabled);
      setIsStripeActive(clientData.paymentMethods.stripe.isActivated);
    }
  }, [clientData]);

  const handleEnableStripe = async () => {
    if (!adminId) {
      toast.error("No client selected");
      return;
    }

    setIsLoading(true);
    try {
      const result = await enableStripePayment(adminId);
      setIsStripeEnabled(true);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "Failed to enable Stripe payments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedKYC = async () => {
    if (!adminId) {
      toast.error("No client selected");
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeStripeOnboarding(adminId);
      if (result) {
        window.open(result, "_blank", "noopener,noreferrer");
      } else {
        throw new Error("Failed to get onboarding URL");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start Stripe onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium">
              Stripe Payment Configuration
            </h3>
            {isStripeEnabled && (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>

        {isStripeActive ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm text-gray-600">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <p>
                You have successfully configured Stripe payments. Your account
                is fully set up and ready to accept payments from your
                customers.
              </p>
            </div>
          </div>
        ) : !isStripeEnabled ? (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm text-gray-600">
              <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <p>
                Enable Stripe payments to start accepting credit card payments
                from your customers. You'll need to complete the KYC process
                after enabling Stripe.
              </p>
            </div>
            <Button
              onClick={handleEnableStripe}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Enabling..." : "Enable Stripe Payments"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start space-x-3 text-sm text-gray-600">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <p>
                Stripe payments are enabled. Complete the KYC process to start
                accepting payments. This is required by Stripe to verify your
                business identity.
              </p>
            </div>
            <Button
              onClick={handleProceedKYC}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Loading..." : "Proceed with KYC"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default StripePaymentConfig;
