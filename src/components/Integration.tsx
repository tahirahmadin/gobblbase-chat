import React from "react";
import { useUserStore } from "../store/useUserStore";
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
} from "lucide-react";

export default function Integration() {
  const { activeAgentUsername } = useUserStore();
  const [copied, setCopied] = React.useState(false);
  const [urlCopied, setUrlCopied] = React.useState(false);

  const iframeCode = `<iframe
  src="https://KiFor.ai/#/chatbot/${activeAgentUsername}"
  width="100%"
  style="height: 100%; min-height: 700px"
  frameborder="0"
></iframe>`;

  const chatbotUrl = `https://KiFor.ai/#/chatbot/${activeAgentUsername}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(iframeCode);
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Embed Chatbot Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
            <div className="flex items-center space-x-3">
              <Code className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-800">
                Embed Chatbot
              </h2>
            </div>
            <p className="mt-2 text-gray-600">
              Add your chatbot to any website with this code
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono border border-gray-200">
                  {iframeCode}
                </pre>
                <button
                  onClick={handleCopy}
                  className="absolute top-3 right-3 p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  title="Copy code"
                >
                  <Copy className="h-5 w-5 text-gray-600" />
                </button>
                {copied && (
                  <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg shadow-sm">
                    Copied!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Direct Access URL Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                  <button
                    onClick={handleShare}
                    className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    title="Share"
                  >
                    <Share2 className="h-5 w-5 text-gray-600" />
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

      {/* Social Sharing Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Share2 className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-800">
              Share on Social Media
            </h2>
          </div>
          <p className="mt-2 text-gray-600">
            Share your chatbot with your audience on social media
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href={`https://twitter.com/intent/tweet?text=Chat with my AI assistant powered by KiFor.ai&url=${encodeURIComponent(
                chatbotUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Twitter className="h-5 w-5" />
              Share on Twitter
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                chatbotUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Linkedin className="h-5 w-5" />
              Share on LinkedIn
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                chatbotUrl
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <Facebook className="h-5 w-5" />
              Share on Facebook
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Check out my AI assistant: ${chatbotUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              Share on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
