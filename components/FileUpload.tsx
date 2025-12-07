
import React, { useRef, useState } from 'react';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFilesSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files)
        .map(f => f as File)
        .filter(f => f.type.startsWith('image/'));
      onFilesSelected(files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files)
        .map(f => f as File)
        .filter(f => f.type.startsWith('image/'));
      onFilesSelected(files);
    }
  };

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full h-72 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden group
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-2 border-dashed border-slate-300' : 
          isDragging 
            ? 'border-2 border-indigo-500 bg-indigo-50/50 scale-[0.99] shadow-inner' 
            : 'border-2 border-dashed border-slate-300 bg-slate-50/30 hover:bg-indigo-50/30 hover:border-indigo-400 hover:shadow-lg hover:shadow-indigo-100/50'
        }
      `}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={handleInputChange}
        className="hidden"
        multiple
        accept="image/*"
        disabled={disabled}
      />
      
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center p-6 text-center transform transition-transform duration-300 group-hover:-translate-y-1">
        <div className={`p-5 rounded-full mb-6 shadow-sm transition-all duration-300 ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110'}`}>
          <svg className={`w-10 h-10 ${!isDragging && 'group-hover:animate-bounce'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-xl font-bold text-slate-800 mb-2 tracking-tight">
          {isDragging ? 'Drop to upload' : 'Drop product images here'}
        </p>
        <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
          Drag & drop your files or <span className="text-indigo-600 font-bold underline decoration-indigo-300 underline-offset-4 decoration-2 hover:text-indigo-700">browse computer</span>
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
