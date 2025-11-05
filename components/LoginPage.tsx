
declare const google: any;

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../userStore';
import type { PageState } from '../App';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';
import { FaceLoginCamera } from './FaceLoginCamera';
import { FingerPrintIcon } from './icons/FingerPrintIcon';
import { XIcon } from './icons/XIcon';
import { Loader } from './Loader';


interface LoginPageProps {
  onLogin: (username: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; message: string }>;
  navigateTo: (state: PageState) => void;
  onGoogleLogin: (credential: string) => void;
  onFaceLogin: (user: User) => void;
  users: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, navigateTo, onGoogleLogin, onFaceLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  
  // State for face login flow
  const [isFaceLoginOpen, setIsFaceLoginOpen] = useState(false);
  const [faceLoginStep, setFaceLoginStep] = useState<'prompt_user' | 'capture' | 'verifying'>('prompt_user');
  const [faceLoginUsername, setFaceLoginUsername] = useState('');
  const [faceLoginError, setFaceLoginError] = useState('');

  // State for forgot password flow
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotZalo, setForgotZalo] = useState('');
  const [foundPassword, setFoundPassword] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState('');


  // On component mount, check for remembered credentials in localStorage.
  useEffect(() => {
    try {
      const rememberedCredsJson = localStorage.getItem('rememberedCredentials_v1');
      if (rememberedCredsJson) {
        const { username, password } = JSON.parse(rememberedCredsJson);
        if (username && password) {
          setUsername(username);
          setPassword(password);
          setRememberMe(true);
        }
      } else {
        const lastUser = localStorage.getItem('lastLoggedInUser_v1');
        if (lastUser) {
            setUsername(lastUser);
        }
      }
    } catch (e) {
      console.error("Failed to load remembered credentials:", e);
    }
  }, []); // Empty dependency array ensures this runs only once on mount.

  useEffect(() => {
    if (typeof google !== 'undefined' && google.accounts && googleButtonRef.current) {
        google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: (response: any) => {
                onGoogleLogin(response.credential);
            }
        });

        google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: "outline", size: "large", type: "standard", text: "continue_with", shape: "rectangular" }
        );
    }
  }, [onGoogleLogin]);

  const handleFaceLoginStart = () => {
    setFaceLoginError('');
    setFaceLoginStep('prompt_user');
    setFaceLoginUsername('');
    setIsFaceLoginOpen(true);
  };
  
  const handleFaceUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFaceLoginError('');
    const userToLogin = users.find(u => u.username.toLowerCase() === faceLoginUsername.toLowerCase());
    if (!userToLogin) {
        setFaceLoginError('Tên đăng nhập không tồn tại.');
        return;
    }
    if (!userToLogin.faceIdPhotoUrl) {
        setFaceLoginError('Người dùng này chưa đăng ký đăng nhập bằng khuôn mặt.');
        return;
    }
    setFaceLoginStep('capture');
  };

  const handleFaceCapture = async (dataUrl: string) => {
    setFaceLoginError('');
    setFaceLoginStep('verifying');

    const userToLogin = users.find(u => u.username.toLowerCase() === faceLoginUsername.toLowerCase());

    // This is a mock implementation for face recognition. 
    // In a real app, this would be a backend call to compare faces.
    // For now, we simulate a delay for verification and then log in.
    setTimeout(() => {
        if (userToLogin) {
            onFaceLogin(userToLogin);
            setIsFaceLoginOpen(false); // Close modal on success
        } else {
            setFaceLoginError('Đã có lỗi xảy ra. Không tìm thấy người dùng.');
            setFaceLoginStep('prompt_user'); // Go back to username prompt
        }
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = await onLogin(username, password, rememberMe);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleOpenForgotModal = () => {
    setIsForgotModalOpen(true);
    setForgotZalo('');
    setFoundPassword(null);
    setForgotError('');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setFoundPassword(null);
    
    if (!forgotZalo.trim()) {
        setForgotError('Vui lòng nhập số Zalo.');
        return;
    }

    const user = users.find(u => u.zalo === forgotZalo.trim());
    if (user && user.password) {
        setFoundPassword(user.password);
    } else {
        setForgotError('Không tìm thấy tài khoản nào được liên kết với số Zalo này.');
    }
  };


  return (
    <div className="flex items-center justify-center min-h-[70vh] bg-emerald-50 dark:bg-emerald-950 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-zinc-100">Đăng nhập</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Mật khẩu</label>
            <div className="relative">
              <input
                type={isPasswordVisible ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-zinc-400"
              >
                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-slate-600 dark:text-zinc-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2">Ghi nhớ đăng nhập</span>
            </label>
            <button type="button" onClick={handleOpenForgotModal} className="text-sm text-blue-600 hover:underline">Quên mật khẩu?</button>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </form>
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-zinc-600"></div>
          <span className="flex-shrink mx-4 text-slate-500 dark:text-zinc-400 text-sm">Hoặc tiếp tục với</span>
          <div className="flex-grow border-t border-slate-300 dark:border-zinc-600"></div>
        </div>
        <div className="flex flex-col items-center gap-4">
            <div ref={googleButtonRef}></div>
            <button
              type="button"
              onClick={handleFaceLoginStart}
              className="w-full max-w-[280px] flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 dark:border-zinc-600 rounded-md text-sm font-medium text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700"
            >
              <FingerPrintIcon className="w-5 h-5" />
              Đăng nhập bằng khuôn mặt
            </button>
        </div>
        <p className="text-sm text-center text-slate-600 dark:text-zinc-400">
          Chưa có tài khoản?{' '}
          <button onClick={() => navigateTo({ page: 'register' })} className="font-medium text-blue-600 hover:underline">
            Đăng ký ngay
          </button>
        </p>
      </div>

      {isFaceLoginOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsFaceLoginOpen(false)}>
          {faceLoginStep === 'capture' ? (
              <FaceLoginCamera 
                  onCapture={handleFaceCapture}
                  onClose={() => setIsFaceLoginOpen(false)}
                  title="Đăng nhập bằng khuôn mặt"
                  buttonText="Chụp ảnh để đăng nhập"
              />
          ) : faceLoginStep === 'verifying' ? (
               <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-sm p-8 text-center">
                   <Loader />
                   <p className="mt-4 font-semibold">Đang xác thực...</p>
               </div>
          ) : (
             <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Đăng nhập bằng khuôn mặt</h2>
                    <button onClick={() => setIsFaceLoginOpen(false)}><XIcon className="w-6 h-6"/></button>
                </header>
                 <form onSubmit={handleFaceUsernameSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Nhập tên đăng nhập của bạn</label>
                        <input
                            type="text"
                            value={faceLoginUsername}
                            onChange={(e) => setFaceLoginUsername(e.target.value)}
                            required
                            autoFocus
                            className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
                        />
                    </div>
                    {faceLoginError && <p className="text-sm text-red-600">{faceLoginError}</p>}
                    <button type="submit" className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Tiếp tục</button>
                 </form>
             </div>
          )}
        </div>
      )}

      {isForgotModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setIsForgotModalOpen(false)}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Lấy lại mật khẩu</h2>
                    <button onClick={() => setIsForgotModalOpen(false)}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleForgotPassword} className="p-6 space-y-4">
                    {!foundPassword && (
                        <>
                            <p className="text-sm text-slate-600 dark:text-zinc-400">Nhập số Zalo đã đăng ký để tìm lại mật khẩu của bạn.</p>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Số Zalo</label>
                                <input
                                    type="tel"
                                    value={forgotZalo}
                                    onChange={(e) => setForgotZalo(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-zinc-700 dark:border-zinc-600"
                                />
                            </div>
                        </>
                    )}
                    
                    {forgotError && <p className="text-sm text-red-600">{forgotError}</p>}
                    
                    {foundPassword && (
                        <div className="text-center space-y-2">
                            <p className="text-sm text-slate-600 dark:text-zinc-400">Mật khẩu của bạn là:</p>
                            <p className="p-3 bg-slate-100 dark:bg-zinc-700 rounded-md font-mono font-bold text-lg">{foundPassword}</p>
                            <p className="text-xs text-slate-500">Vui lòng ghi nhớ và đăng nhập lại.</p>
                        </div>
                    )}
                    
                    {!foundPassword ? (
                        <button type="submit" className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Tìm mật khẩu</button>
                    ) : (
                        <button type="button" onClick={() => setIsForgotModalOpen(false)} className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Đóng</button>
                    )}
                </form>
            </div>
        </div>
      )}
    </div>
  );
};