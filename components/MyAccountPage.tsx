import React, { useState } from 'react';
import { User } from '../userStore';
import { Product } from '../productStore';
import { Reward, Voucher } from '../loyaltyStore';
import { useToast } from './Toast';
import { GiftIcon } from './icons/GiftIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { FaceLoginCamera } from './FaceLoginCamera';

interface MyAccountPageProps {
    currentUser: User;
    rewards: Reward[];
    vouchers: Voucher[];
    products: Product[];
    onRedeemReward: (rewardId: string) => { success: boolean; message: string };
    onUpdateUser: (updates: Partial<User>) => void;
    onUpdatePassword: (oldPassword: string, newPassword: string) => { success: boolean, message: string };
}

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-semibold rounded-t-lg transition-colors ${isActive ? 'bg-white dark:bg-zinc-800 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700'}`}>
        {name}
    </button>
);

const InputField: React.FC<{ label: string; value: string; onChange: (val: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} className="w-full mt-1 p-2 border rounded-md bg-slate-50 dark:bg-zinc-700 border-slate-300 dark:border-zinc-600" />
    </div>
);

const MyAccountPage: React.FC<MyAccountPageProps> = ({ currentUser, rewards, vouchers, onRedeemReward, onUpdateUser, onUpdatePassword }) => {
    const [activeTab, setActiveTab] = useState<'info' | 'rewards'>('info');
    const { showToast } = useToast();

    // States for editing user info
    const [fullName, setFullName] = useState(currentUser.fullName);
    const [zalo, setZalo] = useState(currentUser.zalo);
    const [email, setEmail] = useState(currentUser.email || '');
    const [birthDate, setBirthDate] = useState(currentUser.birthDate || '');
    
    // States for changing password
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // State for face registration modal
    const [isRegisteringFace, setIsRegisteringFace] = useState(false);

    const handleUpdate = () => {
        onUpdateUser({ fullName, zalo, email, birthDate });
        showToast('Thông tin đã được cập nhật!', 'success');
    };

    const handleRedeem = (rewardId: string) => {
        const result = onRedeemReward(rewardId);
        showToast(result.message, result.success ? 'success' : 'error');
    };
    
    const handleFaceRegister = (dataUrl: string) => {
        onUpdateUser({ faceIdPhotoUrl: dataUrl });
        setIsRegisteringFace(false);
        showToast('Đã đăng ký khuôn mặt thành công!', 'success');
    };

    const handleChangePassword = () => {
        if (newPassword !== confirmPassword) {
            showToast('Mật khẩu mới không khớp.', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showToast('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
            return;
        }
        const result = onUpdatePassword(oldPassword, newPassword);
        showToast(result.message, result.success ? 'success' : 'error');
        if(result.success) {
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    const renderInfoTab = () => (
        <div className="space-y-8">
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Thông tin Cá nhân</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Họ và tên" value={fullName} onChange={setFullName} />
                    <InputField label="Số Zalo" value={zalo} onChange={setZalo} />
                    <InputField label="Email" value={email} onChange={setEmail} type="email" />
                    <InputField label="Ngày sinh" value={birthDate} onChange={setBirthDate} type="date" />
                </div>
                <div className="text-right mt-6">
                    <button onClick={handleUpdate} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Cập nhật</button>
                </div>
            </div>
            
            <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100 mb-4">Bảo mật & Đăng nhập</h3>
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-lg flex items-center justify-between">
                        <div>
                            <p className="font-medium">Đăng nhập bằng khuôn mặt</p>
                            <p className="text-xs text-slate-500">{currentUser.faceIdPhotoUrl ? 'Đã đăng ký' : 'Chưa đăng ký'}</p>
                        </div>
                        <button onClick={() => setIsRegisteringFace(true)} className="px-4 py-2 bg-slate-200 dark:bg-zinc-600 text-sm font-semibold rounded-md hover:bg-slate-300">
                            {currentUser.faceIdPhotoUrl ? 'Thay đổi' : 'Đăng ký'}
                        </button>
                    </div>
                    {/* Change Password Section */}
                    <div className="p-4 bg-slate-50 dark:bg-zinc-700/50 rounded-lg">
                        <p className="font-medium mb-3">Đổi Mật khẩu</p>
                         <div className="space-y-3">
                            <InputField label="Mật khẩu cũ" type="password" value={oldPassword} onChange={setOldPassword} />
                            <InputField label="Mật khẩu mới" type="password" value={newPassword} onChange={setNewPassword} />
                            <InputField label="Xác nhận mật khẩu mới" type="password" value={confirmPassword} onChange={setConfirmPassword} />
                         </div>
                         <div className="text-right mt-4">
                            <button onClick={handleChangePassword} className="px-4 py-2 bg-slate-200 dark:bg-zinc-600 text-sm font-semibold rounded-md hover:bg-slate-300">Lưu Mật khẩu</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-zinc-100">Thông tin khác</h3>
                <p className="mt-4"><strong>Điểm tích lũy:</strong> <span className="font-bold text-blue-600 dark:text-blue-400">{currentUser.points || 0}</span> điểm</p>
                <p className="mt-2"><strong>Mã giới thiệu của bạn:</strong> <code className="bg-slate-200 dark:bg-zinc-700 p-1 rounded font-mono">{currentUser.referralCode}</code></p>
            </div>
        </div>
    );
    
    const renderRewardsTab = () => (
        <div className="space-y-6 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm border border-slate-200 dark:border-zinc-700">
            <div>
                <h3 className="text-lg font-semibold flex items-center gap-2"><TrophyIcon className="w-5 h-5"/> Đổi thưởng</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    {rewards.map(reward => (
                         <div key={reward.id} className="p-4 border rounded-lg bg-slate-50 dark:bg-zinc-700/50">
                             <p className="font-bold">{reward.description}</p>
                             <p className="text-sm text-slate-500">{reward.pointsCost} điểm</p>
                             <button 
                                onClick={() => handleRedeem(reward.id)}
                                disabled={(currentUser.points || 0) < reward.pointsCost}
                                className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded disabled:bg-slate-400"
                            >
                                Đổi thưởng
                            </button>
                         </div>
                    ))}
                </div>
            </div>
             <div>
                <h3 className="text-lg font-semibold flex items-center gap-2"><GiftIcon className="w-5 h-5"/> Voucher của bạn</h3>
                <div className="space-y-2 mt-2">
                    {vouchers.length > 0 ? vouchers.map(voucher => {
                        const reward = rewards.find(r => r.id === voucher.rewardId);
                        return (
                            <div key={voucher.id} className="p-3 bg-green-100 dark:bg-green-900/50 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-mono text-sm font-bold bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded inline-block">{voucher.code}</p>
                                    <p className="text-xs mt-1">{reward?.description || 'Voucher khuyến mãi'}</p>
                                </div>
                                 <span className="text-xs font-bold text-green-800 dark:text-green-300">{voucher.status === 'active' ? 'Có thể dùng' : 'Đã dùng'}</span>
                            </div>
                        )
                    }) : <p className="text-sm text-slate-500">Bạn chưa có voucher nào.</p>}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100 mb-6">Tài khoản của tôi</h1>
                <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-6">
                    <TabButton name="Thông tin" isActive={activeTab === 'info'} onClick={() => setActiveTab('info')} />
                    <TabButton name="Phần thưởng & Voucher" isActive={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')} />
                </div>

                <div>
                    {activeTab === 'info' ? renderInfoTab() : renderRewardsTab()}
                </div>
            </main>
            {isRegisteringFace && (
                <FaceLoginCamera
                    onCapture={handleFaceRegister}
                    onClose={() => setIsRegisteringFace(false)}
                    title="Đăng ký Khuôn mặt"
                    buttonText="Chụp và Lưu ảnh"
                />
            )}
        </>
    );
};

export default MyAccountPage;