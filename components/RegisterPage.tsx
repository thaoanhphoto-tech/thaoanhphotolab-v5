
declare const google: any;

import React, { useState, useEffect, useRef } from 'react';
import type { PageState } from '../App';
import { EyeIcon } from './icons/EyeIcon';
import { EyeOffIcon } from './icons/EyeOffIcon';

interface RegisterPageProps {
  onRegister: (username: string, password: string, fullName: string, zalo: string, email?: string, referredBy?: string) => Promise<{ success: boolean; message: string }>;
  navigateTo: (state: PageState) => void;
  onGoogleLogin: (credential: string) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, navigateTo, onGoogleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [zalo, setZalo] = useState('');
  const [email, setEmail] = useState('');
  const [referredBy, setReferredBy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof google !== 'undefined' && google.accounts && googleButtonRef.current) {
        // FIX: Use process.env for environment variables to resolve typing issues.
        const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.error("VITE_GOOGLE_CLIENT_ID is not defined.");
            return;
        }
        google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: any) => {
                onGoogleLogin(response.credential);
            }
        });

        google.accounts.id.renderButton(
            googleButtonRef.current,
            { theme: "outline", size: "large", type: "standard", text: "signup_with", shape: "rectangular" }
        );
    }
  }, [onGoogleLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Mật khẩu không khớp.');
      return;
    }

    const result = await onRegister(username, password, fullName, zalo, email, referredBy);
    if (result.success) {
        setSuccess(result.message);
        setTimeout(() => navigateTo({ page: 'login' }), 2000); // Redirect to login after a short delay
    } else {
        setError(result.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-emerald-50 dark:bg-emerald-950 py-12 px-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
        <h2 className="text-2xl font-bold text-center text-slate-800 dark:text-zinc-100">Tạo tài khoản</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Họ và tên</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Số Zalo</label>
            <input type="tel" value={zalo} onChange={(e) => setZalo(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Email (tùy chọn)</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Tên đăng nhập</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Mật khẩu</label>
            <div className="relative">
              <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600 pr-10" />
              <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-zinc-400">
                {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Xác nhận mật khẩu</label>
            <div className="relative">
              <input type={isConfirmPasswordVisible ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600 pr-10" />
              <button type="button" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-zinc-400">
                {isConfirmPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Mã giới thiệu (tùy chọn)</label>
            <input type="text" value={referredBy} onChange={(e) => setReferredBy(e.target.value)} className="w-full px-3 py-2 mt-1 border border-slate-300 rounded-md dark:bg-zinc-700 dark:border-zinc-600" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
          >
            Đăng ký
          </button>
        </form>
         <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-300 dark:border-zinc-600"></div>
          <span className="flex-shrink mx-4 text-slate-500 dark:text-zinc-400 text-sm">Hoặc đăng ký với</span>
          <div className="flex-grow border-t border-slate-300 dark:border-zinc-600"></div>
        </div>
        <div className="flex justify-center">
            <div ref={googleButtonRef}></div>
        </div>
        <p className="text-sm text-center text-slate-600 dark:text-zinc-400">
          Đã có tài khoản?{' '}
          <button onClick={() => navigateTo({ page: 'login' })} className="font-medium text-blue-600 hover:underline">
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
};
