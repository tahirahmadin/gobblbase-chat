import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getBookingForReschedule } from "../../../lib/serverActions";
import { useBotConfig } from "../../../store/useBotConfig";
import { Theme } from "../../types";
import RescheduleFlowComponent from "./RescheduleFlowComponent";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft, Calendar, X } from "lucide-react";

// Interfaces for better type safety
interface BookingData {
  booking: {
    _id: string;
    userId: string;
    agentId: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    name: string;
    notes?: string;
    businessTimezone: string;
    sessionType: string;
    displayStartTime?: string;
    displayEndTime?: string;
    userTimezone?: string;
  };
  settings: {
    availability: Array<{
      day: string;
      available: boolean;
      timeSlots: Array<{ startTime: string; endTime: string; }>;
    }>;
    unavailableDates?: Array<{
      date: string;
      allDay: boolean;
      startTime?: string;
      endTime?: string;
    }>;
    timezone: string;
    meetingDuration: number;
    bufferTime: number;
  };
}

interface LoadingState {
  isLoading: boolean;
  phase: 'initial' | 'validating' | 'fetching' | 'ready';
  message: string;
}

interface ErrorState {
  hasError: boolean;
  type: 'validation' | 'network' | 'auth' | 'not_found' | 'unknown';
  message: string;
  canRetry: boolean;
}

// Custom hook for theme management
const useTheme = (): Theme => {
  const { activeBotData } = useBotConfig();
  
  return useMemo(() => ({
    primaryColor: activeBotData?.theme?.primaryColor || "#3b82f6",
    secondaryColor: activeBotData?.theme?.secondaryColor || "#e5e7eb",
    backgroundColor: activeBotData?.theme?.backgroundColor || "#ffffff",
    chatBackground: activeBotData?.theme?.chatBackground || "#f3f4f6",
    highlightColor: activeBotData?.theme?.highlightColor || "#2563eb",
    isDark: activeBotData?.theme?.isDark || false,
    textColor: activeBotData?.theme?.textColor || "#000000",
    userTextColor: activeBotData?.theme?.userTextColor || "#000000",
    botTextColor: activeBotData?.theme?.botTextColor || "#000000",
    borderRadius: activeBotData?.theme?.borderRadius || 12,
    mainLightColor: activeBotData?.theme?.primaryColor || "#3b82f6",
    userMessageBackground: activeBotData?.theme?.userMessageBackground || "#e5e7eb",
    botMessageBackground: activeBotData?.theme?.botMessageBackground || "#3b82f6",
  }), [activeBotData?.theme]);
};

// Custom hook for URL parameters
const useRescheduleParams = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get('userId');
  const redirectUrl = searchParams.get('redirect') || '/';

  const validateParams = useCallback((): ErrorState | null => {
    if (!bookingId || bookingId.trim() === '') {
      return {
        hasError: true,
        type: 'validation',
        message: 'Invalid booking ID provided in the URL.',
        canRetry: false
      };
    }

    if (bookingId.length < 10 || bookingId.length > 50) {
      return {
        hasError: true,
        type: 'validation',
        message: 'Booking ID format is invalid.',
        canRetry: false
      };
    }

    return null;
  }, [bookingId]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(redirectUrl);
    }
  }, [navigate, redirectUrl]);

  return {
    bookingId: bookingId?.trim(),
    userId: userId?.trim(),
    validateParams,
    goBack
  };
};

