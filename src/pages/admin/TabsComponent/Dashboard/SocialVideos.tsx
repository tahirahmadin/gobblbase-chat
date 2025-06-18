import React, { useState, useEffect } from "react";
import { Video, Plus, X, FileText, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { removeDocumentFromAgent } from "../../../../lib/serverActions";
import {
  fetchYouTubeTranscript,
  fetchYouTubeDetails,
  fetchInstagramTranscript,
  fetchInstagramPost,
  fetchTikTokTranscript,
  fetchTikTokDetails,
  fetchTwitterTweet,
  fetchLinkedInPost,
} from "../../../../lib/serverActions";
import styled from "styled-components";

const Button = styled.button`
  position: relative;
  background: #6aff97;
  padding: 0.6vh 1vw;
  border: 1px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 15px);
  font-weight: 400;
  font-family: "DM Sans", sans-serif;
  @media (max-width: 600px) {
    min-width: 100px;
    padding: 8px 12px;
    font-size: 12px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 4px;
    right: -4px;
    width: 100%;
    height: 100%;
    border: 1px solid #000000;
    z-index: -1;
    background: #6aff97;
  }

  
   &:disabled {
    background: #CDCDCD;
    border: 1px solid #7d7d7d;
    color: #7D7D7D;
    cursor: not-allowed;
  }
  &:disabled::before {
    background: #CDCDCD;
    border: 1px solid #7d7d7d;
  }
`;

const Icon = styled.button`
  position: relative;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #aeb8ff;
  border: 2px solid black;
  cursor: pointer;
  transition: background 0.3s;
  font-size: clamp(8px, 4vw, 16px);
  &:hover {
    background: #aeb8ff;
  }

  @media (max-width: 600px) {
    width: 28px;
    height: 28px;
  }

  &::before {
    content: "";
    position: absolute;
    top: 5px;
    right: -5px;
    width: 100%;
    height: 100%;
    border: 2px solid #000000;
    z-index: -1;
    background: #aeb8ff;
  }
`;

const cleanTikTokTranscript = (transcriptData) => {
  try {
    let transcript = transcriptData?.transcript || "";
    
    if (transcript.includes('"text"') && transcript.includes('"start_time"')) {
      const textMatches = transcript.match(/"text":"([^"]+)"/g);
      if (textMatches && textMatches.length > 0) {
        const extractedTexts = textMatches.map(match => {
          const textContent = match.match(/"text":"([^"]+)"/);
          return textContent ? textContent[1] : '';
        }).filter(text => text.trim().length > 0);
        
        if (extractedTexts.length > 0) {
          return extractedTexts.join(' ');
        }
      }
    }
    
    if (typeof transcript === 'string' && !transcript.includes('"start_time"')) {
      return transcript;
    }
    
    return transcript;
  } catch (error) {
    console.error('Error cleaning TikTok transcript:', error);
    return transcriptData?.transcript || "";
  }
};

const OPENAI_API_KEY = import.meta.env.VITE_PUBLIC_OPENAI_API_KEY;

