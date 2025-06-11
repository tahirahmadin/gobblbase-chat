import React, { useState, useEffect } from 'react';
import { Video, Plus, X, FileText, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { toast } from "react-hot-toast";
import { removeDocumentFromAgent } from '../../../../lib/serverActions';

const Button = ({ children, onClick, disabled, className, ...props }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded font-medium transition-colors ${
      disabled 
        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
        : 'bg-green-600 text-white hover:bg-green-700'
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

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
      <div className="bg-green-100 px-4 py-3 border-b border-green-200">
        <p className="text-sm text-gray-700">
          Paste Video links from social media for converting into brain knowledge | Platforms: YouTube, Instagram, TikTok, Twitter, LinkedIn, and Reddit
        </p>
      </div>

      {/* New Link Section */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Plus className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">New Link</span>
          </div>
          <div className="flex-1 flex items-center space-x-2">
            <input
              type="url"
              value={newVideoUrl}
              onChange={(e) => setNewVideoUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste your link..."
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
            <button 
              onClick={handleAddVideo}
              className="px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              ADD LINK
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {videos.length > 0 && (
        <div className="flex h-96">
          {/* Left Sidebar - Videos List */}
          <div className="w-64 bg-blue-50 border-r border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              {videos.length} Video{videos.length > 1 ? 's' : ''}
            </h3>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {videos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video.id)}
                  className={`relative bg-white rounded-lg p-2 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer ${
                    selectedVideo === video.id ? 'ring-2 ring-blue-300' : ''
                  }`}
                >
                  {/* Action buttons */}
                  <div className="absolute top-1 right-1 flex space-x-1">
                    {video.savedToAgent && video.documentId && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromAgent(video);
                        }}
                        disabled={removingVideo === video.id}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                        title="Remove from agent"
                      >
                        {removingVideo === video.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeVideo(video.id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                      title="Remove from list"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="flex space-x-2">
                    {video.thumbnail && (
                      <img 
                        src={video.thumbnail}
                        alt="Video thumbnail"
                        className="w-16 h-12 rounded object-cover flex-shrink-0"
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center space-x-1 mb-1">
                        <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded ${
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
                          <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                            Saved
                          </span>
                        )}
                        {/* Add saving indicator */}
                        {savingToAgent === video.id && (
                          <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                            Saving...
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-800 line-clamp-2">
                        {video.loading ? 'Loading...' : video.title}
                      </p>
                      {video.author && !video.loading && (
                        <p className="text-xs text-gray-600 truncate">
                          by {video.author}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {video.loading && (
                    <div className="absolute inset-0 bg-blue-50 bg-opacity-75 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-4">
            {selectedVideoData ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="border-b pb-3 mb-4">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {selectedVideoData.title}
                  </h3>
                  {selectedVideoData.author && (
                    <p className="text-xs text-gray-600 mb-2">
                      by {selectedVideoData.author}
                    </p>
                  )}
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {selectedVideoData.viewCount && (
                      <span>{selectedVideoData.viewCount}</span>
                    )}
                    {selectedVideoData.publishDate && (
                      <span>{selectedVideoData.publishDate}</span>
                    )}
                    {selectedVideoData.transcript && (
                      <span>{selectedVideoData.transcript.split(/\s+/).length} words of content</span>
                    )}
                    {selectedVideoData.savedToAgent && (
                      <span className="text-green-600 font-medium">✓ Saved to Agent</span>
                    )}
                    {/* Add saving indicator in header */}
                    {savingToAgent === selectedVideoData.id && (
                      <span className="text-blue-600 font-medium">Saving...</span>
                    )}
                  </div>
                </div>

                {selectedVideoData.error ? (
                  <div className="flex items-center space-x-2 text-red-600 bg-red-50 rounded-lg p-3">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{selectedVideoData.error}</span>
                  </div>
                ) : selectedVideoData.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading content...</span>
                    </div>
                  </div>
                ) : selectedVideoData.transcript ? (
                  <>
                    {/* Tab Controls */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 border-b border-gray-200 pb-2">
                        <button
                          onClick={() => setActiveTab('transcript')}
                          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
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
                            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                              activeTab === 'summary'
                                ? 'text-blue-600 border-blue-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                          >
                            Summary
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {!selectedVideoData.summary && selectedVideoData.transcript && (
                          <Button
                            onClick={() => handleGenerateSummary(selectedVideoData.id)}
                            disabled={generatingSummary === selectedVideoData.id}
                            className="text-xs px-3 py-1 h-7"
                          >
                            {generatingSummary === selectedVideoData.id ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                <span>Generating...</span>
                              </div>
                            ) : (
                              'Generate Summary'
                            )}
                          </Button>
                        )}
                        
                        {/* Updated Save button with loading state */}
                        {!selectedVideoData.savedToAgent && (
                          <Button
                            onClick={() => handleSaveToAgent(selectedVideoData)}
                            disabled={!onAddToAgent || savingToAgent === selectedVideoData.id}
                            className={`text-xs px-3 py-1 h-7 ${
                              savingToAgent === selectedVideoData.id ? 'cursor-not-allowed' : ''
                            }`}
                          >
                            {savingToAgent === selectedVideoData.id ? (
                              <div className="flex items-center space-x-1">
                                <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full"></div>
                                <span>Saving...</span>
                              </div>
                            ) : (
                              'Save to Agent'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Content Display */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {activeTab === 'transcript' 
                          ? selectedVideoData.transcript 
                          : selectedVideoData.summary}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center py-8 text-gray-500">
                    <span>No content available</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a video to view content</p>
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