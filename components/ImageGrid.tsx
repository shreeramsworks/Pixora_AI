import React from 'react';
import { UploadedFile } from '../types';

interface ImageGridProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

const ImageGrid: React.FC<ImageGridProps> = ({ files, onRemove, onClear }) => {
  if (files.length === 0) return null;

  return (
    <div className="mt-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
          Upload Queue ({files.length})
        </h3>
        <button 
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100 group"
          title="Remove all images"
        >
          <svg className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {files.map((file) => (
          <div key={file.id} className="group relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <img 
              src={file.previewUrl} 
              alt="preview" 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={() => onRemove(file.id)}
                className="p-2 bg-white text-red-500 rounded-full hover:bg-red-50 transition-colors transform hover:scale-110 active:scale-95"
                title="Remove image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status Indicator */}
            <div className="absolute bottom-2 left-2 right-2">
               {file.status === 'analyzing' && (
                 <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden backdrop-blur-sm">
                   <div className="h-full bg-white animate-pulse w-2/3"></div>
                 </div>
               )}
               {file.status === 'done' && (
                 <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block shadow-sm">
                   READY
                 </div>
               )}
                {file.status === 'error' && (
                 <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full inline-block shadow-sm">
                   ERROR
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageGrid;