import React, { useState, useEffect } from 'react';
import type { User } from '../userStore';
import type { Theme } from '../types';
import type { PageState } from '../App';
import { PhoneIcon } from './icons/PhoneIcon';
import { MoonIcon } from './icons/MoonIcon';
import { LogoUploader } from './LogoUploader';
import { loadImageContent, saveImageContent } from '../contentStore';
import { SunIcon } from './icons/SunIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface HeaderProps {
    currentUser: User | null;
    handleLogout: () => void;
    navigateTo: (state: PageState) => void;
    theme: Theme;
    toggleTheme: () => void;
    isAdmin: boolean;
    newPrintRequestsCount: number;
    pageState: PageState;
    cartItemCount: number;
}

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode; isActive?: boolean }> = ({ onClick, children, isActive = false }) => {
    return (
        <button 
            onClick={onClick}
            className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 uppercase ${
                isActive 
                ? 'bg-white dark:bg-teal-600 text-teal-900 dark:text-white shadow'
                : 'text-teal-800 dark:text-teal-100 hover:text-teal-950 dark:hover:text-white'
            }`}
        >
            {children}
        </button>
    );
}

const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);

const CartIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.823-6.423a.75.75 0 00-.67-1.03H6.082L5.25 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 21a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ currentUser, handleLogout, navigateTo, theme, toggleTheme, isAdmin, newPrintRequestsCount, pageState, cartItemCount }) => {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        setLogoUrl(loadImageContent('app_logo', 'https://lh3.googleusercontent.com/d/1SJiuZBOBSX6umhPp7QxbDNXJXsG6SOEL'));
    }, []);

    const handleLogoUpload = (file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result as string;
            saveImageContent('app_logo', dataUrl);
            setLogoUrl(dataUrl);
        };
        reader.readAsDataURL(file);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigateTo({ page: 'search_results', query: searchQuery.trim() });
        }
    };

    return (
        <header>
            {/* Top Bar */}
            <div className="bg-emerald-100 dark:bg-emerald-900 border-b border-dotted border-slate-300 dark:border-zinc-700">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center text-sm text-slate-600 dark:text-zinc-400 flex-wrap gap-y-2 gap-x-4">
                    <div className="whitespace-nowrap text-red-500/80 animate-blink font-extrabold text-lg">
                        Hotline: 0978.983.136
                    </div>
                    <div className="flex items-center gap-4 flex-wrap justify-end">
                        <button 
                            onClick={() => navigateTo({ page: 'promotions' })} 
                            className={`font-bold text-lg animate-jump ${
                                pageState.page === 'promotions' 
                                ? 'text-red-700 dark:text-red-500 underline' 
                                : 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500'
                            }`}
                        >
                            Khuyến mãi hot
                        </button>
                        <a href="#" className="hover:text-slate-900 dark:hover:text-white">Hệ thống cửa hàng</a>
                        {isAdmin && (
                            <button onClick={() => navigateTo({ page: 'user_management' })} className="font-semibold hover:text-slate-900 dark:hover:text-white">Quản Trị</button>
                        )}
                        {(currentUser?.operationalRole || isAdmin) && (
                            <button onClick={() => navigateTo({ page: 'lab_operation' })} className="font-semibold hover:text-slate-900 dark:hover:text-white text-yellow-500">Vận hành LAB</button>
                        )}
                         {(currentUser?.operationalRole || isAdmin) && (
                            <button onClick={() => navigateTo({ page: 'time_clock' })} className="font-semibold hover:text-slate-900 dark:hover:text-white">Chấm công</button>
                        )}
                        {isAdmin && (
                                <button onClick={() => navigateTo({ page: 'print_queue' })} className={`relative font-semibold hover:text-slate-900 dark:hover:text-white ${newPrintRequestsCount > 0 ? 'text-red-500 animate-pulse' : ''}`}>
                                    Hàng đợi in
                                    {newPrintRequestsCount > 0 && <span className="absolute -top-1 -right-3 text-xs font-bold">({newPrintRequestsCount})</span>}
                                </button>
                        )}
                        {currentUser ? (
                            <>
                                <span>Chào, {currentUser.fullName || currentUser.username}!</span>
                                <button onClick={() => navigateTo({ page: 'my_account' })} className="font-semibold hover:text-slate-900 dark:hover:text-white">Tài khoản của tôi</button>
                                <button onClick={handleLogout} className="font-semibold hover:text-slate-900 dark:hover:text-white">Đăng xuất</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => navigateTo({ page: 'login' })} className="font-semibold hover:text-slate-900 dark:hover:text-white">Đăng nhập</button>
                                <button onClick={() => navigateTo({ page: 'register' })} className="font-semibold hover:text-slate-900 dark:hover:text-white">Đăng ký</button>
                            </>
                        )}
                         <button onClick={toggleTheme} className="p-1 rounded-full text-slate-500 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700">
                           {theme === 'light' ? <MoonIcon className="w-5 h-5"/> : <SunIcon className="w-5 h-5"/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Header Bar */}
            <div className="bg-emerald-50 dark:bg-emerald-900/80">
                <div className="container mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-3 items-center gap-4">
                    {/* Left: Logo & Name */}
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                        <LogoUploader 
                            logoUrl={logoUrl}
                            onLogoUpload={handleLogoUpload}
                            isAdminMode={isAdmin}
                        />
                         <div className="text-base font-black text-center">
                            <span className="animated-gradient-text block">TRUNG TÂM IN ẢNH KỸ THUẬT SỐ CÔNG NGHỆ MỚI</span>
                            <span className="animated-gradient-text block">THẢO ANH PHOTO LAB</span>
                        </div>
                    </div>
                    
                    {/* Middle: Search bar */}
                    <form onSubmit={handleSearchSubmit} className="w-full max-w-lg mx-auto">
                        <div className="relative">
                          <input 
                            type="search" 
                            placeholder="Tìm kiếm sản phẩm..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full p-2.5 pl-4 pr-10 border-2 border-teal-500 dark:border-teal-300 rounded-full bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-sm focus:ring-2 focus:ring-teal-400 dark:focus:ring-teal-300 focus:border-transparent outline-none dark:placeholder:text-zinc-400 dark:text-zinc-200" />
                          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500">
                            <SearchIcon className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 pl-4">Gợi ý: ảnh lụa, ảnh meka...</p>
                    </form>

                    {/* Right: Hotline & Cart */}
                    <div className="flex items-center justify-center lg:justify-end gap-6">
                        <div className="flex items-center gap-3 animate-blink">
                           <PhoneIcon className="w-10 h-10 text-orange-500" />
                            <div>
                                <p className="text-sm text-slate-500 dark:text-zinc-400">Hotline 24/7</p>
                                <p className="font-extrabold text-xl text-orange-600 dark:text-orange-400">0978.983.136</p>
                            </div>
                        </div>
                        <button onClick={() => navigateTo({ page: 'cart' })} className="relative flex items-center gap-2 cursor-pointer">
                            <CartIcon className="w-7 h-7 text-slate-600 dark:text-zinc-300" />
                            <div>
                                <p className="font-bold text-slate-700 dark:text-zinc-200">Giỏ hàng</p>
                            </div>
                            {cartItemCount > 0 && (
                                <div className="absolute -top-2 -right-3 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {cartItemCount}
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Navigation Bar */}
            <div className="bg-teal-300 dark:bg-teal-800 shadow-md">
                <div className="container mx-auto flex justify-center py-2">
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex flex-wrap items-center justify-center gap-2">
                        <NavLink onClick={() => navigateTo({ page: 'home' })} isActive={pageState.page === 'home'}>Trang chủ</NavLink>
                        <NavLink onClick={() => navigateTo({ page: 'main_products' })} isActive={pageState.page === 'main_products'}>Sản phẩm chủ đạo</NavLink>
                        <NavLink onClick={() => navigateTo({ page: 'service', serviceId: 'in-anh-kts' })} isActive={pageState.page === 'service' || pageState.page === 'product'}>Dịch vụ</NavLink>
                        <NavLink onClick={() => navigateTo({ page: 'tool', toolId: 'introduction' })} isActive={pageState.page === 'tool'}>TRỢ LÝ STUDIO</NavLink>
                        {currentUser && <NavLink onClick={() => navigateTo({ page: 'community' })} isActive={pageState.page === 'community'}>Cộng đồng</NavLink>}
                        <NavLink onClick={() => navigateTo({ page: 'pricing' })} isActive={pageState.page === 'pricing'}>Mua bản quyền</NavLink>
                        <NavLink onClick={() => navigateTo({ page: 'blog' })} isActive={pageState.page === 'blog' || pageState.page === 'blog_post'}>Tin tức</NavLink>
                    </div>
                </div>
            </div>
        </header>
    );
};