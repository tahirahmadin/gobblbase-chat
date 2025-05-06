import React from "react";

export default function TryFreeBanner() {
  return (
    <div className="mt-auto w-full shadow-lg">
      {/* Create Agent Banner */}
      <div
        className="flex items-center justify-between  p-2"
        style={{ backgroundColor: "#91a3ff" }}
      >
        <span className="text-sm">Create your free AI Agent</span>
        <button
          onClick={() => {
            window.open("https://app.kifor.ai/", "_blank");
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium"
          style={{ color: "white" }}
        >
          TRY KIFOR
        </button>
      </div>
    </div>
  );
}
