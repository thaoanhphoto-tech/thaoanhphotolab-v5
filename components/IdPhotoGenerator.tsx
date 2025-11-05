import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PhotoUploader } from './PhotoUploader';
import { OptionSelector } from './OptionSelector';
import { ImageAnalysisFeedback } from './ImageAnalysisFeedback';
import { CollapsibleSection } from './CollapsibleSection';
import { ResultView } from './ResultView';
import { ZoomModal } from './ZoomModal';
import { Loader } from './Loader';
import { analyzeImage, generateIdPhoto } from '../services/geminiService';
import type { ImageAnalysisResult, Outfit, Hairstyle, Gender, Background, AspectRatio, CountryTemplate, DocumentType, RetouchOption, ExpressionOption, LightingOption } from '../types';
import { User, isFreeUserOnly } from '../userStore';
import { BACKGROUNDS, OUTFITS, HAIRSTYLES, GENDERS, RETOUCH_OPTIONS, EXPRESSION_OPTIONS, ASPECT_RATIOS, COUNTRY_TEMPLATES, DOCUMENT_TYPES, LIGHTING_OPTIONS } from '../constants';
import { GlobeIcon } from './icons/GlobeIcon';
import { PrinterIcon } from './icons/PrinterIcon';
import { applyWatermark, dataURLtoFile } from '../utils/imageUtils';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface IdPhotoGeneratorProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
    onSinglePhotoDownloadRequest: (imageUrl: string) => void;
}

