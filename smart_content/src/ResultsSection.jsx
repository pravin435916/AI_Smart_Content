import React from 'react';
import { Share2, Download, BookOpen, FileText, List, HelpCircle } from "lucide-react";
import QuizComponent from "./QuizComponent";
import ContentTabs from './ContentTabs';

const ResultsSection = ({ 
  data, 
  selectedProcessingOptions, 
  activeResultTab, 
  setActiveResultTab, 
  resetState 
}) => {
  if (!data) return null;

  return (
    <div className="mt-0 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Video/Content Info Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-700 p-4 text-white">
        <h3 className="font-semibold text-lg">{data.metadata?.title || "Content Results"}</h3>
        <p className="text-sm opacity-90">{data.metadata?.channel || ""}</p>
        <div className="flex gap-2 mt-2 text-xs">
          {data.metadata?.views && data.metadata.views !== "N/A" && (
            <span className="bg-white/20 px-2 py-1 rounded-full">
              {parseInt(data.metadata.views).toLocaleString()} views
            </span>
          )}
          {data.metadata?.likes && data.metadata.likes !== "N/A" && (
            <span className="bg-white/20 px-2 py-1 rounded-full">
              {parseInt(data.metadata.likes).toLocaleString()} likes
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <ContentTabs 
        selectedProcessingOptions={selectedProcessingOptions}
        activeResultTab={activeResultTab}
        setActiveResultTab={setActiveResultTab}
      />

      {/* Content */}
      <div className="p-4">
        {activeResultTab === 'summary' && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Content Summary</h4>
            <p className="whitespace-pre-line">{data.summary || "No summary available"}</p>
          </div>
        )}

        {activeResultTab === 'transcript' && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Transcript</h4>
            <p className="whitespace-pre-line">{data.transcript_preview || "Full transcript not available"}</p>
            {data.transcript_preview && data.transcript_preview.endsWith("...") && (
              <button className="mt-2 text-violet-600 text-sm font-medium hover:underline">
                Show full transcript
              </button>
            )}
          </div>
        )}

        {activeResultTab === 'notes' && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Key Notes</h4>
            <p>Key notes feature will be available in the next update.</p>
          </div>
        )}

        {activeResultTab === 'quiz' && (
          <div className="prose prose-sm max-w-none text-gray-700">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Quiz Questions</h4>
            {data.questions ? (
              <div>
                <QuizComponent quizData={data.questions} />
              </div>
            ) : (
              <p>No quiz questions available.</p>
            )}
          </div>
        )}
      </div>

      {/* Actions Footer */}
      <div className="bg-gray-50 p-3 flex justify-between border-t">
        <button 
          className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
          onClick={resetState}
        >
          <span>New Analysis</span>
        </button>
        <div className="flex gap-2">
          <button className="text-sm text-violet-600 hover:text-violet-700 flex items-center gap-1 px-2 py-1 rounded">
            <Share2 size={16} />
            <span>Share</span>
          </button>
          <button className="text-sm text-white bg-violet-600 px-3 py-1 rounded hover:bg-violet-700 flex items-center gap-1">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsSection;