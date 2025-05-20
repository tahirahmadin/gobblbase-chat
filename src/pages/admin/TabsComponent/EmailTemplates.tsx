import React, { useEffect, useState } from "react";
import { useBotConfig } from "../../../store/useBotConfig";
import { useAdminStore } from "../../../store/useAdminStore";
import TemplateEditor from "./Emails/TemplateEditor";

// Default templates
const defaultTemplates = {
  physicalProduct: {
    subject: "Your Order Confirmation",
    body: `Dear {{name}},

Thank you for your order! We're excited to confirm that your purchase has been successfully processed.

ORDER SUMMARY:
Product: {{productTitle}}
Order ID: {{orderId}}
Amount: {{totalAmount}}
Payment Method: {{paymentMethod}}
Date: {{paymentDate}}

Your order is being prepared for shipping and will be on its way to you soon. You'll receive a shipping confirmation email with tracking information once your package is on its way.

If you have any questions about your order, please don't hesitate to contact our customer support team.

Thank you for choosing our store!

Best regards,
The Team`,
  },
  
  digitalProduct: {
    subject: "Your Digital Product Order Confirmation",
    body: `Dear {{name}},

Thank you for your purchase! Your digital product is ready for download.

ORDER SUMMARY:
Product: {{productTitle}}
Order ID: {{orderId}}
Amount: {{totalAmount}}
Payment Method: {{paymentMethod}}
Date: {{paymentDate}}

You can download your purchase using the link below:
{{fileUrl}}

The download link will remain active for 30 days. If you have any questions or need assistance, please reach out to our support team.

Thank you for your business!

Best regards,
The Team`,
  },
  
  Service: {
    subject: "Your Service Order Confirmation",
    body: `Dear {{name}},

Thank you for your order! We're pleased to confirm that your service booking has been successfully processed.

ORDER SUMMARY:
Service: {{productTitle}}
Order ID: {{orderId}}
Amount: {{totalAmount}}
Payment Method: {{paymentMethod}}
Date: {{paymentDate}}

Our team will contact you shortly to coordinate the details of your service.

If you have any questions in the meantime, please don't hesitate to reach out to our customer service team.

Thank you for choosing our services!

Best regards,
The Team`,
  },
  
  Event_Booking_Confirmation: {
    subject: "Your Event Registration is Confirmed",
    body: `Dear {{name}},

Thank you for registering for our upcoming event!

ORDER SUMMARY:
Event: {{productTitle}}
Order ID: {{orderId}}
Amount: {{totalAmount}}
Payment Method: {{paymentMethod}}
Date: {{paymentDate}}

EVENT DETAILS:
Date: {{date}}
Time: {{startTime}} - {{endTime}}
Location: {{location}}
{{#if isVirtual}}Access Link: {{meetingLink}}{{/if}}

We've reserved your spot and look forward to your participation. Please save this information for your records.

If you have any questions or need special accommodations, please let us know.

Best regards,
The Team`,
  },
  
  Event_Booking_Cancellation: {
    subject: "Your Event Registration has been Cancelled",
    body: `Dear {{name}},

We're writing to confirm that your registration for the following event has been cancelled:

ORDER DETAILS:
Event: {{productTitle}}
Order ID: {{orderId}}

CANCELLED REGISTRATION:
Date: {{date}}
Time: {{startTime}} - {{endTime}}

If you'd like to register for any of our other events, please visit our events page.

Thank you for your understanding.

Best regards,
The Team`,
  },

  Calender_Booking_Confirmation: {
    subject: "Your {{sessionType}} Is Confirmed",
    body: `Dear {{name}},

Your {{sessionType}} has been successfully scheduled!

APPOINTMENT DETAILS:
Date: {{date}}
Time: {{startTime}} - {{endTime}}
Location: {{location}}
{{#if isVirtual}}Meeting Link: {{meetingLink}}{{/if}}

Please make sure to be available at least 5 minutes before the scheduled time. If you need to reschedule or cancel, please do so at least 24 hours in advance.

We look forward to meeting with you!

Best regards,
The Team`,
  },

  Calender_Booking_Cancellation: {
    subject: "Your {{sessionType}} Has Been Cancelled",
    body: `Dear {{name}},

We're writing to confirm that your {{sessionType}} has been cancelled as requested.

CANCELLED APPOINTMENT:
Date: {{date}}
Time: {{startTime}} - {{endTime}}

If you'd like to reschedule for another time, please visit our booking page or contact us directly.

Thank you for your understanding.

Best regards,
The Team`,
  }
};


