import React, { useState, useRef } from 'react';
import { UploadIcon } from '../icons/UploadIcon';

interface StyleReferenceUploaderProps {
  onFileChange: (file: File | null) => void;
  promptValue: string;
  onPromptChange: (text: string) => void;
}

export const StyleReferenceUploader: React.FC<StyleReferenceUploaderProps> = ({ onFileChange, promptValue, onPromptChange }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'prompt'>('upload');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChangeInternal = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileChange(file);
      onPromptChange('');
      setPreview(URL.createObjectURL(file));
      setActiveTab('upload');
    }
  };

  const handlePromptChangeInternal = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = event.target.value;
    onPromptChange(text);
    if (text) {
      onFileChange(null);
      setPreview(null);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex bg-slate-200 dark:bg-slate-700/50 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'upload' ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
          }`}
        >
          Tải Ảnh
        </button>
        <button
          onClick={() => setActiveTab('prompt')}
          className={`flex-1 py-2 px-4 text-sm font-semibold rounded-md transition-colors ${
            activeTab === 'prompt' ? 'bg-white dark:bg-purple-600 text-purple-600 dark:text-white shadow-md' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-600/50'
          }`}
        >
          Nhập Mô Tả
        </button>
      </div>

      {activeTab === 'upload' ? (
        <div
          onClick={handleClick}
          className="w-full aspect-video border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-slate-700/50 transition-colors relative"
        >
          <input
            type="file"
            ref={inputRef}
            onChange={handleFileChangeInternal}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          {preview ? (
            <img src={preview} alt="Style reference preview" className="w-full h-full object-contain rounded-md" />
          ) : (
            <div className="text-slate-500 dark:text-slate-400">
              <UploadIcon className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-slate-500" />
              <p className="font-semibold text-sm">Tải ảnh tham chiếu</p>
              <p className="text-xs mt-1">AI sẽ học phong cách từ ảnh này.</p>
            </div>
          )}
        </div>
      ) : (
        <textarea
            value={promptValue}
            onChange={handlePromptChangeInternal}
            placeholder="Ví dụ: phong cách tranh sơn dầu của Van Gogh, tông màu phim của Wong Kar-wai, ánh sáng neon trong đêm mưa..."
            className="w-full h-[150px] p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-500 transition-all duration-200 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            rows={4}
        />
      )}
    </div>
  );
};