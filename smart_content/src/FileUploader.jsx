import React, { useRef } from 'react';

const FileUploader = ({ type, onFileUpload, accept, fileDescription, icon }) => {
  const fileInputRef = useRef(null);
  
  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div 
      className="border-2 border-dashed border-violet-300 rounded-lg p-8 text-center hover:bg-violet-50 transition-colors"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        className="hidden"
        id={`${type}-upload`}
        ref={fileInputRef}
        onChange={handleChange}
      />
      <label 
        htmlFor={`${type}-upload`}
        className="cursor-pointer flex flex-col items-center gap-3"
      >
        {icon}
        <span className="text-sm text-gray-700 font-medium">Click to upload or drag and drop</span>
        <span className="text-xs text-gray-500">{fileDescription}</span>
      </label>
    </div>
  );
};

export default FileUploader;