import React, { useState } from "react";
import { Copy, ExternalLink, Globe, Check } from "lucide-react";
import { useBotConfig } from "../../../../store/useBotConfig";

const embedAgent = ["Embed a Chat Bubble?", "Embed the IFrame directly"];
export default function Embed() {
  const [selectedEmbedAgent, setSelectedEmbedAgent] = useState<string>(
    embedAgent[0]
  );
  const { activeBotData } = useBotConfig();
  const [copied, setCopied] = React.useState(false);
  const [urlCopied, setUrlCopied] = React.useState(false);
  const [embedType, setEmbedType] = React.useState<"bubble" | "iframe">(
    "iframe"
  );

  const iframeCode = `<iframe
  src="https://Sayy.ai/${activeBotData?.username}"
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
  src="https://Sayy.ai/embed.min.js"
  async>
</script>`;

  const chatbotUrl = `https://Sayy.ai/${activeBotData?.username}`;

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

  return (
    <div className="h-screen overflow-x-hidden">
      <div
        className="space-y-6 h-full overflow-y-auto "
        style={{ paddingBottom: 200 }}
      >
        {/* upper side title and toggle btn  */}
        <div className="mt-4 sm:px-12 py-6">
          <h2 className="text-2xl px-4 sm:px-0 font-semibold text-gray-900">
            Embed Agent
          </h2>
          <div className="px-4 sm:px-0 flex flex-col items-start gap-4 sm:flex-row sm:items-center py-6 border-b border-[#7D7D7D]">
            {embedAgent.map((embed) => (
              <button
                key={embed}
                onClick={() => {
                  setSelectedEmbedAgent(embed);
                  setEmbedType(embed.includes("Bubble") ? "bubble" : "iframe");
                }}
                className={`py-2 pr-12 pl-6 border transition-all text-start relative
                  ${
                    selectedEmbedAgent === embed
                      ? "bg-[#CEFFDC] border-2 border-[#6AFF97] focus:outline-none"
                      : "border-gray-500 border hover:border-gray-900"
                  }`}
              >
                <div className="absolute -left-3 top-[7px]">
                  {selectedEmbedAgent === embed ? (
                    <>
                      <div className="relative w-[25px] h-[25px] bg-[#CEFFDC] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3">
                        <div className="absolute top-1 left-1 w-4 h-4 bg-[#6AFF97] rounded-full flex items-center justify-center border border-[#000000]"></div>
                      </div>
                    </>
                  ) : (
                    <div className="relative w-[25px] h-[25px] bg-[#CDCDCD] shadow-[inset_0_8px_8px_0_rgba(0,0,0,0.25)] rounded-full flex items-center justify-center border border-[#000000] p-3"></div>
                  )}
                </div>
                <span className="para-font text-[1rem]">{embed}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="configuration">
          <div className="px-4 sm:px-12 w-fit mb-2">
            <h2 className="text-[1.3rem] font-semibold text-gray-800">
              Configuration
            </h2>
          </div>
          <div
            className="sm:rounded-xl p-4 md:p-6 mx-auto w-[94%]"
            style={{ backgroundColor: "#eaefff" }}
          >
            <div className="relative flex flex-col items-end xs:flex-row xs:items-start gap-2">
              <pre className="w-full whitespace-wrap bg-gray-50 p-2 xs:p-4 overflow-x-auto text-xs xs:text-sm font-mono border border-gray-200">
                {embedType === "bubble" ? bubbleCode : iframeCode}
              </pre>
              <span className="relative z-10">
                <div className="absolute left-[2px] top-[2px] h-full w-full bg-[#6AFF97] border border-black z-[-10]"></div>
                <button
                  onClick={() =>
                    handleCopy(embedType === "bubble" ? bubbleCode : iframeCode)
                  }
                  className="para-font bg-[#6AFF97] border border-black z-10 text-black px-2 py-2 text-[1rem]"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-black z-10" />
                  ) : (
                    <Copy className="h-5 w-5 text-black z-10" />
                  )}
                </button>
              </span>
            </div>
          </div>
        </div>
        {/* Direct Access URL Card */}
        <div className=" h-[220px]">
          <div className="px-4 sm:px-12">
            <div className="flex items-center space-x-3">
              <Globe className="h-6 w-6 text-gray-600" />
              <h2 className="mt-1 text-[1.2em] font-semibold text-gray-800">
                Direct Access URL
              </h2>
            </div>
            <p className="mt-1 text-gray-600">
              Share your chatbot with this direct link
            </p>
          </div>
          <div
            className="mx-auto w-[94%] p-6 sm:rounded-xl"
            style={{ backgroundColor: "#eaefff" }}
          >
            <div className="space-y-4">
              <div className="relative flex flex-col items-end gap-2 xs:flex-row xs:items-center">
                <div className="w-full bg-gray-50 p-4 overflow-x-auto text-xs xs:text-sm font-mono border border-gray-200">
                  {chatbotUrl}
                </div>
                <div className="btns flex items-center gap-2 mt-2 xs:mt-0">
                  <span className="relative z-10">
                    <div className="absolute left-[2px] top-[2px] h-full w-full bg-[#6AFF97] border border-black z-[-10]"></div>
                    <button
                      onClick={handleUrlCopy}
                      className="para-font bg-[#6AFF97] border border-black z-10 text-black px-2 py-2 text-[1rem]"
                      title="Copy URL"
                    >
                      <Copy className="h-5 w-5 text-black z-10" />
                    </button>
                    {urlCopied && (
                      <div className="absolute top-3 right-3 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg shadow-sm">
                        Copied!
                      </div>
                    )}
                  </span>
                  <span className="relative z-10">
                    <div className="absolute left-[2px] top-[2px] h-full w-full bg-[#6AFF97] border border-black z-[-10]"></div>
                    <button
                      onClick={handleVisitUrl}
                      className="para-font bg-[#6AFF97] border border-black z-10 text-black px-2 py-2 text-[1rem]"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-5 w-5 text-black" />
                    </button>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
