import React, { useState } from 'react';
import { LoyaltySettings, Reward, RewardType } from '../../loyaltyStore';
import { User } from '../../userStore';
import { Product } from '../../productStore';
import { GiftIcon } from '../icons/GiftIcon';
import { TrophyIcon } from '../icons/TrophyIcon';
import { XIcon } from '../icons/XIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';

interface LoyaltyProgramPageProps {
    settings: LoyaltySettings;
    onUpdateSettings: (newSettings: LoyaltySettings) => void;
    users: User[];
    onManualPointUpdate: (userId: string, points: number, reason: string) => void;
    rewards: Reward[];
    onUpdateRewards: (newRewards: Reward[]) => void;
    products: Product[];
}

export const LoyaltyProgramPage: React.FC<LoyaltyProgramPageProps> = ({ settings, onUpdateSettings, users, onManualPointUpdate, rewards, onUpdateRewards, products }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [pointsToChange, setPointsToChange] = useState(0);
    const [changeReason, setChangeReason] = useState('');

    const [isAddingReward, setIsAddingReward] = useState(false);
    const [newReward, setNewReward] = useState<Omit<Reward, 'id'>>({ type: 'discount', pointsCost: 100, description: '', value: 50000 });

    const handleSaveSettings = () => {
        onUpdateSettings(localSettings);
    };
    
    const handlePointChange = () => {
        if (!editingUser || !changeReason) {
            alert('Vui lòng nhập lý do thay đổi điểm.');
            return;
        }
        onManualPointUpdate(editingUser.id, pointsToChange, changeReason);
        setEditingUser(null);
        setPointsToChange(0);
        setChangeReason('');
    };

    const handleAddReward = () => {
        if (newReward.description.trim() === '' || newReward.pointsCost <= 0) {
            alert('Vui lòng nhập đủ thông tin cho phần thưởng.');
            return;
        }
        const rewardToAdd: Reward = { ...newReward, id: `rew-${Date.now()}` };
        onUpdateRewards([...rewards, rewardToAdd]);
        setIsAddingReward(false);
        setNewReward({ type: 'discount', pointsCost: 100, description: '', value: 50000 });
    };

    const handleDeleteReward = (rewardId: string) => {
        if (window.confirm('Bạn có chắc muốn xóa phần thưởng này?')) {
            onUpdateRewards(rewards.filter(r => r.id !== rewardId));
        }
    };

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.zalo.includes(searchTerm)
    );

    return (
        <div className="space-y-8">
            {/* Settings Section */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                    <TrophyIcon className="w-6 h-6" /> Cài đặt Chương trình
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium">Tỷ lệ tích điểm</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="number" value={localSettings.pointsPerUnit} onChange={e => setLocalSettings({...localSettings, pointsPerUnit: Number(e.target.value)})} className="w-24 p-2 border rounded dark:bg-zinc-700"/>
                            <span>VNĐ =</span>
                             <input type="number" value={localSettings.pointsValue} onChange={e => setLocalSettings({...localSettings, pointsValue: Number(e.target.value)})} className="w-16 p-2 border rounded dark:bg-zinc-700"/>
                             <span>điểm</span>
                        </div>
                    </div>
                     <div>
                        <label className="text-sm font-medium">Điểm thưởng giới thiệu</label>
                        <div className="flex items-center gap-2 mt-1">
                            <input type="number" value={localSettings.referralBonusPoints} onChange={e => setLocalSettings({...localSettings, referralBonusPoints: Number(e.target.value)})} className="w-24 p-2 border rounded dark:bg-zinc-700"/>
                            <span>điểm (cho cả 2 người)</span>
                        </div>
                    </div>
                     <div className="md:col-span-2">
                        <label className="text-sm font-medium">Mô tả Quà sinh nhật</label>
                        <input type="text" value={localSettings.birthdayGiftDescription} onChange={e => setLocalSettings({...localSettings, birthdayGiftDescription: e.target.value})} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"/>
                    </div>
                </div>
                 <div className="text-right mt-4">
                    <button onClick={handleSaveSettings} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Lưu Cài đặt</button>
                </div>
            </div>

            {/* Reward Setup */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                <h2 className="text-xl font-semibold mb-4">Thiết lập Phần thưởng</h2>
                <div className="space-y-2">
                    {rewards.map(reward => (
                        <div key={reward.id} className="flex justify-between items-center p-2 bg-slate-50 dark:bg-zinc-700 rounded">
                            <div>
                                <p className="font-semibold">{reward.description}</p>
                                <p className="text-xs text-slate-500">{reward.pointsCost} điểm</p>
                            </div>
                            <button onClick={() => handleDeleteReward(reward.id)} className="p-1 text-red-500 hover:text-red-700"><XIcon className="w-4 h-4" /></button>
                        </div>
                    ))}
                </div>
                {isAddingReward ? (
                    <div className="mt-4 p-4 border-t space-y-3">
                        <select value={newReward.type} onChange={e => setNewReward(p => ({...p, type: e.target.value as RewardType}))} className="w-full p-2 border rounded dark:bg-zinc-700">
                            <option value="discount">Voucher Giảm giá</option>
                            <option value="product">Voucher Sản phẩm</option>
                        </select>
                        <input type="text" placeholder="Mô tả (VD: Giảm giá 50,000đ)" value={newReward.description} onChange={e => setNewReward(p => ({...p, description: e.target.value}))} className="w-full p-2 border rounded dark:bg-zinc-700" />
                        <input type="number" placeholder="Số điểm cần đổi" value={newReward.pointsCost} onChange={e => setNewReward(p => ({...p, pointsCost: Number(e.target.value)}))} className="w-full p-2 border rounded dark:bg-zinc-700" />
                        {newReward.type === 'discount' ? (
                            <input type="number" placeholder="Giá trị giảm (VNĐ)" value={newReward.value as number} onChange={e => setNewReward(p => ({...p, value: Number(e.target.value)}))} className="w-full p-2 border rounded dark:bg-zinc-700" />
                        ) : (
                            <select value={newReward.value as string} onChange={e => setNewReward(p => ({...p, value: e.target.value}))} className="w-full p-2 border rounded dark:bg-zinc-700">
                                <option value="">-- Chọn sản phẩm tặng --</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        )}
                        <div className="flex gap-2">
                            <button onClick={handleAddReward} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md">Lưu</button>
                            <button onClick={() => setIsAddingReward(false)} className="px-4 py-2 border rounded font-semibold">Hủy</button>
                        </div>
                    </div>
                ) : (
                    <button onClick={() => setIsAddingReward(true)} className="mt-4 text-sm font-semibold text-blue-600 flex items-center gap-1"><PlusCircleIcon className="w-5 h-5"/> Thêm Phần thưởng mới</button>
                )}
            </div>

            {/* Member Management */}
            <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                 <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                    <GiftIcon className="w-6 h-6" /> Quản lý Điểm thành viên
                </h2>
                 <input 
                    type="search" 
                    placeholder="Tìm thành viên theo tên hoặc Zalo..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm p-2 mb-4 border rounded-md dark:bg-zinc-700 dark:border-zinc-600"
                />
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="p-2 flex justify-between items-center hover:bg-slate-50 dark:hover:bg-zinc-700/50 rounded-md">
                            <div>
                                <p className="font-semibold">{user.fullName}</p>
                                <p className="text-sm text-slate-500">{user.zalo}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg text-blue-600 dark:text-blue-400">{user.points || 0} điểm</span>
                                <button onClick={() => setEditingUser(user)} className="text-sm font-semibold text-blue-600 hover:underline">Thay đổi</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Point Edit Modal */}
            {editingUser && (
                 <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setEditingUser(null)}>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="font-bold text-lg mb-4">Thay đổi điểm của {editingUser.fullName}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm">Số điểm (+/-)</label>
                                <input type="number" value={pointsToChange} onChange={e => setPointsToChange(Number(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"/>
                            </div>
                             <div>
                                <label className="text-sm">Lý do thay đổi</label>
                                <input type="text" value={changeReason} onChange={e => setChangeReason(e.target.value)} placeholder="Ví dụ: Thưởng sự kiện, trừ điểm do hoàn hàng..." className="w-full mt-1 p-2 border rounded dark:bg-zinc-700"/>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded font-semibold">Hủy</button>
                            <button onClick={handlePointChange} className="px-4 py-2 bg-blue-600 text-white rounded font-semibold">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};