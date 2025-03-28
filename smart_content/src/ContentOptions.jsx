import React from 'react';
import { Youtube, Upload, FileText, AudioLines } from "lucide-react";

const ContentOptions = ({ selectedOption, setSelectedOption }) => {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {/* YouTube URL Box */}
      <div 
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md
          ${selectedOption === 'youtube' 
            ? 'border-violet-500 bg-violet-50' 
            : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
        onClick={() => setSelectedOption('youtube')}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`p-3 rounded-full ${selectedOption === 'youtube' ? 'bg-violet-100' : 'bg-gray-100 group-hover:bg-violet-50'}`}>
            <Youtube className={`${selectedOption === 'youtube' ? 'text-violet-600' : 'text-red-600'}`} size={24} />
          </div>
          <h2 className="font-semibold text-sm text-gray-800">YouTube URL</h2>
        </div>
      </div>

      {/* Upload Video Box */}
      <div 
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md
          ${selectedOption === 'video' 
            ? 'border-violet-500 bg-violet-50' 
            : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
        onClick={() => setSelectedOption('video')}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`p-3 rounded-full ${selectedOption === 'video' ? 'bg-violet-100' : 'bg-gray-100 group-hover:bg-violet-50'}`}>
            <Upload className={`${selectedOption === 'video' ? 'text-violet-600' : 'text-indigo-600'}`} size={24} />
          </div>
          <h2 className="font-semibold text-sm text-gray-800">Upload Video</h2>
        </div>
      </div>

      {/* Upload Audio Box */}
      <div 
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md
          ${selectedOption === 'audio' 
            ? 'border-violet-500 bg-violet-50' 
            : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
        onClick={() => setSelectedOption('audio')}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`p-3 rounded-full ${selectedOption === 'audio' ? 'bg-violet-100' : 'bg-gray-100 group-hover:bg-violet-50'}`}>
            <AudioLines className={`${selectedOption === 'audio' ? 'text-violet-600' : 'text-indigo-600'}`} size={24} />
          </div>
          <h2 className="font-semibold text-sm text-gray-800">Upload Audio</h2>
        </div>
      </div>

      {/* Upload Document Box */}
      <div 
        className={`p-4 rounded-xl border-2 transition-all cursor-pointer group hover:shadow-md
          ${selectedOption === 'document' 
            ? 'border-violet-500 bg-violet-50' 
            : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'}`}
        onClick={() => setSelectedOption('document')}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className={`p-3 rounded-full ${selectedOption === 'document' ? 'bg-violet-100' : 'bg-gray-100 group-hover:bg-violet-50'}`}>
            <FileText className={`${selectedOption === 'document' ? 'text-violet-600' : 'text-indigo-600'}`} size={24} />
          </div>
          <h2 className="font-semibold text-sm text-gray-800">Upload Document</h2>
        </div>
      </div>
    </div>
  );
};

export default ContentOptions;