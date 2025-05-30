import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBookingForReschedule } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import { Theme } from "../../types";
import RescheduleFlowComponent from "./RescheduleFlowComponent";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";

const RescheduleBookingWrapper: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const { activeBotData } = useBotConfig();

  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('userId');

  useEffect(() => {
    const fetchBookingData = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        const result = await getBookingForReschedule(bookingId, userId || '');
        
        if (result.error) {
          setError(result.result);
        } else {
          setBookingData(result.result);
        }
      } catch (err) {
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingId, userId]);

  const theme: Theme = {
    primaryColor: activeBotData?.theme?.primaryColor || "#3b82f6",
    secondaryColor: activeBotData?.theme?.secondaryColor || "#e5e7eb",
    backgroundColor: activeBotData?.theme?.backgroundColor || "#ffffff",
    chatBackground: activeBotData?.theme?.chatBackground || "#f3f4f6",
    highlightColor: activeBotData?.theme?.highlightColor || "#2563eb",
    isDark: false,
    textColor: activeBotData?.theme?.textColor || "#000000",
    userTextColor: activeBotData?.theme?.userTextColor || "#000000",
    botTextColor: activeBotData?.theme?.botTextColor || "#000000",
    borderRadius: activeBotData?.theme?.borderRadius || 12,
    mainLightColor: activeBotData?.theme?.primaryColor || "#3b82f6",
    userMessageBackground: activeBotData?.theme?.userMessageBackground || "#e5e7eb",
    botMessageBackground: activeBotData?.theme?.botMessageBackground || "#3b82f6",
  };

  const handleSuccess = () => {
    setShowSuccess(true);
  };

  const handleClose = () => {
    // Close the reschedule flow
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Successfully Rescheduled!</h2>
          <p className="text-gray-600 mb-6">
            Your appointment has been successfully rescheduled. You will receive a confirmation email shortly.
          </p>
          <p className="text-sm text-gray-500">
            You can close this window now.
          </p>
        </div>
      </div>
    );
  }

  // Extract userId from booking data if not provided in URL
  const actualUserId = userId || bookingData?.booking?.userId;

  if (!actualUserId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">
            Please use the reschedule link sent to your email to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Reschedule Appointment</h1>
          </div>
          <RescheduleFlowComponent
            bookingId={bookingId!}
            userId={actualUserId}
            theme={theme}
            onClose={handleClose}
            onSuccess={handleSuccess}
          />
        </div>
      </div>
    </div>
  );
};

export default RescheduleBookingWrapper;