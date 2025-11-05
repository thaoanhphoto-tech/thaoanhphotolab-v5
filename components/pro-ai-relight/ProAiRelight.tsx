import React, { useState, useEffect, useCallback } from 'react';
import type { RelightSettings, Language, PostProcessingSettings } from './types';
import { locales } from './locales';
import { ControlPanel } from './ControlPanel';
import { ImageDisplay } from './ImageDisplay';
import { relightImage } from '../../services/geminiService';
import { User } from '../../userStore';
import { dataURLtoFile } from '../../utils/imageUtils';

interface ProAiRelightProps {
    currentUser: User | null;
    onPrintRequest: (imageDataUrl: string, sourceTool: string) => void;
}


export const ProAiRelight: React.FC<ProAiRelightProps> = ({ currentUser, onPrintRequest }) => {
  const [settings, setSettings] = useState<RelightSettings>({
    backlightDirection: 'left',
    lightType: 'one-light',
    lightColor1: 'White',
    lightColor2: 'Blue',
    lightColor3: 'Red',
    quality: 'standard',
    customPrompt: '',
    preserveExpression: true,
  });

  const [postProcessingSettings, setPostProcessingSettings] = useState<PostProcessingSettings>({
    temperature: 0,
    exposure: 0,
    contrast: 0,
    highlights: 0,
    shadows: 0,
    saturation: 0,
  });

  const [language, setLanguage] = useState<Language>('vi');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isRelighting, setIsRelighting] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);
  const [loadingMessage, setLoadingMessage] = useState('');

  const t = locales[language];

  useEffect(() => {
    let interval: number;
    if (isRelighting) {
      let messageIndex = 0;
      setLoadingMessage(t.loadingMessages[0]);
      interval = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % t.loadingMessages.length;
        setLoadingMessage(t.loadingMessages[messageIndex]);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isRelighting, t.loadingMessages]);
  
  const handleImageUpload = useCallback((file: File) => {
    setUploadedImage(file);
    const url = URL.createObjectURL(file);
    setOriginalImageUrl(url);
    setGeneratedImageUrl(null);
    setError(null);
  }, []);

  const handleUseAsOriginal = useCallback((imageUrl: string) => {
    const newFile = dataURLtoFile(imageUrl, `relighted-photo-${Date.now()}.png`);
    if (newFile) {
        handleImageUpload(newFile);
    }
  }, [handleImageUpload]);

  const handleRelight = async () => {
    if (!uploadedImage) return;

    setIsRelighting(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const result = await relightImage(uploadedImage, settings);
      if (result.image) {
        setGeneratedImageUrl(result.image);
      } else {
        setError({ title: t.error.title, message: result.text || t.error.generationFailed });
      }
    } catch (e) {
      console.error(e);
      setError({ title: t.error.title, message: t.error.unexpected });
    } finally {
      setIsRelighting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4 md:p-6 lg:p-8 bg-emerald-50 dark:bg-emerald-950 min-h-screen">
      <div className="lg:col-span-1">
        <ControlPanel
          settings={settings}
          setSettings={setSettings}
          onImageUpload={handleImageUpload}
          onRelight={handleRelight}
          isRelighting={isRelighting}
          hasUploadedImage={!!uploadedImage}
          language={language}
          setLanguage={setLanguage}
          t={t.controls}
        />
      </div>
      <div className="lg:col-span-2">
        <ImageDisplay
          currentUser={currentUser}
          originalImageUrl={originalImageUrl}
          generatedImageUrl={generatedImageUrl}
          isRelighting={isRelighting}
          loadingMessage={loadingMessage}
          error={error}
          t={t.imageDisplay}
          postProcessingSettings={postProcessingSettings}
          setPostProcessingSettings={setPostProcessingSettings}
          postProcessingTranslations={t.postProcessing}
          onPrintRequest={onPrintRequest}
          onUseAsOriginal={handleUseAsOriginal}
        />
      </div>
    </div>
  );
};
