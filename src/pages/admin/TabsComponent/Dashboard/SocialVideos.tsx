import React, { useState, useEffect } from 'react';
import { Video, Plus, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from "react-hot-toast";
import { removeDocumentFromAgent } from '../../../../lib/serverActions';
import styled from "styled-components";

const Button = ({ children, onClick, disabled, className, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded font-medium transition-colors text-xs sm:text-sm ${
      disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-green-600 text-white hover:bg-green-700'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

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

const SCRAPE_CREATORS_API_KEY = import.meta.env.VITE_PUBLIC_SCRAPE_CREATORS_API_KEY || "4VR7li6w0hUnpeg6ZfiYbrnBr5q1";
const OPENAI_API_KEY = import.meta.env.VITE_PUBLIC_OPENAI_API_KEY;

export default function SocialVideos({ onAddToAgent, activeBotData, activeBotId, onRefreshData }) {
  const [videos, setVideos] = useState([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [generatingSummary, setGeneratingSummary] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeTab, setActiveTab] = useState('transcript');
  const [removingVideo, setRemovingVideo] = useState(null);
  const [savingToAgent, setSavingToAgent] = useState(null);

  // Load videos from agent data when component mounts or activeBotData changes
  useEffect(() => {
    if (activeBotData?.socialVideos) {
      const loadedVideos = activeBotData.socialVideos.map(video => ({
        ...video,
        loading: false,
        error: null
      }));
      setVideos(loadedVideos);
      
      // Set first video as selected if none selected
      if (loadedVideos.length > 0 && !selectedVideo) {
        setSelectedVideo(loadedVideos[0].id);
      }
    } else {
      setVideos([]);
      setSelectedVideo(null);
    }
  }, [activeBotData?.socialVideos]);

  const detectPlatform = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    } else if (url.includes('instagram.com')) {
      return 'instagram';
    } else if (url.includes('tiktok.com')) {
      return 'tiktok';
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      return 'twitter';
    } else if (url.includes('linkedin.com')) {
      return 'linkedin';
    } else if (url.includes('reddit.com')) {
      return 'reddit';
    }
    return 'unknown';
  };

  const fetchVideoData = async (url, platform) => {
    try {
      let videoDetails = null;
      let transcriptData = null;
      
      // Fetch video details for preview
      if (platform === 'youtube') {
        const detailsResponse = await fetch(
          `https://api.scrapecreators.com/v1/youtube/video?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (detailsResponse.ok) {
          videoDetails = await detailsResponse.json();
        }
        
        // Fetch transcript
        const transcriptResponse = await fetch(
          `https://api.scrapecreators.com/v1/youtube/video/transcript?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (transcriptResponse.ok) {
          transcriptData = await transcriptResponse.json();
        }
        
      } else if (platform === 'instagram') {
        const detailsResponse = await fetch(
          `https://api.scrapecreators.com/v1/instagram/post?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (detailsResponse.ok) {
          videoDetails = await detailsResponse.json();
        }
        
        // Fetch transcript
        const transcriptResponse = await fetch(
          `https://api.scrapecreators.com/v2/instagram/media/transcript?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (transcriptResponse.ok) {
          transcriptData = await transcriptResponse.json();
        }
        
      } else if (platform === 'tiktok') {
        const detailsResponse = await fetch(
          `https://api.scrapecreators.com/v2/tiktok/video?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (detailsResponse.ok) {
          videoDetails = await detailsResponse.json();
        }
        
        // Fetch transcript
        const transcriptResponse = await fetch(
          `https://api.scrapecreators.com/v1/tiktok/video/transcript?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (transcriptResponse.ok) {
          transcriptData = await transcriptResponse.json();
        }
        
      } else if (platform === 'twitter') {
        const response = await fetch(
          `https://api.scrapecreators.com/v1/twitter/tweet?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const tweet = data;
        const authorName = tweet.core?.user_results?.result?.legacy?.name || 'Unknown User';
        const tweetText = tweet.legacy?.full_text || '';
        const profileImage = tweet.core?.user_results?.result?.legacy?.profile_image_url_https;
        
        return {
          title: `${authorName}: ${tweetText.substring(0, 50)}...`,
          thumbnail: profileImage,
          transcript: tweetText,
          platform,
          url,
          author: authorName,
          description: tweetText
        };
        
      } else if (platform === 'linkedin') {
        const response = await fetch(
          `https://api.scrapecreators.com/v1/linkedin/post?url=${encodeURIComponent(url)}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return {
          title: data.name || data.headline || 'LinkedIn Post',
          thumbnail: data.author?.profileImage || null,
          transcript: data.description || '',
          platform,
          url,
          author: data.author?.name || 'Unknown Author',
          description: data.description || ''
        };
        
      } else if (platform === 'reddit') {
        // For Reddit, we need to extract post ID from URL and use subreddit API
        const postMatch = url.match(/reddit\.com\/r\/(\w+)\/comments\/(\w+)/);
        if (!postMatch) {
          throw new Error('Invalid Reddit URL format');
        }
        const [, subreddit, postId] = postMatch;
        
        const response = await fetch(
          `https://api.scrapecreators.com/v1/reddit/subreddit?subreddit=${subreddit}`,
          {
            headers: {
              'x-api-key': SCRAPE_CREATORS_API_KEY,
            },
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        const post = data.children?.find(child => child.data.id === postId)?.data;
        
        if (!post) {
          throw new Error('Post not found in subreddit');
        }
        
        return {
          title: post.title || 'Reddit Post',
          thumbnail: post.thumbnail !== 'self' ? post.thumbnail : null,
          transcript: post.selftext || post.title,
          platform,
          url,
          author: post.author || 'Unknown Author',
          description: post.selftext || post.title
        };
        
      } else {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Process the data based on platform
      let processedData = {};
      
      if (platform === 'youtube') {
        processedData = {
          title: videoDetails?.title || 'YouTube Video',
          thumbnail: videoDetails?.thumbnail || null,
          transcript: transcriptData?.transcript_only_text || '',
          platform,
          url,
          author: videoDetails?.channel?.title || 'Unknown Channel',
          description: videoDetails?.description || '',
          viewCount: videoDetails?.viewCountText || null,
          publishDate: videoDetails?.publishDateText || null
        };
        
      } else if (platform === 'instagram') {
        // Extract data from Instagram's complex structure
        const igData = videoDetails?.data?.xdt_shortcode_media || videoDetails;
        const captionEdges = igData?.edge_media_to_caption?.edges;
        const caption = captionEdges?.[0]?.node?.text || '';
        const ownerUsername = igData?.owner?.username || 'Unknown User';
        
        processedData = {
          title: `Instagram ${igData?.__typename === 'XDTGraphVideo' ? 'Reel' : 'Post'} by @${ownerUsername}`,
          thumbnail: igData?.display_url || igData?.thumbnail_src || null,
          transcript: transcriptData?.transcripts?.[0]?.text || caption || '',
          platform,
          url,
          author: ownerUsername,
          description: caption,
          viewCount: igData?.video_play_count ? `${igData.video_play_count.toLocaleString()} plays` : null
        };
        
      } else if (platform === 'tiktok') {
        // Extract data from TikTok's structure
        const tikTokData = videoDetails?.aweme_detail;
        const authorNickname = tikTokData?.author?.nickname || 'Unknown User';
        const authorUsername = tikTokData?.author?.unique_id || '';
        const desc = tikTokData?.desc || '';
        
        processedData = {
          title: `TikTok by @${authorUsername || authorNickname}`,
          thumbnail: tikTokData?.video?.cover?.url_list?.[0] || tikTokData?.video?.dynamic_cover?.url_list?.[0] || null,
          transcript: transcriptData?.transcript || desc || '',
          platform,
          url,
          author: authorNickname,
          description: desc,
          viewCount: tikTokData?.statistics?.play_count ? `${tikTokData.statistics.play_count.toLocaleString()} views` : null
        };
      }

      return processedData;
      
    } catch (error) {
      console.error('Error fetching video data:', error);
      throw error;
    }
  };

  const generateSummary = async (transcript) => {
    if (!transcript || !OPENAI_API_KEY) {
      throw new Error('Transcript or OpenAI API key is missing');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise summaries of social media content. Summarize the key points, main message, and important details.'
            },
            {
              role: 'user',
              content: `Please provide a comprehensive summary of this content:\n\n${transcript}`
            }
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || 'Summary could not be generated';
    } catch (error) {
      console.error('Error generating summary:', error);
      throw error;
    }
  };

  const handleSaveToAgent = async (video) => {
    if (!video.transcript && !video.summary) return;
    
    const wordCount = video.transcript.split(/\s+/).filter(word => word.length > 0).length;
    
    const shouldSaveSummary = wordCount > 3500 && video.summary;
    const contentToSave = shouldSaveSummary ? video.summary : video.transcript;
    const contentType = shouldSaveSummary ? 'Summary' : 'Transcript';
    
    if (wordCount > 3500 && !video.summary) {
      toast.error('Please generate a summary first - content is too long (>3500 words)');
      return;
    }
    
    const fullContent = `Platform: ${video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}\nURL: ${video.url}\nAuthor: ${video.author || 'Unknown'}\n\n${contentType}:\n${contentToSave}`;
    const contentSize = new TextEncoder().encode(fullContent).length;
    
    const videoMetadata = {
      id: video.id,
      url: video.url,
      platform: video.platform,
      title: video.title,
      thumbnail: video.thumbnail,
      transcript: video.transcript,
      summary: video.summary || '',
      author: video.author,
      description: video.description,
      viewCount: video.viewCount,
      publishDate: video.publishDate
    };
    
    if (onAddToAgent) {
      try {
        setSavingToAgent(video.id); 
        
        const success = await onAddToAgent(
          `Social: ${video.platform.charAt(0).toUpperCase() + video.platform.slice(1)} ${contentType}: ${video.title}`,
          fullContent,
          contentSize,
          videoMetadata 
        );
        
        if (success) {
          setVideos(prev => prev.map(v => 
            v.id === video.id 
              ? { ...v, savedToAgent: true }
              : v
          ));
          toast.success(`${contentType} saved to agent knowledge`);
          
          if (onRefreshData) {
            onRefreshData();
          }
        }
      } catch (error) {
        console.error("Error saving content:", error);
        toast.error(`Failed to save ${contentType.toLowerCase()}`);
      } finally {
        setSavingToAgent(null); 
      }
    }
  };

  const handleRemoveFromAgent = async (video) => {
    if (!video.documentId || !activeBotId) {
      toast.error('Cannot remove: video not properly saved or no active agent');
      return;
    }

    try {
      setRemovingVideo(video.id);
      
      const response = await removeDocumentFromAgent(activeBotId, video.documentId);
      
      if (!response.error) {
        // Remove video from local state
        setVideos(prev => prev.filter(v => v.id !== video.id));
        
        // If this was the selected video, clear selection or select another
        if (selectedVideo === video.id) {
          const remainingVideos = videos.filter(v => v.id !== video.id);
          setSelectedVideo(remainingVideos.length > 0 ? remainingVideos[0].id : null);
        }
        
        toast.success('Video removed from agent knowledge');
        
        // Trigger refresh of agent data
        if (onRefreshData) {
          onRefreshData();
        }
      } else {
        toast.error('Failed to remove video from agent');
      }
    } catch (error) {
      console.error('Error removing video:', error);
      toast.error('Failed to remove video from agent');
    } finally {
      setRemovingVideo(null);
    }
  };

  const handleAddVideo = async () => {
    if (!newVideoUrl.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    const platform = detectPlatform(newVideoUrl);
    if (platform === 'unknown') {
      toast.error('Unsupported platform. Please enter a YouTube, Instagram, TikTok, Twitter, LinkedIn, or Reddit URL.');
      return;
    }

    // Check if URL already exists
    if (videos.some(video => video.url === newVideoUrl)) {
      toast.error('This content has already been added');
      return;
    }

    const newVideo = {
      id: Date.now().toString(),
      url: newVideoUrl,
      platform,
      title: 'Loading...',
      thumbnail: '',
      transcript: '',
      summary: '',
      loading: true,
      error: null,
      author: '',
      description: '',
      viewCount: null,
      publishDate: null,
      savedToAgent: false
    };

    setVideos(prev => [...prev, newVideo]);
    setNewVideoUrl('');
    setSelectedVideo(newVideo.id);

    try {
      const videoData = await fetchVideoData(newVideoUrl, platform);
      
      setVideos(prev => prev.map(video => 
        video.id === newVideo.id 
          ? { ...video, ...videoData, loading: false }
          : video
      ));

      toast.success(`${platform.charAt(0).toUpperCase() + platform.slice(1)} content added successfully!`);
    } catch (error) {
      setVideos(prev => prev.map(video => 
        video.id === newVideo.id 
          ? { ...video, loading: false, error: error.message }
          : video
      ));
      
      toast.error(`Failed to load ${platform} content: ${error.message}`);
    }
  };

  const removeVideo = (videoId) => {
    setVideos(prev => prev.filter(video => video.id !== videoId));
    if (selectedVideo === videoId) {
      const remainingVideos = videos.filter(v => v.id !== videoId);
      setSelectedVideo(remainingVideos.length > 0 ? remainingVideos[0].id : null);
    }
  };

  const handleGenerateSummary = async (videoId) => {
    const video = videos.find(v => v.id === videoId);
    if (!video?.transcript) {
      toast.error('No transcript available to summarize');
      return;
    }

    setGeneratingSummary(videoId);

    try {
      const summary = await generateSummary(video.transcript);
      
      setVideos(prev => prev.map(v => 
        v.id === videoId 
          ? { ...v, summary }
          : v
      ));

      setActiveTab('summary');
      toast.success('Summary generated successfully!');
    } catch (error) {
      toast.error(`Failed to generate summary: ${error.message}`);
    } finally {
      setGeneratingSummary(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddVideo();
    }
  };

  const selectedVideoData = selectedVideo ? videos.find(v => v.id === selectedVideo) : null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-100 px-4 sm:px-6 py-3 border-b border-green-200">
        <p className="text-xs sm:text-sm text-gray-700">
          Paste Video links from social media for converting into brain knowledge | Platforms: YouTube, Instagram, TikTok, Twitter, LinkedIn, and Reddit
        </p>
      </div>

      {/* New Link Section */}
      <div className="bg-gray-50 px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-xs sm:text-sm font-medium text-gray-700">New Link</span>
          </div>
          <div className="flex flex-col sm:flex-row flex-1 space-y-3 sm:space-y-0 sm:space-x-3">
            <input
              type="url"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste your link..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            <button 
              onClick={handleAddVideo}
              className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white text-xs sm:text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              ADD LINK
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {videos.length > 0 && (
        <div className="flex flex-col lg:flex-row min-h-96">
          {/* Left Sidebar - Videos List */}
          <div className="w-full lg:w-80 bg-blue-50 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-blue-100">
              <h3 className="text-sm font-medium text-gray-700">
                {videos.length} Video{videos.length > 1 ? 's' : ''}
              </h3>
            </div>
            
            <div className="p-4">
              <div className="space-y-4 max-h-72 lg:max-h-80 overflow-y-auto">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    onClick={() => setSelectedVideo(video.id)}
                    className={`relative bg-white rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                      selectedVideo === video.id 
                        ? 'border-blue-500 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Remove button */}
                    <div className="absolute top-2 right-2 z-10">
                      {video.savedToAgent && video.documentId && (
                        removingVideo === video.id ? (
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
                            aria-label="Remove video"
                          >
                            <X className="w-4 h-4" />
                          </Icon>
                        )
                      )}
                    </div>
                    
                    <div className="p-4">
                      {/* Thumbnail and Title Section */}
                      <div className="flex space-x-3 mb-3">
                        {video.thumbnail && (
                          <div className="flex-shrink-0">
                            <img 
                              src={video.thumbnail}
                              alt="Video thumbnail"
                              className="w-16 h-12 rounded object-cover border border-gray-200"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 pr-8">
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                            {video.loading ? 'Loading...' : video.title}
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
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          video.platform === 'youtube' ? 'bg-red-100 text-red-800' :
                          video.platform === 'instagram' ? 'bg-pink-100 text-pink-800' :
                          video.platform === 'tiktok' ? 'bg-gray-100 text-gray-800' :
                          video.platform === 'twitter' ? 'bg-blue-100 text-blue-800' :
                          video.platform === 'linkedin' ? 'bg-blue-100 text-blue-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {video.platform}
                        </span>
                        
                        {video.savedToAgent && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            ✓ Saved
                          </span>
                        )}
                        
                        {savingToAgent === video.id && (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            Saving...
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
                    
                    {video.loading && (
                      <div className="absolute inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center rounded-lg">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-4 sm:p-6">
            {selectedVideoData ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b pb-4 mb-6">
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
                      <span className="hidden sm:inline">{selectedVideoData.publishDate}</span>
                    )}
                    {selectedVideoData.transcript && (
                      <span>{selectedVideoData.transcript.split(/\s+/).length} words</span>
                    )}
                    {selectedVideoData.savedToAgent && (
                      <span className="text-green-600 font-medium">✓ Saved</span>
                    )}
                    {savingToAgent === selectedVideoData.id && (
                      <span className="text-blue-600 font-medium">Saving...</span>
                    )}
                  </div>
                </div>

                {selectedVideoData.error ? (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">{selectedVideoData.error}</span>
                  </div>
                ) : selectedVideoData.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm sm:text-base">Loading content...</span>
                    </div>
                  </div>
                ) : selectedVideoData.transcript ? (
                  <>
                    {/* Tab Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div className="flex items-center space-x-4 border-b border-gray-200 pb-2 overflow-x-auto">
                        <button
                          onClick={() => setActiveTab('transcript')}
                          className={`text-xs sm:text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap ${
                            activeTab === 'transcript'
                              ? 'text-blue-600 border-blue-600'
                              : 'text-gray-500 border-transparent hover:text-gray-700'
                          }`}
                        >
                          Transcript
                        </button>
                        {selectedVideoData.summary && (
                          <button
                            onClick={() => setActiveTab('summary')}
                            className={`text-xs sm:text-sm font-medium pb-2 border-b-2 transition-colors whitespace-nowrap ${
                              activeTab === 'summary'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                          >
                            Summary
                          </button>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {!selectedVideoData.summary && selectedVideoData.transcript && (
                          <Button
                            onClick={() => handleGenerateSummary(selectedVideoData.id)}
                            disabled={generatingSummary === selectedVideoData.id}
                            className="text-xs sm:text-sm px-3 py-2 h-8"
                          >
                            {generatingSummary === selectedVideoData.id ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                <span className="hidden sm:inline">Generating...</span>
                                <span className="sm:hidden">Gen...</span>
                              </div>
                            ) : (
                              <span>
                                <span className="hidden sm:inline">Generate Summary</span>
                                <span className="sm:hidden">Summary</span>
                              </span>
                            )}
                          </Button>
                        )}
                        
                        {!selectedVideoData.savedToAgent && (
                          <Button
                            onClick={() => handleSaveToAgent(selectedVideoData)}
                            disabled={!onAddToAgent || savingToAgent === selectedVideoData.id}
                            className={`text-xs sm:text-sm px-3 py-2 h-8 ${
                              savingToAgent === selectedVideoData.id ? 'cursor-not-allowed' : ''
                            }`}
                          >
                            {savingToAgent === selectedVideoData.id ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                <span>Saving...</span>
                              </div>
                            ) : (
                              <span>
                                <span className="hidden sm:inline">Save to Agent</span>
                                <span className="sm:hidden">Save</span>
                              </span>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content Display */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 sm:p-6 overflow-y-auto min-h-32 lg:min-h-0">
                      <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {activeTab === 'transcript' 
                          ? selectedVideoData.transcript 
                          : selectedVideoData.summary}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <span className="text-sm">No content available</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full min-h-32 text-gray-500">
                <div className="text-center">
                  <Video className="w-8 h-8 sm:w-12 sm:h-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs sm:text-sm">Select a video to view content</p>
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