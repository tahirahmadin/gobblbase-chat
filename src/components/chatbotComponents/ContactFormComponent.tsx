import React, { useState } from "react";
import { Theme } from "../../types";
import { saveCustomerLead } from "../../lib/serverActions";
import { toast } from "react-hot-toast";

interface ContactFormComponentProps {
  theme: Theme;
  agentId?: string;
  botName?: string;
  onSubmitSuccess?: () => void;
}

const ContactFormComponent: React.FC<ContactFormComponentProps> = ({
  theme,
  agentId,
  botName = "Assistant",
  onSubmitSuccess
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await saveCustomerLead(agentId || "", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        queryMessage: formData.message,
        createdAt: new Date().toISOString(),
      });

      if (response.error) {
        throw new Error(response.result || "Failed to submit form");
      }

      // Show success
      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you soon.");
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (err) {
      setError("Failed to submit form. Please try again.");
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Define common styles for better consistency
  const inputStyles = `w-full px-3 py-2 rounded-lg border transition-all duration-200 
    focus:outline-none focus:ring-2 focus:ring-opacity-50 
    focus:ring-${theme.highlightColor.includes('#') ? '[' + theme.highlightColor.substring(1) + ']' : theme.highlightColor + '-500'}`;

  const inputBgStyles = theme.isDark 
    ? "bg-gray-800 border-gray-700 text-white focus:border-gray-600" 
    : "bg-white border-gray-200 text-gray-800 focus:border-gray-300";

  if (isSubmitted) {
    return (
      <div 
        className="p-5 rounded-xl shadow-lg"
        style={{
          color: theme.isDark ? "white" : "#1F2937",
        }}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-3">Message Sent!</h3>
          <p className="text-base opacity-90 mb-4 max-w-md mx-auto">
            Thank you for contacting us. We'll get back to you as soon as possible.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="rounded-xl overflow-hidden shadow-lg"
      style={{
        color: theme.isDark ? "white" : "#1F2937",
      }}
    >
      <div className="p-4">
        <div 
          className="mb-4 pb-2 text-center"
          style={{
            borderBottom: `1px solid ${theme.isDark ? '#374151' : '#E5E7EB'}`
          }}
        >
          <h3 
            className="text-xl font-bold" 
            style={{
              color: theme.isDark ? "white" : "#1F2937",
            }}
          >
            Contact {botName}
          </h3>
          <p className="text-sm mt-1 opacity-75">
            Fill out the form below and we'll get back to you soon
          </p>
        </div>
        
        {error && (
          <div className="mb-3 p-3 rounded-lg bg-red-100 border border-red-200 text-red-700 text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`${inputStyles} ${inputBgStyles}`}
              style={{
                borderColor: theme.isDark ? "#374151" : "#E5E7EB",
              }}
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`${inputStyles} ${inputBgStyles}`}
              style={{
                backgroundColor: theme.isDark ? "#1F2937" : "white",
                borderColor: theme.isDark ? "#374151" : "#E5E7EB",
              }}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className={`${inputStyles} ${inputBgStyles}`}
              style={{
                backgroundColor: theme.isDark ? "#1F2937" : "white",
                borderColor: theme.isDark ? "#374151" : "#E5E7EB",
              }}
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              className={`${inputStyles} ${inputBgStyles} resize-none`}
              style={{
                backgroundColor: theme.isDark ? "#1F2937" : "white",
                borderColor: theme.isDark ? "#374151" : "#E5E7EB",
              }}
              placeholder="How can we help you?"
              rows={4}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 px-3 rounded-lg font-medium text-center transition-all duration-200 
              shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed
              transform hover:-translate-y-0.5 active:translate-y-0"
            style={{
              backgroundColor: theme.highlightColor,
              color: theme.isDark ? "#111827" : "white",
            }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              "Submit Message"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactFormComponent;