import React from "react";
import {
  Copy,
  ExternalLink,
  Share2,
  Globe,
  Code,
  Twitter,
  Linkedin,
  Facebook,
  MessageSquare,
  Check,
} from "lucide-react";
import { useBotConfig } from "../../../store/useBotConfig";

export default function Embed() {
  const { activeBotData } = useBotConfig();
  const [copied, setCopied] = React.useState(false);
  const [urlCopied, setUrlCopied] = React.useState(false);
  const [embedType, setEmbedType] = React.useState<"bubble" | "iframe">(
    "iframe"
  );

  const iframeCode = `<iframe
  src="https://test.KiFor.ai/${activeBotData?.username}"
  width="100%"
  style="height: 100%; min-height: 600px"
  frameborder="0"
></iframe>`;

  const bubbleCode = `<script>
  window.chatbaseConfig = {
    chatbotId: "${activeBotData?.username}"
  }
</script>
<script
  src="https://test.KiFor.ai/embed.min.js"
  async>
</script>`;

  const chatbotUrl = `https://test.KiFor.ai/${activeBotData?.username}`;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUrlCopy = () => {
    navigator.clipboard.writeText(chatbotUrl);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  };

  const handleVisitUrl = () => {
    window.open(chatbotUrl, "_blank");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Chat with my AI Assistant",
          text: "Check out my AI assistant powered by KiFor.ai",
          url: chatbotUrl,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      <div
        className="space-y-6 p-4 h-full overflow-y-auto"
        style={{ paddingBottom: 200 }}
      >
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black">Embed Chat</h2>
        </div>

        {/* Configuration Section */}
        <div
          className="rounded-lg border border-gray-200"
          style={{ backgroundColor: "#eaefff" }}
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Configuration
            </h2>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  On the website - www.kifor.ai
                </h3>
                <div className="relative">
                  <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                    {embedType === "bubble" ? bubbleCode : iframeCode}
                  </pre>
                  <button
                    onClick={() =>
                      handleCopy(
                        embedType === "bubble" ? bubbleCode : iframeCode
                      )
                    }
                    className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <Copy className="h-5 w-5 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Direct Access URL Card */}
        <div
          className="rounded-lg border border-gray-200 h-[220px]"
          style={{ backgroundColor: "#eaefff" }}
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Direct Access URL
              </h2>
            </div>
            <p className="mt-2 text-gray-600">
              Share your chatbot with this direct link
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                  {chatbotUrl}
                </div>
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={handleUrlCopy}
                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="h-5 w-5 text-gray-600" />
                  </button>
                  <button
                    onClick={handleVisitUrl}
                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-5 w-5 text-gray-600" />
                  </button>
                </div>
                {urlCopied && (
                  <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg shadow-sm">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