// Error display component
const ErrorDisplay: React.FC<{
  error: ErrorState;
  theme: Theme;
  onRetry?: () => void;
  onGoBack: () => void;
}> = ({ error, theme, onRetry, onGoBack }) => {
  const getErrorIcon = () => {
    switch (error.type) {
      case 'auth':
        return <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />;
      case 'not_found':
        return <Calendar className="h-12 w-12 text-gray-500 mx-auto mb-4" />;
      default:
        return <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />;
    }
  };

  const getErrorTitle = () => {
    switch (error.type) {
      case 'validation':
        return 'Invalid Link';
      case 'auth':
        return 'Authentication Required';
      case 'not_found':
        return 'Booking Not Found';
      case 'network':
        return 'Connection Error';
      default:
        return 'Something Went Wrong';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
         style={{ backgroundColor: theme.chatBackground }}>
      <div className="text-center p-8 rounded-lg shadow-lg max-w-md w-full"
           style={{ backgroundColor: theme.backgroundColor }}>
        {getErrorIcon()}
        <h2 className="text-xl font-semibold mb-3" style={{ color: theme.textColor }}>
          {getErrorTitle()}
        </h2>
        <p className="mb-6 text-sm leading-relaxed" style={{ color: theme.textColor, opacity: 0.8 }}>
          {error.message}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {error.canRetry && onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: theme.highlightColor,
                color: theme.highlightColor
              }}
            >
              Try Again
            </button>
          )}
          <button
            onClick={onGoBack}
            className="px-6 py-2 rounded-lg transition-colors flex items-center justify-center"
            style={{
              backgroundColor: theme.highlightColor,
              color: theme.backgroundColor
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

// Loading display component
const LoadingDisplay: React.FC<{
  loadingState: LoadingState;
  theme: Theme;
}> = ({ loadingState, theme }) => (
  <div className="min-h-screen flex items-center justify-center p-4"
       style={{ backgroundColor: theme.chatBackground }}>
    <div className="text-center p-8 rounded-lg shadow-lg max-w-md w-full"
         style={{ backgroundColor: theme.backgroundColor }}>
      <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" 
               style={{ color: theme.highlightColor }} />
      <h2 className="text-lg font-semibold mb-2" style={{ color: theme.textColor }}>
        Loading...
      </h2>
      <p className="text-sm" style={{ color: theme.textColor, opacity: 0.7 }}>
        {loadingState.message}
      </p>
      <div className="mt-4 w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ 
            backgroundColor: theme.highlightColor,
            width: loadingState.phase === 'initial' ? '25%' : 
                   loadingState.phase === 'validating' ? '50%' :
                   loadingState.phase === 'fetching' ? '75%' : '100%'
          }}
        />
      </div>
    </div>
  </div>
);

