import React, { useState, useRef, useEffect, useCallback } from 'react';
import { User } from '../userStore';
import { CameraIcon } from './icons/CameraIcon';
import { Loader } from './Loader';

interface TimeClockPageProps {
  currentUser: User;
  onAddTimeClockEntry: (userId: string, type: 'clock_in' | 'clock_out', photoDataUrl: string) => void;
}

export const TimeClockPage: React.FC<TimeClockPageProps> = ({ currentUser, onAddTimeClockEntry }) => {
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Loading on mount
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (streamRef.current) {
      stopCamera();
    }
    try {
      setError(null);
      setIsLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 400, height: 400, facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Không thể truy cập camera. Vui lòng cấp quyền và thử lại.');
      setIsLoading(false);
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  const handleCanPlay = () => {
    setIsLoading(false);
    setIsCameraReady(true);
  };

  const handleClockAction = (type: 'clock_in' | 'clock_out') => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return;

    setIsLoading(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (context) {
      // Flip the captured image because the preview is flipped
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photoDataUrl = canvas.toDataURL('image/jpeg');
      onAddTimeClockEntry(currentUser.id, type, photoDataUrl);
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-2">Chấm công</h1>
        <p className="text-slate-500 dark:text-zinc-400 mb-4">Hệ thống sẽ chụp lại ảnh khuôn mặt của bạn để xác thực.</p>
        
        <div className="relative w-64 h-64 mx-auto bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden border-4 border-white dark:border-zinc-600 shadow-inner">
          {isLoading && <div className="absolute inset-0 flex items-center justify-center z-10"><Loader /></div>}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-red-500 p-4">
              <CameraIcon className="w-16 h-16"/>
              <p className="text-sm mt-2">{error}</p>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover transform -scale-x-100" 
            onCanPlay={handleCanPlay}
            style={{ visibility: isCameraReady && !error ? 'visible' : 'hidden' }}
          />
        </div>
        <canvas ref={canvasRef} className="hidden"></canvas>
        
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={() => handleClockAction('clock_in')}
            disabled={!isCameraReady || isLoading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Chấm công Đầu ngày
          </button>
          <button
            onClick={() => handleClockAction('clock_out')}
            disabled={!isCameraReady || isLoading}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Chấm công Cuối ngày
          </button>
        </div>
      </div>
    </div>
  );
};