export default function SocialVideos({
  onAddToAgent,
  activeBotData,
  activeBotId,
  onRefreshData,
}) {
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("transcript");
  const [removingVideo, setRemovingVideo] = useState(null);
  const [expandedVideoMobile, setExpandedVideoMobile] = useState(null);
  const [activeTabMobile, setActiveTabMobile] = useState("transcript");
  const [processingVideo, setProcessingVideo] = useState(null);

  useEffect(() => {
    if (activeBotData?.socialVideos) {
      const loadedVideos = activeBotData.socialVideos.map((video) => ({
        ...video,
        loading: false,
        error: null,
      }));
      setVideos(loadedVideos);

      if (loadedVideos.length > 0 && !selectedVideo) {
        setSelectedVideo(loadedVideos[0].id);
      }
    } else {
      setVideos([]);
      setSelectedVideo(null);
    }
  }, [activeBotData?.socialVideos]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setExpandedVideoMobile(null);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const detectPlatform = (url) => {
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      return "youtube";
    } else if (url.includes("instagram.com")) {
      return "instagram";
    } else if (url.includes("tiktok.com")) {
      return "tiktok";
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      return "twitter";
    } else if (url.includes("linkedin.com")) {
      return "linkedin";
    }
    return "unknown";
  };

  const fetchVideoData = async (url, platform) => {
    try {
      let videoDetails = null;
      let transcriptData = null;
      let hasContent = false;

      if (platform === "youtube") {
        try {
          transcriptData = await fetchYouTubeTranscript(url);
          const transcriptText = transcriptData?.transcript_only_text || "";
          if (transcriptText.trim().length > 0) {
            hasContent = true;
          }
        } catch (error) {
          console.log("No transcript available for YouTube video");
        }

        if (!hasContent) {
          throw new Error("No transcript available for this video");
        }

        try {
          videoDetails = await fetchYouTubeDetails(url);
        } catch (error) {
          console.log("Could not fetch YouTube details, using transcript only");
        }
      } else if (platform === "instagram") {
        try {
          transcriptData = await fetchInstagramTranscript(url);
          const transcriptText = transcriptData?.transcripts?.[0]?.text || "";
          if (transcriptText.trim().length > 0) {
            hasContent = true;
          }
        } catch (error) {
          console.log("No transcript available for Instagram content");
        }

        if (!hasContent) {
          try {
            const tempDetails = await fetchInstagramPost(url);
            const igData = tempDetails?.data?.xdt_shortcode_media || tempDetails;
            const captionEdges = igData?.edge_media_to_caption?.edges;
            const caption = captionEdges?.[0]?.node?.text || "";

            if (caption.trim().length > 0) {
              hasContent = true;
              videoDetails = tempDetails;
            }
          } catch (error) {
            console.log("Could not fetch Instagram post details");
          }
        }

        if (!hasContent) {
          throw new Error("No transcript or caption available for this content");
        }

        if (!videoDetails) {
          try {
            videoDetails = await fetchInstagramPost(url);
          } catch (error) {
            console.log("Could not fetch Instagram post details");
          }
        }
      } else if (platform === "tiktok") {
        try {
          transcriptData = await fetchTikTokTranscript(url);
          
          const cleanedTranscript = cleanTikTokTranscript(transcriptData);
          
          if (cleanedTranscript && cleanedTranscript.trim().length > 0) {
            hasContent = true;
            transcriptData = { ...transcriptData, transcript: cleanedTranscript };
          }
        } catch (error) {
          console.log("No transcript available for TikTok video");
        }
        if (!hasContent) {
          try {
            const tempDetails = await fetchTikTokDetails(url);
            const tikTokData = tempDetails?.aweme_detail;
            const desc = tikTokData?.desc || "";
      
            if (desc.trim().length > 0) {
              hasContent = true;
              videoDetails = tempDetails;
            }
          } catch (error) {
            console.log("Could not fetch TikTok video details");
          }
        }
      
        if (!hasContent) {
          throw new Error("No transcript or description available for this video");
        }
      
        if (!videoDetails) {
          try {
            videoDetails = await fetchTikTokDetails(url);
          } catch (error) {
            console.log("Could not fetch TikTok video details");
          }
        }
      } else if (platform === "twitter") {
        try {
          const data = await fetchTwitterTweet(url);
          
          const tweetText = data.legacy?.full_text || data.full_text || data.text || "";

          if (!tweetText.trim() || tweetText.trim().length === 0) {
            throw new Error("No text content available in this tweet");
          }

          hasContent = true;
          videoDetails = data;
        } catch (error) {
          console.error("Error fetching Twitter content:", error);
          throw error;
        }
      } else if (platform === "linkedin") {
        try {
          const data = await fetchLinkedInPost(url);

          const description = data.description || "";
          if (!description.trim() || description.trim().length === 0) {
            throw new Error("No content available in this LinkedIn post");
          }

          hasContent = true;
          videoDetails = data;
        } catch (error) {
          console.error("Error fetching LinkedIn content:", error);
          throw error;
        }
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      let processedData = {};

      if (platform === "youtube") {
        processedData = {
          title: videoDetails?.title || "YouTube Video",
          thumbnail: videoDetails?.thumbnail || null,
          transcript: transcriptData?.transcript_only_text || "",
          platform,
          url,
          author: videoDetails?.channel?.title || "Unknown Channel",
          description: videoDetails?.description || "",
          viewCount: videoDetails?.viewCountText || null,
          publishDate: videoDetails?.publishDateText || null,
        };
      } else if (platform === "instagram") {
        const igData = videoDetails?.data?.xdt_shortcode_media || videoDetails;
        const captionEdges = igData?.edge_media_to_caption?.edges;
        const caption = captionEdges?.[0]?.node?.text || "";
        const ownerUsername = igData?.owner?.username || "Unknown User";
        const isVideo = igData?.__typename === "XDTGraphVideo";

        let thumbnail = null;
        if (igData?.display_url) {
          thumbnail = igData.display_url;
        } else if (igData?.thumbnail_src) {
          thumbnail = igData.thumbnail_src;
        } else if (igData?.display_resources?.length > 0) {
          const resourceIndex = igData.display_resources.length > 1 ? 1 : 0;
          thumbnail = igData.display_resources[resourceIndex]?.src;
        }

        let viewCount = null;
        if (isVideo && igData?.video_play_count) {
          viewCount = `${igData.video_play_count.toLocaleString()} plays`;
        } else if (igData?.edge_media_preview_like?.count) {
          viewCount = `${igData.edge_media_preview_like.count.toLocaleString()} likes`;
        }

        processedData = {
          title: `Instagram ${isVideo ? "Reel" : "Post"} by @${ownerUsername}`,
          thumbnail: thumbnail,
          transcript: transcriptData?.transcripts?.[0]?.text || caption || "",
          platform,
          url,
          author: ownerUsername,
          description: caption,
          viewCount: viewCount,
        };
      } else if (platform === "tiktok") {
        const tikTokData = videoDetails?.aweme_detail;
        const authorNickname = tikTokData?.author?.nickname || "Unknown User";
        const authorUsername = tikTokData?.author?.unique_id || "";
        const desc = tikTokData?.desc || "";
      
        const cleanTranscript = transcriptData?.transcript || desc || "";
      
        processedData = {
          title: `TikTok by @${authorUsername || authorNickname}`,
          thumbnail:
            tikTokData?.video?.cover?.url_list?.[0] ||
            tikTokData?.video?.dynamic_cover?.url_list?.[0] ||
            null,
          transcript: cleanTranscript,
          platform,
          url,
          author: authorNickname,
          description: desc,
          viewCount: tikTokData?.statistics?.play_count
            ? `${tikTokData.statistics.play_count.toLocaleString()} views`
            : null,
        };
      } else if (platform === "twitter") {
        const tweetData = videoDetails;
        const authorName =
          tweetData.core?.user_results?.result?.core?.name ||
          tweetData.core?.user_results?.result?.legacy?.name ||
          tweetData.user?.name ||
          tweetData.author?.name ||
          "Unknown User";
        const textContent =
          tweetData.legacy?.full_text ||
          tweetData.full_text ||
          tweetData.text ||
          "";
        const profileImage =
          tweetData.core?.user_results?.result?.avatar?.image_url ||
          tweetData.core?.user_results?.result?.legacy
            ?.profile_image_url_https ||
          tweetData.user?.profile_image_url_https ||
          tweetData.author?.profile_image_url ||
          null;

        processedData = {
          title: `${authorName}: ${textContent.substring(0, 50)}${
            textContent.length > 50 ? "..." : ""
          }`,
          thumbnail: profileImage,
          transcript: textContent,
          platform,
          url,
          author: authorName,
          description: textContent,
        };
      } else if (platform === "linkedin") {
        const linkedinData = videoDetails;

        processedData = {
          title: linkedinData.name || linkedinData.headline || "LinkedIn Post",
          thumbnail: linkedinData.media || linkedinData.author?.image || null,
          transcript: linkedinData.description || "",
          platform,
          url,
          author: linkedinData.author?.name || "Unknown Author",
          description: linkedinData.description || "",
        };
      }

      return processedData;
    } catch (error) {
      console.error("Error fetching video data:", error);
      throw error;
    }
  };

  const generateSummary = async (transcript) => {
    if (!transcript || !OPENAI_API_KEY) {
      throw new Error("Transcript or OpenAI API key is missing");
    }

    try {
      const wordCount = transcript
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      const maxTokens =
        wordCount > 10000
          ? 2000
          : wordCount > 5000
          ? 1500
          : wordCount > 2000
          ? 1000
          : 500;

      const systemPrompt =
        wordCount > 10000
          ? `You are an expert content analyst that creates extremely detailed and comprehensive summaries. Your task is to preserve ALL important information, key points, examples, data, quotes, and insights from the content. Create a thorough summary that captures:

1. Main themes and key messages
2. All important details, facts, and data points
3. Specific examples, case studies, or stories mentioned
4. Key quotes or statements
5. Step-by-step processes or methodologies described
6. Any actionable insights or recommendations
7. Supporting evidence and reasoning
8. Context and background information

The summary should be detailed enough that someone reading only the summary would understand virtually everything important from the original content. Do not skip minor but relevant details. Organize the information logically with clear sections and bullet points where appropriate.`
          : `You are a helpful assistant that creates detailed summaries of social media content. Summarize all key points, main messages, important details, examples, and actionable insights. Preserve the essential information while organizing it clearly.`;

      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content:
                  wordCount > 10000
                    ? `Please provide an extremely detailed and comprehensive summary of this content, preserving ALL important information, key points, examples, data, and insights. The summary should be thorough enough that no critical information is lost:\n\n${transcript}`
                    : `Please provide a comprehensive summary of this content, including all key points, main messages, and important details:\n\n${transcript}`,
              },
            ],
            max_tokens: maxTokens,
            temperature: 0.3,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return (
        data.choices[0]?.message?.content || "Summary could not be generated"
      );
    } catch (error) {
      console.error("Error generating summary:", error);
      throw error;
    }
  };

  const saveToAgent = async (video) => {
    if (!video.transcript && !video.summary) return false;

    const wordCount = video.transcript
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    const shouldSaveSummary = wordCount > 15000 && video.summary;
    const contentToSave = shouldSaveSummary ? video.summary : video.transcript;
    const contentType = "Transcript";

    const fullContent = `${contentToSave}`;
    const contentSize = new TextEncoder().encode(fullContent).length;

    const videoMetadata = {
      id: video.id,
      url: video.url,
      platform: video.platform,
      title: video.title,
      thumbnail: video.thumbnail,
      transcript: video.transcript,
      summary: video.summary || "",
      author: video.author,
      description: video.description,
      viewCount: video.viewCount,
      publishDate: video.publishDate,
    };

    if (onAddToAgent) {
      try {
        const success = await onAddToAgent(
          `Social: ${
            video.platform.charAt(0).toUpperCase() + video.platform.slice(1)
          } ${contentType}: ${video.title}`,
          fullContent,
          contentSize,
          videoMetadata
        );

        if (success) {
          setVideos((prev) =>
            prev.map((v) =>
              v.id === video.id ? { ...v, savedToAgent: true } : v
            )
          );
          toast.success(`${contentType} saved to agent knowledge`);

          if (onRefreshData) {
            onRefreshData();
          }
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error saving content:", error);
        toast.error(`Failed to save ${contentType.toLowerCase()}`);
        return false;
      }
    }
    return false;
  };

  const processAndSaveVideo = async (video) => {
    if (!video.transcript) return;

    const wordCount = video.transcript
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    setProcessingVideo(video.id);

    try {
      // If >15000 words, generate summary first
      if (wordCount > 15000) {
        const summary = await generateSummary(video.transcript);

        // Update video with summary
        setVideos((prev) =>
          prev.map((v) => (v.id === video.id ? { ...v, summary } : v))
        );

        // Save summary to agent
        const updatedVideo = { ...video, summary };
        await saveToAgent(updatedVideo);
      } else {
        // Save transcript directly to agent
        await saveToAgent(video);
      }
    } catch (error) {
      toast.error(`Failed to process content: ${error.message}`);
    } finally {
      setProcessingVideo(null);
    }
  };

  const handleRemoveFromAgent = async (video) => {
    if (!video.documentId || !activeBotId) {
      toast.error(
        "Cannot remove: content not properly saved or no active agent"
      );
      return;
    }

    try {
      setRemovingVideo(video.id);

      const response = await removeDocumentFromAgent(
        activeBotId,
        video.documentId
      );

      if (!response.error) {
        // Remove video from local state
        setVideos((prev) => prev.filter((v) => v.id !== video.id));

        // If this was the selected video, clear selection or select another
        if (selectedVideo === video.id) {
          const remainingVideos = videos.filter((v) => v.id !== video.id);
          setSelectedVideo(
            remainingVideos.length > 0 ? remainingVideos[0].id : null
          );
        }

        toast.success("Content removed from agent knowledge");

        // Trigger refresh of agent data
        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        toast.error("Failed to remove content from agent");
      }
    } catch (error) {
      console.error("Error removing content:", error);
      toast.error("Failed to remove content from agent");
    } finally {
      setRemovingVideo(null);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    const platform = detectPlatform(newVideoUrl);
    if (platform === "unknown") {
      toast.error(
        "Unsupported platform. Please enter a YouTube, Instagram, TikTok, Twitter, or LinkedIn URL."
      );
      return;
    }

    // Check if URL already exists
    if (videos.some((video) => video.url === newVideoUrl)) {
      toast.error("This content has already been added");
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      url: newVideoUrl,
      platform,
      title: "Loading...",
      thumbnail: "",
      transcript: "",
      summary: "",
      loading: true,
      error: null,
      author: "",
      description: "",
      viewCount: null,
      publishDate: null,
      savedToAgent: false,
    };

    setVideos((prev) => [...prev, newVideo]);
    setNewVideoUrl("");
    setSelectedVideo(newVideo.id);

    try {
      const videoData = await fetchVideoData(newVideoUrl, platform);

      setVideos((prev) =>
        prev.map((video) =>
          video.id === newVideo.id
            ? { ...video, ...videoData, loading: false }
            : video
        )
      );

      toast.success(
        `${
          platform.charAt(0).toUpperCase() + platform.slice(1)
        } content added successfully!`
      );

      // Auto-process and save the video
      const updatedVideo = { ...newVideo, ...videoData };
      await processAndSaveVideo(updatedVideo);
    } catch (error) {
      setVideos((prev) => prev.filter((video) => video.id !== newVideo.id));

      // Show specific error message for no content
      if (
        error.message.includes("No transcript") ||
        error.message.includes("No text content") ||
        error.message.includes("No content available")
      ) {
        toast.error(
          `No transcript/content available for this ${platform} link`
        );
      } else {
        toast.error(`Failed to load ${platform} content: ${error.message}`);
      }
    }
  };

  const removeVideo = (videoId) => {
    setVideos((prev) => prev.filter((video) => video.id !== videoId));
    if (selectedVideo === videoId) {
      const remainingVideos = videos.filter((v) => v.id !== videoId);
      setSelectedVideo(
        remainingVideos.length > 0 ? remainingVideos[0].id : null
      );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAddVideo();
    }
  };

  const selectedVideoData = selectedVideo
    ? videos.find((v) => v.id === selectedVideo)
    : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-100 px-4 sm:px-6 py-3 border-b border-green-200">
        <p className="text-xs sm:text-sm text-gray-700">
          Paste links from social media to convert content into brain knowledge
          | Platforms: YouTube, Instagram, TikTok, Twitter, and LinkedIn
        </p>
      </div>

      {/* New Link Section */}
      <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              New Link
            </span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1  relative z-10 mt-4 space-y-3 sm:space-y-0 sm:space-x-3">
            <input
              type="url"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste your link..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            <Button disabled={!newVideoUrl.trim()} onClick={handleAddVideo} className="w-full sm:w-auto">
              ADD LINK
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {videos.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:h-[36rem]">
          {/* Left Sidebar - Videos List */}
          <div className="w-full lg:w-80 bg-blue-50 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-blue-100 flex-shrink-0">
              <h3 className="text-sm font-medium text-gray-700">
                {videos.length} Content{videos.length > 1 ? " Items" : " Item"}
              </h3>
            </div>

            <div className="p-4 flex-1 overflow-hidden">
              <div className="space-y-4 h-full overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => {
                      // Desktop behavior
                      if (window.innerWidth >= 1024) {
                        setSelectedVideo(video.id);
                      } else {
                        // Mobile behavior - toggle expand/collapse
                        if (expandedVideoMobile === video.id) {
                          setExpandedVideoMobile(null);
                        } else {
                          setExpandedVideoMobile(video.id);
                          setActiveTabMobile("transcript");
                        }
                      }
                    }}
                    className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedVideo === video.id ||
                      expandedVideoMobile === video.id
                        ? "border-blue-500 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {/* Remove button */}
                    <div className="absolute top-2 right-2 z-10">
                      {video.savedToAgent &&
                        video.documentId &&
                        (removingVideo === video.id ? (
                          <div className="w-7 h-7 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          </div>
                        ) : (
                          <Icon
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromAgent(video);
                            }}
                            className="hover:text-red-600"
                            disabled={removingVideo === video.id}
                            aria-label="Remove content"
                          >
                            <X className="w-4 h-4" />
                          </Icon>
                        ))}
                    </div>

                    <div className="p-4">
                      {/* Thumbnail and Title Section */}
                      <div className="flex space-x-3 mb-3">
                        {video.thumbnail && (
                          <div className="flex-shrink-0">
                            <img
                              src={video.thumbnail}
                              alt="Content thumbnail"
                              className="w-16 h-12 rounded object-cover border border-gray-200"
                              onError={(e) => (e.target.style.display = "none")}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                            {video.loading ? "Loading..." : video.title}
                          </h4>
                          {video.author && !video.loading && (
                            <p className="text-xs text-gray-600 truncate">
                              by {video.author}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Platform and Status Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            video.platform === "youtube"
                              ? "bg-red-100 text-red-800"
                              : video.platform === "instagram"
                              ? "bg-pink-100 text-pink-800"
                              : video.platform === "tiktok"
                              ? "bg-gray-100 text-gray-800"
                              : video.platform === "twitter"
                              ? "bg-blue-100 text-blue-800"
                              : video.platform === "linkedin"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {video.platform}
                        </span>

                        {video.savedToAgent && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ Saved
                          </span>
                        )}

                        {processingVideo === video.id && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Processing...
                          </span>
                        )}
                      </div>

                      {/* Word count if available */}
                      {video.transcript && !video.loading && (
                        <div className="mt-2 text-xs text-gray-500">
                          {video.transcript.split(/\s+/).length} words
                        </div>
                      )}
                    </div>

                    {/* Mobile expanded content */}
                    <div
                      className={`lg:hidden ${
                        expandedVideoMobile === video.id ? "block" : "hidden"
                      }`}
                    >
                      {video.error ? (
                        <div className="p-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-4">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span className="text-xs">{video.error}</span>
                          </div>
                        </div>
                      ) : video.loading || processingVideo === video.id ? (
                        <div className="p-4 border-t border-gray-200">
                          <div className="flex items-center justify-center py-4">
                            <div className="flex items-center space-x-2 text-gray-500">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="text-sm">
                                {video.loading
                                  ? "Loading content..."
                                  : "Processing content..."}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : video.transcript ? (
                        <div className="border-t border-gray-200">
                          {/* Mobile Tab Controls */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center space-x-4 mb-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTabMobile("transcript");
                                }}
                                className={`text-xs font-medium pb-1 border-b-2 transition-colors ${
                                  activeTabMobile === "transcript"
                                    ? "text-blue-600 border-blue-600"
                                    : "text-gray-500 border-transparent"
                                }`}
                              >
                                Transcript
                              </button>
                            </div>
                          </div>

                          {/* Mobile Content Display */}
                          <div className="p-4 bg-gray-50 max-h-64 overflow-y-auto overflow-x-hidden">
                            <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                              {video.transcript}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 border-t border-gray-200">
                          <div className="flex items-center justify-center py-4 text-gray-500">
                            <span className="text-sm">
                              No content available
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {(video.loading || processingVideo === video.id) && (
                      <div className="absolute inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center rounded-lg">
                        <div className="flex flex-col items-center space-y-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          <span className="text-xs text-blue-600">
                            {video.loading ? "Loading..." : "Processing..."}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area - Hidden on mobile */}
          <div className="hidden lg:flex flex-1 p-4 sm:p-6 flex-col overflow-hidden">
            {selectedVideoData ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b pb-4 mb-6 flex-shrink-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-2">
                    {selectedVideoData.title}
                  </h3>
                  {selectedVideoData.author && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3">
                      by {selectedVideoData.author}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                    {selectedVideoData.viewCount && (
                      <span>{selectedVideoData.viewCount}</span>
                    )}
                    {selectedVideoData.publishDate && (
                      <span className="hidden sm:inline">
                        {selectedVideoData.publishDate}
                      </span>
                    )}
                    {selectedVideoData.transcript && (
                      <span>
                        {selectedVideoData.transcript.split(/\s+/).length} words
                      </span>
                    )}
                    {selectedVideoData.savedToAgent && (
                      <span className="text-green-600 font-medium">
                        ✓ Auto-saved
                      </span>
                    )}
                    {processingVideo === selectedVideoData.id && (
                      <span className="text-blue-600 font-medium">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>

                {selectedVideoData.error ? (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                      {selectedVideoData.error}
                    </span>
                  </div>
                ) : selectedVideoData.loading ||
                  processingVideo === selectedVideoData.id ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm sm:text-base">
                        {selectedVideoData.loading
                          ? "Loading content..."
                          : "Processing content..."}
                      </span>
                    </div>
                  </div>
                ) : selectedVideoData.transcript ? (
                  <>
                    {/* Tab Controls */}
                    <div className="flex items-center space-x-4 border-b border-gray-200 pb-2 mb-6 flex-shrink-0">
                      <button
                        onClick={() => setActiveTab("transcript")}
                        className={`text-xs sm:text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap ${
                          activeTab === "transcript"
                            ? "text-blue-600 border-blue-600"
                            : "text-gray-500 border-transparent hover:text-gray-700"
                        }`}
                      >
                        Transcript
                      </button>
                    </div>

                    {/* Content Display - Fixed height with scroll */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 sm:p-6 overflow-hidden flex flex-col">
                      <div className="h-full overflow-y-auto overflow-x-hidden">
                        <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                          {selectedVideoData.transcript}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <span className="text-sm">No content available</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs sm:text-sm">Select to view content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
