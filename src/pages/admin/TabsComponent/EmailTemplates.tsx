import React, { useState } from "react";

const mockTemplates = [
  {
    id: 1,
    category: "Physical Product",
    name: "Confirmation Email",
    enabled: true,
    subject: "<My Username> - Thank you for your Order #<order number>",
    body: "Type your message...",
  },
  {
    id: 2,
    category: "Digital Product/Service",
    name: "Confirmation Email",
    enabled: true,
    subject: "<My Username> - Thank you for your Order #<order number>",
    body: "Type your message...",
  },
  {
    id: 3,
    category: "Product/Service",
    name: "Cancellation Email",
    enabled: true,
    subject: "<My Username> - Your Order #<order number> has been cancelled",
    body: "Type your message...",
  },
  {
    id: 4,
    category: "Event",
    name: "Booking Confirmation",
    enabled: true,
    subject: "<My Username> - Your booking is confirmed",
    body: "Type your message...",
  },
  {
    id: 5,
    category: "Event",
    name: "Booking Reminder",
    enabled: true,
    subject: "<My Username> - Booking Reminder",
    body: "Type your message...",
  },
  {
    id: 6,
    category: "Event",
    name: "Booking Cancellation",
    enabled: true,
    subject: "<My Username> - Booking Cancelled",
    body: "Type your message...",
  },
  {
    id: 7,
    category: "Calendar",
    name: "Booking Confirmation",
    enabled: false,
    subject: "<My Username> - Calendar Booking Confirmed",
    body: "Type your message...",
  },
  {
    id: 8,
    category: "Calendar",
    name: "Booking Reminder",
    enabled: false,
    subject: "<My Username> - Calendar Booking Reminder",
    body: "Type your message...",
  },
  {
    id: 9,
    category: "Calendar",
    name: "Booking Cancellation",
    enabled: false,
    subject: "<My Username> - Calendar Booking Cancelled",
    body: "Type your message...",
  },
];

const EmailTemplates = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [templates, setTemplates] = useState(mockTemplates);

  const selectedTemplate = templates.find((t) => t.id === selectedId);

  const handleToggle = (id: number) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  };

  const handleSelect = (id: number) => {
    setSelectedId(id);
  };

  const handleInputChange = (field: "subject" | "body", value: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === selectedId ? { ...t, [field]: value } : t))
    );
  };

  const handleRestore = () => {
    // Restore logic (mock)
    setTemplates((prev) =>
      prev.map((t) =>
        t.id === selectedId
          ? {
              ...t,
              subject: mockTemplates.find((m) => m.id === t.id)?.subject || "",
              body: mockTemplates.find((m) => m.id === t.id)?.body || "",
            }
          : t
      )
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 p-8">
      {/* Sidebar */}
      <div className="w-full md:w-1/3 max-w-xs">
        <h2 className="text-2xl font-semibold mb-6">Email Templates</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Tailor messages to match every customer action
        </p>
        <div className="space-y-2">
          {templates.map((template) => (
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
      {/* Editor */}
      <div className="flex-1">
        {selectedTemplate && (
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-6">
            <div className="mb-4 text-gray-700 font-semibold">
              {selectedTemplate.category} &gt; {selectedTemplate.name}
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
              <div className="bg-blue-100 rounded-t-md px-2 py-1 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-600">
                  <button className="hover:text-blue-700">
                    <b>B</b>
                  </button>
                  <button className="hover:text-blue-700">
                    <i>I</i>
                  </button>
                  <button className="hover:text-blue-700">U</button>
                  <button className="hover:text-blue-700">S</button>
                  <button className="hover:text-blue-700">&#128279;</button>
                </div>
                <select className="bg-blue-100 text-gray-700 text-sm rounded px-2 py-1">
                  <option>Personalize</option>
                  <option>&lt;My Username&gt;</option>
                  <option>&lt;order number&gt;</option>
                </select>
              </div>
              <textarea
                value={selectedTemplate.body}
                onChange={(e) => handleInputChange("body", e.target.value)}
                className="w-full min-h-[160px] border-t-0 border border-blue-300 rounded-b-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                placeholder="Type your message..."
              />
            </div>
            <div className="flex items-center gap-4">
              <button
                className="border border-gray-400 rounded px-4 py-1 text-sm hover:bg-gray-100"
                onClick={handleRestore}
              >
                Restore Template
              </button>
              <button className="ml-auto bg-green-300 hover:bg-green-400 text-green-900 font-semibold px-8 py-2 rounded shadow">
                SAVE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
