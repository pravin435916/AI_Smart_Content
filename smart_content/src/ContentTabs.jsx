import React from 'react';
import { BookOpen, FileText, List, HelpCircle } from "lucide-react";

const ContentTabs = ({ selectedProcessingOptions, activeResultTab, setActiveResultTab }) => {
  return (
    <div className="flex border-b">
      {selectedProcessingOptions.summary && (
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeResultTab === 'summary' 
            ? 'text-violet-700 border-b-2 border-violet-600' 
            : 'text-gray-600 hover:text-violet-600'}`}
          onClick={() => setActiveResultTab('summary')}
        >
          <div className="flex items-center justify-center gap-1">
            <BookOpen size={16} />
            <span>Summary</span>
          </div>
        </button>
      )}
      {selectedProcessingOptions.transcript && (
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeResultTab === 'transcript' 
            ? 'text-violet-700 border-b-2 border-violet-600' 
            : 'text-gray-600 hover:text-violet-600'}`}
          onClick={() => setActiveResultTab('transcript')}
        >
          <div className="flex items-center justify-center gap-1">
            <FileText size={16} />
            <span>Transcript</span>
          </div>
        </button>
      )}
      {selectedProcessingOptions.notes && (
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeResultTab === 'notes' 
            ? 'text-violet-700 border-b-2 border-violet-600' 
            : 'text-gray-600 hover:text-violet-600'}`}
          onClick={() => setActiveResultTab('notes')}
        >
          <div className="flex items-center justify-center gap-1">
            <List size={16} />
            <span>Notes</span>
          </div>
        </button>
      )}
      {selectedProcessingOptions.quiz && (
        <button
          className={`flex-1 py-2 px-4 text-sm font-medium ${activeResultTab === 'quiz' 
            ? 'text-violet-700 border-b-2 border-violet-600' 
            : 'text-gray-600 hover:text-violet-600'}`}
          onClick={() => setActiveResultTab('quiz')}
        >
          <div className="flex items-center justify-center gap-1">
            <HelpCircle size={16} />
            <span>Quiz</span>
          </div>
        </button>
      )}
    </div>
  );
};

export default ContentTabs;