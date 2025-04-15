import React from "react";
import { useUserStore } from "../store/useUserStore";
import { Copy } from "lucide-react";

export default function Integration() {
  const { activeAgentId } = useUserStore();
  const [copied, setCopied] = React.useState(false);

  const iframeCode = `<iframe
  src="https://gobblbase-chat.vercel.app/#/chatbot/${activeAgentId}"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
></iframe>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Embed Chatbot
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Copy and paste this code to embed your chatbot on any website:
        </p>
        <div className="relative">
          <pre className="bg-gray-50 p-4 rounded-md overflow-x-auto text-sm">
            {iframeCode}
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600"
          >
            <Copy className="h-5 w-5" />
          </button>
          {copied && (
            <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
              Copied!
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <iframe
            src={`/chatbot/${activeAgentId}`}
            width="100%"
            style={{ height: "700px" }}
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
}