const activeTemplateKeys = [
  "physicalProduct", 
  "digitalProduct", 
  "Service", 
  "Event_Booking_Confirmation",
  "Event_Booking_Cancellation",
  "Calender_Booking_Confirmation", 
  "Calender_Booking_Cancellation"
];

// This maps placeholder categories to their display options
const placeholderOptions = {
  common: [
    { value: "{{name}}", label: "Customer Name" },
    { value: "{{email}}", label: "Customer Email" },
    { value: "{{currentYear}}", label: "Current Year" },
  ],
  product: [
    { value: "{{orderId}}", label: "Order ID" },
    { value: "{{totalAmount}}", label: "Total Amount" },
    { value: "{{paymentMethod}}", label: "Payment Method" },
    { value: "{{paymentDate}}", label: "Payment Date" },
    { value: "{{productTitle}}", label: "Product Title" },
  ],
  digital: [
    { value: "{{fileUrl}}", label: "Download Link" }
  ],
  booking: [
    { value: "{{sessionType}}", label: "Session Type" },
    { value: "{{date}}", label: "Appointment Date" },
    { value: "{{startTime}}", label: "Start Time" },
    { value: "{{endTime}}", label: "End Time" },
    { value: "{{location}}", label: "Location" },
    { value: "{{meetingLink}}", label: "Meeting Link" },
    { value: "{{#if isVirtual}}", label: "Start Virtual Meeting Section" },
    { value: "{{/if}}", label: "End Conditional Section" },
  ]
};

