
import React, { useState, useRef } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onGenerate: (file: File, prompt: string) => void;
  isThinkingMode: boolean;
  onThinkingModeChange: (enabled: boolean) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onGenerate, isThinkingMode, onThinkingModeChange, isLoading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState<string>('Plan a 200kW RWD conversion with a 60kWh LFP battery pack.');
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleGenerateClick = () => {
    if (file && prompt) {
      onGenerate(file, prompt);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
       const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <div className="bg-brand-surface p-4 rounded-lg border border-gray-700 shadow-md">
      <h2 className="text-lg font-semibold text-white mb-3">1. Upload Vehicle Photo</h2>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer bg-gray-900/50 border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:border-brand-blue transition-colors"
      >
        {preview ? (
          <img src={preview} alt="Vehicle preview" className="max-h-32 rounded-md object-contain" />
        ) : (
          <>
            <UploadIcon className="w-10 h-10 text-brand-muted mb-2" />
            <span className="text-brand-muted">
              {file ? file.name : 'Click or drag & drop image'}
            </span>
          </>
        )}
      </label>

      <h2 className="text-lg font-semibold text-white mt-4 mb-2">2. Define Conversion Goal</h2>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition"
        rows={3}
        placeholder="e.g., Plan a performance conversion..."
      />
      
      <div className="flex items-center justify-between mt-4">
        <label htmlFor="thinking-mode" className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" id="thinking-mode" className="sr-only" checked={isThinkingMode} onChange={(e) => onThinkingModeChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition ${isThinkingMode ? 'bg-brand-blue' : 'bg-gray-600'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isThinkingMode ? 'transform translate-x-full' : ''}`}></div>
          </div>
          <div className="ml-3 text-sm text-gray-300">
            Thinking Mode <span className="text-xs text-brand-muted">(Gemini Pro)</span>
          </div>
        </label>
        
        <button
          onClick={handleGenerateClick}
          disabled={!file || !prompt || isLoading}
          className="bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          Generate Plan
        </button>
      </div>
    </div>
  );
};
