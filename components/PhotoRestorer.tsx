
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PhotoUploader } from './PhotoUploader';
import { ComparisonSlider } from './ComparisonSlider';
import { Loader } from './Loader';
import { restorePhoto, analyzeImage } from '../services/geminiService';
import { PrinterIcon } from './icons/PrinterIcon';
import { User, isFreeUserOnly } from '../userStore';
import { applyWatermark, dataURLtoFile } from '../utils/imageUtils';
import { OptionSelector } from './OptionSelector';
import { ImageAnalysisFeedback } from './ImageAnalysisFeedback';
import { OLD_PHOTO_OUTFITS, OLD_PHOTO_HAIRSTYLES, OLD_PHOTO_ACCESSORIES, GENDERS } from '../constants';
import type { Outfit, Hairstyle, Gender, ImageAnalysisResult } from '../types';
import { ArrowUturnLeftIcon } from './icons/ArrowUturnLeftIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface PhotoRestorerProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
    onSinglePhotoDownloadRequest: (imageUrl: string) => void;
}

export const PhotoRestorer: React.FC<PhotoRestorerProps> = ({ currentUser, onPrintRequest, onSinglePhotoDownloadRequest }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [originalGeneratedUrl, setOriginalGeneratedUrl] = useState<string | null>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<ImageAnalysisResult | null>(null);

    // Form state
    const [gender, setGender] = useState<Gender>('Nữ');
    const [outfit, setOutfit] = useState<Outfit>(OLD_PHOTO_OUTFITS[0]);
    const [hairstyle, setHairstyle] = useState<Hairstyle>(OLD_PHOTO_HAIRSTYLES[0]);
    const [accessories, setAccessories] = useState<string[]>([]);
    const [customRequest, setCustomRequest] = useState('');

    useEffect(() => {
        if (imageFile) {
            const url = URL.createObjectURL(imageFile);
            setPreviewUrl(url);
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
        setGeneratedImageUrl(null);
        setOriginalGeneratedUrl(null);
    };

    const handleRestore = async () => {
        if (!imageFile) {
            setError("Vui lòng tải ảnh lên trước.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const result = await restorePhoto(imageFile, outfit.name, hairstyle.name, accessories, customRequest);
            if (result.image) {
                setOriginalGeneratedUrl(result.image);
                if (isFreeUserOnly(currentUser)) {
                    const watermarked = await applyWatermark(result.image);
                    setGeneratedImageUrl(watermarked);
                } else {
                    setGeneratedImageUrl(result.image);
                }
            } else {
                setError(result.text || "AI không thể phục hồi ảnh. Vui lòng thử lại.");
            }
        } catch (e) {
            console.error("Photo restoration failed:", e);
            setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleUseAsOriginal = () => {
        if (!originalGeneratedUrl) return;
        const newFile = dataURLtoFile(originalGeneratedUrl, `restored-photo-${Date.now()}.png`);
        if (newFile) {
          handleImageUpload(newFile);
        }
    };

    const handleDownload = useCallback(() => {
        if (!originalGeneratedUrl) return;
        if (isFreeUserOnly(currentUser)) {
            onSinglePhotoDownloadRequest(originalGeneratedUrl);
        } else {
            const link = document.createElement('a');
            link.href = originalGeneratedUrl;
            link.download = `restored-photo-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [originalGeneratedUrl, currentUser, onSinglePhotoDownloadRequest]);
    
    const filteredOutfits = useMemo(() => OLD_PHOTO_OUTFITS.filter(o => o.id === 'none' || o.gender === gender), [gender]);
    const filteredHairstyles = useMemo(() => OLD_PHOTO_HAIRSTYLES.filter(h => h.id === 'none' || h.gender === gender), [gender]);

    const handleAccessoryToggle = (accessoryId: string) => {
        setAccessories(prev => prev.includes(accessoryId) ? prev.filter(id => id !== accessoryId) : [...prev, accessoryId]);
    };

    const isFree = isFreeUserOnly(currentUser);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <PhotoUploader onImageUpload={handleImageUpload} previewUrl={previewUrl} />
                {imageFile && <ImageAnalysisFeedback result={analysisResult} isLoading={isAnalyzing} />}

                <OptionSelector
                    label="Giới tính"
                    options={GENDERS}
                    selectedOption={GENDERS.find(g => g.id === gender) || GENDERS[0]}
                    onSelect={(option) => setGender(option.id)}
                    renderOption={(option) => <span>{option.name}</span>}
                    disabled={!imageFile}
                />
                 <OptionSelector
                    label="Trang phục"
                    options={filteredOutfits}
                    selectedOption={outfit}
                    onSelect={(option) => setOutfit(option)}
                    renderOption={(option) => <span>{option.name}</span>}
                    disabled={!imageFile}
                />
                 <OptionSelector
                    label="Kiểu tóc"
                    options={filteredHairstyles}
                    selectedOption={hairstyle}
                    onSelect={(option) => setHairstyle(option)}
                    renderOption={(option) => <span>{option.name}</span>}
                    disabled={!imageFile}
                />
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Phụ kiện</label>
                    <div className="flex flex-wrap gap-2">
                        {OLD_PHOTO_ACCESSORIES.map(acc => (
                            <button key={acc.id} onClick={() => handleAccessoryToggle(acc.id)} disabled={!imageFile} className={`px-3 py-1.5 text-sm rounded-full ${accessories.includes(acc.id) ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'}`}>
                                {acc.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Yêu cầu thêm</label>
                    <textarea value={customRequest} onChange={e => setCustomRequest(e.target.value)} disabled={!imageFile} className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-600" rows={2}/>
                </div>
                
                <button onClick={handleRestore} disabled={!imageFile || isLoading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg disabled:bg-blue-400">
                    {isLoading ? 'Đang phục hồi...' : 'Phục hồi ảnh'}
                </button>
            </div>
            <div className="relative aspect-square">
                {isLoading && <Loader />}
                {error && <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-lg">{error}</div>}
                
                {!isLoading && !error && previewUrl && generatedImageUrl ? (
                    <ComparisonSlider originalImageUrl={previewUrl} generatedImageUrl={generatedImageUrl} />
                ) : generatedImageUrl ? (
                    <img src={generatedImageUrl} alt="Restored" className="w-full h-full object-contain rounded-md" />
                ) : previewUrl ? (
                    <img src={previewUrl} alt="Original" className="w-full h-full object-contain rounded-md" />
                ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-zinc-900/50 rounded-lg flex items-center justify-center"><p className="text-slate-500 dark:text-zinc-400">Kết quả sẽ hiện ở đây</p></div>
                )}
                 {generatedImageUrl && !isLoading && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button onClick={handleUseAsOriginal} className="w-full py-2 px-3 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600 flex items-center justify-center gap-2 text-sm"><ArrowUturnLeftIcon className="w-4 h-4" /> Dùng làm gốc</button>
                        <button onClick={handleDownload} className="w-full py-2 px-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm"><DownloadIcon className="w-5 h-5"/> {isFree ? 'Tải về (Gỡ logo)' : 'Tải xuống'}</button>
                        <button onClick={() => onPrintRequest(originalGeneratedUrl || generatedImageUrl, 'Phục hồi Ảnh cũ')} className="w-full py-2 px-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 flex items-center justify-center gap-2 text-sm"><PrinterIcon className="w-5 h-5"/> Gửi in Lab</button>
                    </div>
                 )}
            </div>
        </div>
    );
};