const EmailTemplates = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const { activeBotId } = useBotConfig();
  const [preview, setPreview] = useState(false);
  const [templatePreview, setTemplatePreview] = useState("");

  const {
    emailTemplates,
    emailTemplatesLoading,
    emailTemplatesError,
    fetchEmailTemplates,
    updateEmailTemplate,
    setEmailTemplates,
  } = useAdminStore();

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (activeBotId && emailTemplates.length === 0) {
      fetchEmailTemplates(activeBotId);
    }
  }, [activeBotId, fetchEmailTemplates, emailTemplates.length]);

  // Apply default templates when templates are loaded or selectedId changes
  useEffect(() => {
    if (emailTemplates.length > 0 && selectedId) {
      const template = emailTemplates.find(t => t.id === selectedId);
      if (template) {
        // If subject or body is empty, set default values
        if (!template.subject || template.subject.trim() === '') {
          const defaultTemplate = defaultTemplates[template.rawKey as keyof typeof defaultTemplates];
          if (defaultTemplate) {
            handleInputChange("subject", defaultTemplate.subject);
          }
        }
        
        if (!template.body || template.body.trim() === '') {
          const defaultTemplate = defaultTemplates[template.rawKey as keyof typeof defaultTemplates];
          if (defaultTemplate) {
            handleInputChange("body", defaultTemplate.body);
          }
        }
      }
    }
  }, [emailTemplates, selectedId]);

  const selectedTemplate = emailTemplates.find((t) => t.id === selectedId);

  const filteredTemplates = emailTemplates.filter((template) => 
    activeTemplateKeys.includes(template.rawKey)
  );

  const handleToggle = (id: number) => {
    setEmailTemplates(
      emailTemplates.map((t) =>
        t.id === id ? { ...t, enabled: !t.enabled } : t
      )
    );
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
    setPreview(false);
    setSuccess(false);
    
    const template = emailTemplates.find(t => t.id === id);
    if (template) {
      let updated = false;
      
      // If subject is empty, set default
      if (!template.subject || template.subject.trim() === '') {
        const defaultTemplate = defaultTemplates[template.rawKey as keyof typeof defaultTemplates];
        if (defaultTemplate) {
          handleInputChange("subject", defaultTemplate.subject);
          updated = true;
        }
      }
      
      if (!template.body || template.body.trim() === '') {
        const defaultTemplate = defaultTemplates[template.rawKey as keyof typeof defaultTemplates];
        if (defaultTemplate) {
          handleInputChange("body", defaultTemplate.body);
          updated = true;
        }
      }
    }
  };

  const handleInputChange = (field: "subject" | "body", value: string) => {
    setEmailTemplates(
      emailTemplates.map((t) =>
        t.id === selectedId ? { ...t, [field]: value } : t
      )
    );
  };

  const handleRestore = () => {
    if (selectedTemplate) {
      const templateType = selectedTemplate.rawKey;
      
      if (defaultTemplates[templateType as keyof typeof defaultTemplates]) {
        handleInputChange("subject", defaultTemplates[templateType as keyof typeof defaultTemplates].subject);
        handleInputChange("body", defaultTemplates[templateType as keyof typeof defaultTemplates].body);
        setSuccess(false);
      }
    }
  };

  const handlePreview = () => {
    if (!selectedTemplate) return;
    
    // Create example data for preview
    let previewData: Record<string, string> = {
      name: "John Smith",
      email: "john.smith@example.com",
      currentYear: new Date().getFullYear().toString(),
    };
    
    if (["physicalProduct", "digitalProduct", "Service", "Event_Booking_Confirmation", "Event_Booking_Cancellation"].includes(selectedTemplate.rawKey)) {
      previewData = {
        ...previewData,
        orderId: "ORD-10045",
        totalAmount: "$99.99",
        paymentMethod: "Credit Card",
        paymentDate: new Date().toLocaleDateString(),
        productTitle: selectedTemplate.rawKey === "physicalProduct" 
          ? "Premium Wireless Headphones" 
          : selectedTemplate.rawKey === "digitalProduct"
          ? "Complete Digital Marketing Course"
          : selectedTemplate.rawKey === "Service"
          ? "Professional Consultation Package"
          : "Annual Technology Conference"
      };
      
      // Add digital product specific placeholder
      if (selectedTemplate.rawKey === "digitalProduct") {
        previewData.fileUrl = "https://example.com/download/your-purchase";
      }
      
      // Add event specific placeholders
      if (["Event_Booking_Confirmation", "Event_Booking_Cancellation"].includes(selectedTemplate.rawKey)) {
        previewData = {
          ...previewData,
          date: "Saturday, July 15, 2025",
          startTime: "9:00 AM",
          endTime: "5:00 PM",
          location: "Virtual Event",
          isVirtual: "true",
          meetingLink: "https://events.example.com/tech-conf-2025"
        };
      }
    } else if (["Calender_Booking_Confirmation", "Calender_Booking_Cancellation"].includes(selectedTemplate.rawKey)) {
      // Booking related templates
      previewData = {
        ...previewData,
        date: "Monday, June 10, 2025",
        startTime: "10:00 AM",
        endTime: "11:00 AM",
        location: "Google Meet",
        isVirtual: "true",
        meetingLink: "https://meet.google.com/abc-defg-hij",
        sessionType: "Consultation"
      };
    }
    
    // Simple template render for preview
    let preview = selectedTemplate.body;
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    
    // Handle {{#if isVirtual}}...{{/if}} conditional
    if (previewData.isVirtual === "true") {
      preview = preview.replace(/\{\{#if isVirtual\}\}(.*?)\{\{\/if\}\}/gs, "$1");
    } else {
      preview = preview.replace(/\{\{#if isVirtual\}\}(.*?)\{\{\/if\}\}/gs, "");
    }
    
    setTemplatePreview(preview);
    setPreview(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      if (!selectedTemplate || !activeBotId)
        throw new Error("No template selected");
      
      // Prepare the data for the API
      const updatedData = {
        subText: selectedTemplate.name,
        isActive: selectedTemplate.enabled,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
      };
      
      await updateEmailTemplate(
        activeBotId,
        updatedData,
        selectedTemplate.rawKey
      );
      
      setSuccess(true);
    } catch (err: any) {
      console.error("Error saving template:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlaceholder = (placeholder: string) => {
    if (!selectedTemplate || !placeholder) return;
    
    handleInputChange("body", selectedTemplate.body + " " + placeholder + " ");
  };

  // Get placeholders based on template type
  const getPlaceholdersForTemplate = () => {
    let options = [...placeholderOptions.common];
    
    if (["physicalProduct", "digitalProduct", "Service", "Event_Booking_Confirmation", "Event_Booking_Cancellation"].includes(selectedTemplate?.rawKey || "")) {
      // For all product-type templates
      options = [...options, ...placeholderOptions.product];
      
      if (selectedTemplate?.rawKey === "digitalProduct") {
        options = [...options, ...placeholderOptions.digital];
      }
      
      // Add booking-related placeholders for event types
      if (["Event_Booking_Confirmation", "Event_Booking_Cancellation"].includes(selectedTemplate?.rawKey || "")) {
        options = [...options, ...placeholderOptions.booking];
      }
    } else if (["Calender_Booking_Confirmation", "Calender_Booking_Cancellation"].includes(selectedTemplate?.rawKey || "")) {
      options = [...options, ...placeholderOptions.booking];
    }
    
    return options;
  };

  // If data is still loading
  if (emailTemplatesLoading)
    return <div className="p-6">Loading templates...</div>;
  
  // Handle error state
  if (emailTemplatesError)
    return <div className="p-6 text-red-500">{emailTemplatesError}</div>;

  return (
    // Add height constraint and overflow to the main container
    <div className="flex flex-col md:flex-row gap-8 p-6 h-screen overflow-hidden">
      {/* Sidebar with scrolling */}
      <div className="w-full md:w-1/3 max-w-xs h-full overflow-y-auto">
        <h2 className="text-xl font-bold text-black">Email Templates</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Tailor messages to match every customer action
        </p>
        <div className="space-y-2">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition border ${
                selectedId === template.id
                  ? "bg-green-50 border-green-400"
                  : "bg-white border-gray-200"
              }`}
              onClick={() => handleSelect(template.id)}
            >
              <div>
                <div
                  className={`text-sm font-semibold ${
                    selectedId === template.id
                      ? "text-green-700"
                      : "text-gray-800"
                  }`}
                >
                  {template.category}
                </div>
                <div
                  className={`text-xs ${
                    selectedId === template.id
                      ? "text-green-600"
                      : "text-gray-500"
                  }`}
                >
                  {template.name}
                </div>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleToggle(template.id);
                  }}
                  className="sr-only peer"
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className={`w-11 h-6 bg-gray-200 rounded-full relative transition-colors duration-200 peer-focus:outline-none peer-checked:bg-green-400`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                      template.enabled ? "translate-x-5" : ""
                    }`}
                  ></div>
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Editor area with scrolling */}
      <div className="flex-1 h-full overflow-y-auto">
        {selectedTemplate && !preview && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
            <div className="mb-4 text-gray-700 font-semibold">
              {selectedTemplate.category} &gt; {selectedTemplate.name}
            </div>
            
            {/* Instructions - Simplified */}
            <div className="mb-6 bg-yellow-50 p-3 rounded border border-yellow-200">
              <h3 className="font-medium text-yellow-800 mb-2">Email Template Guide</h3>
              <p className="text-sm text-gray-700">
                Edit the text of your email while keeping the blue placeholders intact. These placeholders will be automatically filled with real customer information when emails are sent.
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Body</label>
              <div className="bg-blue-100 rounded-t-md px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <button 
                    type="button" 
                    className="hover:text-blue-700 px-1.5 py-0.5"
                    onClick={handleRestore}
                  >
                    Restore Default Template
                  </button>
                </div>
                <select
                  className="bg-white text-gray-700 text-sm rounded px-2 py-1 border border-blue-300"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddPlaceholder(e.target.value);
                    }
                    e.target.value = ""; // Reset the dropdown
                  }}
                >
                  <option value="">Add Placeholder...</option>
                  {getPlaceholdersForTemplate().map((placeholder) => (
                    <option key={placeholder.value} value={placeholder.value}>
                      {placeholder.label}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Using TemplateEditor component with max height and scrolling */}
              <div className="border-t-0 border border-blue-300 rounded-b-md bg-white max-h-96 overflow-y-auto">
                <TemplateEditor
                  template={selectedTemplate.body}
                  onChange={(newBody) => handleInputChange("body", newBody)}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-1.5 text-sm"
                onClick={handlePreview}
              >
                Preview Email
              </button>
              
              {emailTemplatesError && (
                <div className="mt-2 text-red-500">{emailTemplatesError}</div>
              )}
              {success && (
                <div className="mt-2 text-green-600">✓ Saved successfully!</div>
              )}
              <button
                className="ml-auto bg-green-500 hover:bg-green-600 text-white font-medium px-6 py-2 rounded shadow"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving..." : "SAVE TEMPLATE"}
              </button>
            </div>
          </div>
        )}
        
        {/* Preview Panel with scrolling */}
        {selectedTemplate && preview && (
          <div className="bg-white border border-blue-300 rounded-lg p-6 max-h-full overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-semibold text-lg">Email Preview</h3>
              <button 
                className="text-blue-700 hover:text-blue-900"
                onClick={() => setPreview(false)}
              >
                Back to Edit
              </button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-blue-600 text-white p-4">
                <h2 className="text-xl font-bold text-center">
                  {selectedTemplate.subject}
                </h2>
              </div>
              
              <div className="p-6 bg-white border-t border-gray-200 max-h-96 overflow-y-auto">
                <div 
                  className="whitespace-pre-line text-gray-700"
                  dangerouslySetInnerHTML={{ __html: templatePreview.replace(/\n/g, '<br>') }}
                />
                
                {selectedTemplate.rawKey === "digitalProduct" && (
                  <div className="mt-4 text-center">
                    <a 
                      href="#download-link"
                      className="inline-block px-4 py-2 bg-blue-500 text-white rounded"
                    >
                      Download Your Purchase
                    </a>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-100 p-4 text-center text-sm text-gray-500">
                <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
                <p>This is an automated message. Please do not reply.</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-500">
              <p>Note: This is a simplified preview. The actual email will include your full branding and formatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
