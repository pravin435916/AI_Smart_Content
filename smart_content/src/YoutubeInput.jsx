import React from 'react';
import { Youtube, Play, ExternalLink, Loader2 } from "lucide-react";

const YoutubeInput = ({ youtubeUrl, setYoutubeUrl, videoPreview, apiStatus, setProcessing }) => {
  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Paste YouTube URL here"
          className="w-full p-3 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Youtube className="text-red-600" size={18} />
        </div>
      </div>
      
      {/* YouTube Preview */}
      {videoPreview && (
        <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 animate-fadeIn">
          <div className="relative pb-[56.25%] bg-black"> {/* 16:9 aspect ratio */}
            <img 
              src={videoPreview.thumbnail} 
              alt="Video thumbnail" 
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // If maxresdefault fails, try hqdefault
                e.target.src = `https://img.youtube.com/vi/${videoPreview.id}/hqdefault.jpg`;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 p-2 rounded-full">
                <Play className="text-white" size={32} />
              </div>
            </div>
          </div>
          <div className="p-3 flex justify-between items-center">
            <div className="text-sm text-gray-700 font-medium line-clamp-1">
              YouTube Video Preview
            </div>
            <a 
              href={`https://www.youtube.com/watch?v=${videoPreview.id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-violet-600 hover:text-violet-700 text-sm flex items-center gap-1"
            >
              <ExternalLink size={14} />
              <span>Open</span>
            </a>
          </div>
        </div>
      )}
      
      <button 
        className={`w-full py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 ${
          apiStatus.loading ? 
          'bg-violet-400 cursor-not-allowed' : 
          'bg-violet-600 hover:bg-violet-700 text-white'
        }`}
        onClick={() => setProcessing(true)}
        disabled={apiStatus.loading || !videoPreview}
      >
        {apiStatus.loading ? (
          <>
            <Loader2 className="animate-spin" size={18} />
            <span>Processing...</span>
          </>
        ) : (
          <span>Process Video</span>
        )}
      </button>
    </div>
  );
};

export default YoutubeInput;