// Success display component
const SuccessDisplay: React.FC<{
  theme: Theme;
  onClose: () => void;
}> = ({ theme, onClose }) => (
  <div className="min-h-screen flex items-center justify-center p-4"
       style={{ backgroundColor: theme.chatBackground }}>
    <div className="text-center p-8 rounded-lg shadow-lg max-w-md w-full"
         style={{ backgroundColor: theme.backgroundColor }}>
      <div className="mb-6">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: '#dcfce7' }}
        >
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-3" style={{ color: theme.textColor }}>
        Successfully Rescheduled!
      </h2>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: theme.textColor, opacity: 0.8 }}>
        Your appointment has been successfully rescheduled. You will receive a confirmation email shortly with the updated details.
      </p>
      <div className="space-y-3">
        <p className="text-xs" style={{ color: theme.textColor, opacity: 0.6 }}>
          You can safely close this window now.
        </p>
        <button
          onClick={onClose}
          className="px-6 py-2 rounded-lg transition-colors"
          style={{
            backgroundColor: theme.highlightColor,
            color: theme.backgroundColor
          }}
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const RescheduleBookingWrapper: React.FC = () => {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    phase: 'initial',
    message: 'Initializing...'
  });
  const [error, setError] = useState<ErrorState | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const theme = useTheme();
  const { bookingId, userId, validateParams, goBack } = useRescheduleParams();

  // Fetch booking data with comprehensive error handling
  const fetchBookingData = useCallback(async () => {
    if (!bookingId) return;

    try {
      setLoadingState({
        isLoading: true,
        phase: 'validating',
        message: 'Validating booking information...'
      });

      // Validate parameters first
      const paramError = validateParams();
      if (paramError) {
        setError(paramError);
        setLoadingState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      setLoadingState({
        isLoading: true,
        phase: 'fetching',
        message: 'Loading booking details...'
      });

      const result = await getBookingForReschedule(bookingId, userId || '');
      
      if (result.error) {
        let errorType: ErrorState['type'] = 'unknown';
        let canRetry = true;

        // Determine error type based on the error message
        const errorMsg = result.result || 'Unknown error occurred';
        if (errorMsg.includes('not found') || errorMsg.includes('does not exist')) {
          errorType = 'not_found';
          canRetry = false;
        } else if (errorMsg.includes('unauthorized') || errorMsg.includes('permission')) {
          errorType = 'auth';
          canRetry = false;
        } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
          errorType = 'network';
          canRetry = true;
        }

        setError({
          hasError: true,
          type: errorType,
          message: errorMsg,
          canRetry
        });
      } else {
        if (!result.result?.booking || !result.result?.settings) {
          setError({
            hasError: true,
            type: 'validation',
            message: 'Invalid booking data received. Please check your link and try again.',
            canRetry: true
          });
          return;
        }

        setBookingData(result.result);
        setLoadingState({
          isLoading: false,
          phase: 'ready',
          message: 'Ready!'
        });
      }
    } catch (err) {
      console.error("Error fetching booking data:", err);
      setError({
        hasError: true,
        type: 'network',
        message: 'Failed to load booking details. Please check your internet connection and try again.',
        canRetry: true
      });
    } finally {
      if (!error) {
        setLoadingState(prev => ({ ...prev, isLoading: false }));
      }
    }
  }, [bookingId, userId, validateParams]);

  // Initial load
  useEffect(() => {
    fetchBookingData();
  }, [fetchBookingData]);

  // Success handler
  const handleSuccess = useCallback(() => {
    setShowSuccess(true);
  }, []);

  // Close handler
  const handleClose = useCallback(() => {
    goBack();
  }, [goBack]);

  // Retry handler
  const handleRetry = useCallback(() => {
    setError(null);
    setLoadingState({
      isLoading: true,
      phase: 'initial',
      message: 'Retrying...'
    });
    fetchBookingData();
  }, [fetchBookingData]);

  // Render loading state
  if (loadingState.isLoading) {
    return <LoadingDisplay loadingState={loadingState} theme={theme} />;
  }

  // Render error state
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        theme={theme}
        onRetry={error.canRetry ? handleRetry : undefined}
        onGoBack={handleClose}
      />
    );
  }

  // Render success state
  if (showSuccess) {
    return <SuccessDisplay theme={theme} onClose={handleClose} />;
  }

  // Validate user ID
  const actualUserId = userId || bookingData?.booking?.userId;
  if (!actualUserId) {
    return (
      <ErrorDisplay
        error={{
          hasError: true,
          type: 'auth',
          message: 'Please use the reschedule link sent to your email to access this page.',
          canRetry: false
        }}
        theme={theme}
        onGoBack={handleClose}
      />
    );
  }

  // Main render
  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.chatBackground }}>
      <div className="max-w-2xl mx-auto py-4 sm:py-8 px-4">
        <div 
          className="rounded-lg shadow-lg overflow-hidden"
          style={{ backgroundColor: theme.backgroundColor }}
        >
          {/* Header */}
          <div 
            className="p-4 sm:p-6 border-b"
            style={{ borderColor: theme.isDark ? '#333' : '#e5e7eb' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: theme.textColor }}
                >
                  Reschedule Appointment
                </h1>
                <p 
                  className="text-sm mt-1"
                  style={{ color: theme.textColor, opacity: 0.7 }}
                >
                  Select a new date and time for your appointment
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-colors hover:bg-opacity-10 hover:bg-gray-500"
                style={{ color: theme.textColor }}
                aria-label="Close reschedule flow"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Reschedule Flow */}
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