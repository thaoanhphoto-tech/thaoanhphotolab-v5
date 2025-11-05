import React, { useState, useEffect } from 'react';
import { PlusIcon } from './icons/PlusIcon';
import { loadIconSettings, getIconComponent, CustomIconSettings } from '../iconStore';

export const ContactFAB: React.FC = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [iconSettings, setIconSettings] = useState<CustomIconSettings>(() => loadIconSettings());

    // Poll for changes in case the admin updates it in another tab
    useEffect(() => {
        const interval = setInterval(() => {
            setIconSettings(loadIconSettings());
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const PhoneComponent = getIconComponent(iconSettings.phone);
    const ZaloComponent = getIconComponent(iconSettings.zalo);
    const FacebookComponent = getIconComponent(iconSettings.facebook);

    const contactOptions = [
        { name: 'Facebook', icon: <FacebookComponent className="w-6 h-6 text-white" />, href: 'https://www.facebook.com/thaoanhphotolab/', bgColor: 'bg-blue-600' },
        { name: 'Zalo', icon: <ZaloComponent className="w-12 h-12" />, href: 'https://zalo.me/0396670118', bgColor: '' },
        { name: 'Hotline', icon: <PhoneComponent className="w-6 h-6 text-white" />, href: 'tel:0978983136', bgColor: 'bg-green-500' }
    ];

    return (
        <div className="fixed bottom-4 left-4 z-[98]">
            <div className="flex flex-col-reverse items-center space-y-3 space-y-reverse">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-purple-700 transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-expanded={isOpen}
                    aria-label="Mở menu liên hệ"
                    style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0)' }}
                >
                    <PlusIcon className="w-7 h-7" />
                </button>
                
                {contactOptions.map((option, index) => (
                    <a
                        key={option.name}
                        href={option.href}
                        target={option.name !== 'Hotline' ? '_blank' : '_self'}
                        rel="noopener noreferrer"
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${option.bgColor} ${isOpen ? 'opacity-100 translate-y-0 animate-subtle-bob' : 'opacity-0 translate-y-4 pointer-events-none'}`}
                        style={{ 
                            transitionDelay: isOpen ? `${index * 50}ms` : `${(contactOptions.length - 1 - index) * 50}ms`,
                            animationDelay: `${index * 150}ms`
                        }}
                        aria-label={option.name}
                    >
                        {option.icon}
                    </a>
                ))}
            </div>
        </div>
    );
};
