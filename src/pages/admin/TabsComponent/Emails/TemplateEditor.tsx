import React, { useState, useEffect } from "react";

interface TemplateEditorProps {
  template?: string;
  onChange: (newTemplate: string) => void;
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template = "",
  onChange,
}) => {
  // Auto-resize function for text areas
  const autoResize = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = "auto";
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div className="border border-gray-200 rounded-md bg-white p-1">
      <textarea
        value={template}
        onChange={(e) => onChange(e.target.value)}
        onInput={autoResize}
        className="w-full border-0 p-0 focus:ring-0 resize-none"
        style={{
          minHeight: "24px",
          height: "auto",
          outline: "none",
        }}
        placeholder="Enter your message here..."
      />
    </div>
  );
};

export default TemplateEditor;
