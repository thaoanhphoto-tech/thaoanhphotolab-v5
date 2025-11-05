import React, { useRef, useEffect, useState, useCallback } from 'react';
import { XIcon } from './icons/XIcon';
import { CameraIcon } from './icons/CameraIcon';
import { Loader } from './Loader';

interface FaceLoginCameraProps {
    onCapture: (dataUrl: string) => void;
    onClose: () => void;
    title: string;
    buttonText: string;
}

export const FaceLoginCamera: React.FC<FaceLoginCameraProps> = ({ onCapture, onClose, title, buttonText }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const startCamera = useCallback(async () => {
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
        } finally {
            setIsLoading(false);
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    useEffect(() => {
        startCamera();
        return () => stopCamera();
    }, [startCamera, stopCamera]);

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            // Flip the image horizontally for a mirror effect
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const photoDataUrl = canvas.toDataURL('image/jpeg');
            onCapture(photoDataUrl);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">{title}</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6">
                    <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-slate-200 dark:border-zinc-700">
                        {isLoading && <Loader />}
                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" onCanPlay={() => setIsLoading(false)} />
                        {!isLoading && !error && (
                            <div className="absolute inset-0 border-[1.5rem] border-black/20 rounded-full box-border"></div>
                        )}
                        {error && <p className="absolute inset-0 flex items-center justify-center text-center text-red-500 bg-slate-100 p-4 text-sm">{error}</p>}
                    </div>
                    <canvas ref={canvasRef} className="hidden"></canvas>
                    <p className="text-center text-sm text-slate-500 dark:text-zinc-400 mt-4">Vui lòng nhìn thẳng vào camera và đảm bảo đủ ánh sáng.</p>
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl">
                    <button onClick={handleCapture} disabled={isLoading || !!error} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-blue-300">
                        <CameraIcon className="w-5 h-5" />
                        {buttonText}
                    </button>
                </footer>
            </div>
        </div>
    );
};
