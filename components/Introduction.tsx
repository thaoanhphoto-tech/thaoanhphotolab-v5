

import React from 'react';
import { PageState } from '../App';
import { User, hasPermission, TOOL_NAMES, ActiveApp } from '../userStore';
import { IdCardIcon } from './icons/IdCardIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';
import { CameraIcon } from './icons/CameraIcon';
import { UsersIcon } from './icons/UsersIcon';
import { NewspaperIcon } from './icons/NewspaperIcon';
import { CogIcon } from './icons/CogIcon';
import { ColorizeIcon } from './icons/ColorizeIcon';
import { LockIcon } from './icons/LockIcon';
import { OfficeBuildingIcon } from './icons/OfficeBuildingIcon';
import { CalendarDaysIcon } from './icons/CalendarDaysIcon';

interface IntroductionProps {
    navigateTo: (state: PageState) => void;
    currentUser: User | null;
}

interface ToolCardInfo {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  navigateToState: PageState;
  permissionCheck?: (user: User | null) => boolean;
  isComingSoon?: boolean;
}

const managementHubTool: ToolCardInfo = {
    id: 'studio_hub',
    title: 'Trung tâm Quản lý Studio',
    description: 'Truy cập bộ công cụ ERP/CRM chuyên biệt cho các loại hình studio.',
    icon: <OfficeBuildingIcon className="w-8 h-8" />,
    navigateToState: { page: 'studio_hub' },
    permissionCheck: (user) => !!user && (user.purchasedPlans.includes('admin') || !!user.operationalRole)
};

const scheduleTools: ToolCardInfo[] = [
    { 
        id: 'schedule', 
        title: 'Quản lý Lịch chụp',
        description: 'Sắp xếp lịch chụp, phân công nhân sự và theo dõi tiến độ.', 
        icon: <CalendarDaysIcon className="w-8 h-8" />,
        navigateToState: { page: 'schedule' },
        permissionCheck: (user) => !!user && (user.purchasedPlans.includes('admin') || user.operationalRole === 'tong_giam_doc')
    },
];

const aiTools: ToolCardInfo[] = [
    { 
        id: 'idPhoto', 
        title: TOOL_NAMES['idPhoto'],
        description: 'Tạo ảnh thẻ chuyên nghiệp cho hộ chiếu, visa, CCCD...', 
        icon: <IdCardIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'idPhoto' }
    },
    { 
        id: 'photoRestorer', 
        title: TOOL_NAMES['photoRestorer'],
        description: 'Phục hồi, khử nhiễu và tăng chất lượng ảnh cũ, mờ, hỏng.', 
        icon: <SparklesIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'photoRestorer' }
    },
    { 
        id: 'conceptPhoto', 
        title: TOOL_NAMES['conceptPhoto'],
        description: 'Ghép ảnh chân dung vào các concept nghệ thuật có sẵn.', 
        icon: <SparklesIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'conceptPhoto' }
    },
    { 
        id: 'familyPhotoComposer',
        title: TOOL_NAMES['familyPhotoComposer'], 
        description: 'Ghép ảnh nhiều thành viên thành một bức ảnh gia đình hoàn chỉnh.', 
        icon: <UsersIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'familyPhotoComposer' }
    },
    { 
        id: 'photoLab', 
        title: 'Photo Lab (Tools Chỉnh ảnh Pro)',
        description: 'Bộ công cụ xử lý kỹ thuật nâng cao cho lab.', 
        icon: <CogIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'photoLab' }
    },
    { 
        id: 'batchColorCorrector', 
        title: TOOL_NAMES['batchColorCorrector'],
        description: 'Chỉnh màu hàng loạt cho nhiều ảnh theo một phong cách.', 
        icon: <ColorizeIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'batchColorCorrector' }
    },
    { 
        id: 'socialMediaPostGenerator', 
        title: TOOL_NAMES['socialMediaPostGenerator'],
        description: 'Thiết kế nhanh các bài đăng mạng xã hội từ mẫu có sẵn.', 
        icon: <NewspaperIcon className="w-8 h-8" />,
        navigateToState: { page: 'tool', toolId: 'socialMediaPostGenerator' }
    },
];

const ToolCard: React.FC<{ tool: ToolCardInfo, navigateTo: (state: PageState) => void }> = ({ tool, navigateTo }) => {
    const handleClick = () => {
        if (tool.isComingSoon) return;
        // Simplified logic: always navigate. App.tsx will handle permissions.
        navigateTo(tool.navigateToState);
    };

    return (
        <button
            key={tool.id}
            onClick={handleClick}
            disabled={tool.isComingSoon}
            className={`relative group text-left p-6 bg-white dark:bg-zinc-800/50 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 transition-all duration-300 flex flex-col ${tool.isComingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-lg hover:-translate-y-1'}`}
        >
            {tool.isComingSoon && (
                 <div className="absolute top-4 right-4 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-1 rounded-full">Sắp ra mắt</div>
            )}
            <div className="text-blue-500 dark:text-blue-400 mb-4 animate-slow-pulse">
                {tool.icon}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex-grow">{tool.title}</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2">{tool.description}</p>
        </button>
    );
};


export const Introduction: React.FC<IntroductionProps> = ({ navigateTo, currentUser }) => {
  return (
    <main className="container mx-auto px-4 py-12 sm:py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-zinc-100">
          TRỢ LÝ STUDIO
        </h1>
        <p className="mt-4 text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Chọn một công cụ AI để bắt đầu sáng tạo và nâng cao chất lượng ảnh của bạn.
        </p>
      </div>

      <div className="space-y-12">
        {/* Section 1: Studio Management */}
        <section>
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-700 dark:text-zinc-200 border-b pb-3">Quản lý Studio</h2>
            <div className="max-w-md mx-auto">
                <ToolCard tool={managementHubTool} navigateTo={navigateTo} />
            </div>
        </section>

        {/* Section 2: Scheduling */}
        <section>
            <h2 className="text-2xl font-bold mb-6 text-center text-slate-700 dark:text-zinc-200 border-b pb-3">Quản lý Lịch chụp</h2>
             <div className="max-w-md mx-auto">
                {scheduleTools.map(tool => <ToolCard key={tool.id} tool={tool} navigateTo={navigateTo} />)}
            </div>
        </section>

        {/* Section 3: AI Editing Tools */}
        <section>
             <h2 className="text-2xl font-bold mb-6 text-center text-slate-700 dark:text-zinc-200 border-b pb-3">TOOLS CHỈNH ẢNH PRO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiTools.map(tool => (
                    <ToolCard 
                        key={tool.id} 
                        tool={tool}
                        navigateTo={navigateTo} 
                    />
                ))}
            </div>
        </section>
      </div>
    </main>
  );
};

export default Introduction;