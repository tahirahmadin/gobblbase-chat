import React from "react";

export default function TryFreeBanner() {
  return (
    <div className="w-full shadow-lg" style={{ margin: 0, padding: 0 }}>
      <div
        className="flex items-center justify-between p-2"
        style={{ backgroundColor: "#91a3ff" }}
      >
        <span className="text-sm text-black px-4">Create your free AI Agent</span>
        <button
          onClick={() => {
            window.open("https://www.kifor.ai/", "_blank");
          }}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium mr-4"
          style={{ color: "white" }}
        >
          TRY KIFOR
        </button>
      </div>
    </div>
  );
}
