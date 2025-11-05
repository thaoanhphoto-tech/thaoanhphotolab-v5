

import React, { useState, useRef, useEffect } from 'react';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { YouTubeIcon } from './icons/YouTubeIcon';
import { TikTokIcon } from './icons/TikTokIcon';
import { services } from '../data/serviceData';
// Fix: Corrected import path to be a relative path.
import type { PageState } from '../App';
import { BestsellerCarousel, bestsellerProducts } from './BestsellerCarousel';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { loadTextContent, saveTextContent } from '../contentStore';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { useToast } from './Toast';
import { BulkImageUploader } from './BulkImageUploader';
import { UploadIcon } from './icons/UploadIcon';
import { MediaLibraryModal } from './MediaLibraryModal';
import { User } from '../userStore';
import { PricingTable, getProductPrice } from '../pricingStore';
// Fix: Import the 'Product' type.
import { Product } from '../productStore';


const StarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.31h5.418a.562.562 0 01.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988H8.88a.563.563 0 00.475-.31l2.125-5.112z" />
  </svg>
);

const ChipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M12 4.5v15M15.75 21v-1.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 6.375a1.5 1.5 0 00-3 0m15 0a1.5 1.5 0 00-3 0m-12 7.5a1.5 1.5 0 00-3 0m15 0a1.5 1.5 0 00-3 0M5.25 17.625a1.5 1.5 0 00-3 0m15 0a1.5 1.5 0 00-3 0" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 18V6A2.25 2.25 0 0017.25 3.75H15" />
  </svg>
);

const SupportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 4.5A6 6 0 0012 7.5m0 0a6 6 0 00-6 6m6-6v1.5m0 6V7.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 6.75h1.5v1.5h-1.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h1.5v1.5h-1.5" />
    </svg>
);

const PriceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
);

interface HomePageProps {
  navigateTo: (state: PageState) => void;
  isAdminMode: boolean;
  currentUser: User | null;
  prices: PricingTable;
  // Fix: Add the missing 'products' prop to resolve a type error in App.tsx.
  products: Product[];
}

interface Slide {
  id: string;
  src: string;
  title: string;
  subtitle: string;
}

export const defaultSlides: Slide[] = [
  { id: 'slide1', src: 'https://i.imgur.com/gK202Vn.jpg', title: 'IN ẢNH CƯỚI PHIÊN BẢN 2024', subtitle: 'Lưu giữ khoảnh khắc hạnh phúc nhất của bạn với chất lượng in cao cấp, màu sắc bền lâu.' }, 
  { id: 'slide2', src: 'https://i.imgur.com/v85UR3Z.jpg', title: 'ALBUM ẢNH GIA ĐÌNH', subtitle: 'Gắn kết yêu thương qua từng trang ảnh, tạo nên cuốn album kỷ niệm đáng giá.' }, 
  { id: 'slide3', src: 'https://i.imgur.com/w4mZ2Qx.jpg', title: 'IN ẢNH KỶ YẾU & SỰ KIỆN', subtitle: 'Đóng lại một chặng đường, mở ra tương lai với những bức ảnh sắc nét.' }, 
  { id: 'slide4', src: 'https://i.imgur.com/p51yXfA.jpg', title: 'PHOTOBOOK & COLLAGE', subtitle: 'Kể lại câu chuyện độc đáo của bạn qua những cuốn photobook được thiết kế chuyên nghiệp.' }, 
  { id: 'slide5', src: 'https://i.imgur.com/lO7a2aR.jpg', title: 'IN ẢNH SẢN PHẨM', subtitle: 'Chuyên nghiệp, sắc nét, thu hút - Nâng tầm thương hiệu của bạn.' },
  { id: 'slide6', src: 'https://i.imgur.com/fplFN6h.jpg', title: 'IN ẢNH TREO TƯỜNG', subtitle: 'Biến không gian sống của bạn thành một phòng triển lãm nghệ thuật cá nhân.' }, 
];


