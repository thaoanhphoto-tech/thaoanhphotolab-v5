
import React from 'react';
// Fix: Use default import for ZaloIcon as it is a default export.
import ZaloIcon from './icons/ZaloIcon';
import { FacebookIcon } from './icons/FacebookIcon';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-emerald-100/70 dark:bg-emerald-900/50 text-slate-700 dark:text-zinc-300 border-t border-slate-200 dark:border-zinc-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Về chúng tôi */}
                    <div>
                        <h3 className="text-lg font-bold uppercase text-teal-600 dark:text-teal-400 mb-4">Về chúng tôi</h3>
                        <ul className="space-y-2 text-sm">
                            <li className="font-bold text-orange-500">HOTLINE: 0978.983.136</li>
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Trang chủ</a></li>
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Giới thiệu</a></li>
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Sản phẩm</a></li>
                        </ul>
                    </div>

                    {/* Hướng dẫn đặt hàng */}
                    <div>
                        <h3 className="text-lg font-bold uppercase text-teal-600 dark:text-teal-400 mb-4">Hướng dẫn đặt hàng</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Hướng dẫn đặt in ảnh</a></li>
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Hướng dẫn gửi ảnh</a></li>
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Hướng dẫn thanh toán</a></li>
                            <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Hướng dẫn giao nhận</a></li>
                        </ul>
                    </div>

                    {/* Bản đồ */}
                    <div>
                        <h3 className="text-lg font-bold uppercase text-teal-600 dark:text-teal-400 mb-4">Bản đồ</h3>
                        <div className="w-full h-56 rounded-lg overflow-hidden border border-slate-300 dark:border-zinc-700">
                            <iframe
                                src="https://maps.google.com/maps?q=19.768556,105.782306&z=15&output=embed"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Bản đồ vị trí Thảo Anh Photo Lab"
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
