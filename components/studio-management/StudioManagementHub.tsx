
import React from 'react';
import { ArrowRightIcon } from '../icons/ArrowRightIcon';
import { HeartIcon } from '../icons/HeartIcon';
import { UsersIcon } from '../icons/UsersIcon';
import { UserCircleIcon } from '../icons/UserCircleIcon';
import { AcademicCapIcon } from '../icons/AcademicCapIcon';

interface HubCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick?: () => void;
    isComingSoon?: boolean;
}

const HubCard: React.FC<HubCardProps> = ({ title, description, icon, onClick, isComingSoon }) => (
    <button
        onClick={onClick}
        disabled={isComingSoon}
        className={`relative group text-left w-full h-full p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 transition-all duration-300 flex flex-col ${
            isComingSoon
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:border-blue-500 hover:shadow-lg hover:-translate-y-1'
        }`}
    >
        {isComingSoon && <div className="absolute top-4 right-4 text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-1 rounded-full">Sắp ra mắt</div>}
        <div className="text-blue-500 dark:text-blue-400 mb-4">{icon}</div>
        <h3 className="font-bold text-lg text-slate-800 dark:text-zinc-100">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-2 flex-grow">{description}</p>
        {!isComingSoon && (
            <div className="absolute bottom-6 right-6 text-slate-400 group-hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100 mt-4">
                <ArrowRightIcon className="w-6 h-6" />
            </div>
        )}
    </button>
);

interface StudioManagementHubProps {
  onSelectManager: (manager: 'wedding') => void;
}

export const StudioManagementHub: React.FC<StudioManagementHubProps> = ({ onSelectManager }) => {
  const modules = [
    { id: 'wedding', title: 'Quản lý Studio Áo cưới', description: 'Giải pháp ERP/CRM toàn diện cho studio áo cưới chuyên nghiệp.', icon: <HeartIcon className="w-10 h-10" />, onClick: () => onSelectManager('wedding') },
    { id: 'family', title: 'Quản lý Studio Gia đình & Bé', description: 'Công cụ quản lý lịch hẹn, khách hàng và sản phẩm cho studio gia đình.', icon: <UsersIcon className="w-10 h-10" />, isComingSoon: true },
    { id: 'portrait', title: 'Quản lý Ảnh Chân dung', description: 'Tối ưu hóa quy trình làm việc cho các nhiếp ảnh gia chân dung.', icon: <UserCircleIcon className="w-10 h-10" />, isComingSoon: true },
    { id: 'yearbook', title: 'Quản lý Kỷ yếu', description: 'Tổ chức các dự án kỷ yếu phức tạp một cách dễ dàng và hiệu quả.', icon: <AcademicCapIcon className="w-10 h-10" />, isComingSoon: true },
  ];

  return (
    <div className="w-full max-w-5xl">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100">Trung tâm Quản lý Studio</h1>
            <p className="mt-3 text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">Chọn loại hình studio của bạn để bắt đầu sử dụng bộ công cụ quản lý chuyên biệt.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map(mod => <HubCard key={mod.id} {...mod} />)}
        </div>
    </div>
  );
};

export default StudioManagementHub;