export const HomePage: React.FC<HomePageProps> = ({ navigateTo, isAdminMode, currentUser, prices, products }) => {
    const [showContactMenu, setShowContactMenu] = useState(false);
    const contactRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const [isBulkUploaderOpen, setIsBulkUploaderOpen] = useState(false);
    
    const [slides, setSlides] = useState<Slide[]>(() => {
        const storedSlides = loadTextContent('home_hero_slides', '');
        let initialSlides = defaultSlides;
        try {
            if (storedSlides) {
                const parsed = JSON.parse(storedSlides) as Partial<Slide>[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                     // Merge stored data (mainly 'src') with default data (for text fallbacks)
                    initialSlides = defaultSlides.map(defaultSlide => {
                        const storedSlide = parsed.find(s => s.id === defaultSlide.id);
                        return storedSlide ? { ...defaultSlide, src: storedSlide.src || defaultSlide.src } : defaultSlide;
                    });
                }
            }
        } catch (e) {
            console.error("Failed to parse slides from localStorage", e);
        }
        return initialSlides;
    });
    const [currentSlide, setCurrentSlide] = useState(0);
    const timeoutRef = useRef<number | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalInfo, setModalInfo] = useState<{ itemKey: string, currentUrl: string } | null>(null);

    const resetTimeout = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    }
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contactRef.current && !contactRef.current.contains(event.target as Node)) {
                setShowContactMenu(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        resetTimeout();
        timeoutRef.current = window.setTimeout(
            () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1)),
            5000 // 5 seconds
        );

        return () => {
            resetTimeout();
        };
    }, [currentSlide, slides.length]);
    
    const handleSelectFromLibrary = (newImageUrl: string) => {
        if (!modalInfo) return;
        
        const [,,slideId] = modalInfo.itemKey.split('_');
        
        const newSlides = slides.map(slide => 
            slide.id === slideId ? { ...slide, src: newImageUrl || defaultSlides.find(s=>s.id === slideId)!.src } : slide
        );
        setSlides(newSlides);
        saveTextContent('home_hero_slides', JSON.stringify(newSlides));
        
        setIsModalOpen(false);
        setModalInfo(null);
    };
    
    const goToPrevious = () => {
        const isFirstSlide = currentSlide === 0;
        const newIndex = isFirstSlide ? slides.length - 1 : currentSlide - 1;
        setCurrentSlide(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentSlide === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentSlide + 1;
        setCurrentSlide(newIndex);
    };
    
    const goToSlide = (slideIndex: number) => {
        setCurrentSlide(slideIndex);
    };

    const reasons = [
        { title: "Chất Lượng Hàng Đầu", description: "Sử dụng giấy in, mực và vật liệu cao cấp, đảm bảo độ bền màu vượt thời gian.", icon: <StarIcon className="w-8 h-8 text-blue-500" /> },
        { title: "Công Nghệ Hiện Đại", description: "Hệ thống máy in ảnh kỹ thuật số công nghệ mới , cho hình ảnh sắc nét, màu sắc trung thực đặc biệt là không phai màu, không thấm nước.", icon: <ChipIcon className="w-8 h-8 text-blue-500" /> },
        { title: "Tư Vấn Tận Tâm", description: "Đội ngũ nhân viên giàu kinh nghiệm, sẵn sàng tư vấn để bạn có sản phẩm ưng ý nhất.", icon: <SupportIcon className="w-8 h-8 text-blue-500" /> },
        { title: "Giá Cả Cạnh Tranh", description: "Chúng tôi mang đến mức giá tốt nhất cho thợ ảnh và studio trên toàn quốc.", icon: <PriceIcon className="w-8 h-8 text-blue-500" /> },
    ];

    const homeReferenceIds = [
        ...defaultSlides.map(slide => ({
            id: `home_slide_${slide.id}`,
            name: `Slide: ${slide.title}`
        })),
        ...services.map(service => ({
            id: `home_service_${service.id}`,
            name: `Dịch vụ nổi bật: ${service.name}`
        })),
        ...bestsellerProducts.map(product => ({
            id: `bestseller_${product.id}`,
            name: `Bán chạy: ${product.name}`
        }))
    ];
  
    return (
        <div className="bg-emerald-50 dark:bg-emerald-950 text-slate-800 dark:text-zinc-200 animate-fade-in">
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-in-out;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }
                
                /* Enhanced cinematic overlay effects */
                @keyframes pulse-vignette {
                    0%, 100% {
                        background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%);
                    }
                    50% {
                        background: radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%);
                    }
                }
                .vignette-overlay {
                    animation: pulse-vignette 12s ease-in-out infinite;
                }

                @keyframes dust-float-1 {
                    0% { transform: translate(0, 0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translate(-10vw, -15vh); opacity: 0; }
                }
                @keyframes dust-float-2 {
                    0% { transform: translate(0, 0); opacity: 0; }
                    20% { opacity: 0.8; }
                    80% { opacity: 0.8; }
                    100% { transform: translate(15vw, -20vh); opacity: 0; }
                }

                .hero-container::before, .hero-container::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    background: transparent;
                    z-index: 1;
                }
                .hero-container::before {
                    /* Layer 1: Slower, larger particles */
                    box-shadow: 
                        10vw 20vh 2px 2px #fff1,
                        80vw 70vh 1px 1px #fff1,
                        30vw 90vh 3px 3px #fff2,
                        50vw 50vh 2px 2px #fff1,
                        5vw 80vh 1px 1px #fff1,
                        90vw 10vh 2px 2px #fff2;
                    animation: dust-float-1 30s linear infinite;
                }
                .hero-container::after {
                    /* Layer 2: Faster, smaller particles */
                    box-shadow: 
                        5vw 15vh 1px 1px #fff2,
                        25vw 60vh 1px 1px #fff2,
                        60vw 5vh 1px 1px #fff1,
                        95vw 95vh 2px 2px #fff3,
                        40vw 30vh 1px 1px #fff2,
                        70vw 85vh 1px 1px #fff1;
                    animation: dust-float-2 22s linear infinite 3s;
                }
            `}</style>
            
            {/* Hero Section */}
            <section className="relative h-[80vh] min-h-[500px] flex flex-col items-center justify-center text-white group overflow-hidden hero-container">
                 <div className="absolute inset-0 w-full h-full">
                    {slides.map((slide, slideIndex) => (
                        <div
                            key={slide.id}
                            className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out animate-subtle-zoom"
                            style={{
                                backgroundImage: `url('${slide.src}')`,
                                opacity: currentSlide === slideIndex ? 1 : 0,
                                animationPlayState: currentSlide === slideIndex ? 'running' : 'paused',
                            }}
                        />
                    ))}
                </div>
                 {isAdminMode && (
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button 
                          onClick={() => setIsBulkUploaderOpen(true)}
                          className="px-3 py-1.5 bg-purple-600/80 text-white text-xs font-semibold rounded-md hover:bg-purple-700 backdrop-blur-sm flex items-center gap-1.5"
                        >
                            <UploadIcon className="w-4 h-4" /> Tải lên hàng loạt
                        </button>
                        <button 
                          onClick={() => {
                            const current = slides[currentSlide];
                            const itemKey = `home_slide_${current.id}`;
                            setModalInfo({ itemKey, currentUrl: current.src });
                            setIsModalOpen(true);
                          }} 
                          className="px-3 py-1.5 bg-black/50 text-white text-xs font-semibold rounded-md hover:bg-black/70 backdrop-blur-sm"
                        >
                            Quản lý ảnh slide
                        </button>
                    </div>
                )}
                <div className="absolute inset-0 vignette-overlay z-[1]"></div>
                
                {/* Centered Content Area */}
                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full max-w-4xl p-4">
                    {/* Text container */}
                    <div className="relative flex-grow w-full flex items-center justify-center">
                        {slides.map((slide, slideIndex) => (
                            <div 
                                key={slide.id}
                                className="absolute inset-0 flex flex-col items-center justify-center text-center"
                                style={{ 
                                    transition: 'opacity 0.7s ease-out, transform 0.7s ease-out',
                                    opacity: currentSlide === slideIndex ? 1 : 0,
                                    transform: currentSlide === slideIndex ? 'translateY(0)' : 'translateY(20px)',
                                    pointerEvents: currentSlide === slideIndex ? 'auto' : 'none'
                                }}
                            >
                                <EditableText
                                    as="h1"
                                    contentKey={`home_slide_${slide.id}_title`}
                                    defaultValue={slide.title}
                                    isAdminMode={isAdminMode}
                                    className="text-3xl md:text-5xl font-black tracking-tight drop-shadow-lg leading-tight uppercase"
                                />
                                <EditableText
                                    as="p"
                                    contentKey={`home_slide_${slide.id}_subtitle`}
                                    defaultValue={slide.subtitle}
                                    isAdminMode={isAdminMode}
                                    className="mt-4 text-md md:text-lg max-w-xl mx-auto drop-shadow-md"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Button container */}
                    <div ref={contactRef} className="relative flex-shrink-0 mt-8">
                        <button
                            onClick={() => setShowContactMenu(prev => !prev)}
                            className="px-8 py-3 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-transform hover:scale-105 shadow-lg"
                        >
                            Liên hệ tư vấn
                        </button>
                        {showContactMenu && (
                            <div className="absolute bottom-full mb-2 w-56 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-slate-200 dark:border-zinc-700 overflow-hidden animate-fade-in-up text-left">
                                <a href="https://zalo.me/0396670118" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors">
                                    <ChatBubbleIcon className="w-5 h-5 text-blue-500" />
                                    <span>Chat qua Zalo</span>
                                </a>
                                <a href="tel:0978983136" className="flex items-center gap-3 px-4 py-3 text-sm text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors border-t border-slate-100 dark:border-zinc-700">
                                    <PhoneIcon className="w-5 h-5 text-green-500" />
                                    <span>Gọi điện thoại</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>

                 {/* Slideshow Navigation */}
                <div className="absolute top-1/2 -translate-y-1/2 left-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={goToPrevious} className="p-2 bg-white/30 rounded-full hover:bg-white/50 backdrop-blur-sm">
                        <ChevronLeftIcon className="w-6 h-6 text-white" />
                    </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 right-5 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={goToNext} className="p-2 bg-white/30 rounded-full hover:bg-white/50 backdrop-blur-sm">
                        <ChevronRightIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Slideshow Dots */}
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                    {slides.map((_, slideIndex) => (
                        <button
                            key={slideIndex}
                            onClick={() => goToSlide(slideIndex)}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${currentSlide === slideIndex ? 'bg-white scale-110' : 'bg-white/50 hover:bg-white/75'}`}
                            aria-label={`Go to slide ${slideIndex + 1}`}
                        />
                    ))}
                </div>
            </section>
  
            <BestsellerCarousel isAdminMode={isAdminMode} currentUser={currentUser} prices={prices} />

            {/* Services Section */}
            <section className="py-16 sm:py-20 bg-emerald-50 dark:bg-emerald-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <EditableText as="h2" contentKey="home_services_title" defaultValue="Dịch Vụ Nổi Bật" isAdminMode={isAdminMode} className="text-3xl font-bold text-teal-600 dark:text-teal-400" />
                        <EditableText as="p" contentKey="home_services_subtitle" defaultValue="Chúng tôi cung cấp đa dạng dịch vụ in ảnh chất lượng cao." isAdminMode={isAdminMode} className="mt-2 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-12">
                         {services.slice(0, 4).map((service) => ( // Show first 4 services
                                <button key={service.id} onClick={() => navigateTo({ page: 'service', serviceId: service.id })} className="text-center group">
                                    <div className="relative aspect-square bg-white dark:bg-zinc-800 rounded-lg shadow-md overflow-hidden transform group-hover:-translate-y-2 transition-transform duration-300 border-2 border-teal-400 dark:border-teal-600">
                                        <EditableImage
                                            contentKey={`home_service_${service.id}_image`}
                                            defaultSrc={service.imageUrl}
                                            alt={service.name}
                                            isAdminMode={isAdminMode}
                                            className="w-full h-full"
                                        />
                                    </div>
                                    <div className="mt-4">
                                        <EditableText as="h3" contentKey={`home_service_${service.id}_name`} defaultValue={service.name} isAdminMode={isAdminMode} className="font-bold text-md text-slate-800 dark:text-zinc-100 uppercase" />
                                        <EditableText as="p" contentKey={`home_service_${service.id}_desc`} defaultValue={service.description} isAdminMode={isAdminMode} className="text-sm text-slate-500 dark:text-zinc-400 font-bold" />
                                    </div>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </section>
  
            {/* Why Choose Us Section */}
            <section className="py-16 sm:py-20 bg-emerald-50 dark:bg-emerald-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <EditableText as="h2" contentKey="home_whyus_title" defaultValue="Tại Sao Chọn Thảo Anh Photo Lab?" isAdminMode={isAdminMode} className="text-3xl font-bold text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
                        {reasons.map((reason, index) => (
                            <div key={index} className="text-center p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border-2 border-teal-600 dark:border-teal-400">
                                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/50 mx-auto mb-4">
                                    {reason.icon}
                                </div>
                                <EditableText as="h3" contentKey={`home_reason_${index}_title`} defaultValue={reason.title} isAdminMode={isAdminMode} className="text-lg font-semibold text-slate-900 dark:text-zinc-100" />
                                <EditableText as="p" contentKey={`home_reason_${index}_desc`} defaultValue={reason.description} isAdminMode={isAdminMode} className="mt-2 text-slate-500 dark:text-zinc-400 text-sm" />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

             {/* Connect With Us Section */}
            <section className="py-16 sm:py-20 bg-emerald-50 dark:bg-emerald-950">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-teal-600 dark:text-teal-400">Kết Nối Với Chúng Tôi</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Fanpage */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-center mb-2">Fanpage</h4>
                            <div className="aspect-square w-full overflow-hidden rounded-md bg-white dark:bg-zinc-800 border-2 border-teal-600 dark:border-teal-400 shadow-lg">
                               <iframe 
                                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fthaoanhphotolab%2F&tabs=timeline&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                                  width="100%" 
                                  height="100%" 
                                  style={{border:'none', overflow:'hidden'}}
                                  scrolling="no" 
                                  frameBorder="0" 
                                  allowFullScreen={true}
                                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                  title="Fanpage Facebook"
                                ></iframe>
                            </div>
                        </div>

                        {/* YouTube */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-center mb-2">YouTube</h4>
                            <a href="https://www.youtube.com/shorts/rHXKaNqg-Oo" target="_blank" rel="noopener noreferrer" className="block aspect-square w-full overflow-hidden rounded-md border-2 border-teal-600 dark:border-teal-400 p-4 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors shadow-lg">
                                <YouTubeIcon className="w-20 h-20 text-red-500" />
                                <span className="text-md font-semibold text-slate-700 dark:text-zinc-300 px-4 py-2 bg-slate-100 dark:bg-zinc-700 rounded-full">Theo dõi Kênh</span>
                            </a>
                        </div>

                        {/* TikTok */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 dark:text-zinc-100 text-center mb-2">TikTok</h4>
                            <a href="https://www.tiktok.com/@thaoanhphotolab/video/7519164496569552144?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" className="block aspect-square w-full overflow-hidden rounded-md border-2 border-teal-600 dark:border-teal-400 p-4 flex flex-col items-center justify-center gap-4 bg-white dark:bg-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-700/50 transition-colors shadow-lg">
                                <TikTokIcon className="w-16 h-16 text-slate-800 dark:text-white" />
                                <span className="text-md font-semibold text-slate-700 dark:text-zinc-300 px-4 py-2 bg-slate-100 dark:bg-zinc-700 rounded-full">Theo dõi Kênh</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            {isAdminMode && isBulkUploaderOpen && (
                <BulkImageUploader 
                    onClose={() => setIsBulkUploaderOpen(false)} 
                    onUpdate={() => window.location.reload()}
                    referenceIds={homeReferenceIds}
                />
            )}
            {isAdminMode && isModalOpen && modalInfo && (
                <MediaLibraryModal 
                    itemKey={modalInfo.itemKey}
                    currentImageUrl={modalInfo.currentUrl}
                    onClose={() => setIsModalOpen(false)}
                    onSelect={handleSelectFromLibrary}
                />
            )}
        </div>
    );
};