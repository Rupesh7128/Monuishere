import React, { useCallback } from 'react';
import { Upload, FileText, X, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { FileData } from '../types';

interface ResumeUploaderProps {
  onFileUpload: (file: FileData | null) => void;
  currentFile: FileData | null;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onFileUpload, currentFile }) => {
  
  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Please upload a PDF file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64 = base64String.split(',')[1];
        
        onFileUpload({
          name: file.name,
          type: file.type,
          base64: base64
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onFileUpload]);

  const removeFile = () => onFileUpload(null);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono font-bold text-zinc-500 tracking-wider">
          01 // SOURCE FILE
        </label>
        {currentFile && <span className="text-xs font-mono text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> UPLOADED</span>}
      </div>
      
      {!currentFile ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative flex-1 group cursor-pointer min-h-[160px]"
        >
          <div className="absolute inset-0 bg-zinc-900/50 rounded-xl border-2 border-dashed border-zinc-800 group-hover:border-orange-500/50 group-hover:bg-zinc-900/80 transition-all duration-300"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-zinc-800 group-hover:bg-orange-500/10 flex items-center justify-center mb-3 transition-colors">
              <Upload className="w-5 h-5 text-zinc-400 group-hover:text-orange-500 transition-colors" />
            </div>
            <p className="text-sm text-zinc-300 font-medium mb-1">
              Upload Resume
            </p>
            <p className="text-xs text-zinc-500 font-mono">
              PDF only (Max 5MB)
            </p>
          </div>
          
          <input 
            type="file" 
            accept=".pdf" 
            onChange={handleFileChange} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
        </motion.div>
      ) : (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 flex flex-col items-center justify-center p-6 bg-zinc-900/80 border border-zinc-700/50 rounded-xl relative group overflow-hidden"
        >
          {/* Animated scan line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>

          <FileText className="w-10 h-10 text-orange-500 mb-3" />
          <p className="text-sm font-bold text-white max-w-[90%] truncate">{currentFile.name}</p>
          <p className="text-xs text-zinc-500 font-mono mt-1">Ready for parsing</p>
          
          <button 
            onClick={removeFile}
            className="absolute top-2 right-2 p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeUploader;