export const IdPhotoGenerator: React.FC<IdPhotoGeneratorProps> = ({ currentUser, onPrintRequest, onSinglePhotoDownloadRequest }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [originalGeneratedUrl, setOriginalGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);

  // Form state
  const [gender, setGender] = useState<Gender>('Nữ');
  const [background, setBackground] = useState(BACKGROUNDS[2]);
  const [documentType, setDocumentType] = useState(DOCUMENT_TYPES[0]);
  const [outfit, setOutfit] = useState<Outfit>(OUTFITS[0]);
  const [hairstyle, setHairstyle] = useState<Hairstyle>(HAIRSTYLES[0]);
  const [retouch, setRetouch] = useState(RETOUCH_OPTIONS[1]);
  const [expression, setExpression] = useState(EXPRESSION_OPTIONS[0]);
  const [lighting, setLighting] = useState(LIGHTING_OPTIONS[0]);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[1]);
  const [countryTemplate, setCountryTemplate] = useState(COUNTRY_TEMPLATES[1]);
  const [customPrompt, setCustomPrompt] = useState('');

  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      setOriginalImageUrl(url);
      // Don't clear the result view here, let the user decide.
      // setGeneratedImageUrl(null);
      setError(null);
      
      const performAnalysis = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
          const result = await analyzeImage(imageFile);
          setAnalysisResult(result);
          if (result.gender) {
            setGender(result.gender);
          }
        } catch (e) {
          console.error("Image analysis failed:", e);
          setError("Phân tích ảnh thất bại. Vui lòng thử lại.");
        } finally {
          setIsAnalyzing(false);
        }
      };
      performAnalysis();

      return () => URL.revokeObjectURL(url);
    }
  }, [imageFile]);

  const handleImageUpload = (file: File) => {
    setImageFile(file);
  };

  const filteredOutfits = useMemo(() => {
    const base = OUTFITS.filter(o => o.id === 'none' || o.gender === gender);
    if (documentType.id === 'all') return base;
    return base.filter(o => o.documentTypes?.includes(documentType.id));
  }, [gender, documentType]);

  const filteredHairstyles = useMemo(() => {
    return HAIRSTYLES.filter(h => h.id === 'none' || h.gender === gender);
  }, [gender]);

  useEffect(() => {
    if (!filteredOutfits.some(o => o.id === outfit.id)) {
      setOutfit(OUTFITS[0]);
    }
  }, [filteredOutfits, outfit.id]);

  useEffect(() => {
    if (!filteredHairstyles.some(h => h.id === hairstyle.id)) {
      setHairstyle(HAIRSTYLES[0]);
    }
  }, [filteredHairstyles, hairstyle.id]);

  useEffect(() => {
    if (countryTemplate.id !== 'custom') {
      const bg = BACKGROUNDS.find(b => b.id === countryTemplate.backgroundId) || background;
      const ar = ASPECT_RATIOS.find(a => a.id === countryTemplate.aspectRatioId) || aspectRatio;
      setBackground(bg);
      setAspectRatio(ar);
    }
  }, [countryTemplate, aspectRatio, background]);

  const handleGenerate = async () => {
    if (!imageFile) {
      setError("Vui lòng tải ảnh lên trước.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setOriginalGeneratedUrl(null);

    try {
      const result = await generateIdPhoto(
        imageFile,
        background.name,
        outfit.name,
        gender,
        hairstyle.name,
        aspectRatio.name,
        retouch.name,
        lighting.name,
        expression.name,
        customPrompt
      );
      
      if (result.image) {
        setOriginalGeneratedUrl(result.image); // Always store the original
        if (isFreeUserOnly(currentUser)) {
            const watermarkedImage = await applyWatermark(result.image);
            setGeneratedImageUrl(watermarkedImage);
        } else {
            setGeneratedImageUrl(result.image);
        }
      } else {
        setError(result.text || "AI không thể tạo ảnh. Vui lòng thử lại với một ảnh khác hoặc tùy chọn khác.");
      }
    } catch (e) {
      console.error("ID Photo generation failed:", e);
      setError("Đã xảy ra lỗi trong quá trình tạo ảnh. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = useCallback(() => {
    if (!originalGeneratedUrl) return;
    const link = document.createElement('a');
    link.href = originalGeneratedUrl;
    link.download = `id-photo-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [originalGeneratedUrl]);

  const handleUseAsOriginal = () => {
    if (!originalGeneratedUrl) return;
    const newFile = dataURLtoFile(originalGeneratedUrl, `generated-photo-${Date.now()}.png`);
    if (newFile) {
      setImageFile(newFile);
      setGeneratedImageUrl(null);
      setOriginalGeneratedUrl(null);
    }
  };

  const isFree = isFreeUserOnly(currentUser);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Controls */}
      <div className="space-y-6">
        <PhotoUploader onImageUpload={handleImageUpload} previewUrl={previewUrl} />
        {imageFile && <ImageAnalysisFeedback result={analysisResult} isLoading={isAnalyzing} />}
        
        <div className="space-y-6">
          <OptionSelector
            label="Giới tính"
            options={GENDERS}
            selectedOption={GENDERS.find(g => g.id === gender) || GENDERS[0]}
            onSelect={(option) => setGender(option.id)}
            renderOption={(option) => <span className="font-semibold">{option.name}</span>}
            disabled={!imageFile}
          />
          <OptionSelector
            label="Mẫu theo Quốc gia"
            options={COUNTRY_TEMPLATES}
            selectedOption={countryTemplate}
            onSelect={(option) => setCountryTemplate(option)}
            renderOption={option => (
              <div className="flex items-center">
                <GlobeIcon className="w-5 h-5 mr-2 text-slate-500"/>
                <span className="font-semibold">{option.name}</span>
              </div>
            )}
            disabled={!imageFile}
          />
          <OptionSelector
            label="Nền"
            options={BACKGROUNDS}
            selectedOption={background}
            onSelect={(option) => setBackground(option)}
            renderOption={option => (
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-2 border border-slate-300 ${option.tailwindColor}`}></div>
                <span className="font-semibold">{option.name}</span>
              </div>
            )}
            disabled={!imageFile || countryTemplate.id !== 'custom'}
          />
          <OptionSelector
            label="Tỉ lệ ảnh"
            options={ASPECT_RATIOS}
            selectedOption={aspectRatio}
            onSelect={(option) => setAspectRatio(option)}
            renderOption={option => <span className="font-semibold">{option.name}</span>}
            disabled={!imageFile || countryTemplate.id !== 'custom'}
          />
          
          <CollapsibleSection title="Trang phục & Kiểu tóc">
            <div className="space-y-6">
               <OptionSelector
                label="Loại hồ sơ"
                options={DOCUMENT_TYPES}
                selectedOption={documentType}
                onSelect={(option) => setDocumentType(option)}
                renderOption={option => <span className="font-semibold">{option.name}</span>}
                disabled={!imageFile}
              />
              <OptionSelector
                label="Trang phục"
                options={filteredOutfits}
                selectedOption={outfit}
                onSelect={(option) => setOutfit(option)}
                renderOption={option => (
                  <div className="flex items-center">
                    <img src={option.previewUrl} alt={option.name} className="w-10 h-10 rounded-md mr-3 object-cover" />
                    <span className="font-semibold text-sm">{option.name}</span>
                  </div>
                )}
                disabled={!imageFile}
              />
              <OptionSelector
                label="Kiểu tóc"
                options={filteredHairstyles}
                selectedOption={hairstyle}
                onSelect={(option) => setHairstyle(option)}
                renderOption={option => (
                  <div className="flex items-center">
                    <img src={option.previewUrl} alt={option.name} className="w-10 h-10 rounded-md mr-3 object-cover" />
                    <span className="font-semibold text-sm">{option.name}</span>
                  </div>
                )}
                disabled={!imageFile}
              />
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection title="Tinh chỉnh Nâng cao" defaultOpen={true}>
            <div className="space-y-6">
              <OptionSelector
                label="Làm mịn da"
                options={RETOUCH_OPTIONS}
                selectedOption={retouch}
                onSelect={(option) => setRetouch(option)}
                renderOption={option => (
                  <div>
                    <span className="font-semibold">{option.name}</span>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{option.description}</p>
                  </div>
                )}
                disabled={!imageFile}
              />
              <OptionSelector
                label="Biểu cảm"
                options={EXPRESSION_OPTIONS}
                selectedOption={expression}
                onSelect={(option) => setExpression(option)}
                renderOption={option => (
                  <div>
                    <span className="font-semibold">{option.name}</span>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">{option.description}</p>
                  </div>
                )}
                disabled={!imageFile}
              />
              <OptionSelector
                label="Ánh sáng Studio"
                options={LIGHTING_OPTIONS}
                selectedOption={lighting}
                onSelect={(option) => setLighting(option)}
                renderOption={option => <span className="font-semibold">{option.name}</span>}
                disabled={!imageFile}
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Yêu cầu thêm (Tùy chọn)</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ví dụ: 'thêm một nốt ruồi nhỏ trên má phải', 'làm cho tóc dày hơn một chút'..."
                  className="w-full p-2 bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 rounded-md text-slate-800 dark:text-zinc-200"
                  rows={2}
                  disabled={!imageFile}
                />
              </div>
            </div>
          </CollapsibleSection>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!imageFile || isLoading}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang tạo ảnh...' : 'Bắt đầu Chỉnh sửa'}
        </button>
      </div>

      {/* Right Column: Result */}
      <div className="relative aspect-square">
        {isLoading && <Loader />}
        {error && <div className="absolute inset-0 flex items-center justify-center bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 p-4 rounded-lg text-center">{error}</div>}
        
        {!isLoading && !error && originalImageUrl && generatedImageUrl ? (
          <ResultView 
            originalImageUrl={originalImageUrl} 
            generatedImageUrl={generatedImageUrl}
            onZoomRequest={setZoomedImageUrl}
          />
        ) : generatedImageUrl ? (
            <div className="w-full h-full bg-white dark:bg-zinc-900/50 rounded-lg flex items-center justify-center p-4">
                <img src={generatedImageUrl} alt="Generated" className="max-w-full max-h-full object-contain rounded-md" />
            </div>
        ) : previewUrl ? (
            <div className="w-full h-full bg-white dark:bg-zinc-900/50 rounded-lg flex items-center justify-center p-4">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain rounded-md" />
            </div>
        ) : (
          <div className="w-full h-full bg-white dark:bg-zinc-900/50 border-2 border-dashed border-slate-300 dark:border-zinc-700 rounded-lg flex items-center justify-center">
            <p className="text-slate-500 dark:text-zinc-400">Kết quả sẽ hiện ở đây</p>
          </div>
        )}

        {generatedImageUrl && !isLoading && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                    onClick={handleUseAsOriginal}
                    disabled={isFree}
                    className={`w-full py-2 px-3 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 text-sm ${isFree ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={isFree ? "Nâng cấp để sử dụng tính năng này" : "Sử dụng ảnh này làm ảnh gốc cho lần tạo tiếp theo"}
                >
                    <ArrowUturnLeftIcon className="w-4 h-4" /> Dùng làm gốc
                </button>
                {isFree ? (
                    <button
                        onClick={() => onSinglePhotoDownloadRequest(originalGeneratedUrl || '')}
                        className="w-full py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                        <DownloadIcon className="w-5 h-5" /> Tải về (Gỡ logo)
                    </button>
                ) : (
                    <button onClick={handleDownload} className="w-full py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2">
                        <DownloadIcon className="w-5 h-5" /> Tải xuống
                    </button>
                )}
                <button 
                    onClick={() => onPrintRequest(originalGeneratedUrl || generatedImageUrl, 'Ảnh Thẻ')}
                    className="w-full py-2 px-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <PrinterIcon className="w-5 h-5" /> Gửi in Lab
                </button>
            </div>
        )}
      </div>

      {zoomedImageUrl && <ZoomModal imageUrl={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />}
    </div>
  );
};