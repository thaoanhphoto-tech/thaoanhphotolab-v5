
import React, { useState, lazy, Suspense, useEffect, useRef } from 'react';
import { User, PlanId, ALL_TOOLS, TOOL_NAMES, hasPermission, BankAccount, getPendingBill, OperationalRole, OPERATIONAL_ROLE_NAMES, PersonnelProfile, BANKS, TimeClockEntry, PrintRequest } from './userStore';
import { useToast } from './components/Toast';
import { XIcon } from './components/icons/XIcon';
import { EyeIcon } from './components/icons/EyeIcon';
import { EyeOffIcon } from './components/icons/EyeOffIcon';
import { StarIcon } from './components/icons/StarIcon';
import { PageState } from './App';
import { IdCardIcon } from './components/icons/IdCardIcon';
import { HomeIcon } from './components/icons/HomeIcon';
import { UploadIcon } from './components/icons/UploadIcon';
import { CameraIcon } from './components/icons/CameraIcon';
import { LoyaltyProgramPage } from './components/loyalty/LoyaltyProgramPage';
import { LoyaltySettings, Reward } from './loyaltyStore';
import { Product } from './productStore';
import { InventoryManagementPage } from './components/InventoryManagementPage';
import { Material, ProductBOM, Supplier, InventoryTransaction, PurchaseOrder, Warehouse, WarehouseTransfer } from './inventoryStore';
import { HRPayrollTab } from './components/hr/HRPayrollTab';
import { TrashIcon } from './components/icons/TrashIcon';
import { UsersIcon } from './components/icons/UsersIcon';
import { BanknotesIcon } from './components/icons/BanknotesIcon';
import { TrophyIcon } from './components/icons/TrophyIcon';
import { ArchiveBoxIcon } from './components/icons/ArchiveBoxIcon';
import { DocumentTextIcon } from './components/icons/DocumentTextIcon';
import { Loader } from './components/Loader';
import { Expense } from './expenseStore';
import { OfficeBuildingIcon } from './components/icons/OfficeBuildingIcon';
// FIX: Import PlanDetail to correctly type plan details when iterating.
import { loadPlans, PlanDetailsTable, PlanDetail } from './planStore';
import IconLibraryModal from './components/IconLibraryModal';
import { IconID, CustomIconSettings, loadIconSettings, saveIconSettings, getIconOptionsForType } from './iconStore';

// ... (rest of the imports are assumed to be correct)

interface UserManagementPageProps {
  users: User[];
  currentUser: User | null;
  personnelProfiles: PersonnelProfile[];
  onAddUser: (username: string, password: string, role: PlanId, fullName: string, zalo: string, isVip: boolean, email?: string, referredBy?: string) => Promise<{ success: boolean; message: string }>;
  onDeleteUser: (userId: string) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onUpdatePersonnelProfile: (userId: string, profile: PersonnelProfile) => void;
  onConfirmPayment: (userId: string) => void;
  onRejectPayment: (userId: string) => void;
  navigateTo: (state: PageState) => void;
  loyaltySettings: LoyaltySettings;
  onUpdateLoyaltySettings: (settings: LoyaltySettings) => void;
  onManualPointUpdate: (userId: string, points: number, reason: string) => void;
  rewards: Reward[];
  onUpdateRewards: (newRewards: Reward[]) => void;
  products: Product[];
  bankAccounts: BankAccount[];
  onUpdateBankAccounts: (accounts: BankAccount[]) => void;
  materials: Material[];
  onUpdateMaterials: (materials: Material[]) => void;
  productBOMs: ProductBOM[];
  onUpdateProductBOMs: (boms: ProductBOM[]) => void;
  timeClockEntries: TimeClockEntry[];
  requests: PrintRequest[];
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  // New props for Inventory Management
  suppliers: Supplier[];
  onUpdateSuppliers: (suppliers: Supplier[]) => void;
  transactions: InventoryTransaction[];
  onAddTransaction: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
  sizes: string[];
  purchaseOrders: PurchaseOrder[];
  onAddPurchaseOrder: (orderData: Omit<PurchaseOrder, 'id' | 'timestamp'>) => void;
  onUpdatePurchaseOrder: (orderId: string, updates: Partial<PurchaseOrder>) => void;
  // New props for Multi-Warehouse
  warehouses: Warehouse[];
  onUpdateWarehouses: (warehouses: Warehouse[]) => void;
  warehouseTransfers: WarehouseTransfer[];
  onAddWarehouseTransfer: (transferData: Omit<WarehouseTransfer, 'id' | 'timestamp' | 'status'>) => void;
  onCompleteWarehouseTransfer: (transferId: string) => void;
  // FIX: Add missing onApplyAudit prop to satisfy InventoryManagementPageProps
  onApplyAudit: (updatedMaterials: { id: string; newStock: number; warehouseId: string }[], notes: string, warehouseId: string) => void;
}

// ... (Tab definition and other lazy loads)
// Fix: Correctly lazy load the default export of ReportsPage.
// FIX: Correct path to components/reports/ReportsPage.tsx
const ReportsPage = lazy(() => import('./components/reports/ReportsPage'));
// FIX: Correct path to components/expenses/ExpenseManagementPage.tsx
const ExpenseManagementPage = lazy(() => import('./components/expenses/ExpenseManagementPage'));


// FIX: Moved helper components before they are used to prevent "Cannot find name" errors.
const TabButton: React.FC<{ name: string, icon: React.ReactNode, isActive: boolean, onClick: () => void }> = ({ name, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-semibold transition-colors flex-shrink-0 flex items-center ${isActive ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'}`}>
        {icon} {name}
    </button>
);

const InputField: React.FC<{ label: string, value: string, onChange: (val: string) => void, type?: string, required?: boolean, as?: 'input' | 'select', children?: React.ReactNode, placeholder?: string }> =
({ label, value, onChange, type = 'text', required = false, as = 'input', children, placeholder }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">{label}</label>
        {as === 'input' ? (
            <input type={type} value={value} onChange={e => onChange(e.target.value)} required={required} placeholder={placeholder} className="w-full px-3 py-2 mt-1 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
        ) : (
            <select value={value} onChange={e => onChange(e.target.value)} required={required} className="w-full px-3 py-2 mt-1 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                {children}
            </select>
        )}
    </div>
);

const BankAccountEditModal: React.FC<{
  account: BankAccount;
  onClose: () => void;
  onSave: (account: BankAccount) => void;
}> = ({ account, onClose, onSave }) => {
  const [localAccount, setLocalAccount] = useState(account);
  
  const handleChange = (field: keyof BankAccount, value: string | boolean) => {
    setLocalAccount(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <header className="p-4 border-b dark:border-zinc-700"><h2 className="text-lg font-semibold">Thông tin Tài khoản</h2></header>
        <div className="p-6 space-y-4">
          <InputField label="Ngân hàng" as="select" value={localAccount.bankBin} onChange={val => handleChange('bankBin', val)}>
            <option value="">-- Chọn ngân hàng --</option>
            {BANKS.map(bank => <option key={bank.bin} value={bank.bin}>{bank.name}</option>)}
          </InputField>
          <InputField label="Số tài khoản" value={localAccount.accountNumber} onChange={val => handleChange('accountNumber', val)} />
          <InputField label="Tên chủ tài khoản" value={localAccount.accountName} onChange={val => handleChange('accountName', val.toUpperCase())} placeholder="nguyễn hữu thảo" />
          <div className="flex items-center">
            <input id="isDefault" type="checkbox" checked={localAccount.isDefault} onChange={e => handleChange('isDefault', e.target.checked)} className="h-4 w-4" />
            <label htmlFor="isDefault" className="ml-2 text-sm">Đặt làm tài khoản mặc định</label>
          </div>
        </div>
        <footer className="p-4 border-t dark:border-zinc-700 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 font-semibold rounded-md border dark:border-zinc-600">Hủy</button>
          <button onClick={() => onSave(localAccount)} className="px-4 py-2 font-semibold rounded-md bg-blue-600 text-white">Lưu</button>
        </footer>
      </div>
    </div>
  );
};


const BankAccountSettings: React.FC<{
  accounts: BankAccount[];
  onUpdate: (accounts: BankAccount[]) => void;
}> = ({ accounts, onUpdate }) => {
    const [isEditing, setIsEditing] = useState<BankAccount | null>(null);
    const { showToast } = useToast();

    const handleSave = (accountToSave: BankAccount) => {
        if (!accountToSave.bankBin || !accountToSave.accountNumber || !accountToSave.accountName.trim()) {
            showToast('Vui lòng điền đủ thông tin ngân hàng.', 'error');
            return;
        }

        let updatedAccounts: BankAccount[];
        if (accounts.some(acc => acc.id === accountToSave.id)) {
            // Update existing
            updatedAccounts = accounts.map(acc => acc.id === accountToSave.id ? accountToSave : acc);
        } else {
            // Add new
            updatedAccounts = [...accounts, accountToSave];
        }

        // Ensure only one default
        if (accountToSave.isDefault) {
            updatedAccounts = updatedAccounts.map(acc => acc.id === accountToSave.id ? acc : { ...acc, isDefault: false });
        }

        onUpdate(updatedAccounts);
        setIsEditing(null);
        showToast('Đã lưu thông tin tài khoản!', 'success');
    };
    
    const handleDelete = (accountId: string) => {
      if(window.confirm('Bạn có chắc muốn xóa tài khoản này?')) {
        onUpdate(accounts.filter(acc => acc.id !== accountId));
        showToast('Đã xóa tài khoản!', 'success');
      }
    };
    
    const handleSetDefault = (accountId: string) => {
        onUpdate(accounts.map(acc => ({ ...acc, isDefault: acc.id === accountId })));
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">Cài đặt Thanh toán (VietQR)</h2>
              <button onClick={() => setIsEditing({ id: `new-${Date.now()}`, bankBin: '', accountNumber: '', accountName: '', isDefault: accounts.length === 0 })} className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md hover:bg-green-700">+ Thêm mới</button>
            </div>
            <div className="space-y-3">
              {accounts.map(account => (
                <div key={account.id} className="p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{BANKS.find(b => b.bin === account.bankBin)?.name} {account.isDefault && <span className="text-xs font-bold text-yellow-500">(Mặc định)</span>}</p>
                    <p className="text-sm text-slate-500 dark:text-zinc-400">{account.accountNumber} - {account.accountName}</p>
                  </div>
                  <div className="flex gap-2">
                    {!account.isDefault && <button onClick={() => handleSetDefault(account.id)} className="text-xs font-semibold text-yellow-600 hover:underline">Đặt mặc định</button>}
                    <button onClick={() => setIsEditing(account)} className="text-xs font-semibold text-blue-600 hover:underline">Sửa</button>
                    <button onClick={() => handleDelete(account.id)} className="text-xs font-semibold text-red-600 hover:underline">Xóa</button>
                  </div>
                </div>
              ))}
              {accounts.length === 0 && <p className="text-sm text-center text-slate-500 py-4">Chưa có tài khoản ngân hàng nào.</p>}
            </div>

            {isEditing && <BankAccountEditModal account={isEditing} onClose={() => setIsEditing(null)} onSave={handleSave} />}
        </div>
    );
};

const AddUserModal: React.FC<{
    onClose: () => void;
    onAddUser: UserManagementPageProps['onAddUser'];
}> = ({ onClose, onAddUser }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [zalo, setZalo] = useState('');
    const [email, setEmail] = useState('');
    const [plan, setPlan] = useState<PlanId>('free');
    const [isVip, setIsVip] = useState(false);
    const [referredBy, setReferredBy] = useState('');
    const [error, setError] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const plans: PlanDetailsTable = loadPlans();
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự.');
            return;
        }
        const result = await onAddUser(username, password, plan, fullName, zalo, isVip, email, referredBy);
        if (result.success) {
            onClose();
        } else {
            setError(result.message);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Thêm Thành viên mới</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <InputField label="Họ và Tên" value={fullName} onChange={setFullName} required />
                        <InputField label="Số Zalo" value={zalo} onChange={setZalo} required />
                        <InputField label="Email (tùy chọn)" value={email} onChange={setEmail} type="email" />
                        <hr className="dark:border-zinc-600"/>
                        <InputField label="Tên đăng nhập" value={username} onChange={setUsername} required />
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Mật khẩu</label>
                             <div className="relative mt-1">
                               <input type={isPasswordVisible ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded dark:bg-zinc-700 dark:border-zinc-600 pr-10" />
                               <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 dark:text-zinc-400">
                                 {isPasswordVisible ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                               </button>
                             </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300">Gói bản quyền</label>
                            <select value={plan} onChange={e => setPlan(e.target.value as PlanId)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                {Object.entries(plans).filter(([key]) => key !== 'admin').map(([planId, details]) => (
                                    <option key={planId} value={planId}>{(details as PlanDetail).name}</option>
                                ))}
                            </select>
                         </div>
                         <InputField label="Mã giới thiệu (tùy chọn)" value={referredBy} onChange={setReferredBy} />
                         <div className="flex items-center">
                            <input
                                id="is-vip-checkbox"
                                type="checkbox"
                                checked={isVip}
                                onChange={(e) => setIsVip(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="is-vip-checkbox" className="ml-2 block text-sm text-slate-700 dark:text-zinc-300">
                                Đánh dấu là Khách hàng VIP
                            </label>
                        </div>
                         {error && <p className="text-sm text-red-500">{error}</p>}
                    </div>
                    <footer className="p-4 border-t dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 font-semibold rounded-md border dark:border-zinc-600">Hủy</button>
                        <button type="submit" className="px-4 py-2 font-semibold rounded-md bg-blue-600 text-white">Thêm Thành viên</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

const PersonnelEditModal: React.FC<{ profile: PersonnelProfile, onClose: () => void, onSave: (p: PersonnelProfile) => void }> = ({ profile, onClose, onSave }) => {
    const [localProfile, setLocalProfile] = useState(profile);
    const [showNationalId, setShowNationalId] = useState(false);
    const idPhotoInputRef = useRef<HTMLInputElement>(null);
    const nationalIdInputRef = useRef<HTMLInputElement>(null);
    const [allowances, setAllowances] = useState(profile.allowances || []);

    const handleChange = (field: keyof PersonnelProfile, value: string | number | undefined) => {
        setLocalProfile(prev => ({...prev, [field]: value}));
    };
    
    const handleImageUpload = (field: 'idPhotoUrl' | 'nationalIdUrl', file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            handleChange(field, reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAllowanceChange = (index: number, field: 'description' | 'amount', value: string | number) => {
        const newAllowances = [...allowances];
        (newAllowances[index] as any)[field] = value;
        setAllowances(newAllowances);
    };

    const addAllowance = () => setAllowances([...allowances, { description: '', amount: 0 }]);
    const removeAllowance = (index: number) => setAllowances(allowances.filter((_, i) => i !== index));

    const handleFinalSave = () => {
        onSave({ ...localProfile, allowances });
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-zinc-700"><h2 className="text-lg font-semibold">Hồ sơ & Lương nhân sự</h2></header>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Fields from before */}
                        <div className="md:col-span-2">
                          <label className="text-sm font-medium">Quê quán</label>
                          <div className="relative mt-1">
                              <HomeIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                              <input value={localProfile.hometown || ''} onChange={e => handleChange('hometown', e.target.value)} className="w-full p-2 pl-10 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
                          </div>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Mức lương cơ bản</label>
                                <input type="number" value={localProfile.baseSalary || ''} onChange={e => handleChange('baseSalary', Number(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
                            </div>
                             <div>
                                <label className="text-sm font-medium">Loại lương</label>
                                <select value={localProfile.salaryType || 'monthly'} onChange={e => handleChange('salaryType', e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600">
                                    <option value="monthly">Theo tháng</option>
                                    <option value="hourly">Theo giờ</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* New Payroll Fields */}
                        <div className="md:col-span-2">
                           <label className="text-sm font-medium">Tỷ lệ lương tăng ca (x)</label>
                           <input type="number" step="0.1" value={localProfile.overtimeRate || 1.5} onChange={e => handleChange('overtimeRate', Number(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" placeholder="1.5"/>
                        </div>
                        
                        <div className="md:col-span-2 space-y-2">
                           <label className="text-sm font-medium">Các khoản phụ cấp cố định</label>
                           {allowances.map((allowance, index) => (
                               <div key={index} className="flex items-center gap-2">
                                   <input type="text" placeholder="Mô tả (VD: Phụ cấp ăn trưa)" value={allowance.description} onChange={e => handleAllowanceChange(index, 'description', e.target.value)} className="flex-grow p-1 border rounded dark:bg-zinc-700"/>
                                   <input type="number" placeholder="Số tiền" value={allowance.amount} onChange={e => handleAllowanceChange(index, 'amount', Number(e.target.value))} className="w-32 p-1 border rounded dark:bg-zinc-700"/>
                                   <button onClick={() => removeAllowance(index)}><TrashIcon className="w-5 h-5 text-red-500"/></button>
                               </div>
                           ))}
                           <button onClick={addAllowance} className="text-xs font-semibold text-blue-500">+ Thêm phụ cấp</button>
                        </div>
                        
                        {/* Other fields */}
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Ghi chú</label>
                            <textarea value={localProfile.notes || ''} onChange={e => handleChange('notes', e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" rows={4}></textarea>
                        </div>
                        <div className="space-y-2">
                             <label className="text-sm font-medium">Ảnh thẻ</label>
                             <input type="file" ref={idPhotoInputRef} onChange={e => e.target.files && handleImageUpload('idPhotoUrl', e.target.files[0])} className="hidden" />
                             <div className="w-32 h-32 bg-slate-100 dark:bg-zinc-700 rounded-md flex items-center justify-center cursor-pointer hover:bg-slate-200" onClick={() => idPhotoInputRef.current?.click()}>
                                 {localProfile.idPhotoUrl ? <img src={localProfile.idPhotoUrl} alt="ID" className="w-full h-full object-cover rounded-md"/> : <CameraIcon className="w-10 h-10 text-slate-400"/>}
                             </div>
                        </div>
                         <div className="space-y-2">
                             <label className="text-sm font-medium">Căn cước công dân</label>
                             <input type="file" ref={nationalIdInputRef} onChange={e => e.target.files && handleImageUpload('nationalIdUrl', e.target.files[0])} className="hidden" />
                            {showNationalId && localProfile.nationalIdUrl ? (
                                <img src={localProfile.nationalIdUrl} alt="National ID" className="w-full max-w-xs object-contain rounded-md border p-1 dark:border-zinc-600" />
                            ) : (
                                <div className="w-full h-32 bg-slate-100 dark:bg-zinc-700 rounded-md flex items-center justify-center">
                                    <IdCardIcon className="w-10 h-10 text-slate-400"/>
                                </div>
                            )}
                             <div className="flex gap-2">
                                <button onClick={() => nationalIdInputRef.current?.click()} className="text-xs p-2 bg-slate-200 dark:bg-zinc-600 rounded">Tải lên</button>
                                <button onClick={() => setShowNationalId(!showNationalId)} className="text-xs p-2 bg-slate-200 dark:bg-zinc-600 rounded">{showNationalId ? 'Ẩn' : 'Hiện'}</button>
                             </div>
                        </div>
                    </div>
                </div>
                <footer className="p-4 border-t dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border dark:border-zinc-600">Hủy</button>
                    <button onClick={handleFinalSave} className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white">Lưu</button>
                </footer>
            </div>
        </div>
    )
};

const CustomerEditModal: React.FC<{ user: User, onClose: () => void, onSave: (u: User, updates: Partial<User>) => void }> = ({ user, onClose, onSave }) => {
    const [address, setAddress] = useState(user.address || '');
    const [notes, setNotes] = useState(user.customerNotes || '');
    const [birthDate, setBirthDate] = useState(user.birthDate || '');

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
             <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="p-4 border-b dark:border-zinc-700 flex justify-between items-center"><h2 className="text-lg font-semibold">Thông tin Khách hàng: {user.fullName}</h2><button onClick={onClose}><XIcon className="w-5 h-5"/></button></header>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Địa chỉ</label>
                        <input value={address} onChange={e => setAddress(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Ngày sinh (để nhận ưu đãi)</label>
                        <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-slate-700 dark:text-zinc-300">Ghi chú</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700 dark:border-zinc-600" rows={5}></textarea>
                    </div>
                </div>
                <footer className="p-4 border-t dark:border-zinc-700 flex justify-end gap-2 bg-slate-50 dark:bg-zinc-800/50 rounded-b-xl">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-md border dark:border-zinc-600">Hủy</button>
                    <button onClick={() => onSave(user, { address, customerNotes: notes, birthDate })} className="px-4 py-2 text-sm font-semibold rounded-md bg-blue-600 text-white">Lưu</button>
                </footer>
             </div>
        </div>
    );
};

const IconSelector: React.FC<{
    label: string;
    options: { id: IconID, name: string }[];
    selectedValue: IconID;
    onChange: (value: string) => void;
}> = ({ label, options, selectedValue, onChange }) => (
    <div className="flex items-center justify-between">
        <label className="font-medium">{label}</label>
        <select value={selectedValue} onChange={e => onChange(e.target.value)} className="p-2 border rounded dark:bg-zinc-700">
            {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
        </select>
    </div>
);

const InterfaceCustomizationSettings: React.FC<{onManageLibrary: () => void}> = ({ onManageLibrary }) => {
    const [settings, setSettings] = useState(() => loadIconSettings());
    const { showToast } = useToast();

    const handleIconChange = (type: keyof CustomIconSettings, iconId: IconID) => {
        const newSettings = { ...settings, [type]: iconId };
        setSettings(newSettings);
        saveIconSettings(newSettings);
        showToast('Đã cập nhật icon!', 'success');
    };

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-zinc-100">Tùy biến Giao diện</h2>
                <button
                    onClick={onManageLibrary}
                    className="px-3 py-1.5 bg-slate-200 dark:bg-zinc-600 text-sm font-semibold rounded-md hover:bg-slate-300"
                >
                    Quản lý Thư viện Icon
                </button>
            </div>
            <div className="space-y-4">
                <IconSelector 
                    label="Icon Hotline"
                    options={getIconOptionsForType('phone')}
                    selectedValue={settings.phone}
                    onChange={(val) => handleIconChange('phone', val as IconID)}
                />
                <IconSelector 
                    label="Icon Zalo"
                    options={getIconOptionsForType('zalo')}
                    selectedValue={settings.zalo}
                    onChange={(val) => handleIconChange('zalo', val as IconID)}
                />
                <IconSelector 
                    label="Icon Facebook"
                    options={getIconOptionsForType('facebook')}
                    selectedValue={settings.facebook}
                    onChange={(val) => handleIconChange('facebook', val as IconID)}
                />
            </div>
        </div>
    );
};

const AccountManagementTab: React.FC<UserManagementPageProps> = (props) => {
    const { users, currentUser, onAddUser, onDeleteUser, onUpdateUser, onConfirmPayment, onRejectPayment, navigateTo, bankAccounts, onUpdateBankAccounts } = props;
    const { showToast } = useToast();
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editingPasswordFor, setEditingPasswordFor] = useState<string | null>(null);
    const [newPasswordForUser, setNewPasswordForUser] = useState('');
    const [isUserPasswordVisible, setIsUserPasswordVisible] = useState(false);
    const [viewingBillUrl, setViewingBillUrl] = useState<string | null>(null);
    const [activeSubTab, setActiveSubTab] = useState<'members' | 'vips'>('members');
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    
    const [isIconLibraryOpen, setIsIconLibraryOpen] = useState(false);
    const [iconUpdateKey, setIconUpdateKey] = useState(0); // Key to force re-render

    const handlePlanToggle = (userId: string, planId: PlanId) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const currentPlans = user.purchasedPlans || ['free'];
        let newPlans;
        if (currentPlans.includes(planId)) {
            newPlans = currentPlans.filter(p => p !== planId);
            if (newPlans.length === 0) newPlans.push('free');
        } else {
            newPlans = [...currentPlans.filter(p => p !== 'free'), planId];
        }
        onUpdateUser(userId, { purchasedPlans: newPlans });
        showToast('Cập nhật gói thành công!', 'success');
    };
    
    const handleVipStatusToggle = (userId: string, isVip: boolean) => {
        onUpdateUser(userId, { isVipCustomer: isVip });
        const user = users.find(u => u.id === userId);
        if (user) {
            showToast(isVip ? `${user.fullName || user.username} đã được đánh dấu là khách VIP.` : `${user.fullName || user.username} đã được xóa khỏi danh sách VIP.`, 'success');
        }
    };
    
    const handleOperationalRoleChange = (userId: string, role: OperationalRole | null) => {
        onUpdateUser(userId, { operationalRole: role });
        showToast('Cập nhật vai trò vận hành thành công!', 'success');
    };

    const handleSavePassword = (userId: string) => {
        if (newPasswordForUser.length < 6) {
            showToast('Mật khẩu phải có ít nhất 6 ký tự.', 'error');
            return;
        }
        onUpdateUser(userId, { password: newPasswordForUser });
        setEditingPasswordFor(null);
        setNewPasswordForUser('');
        showToast('Mật khẩu đã được cập nhật thành công!', 'success');
    };
    
    const vipUsers = users.filter(user => user.isVipCustomer);
    const displayedUsers = activeSubTab === 'members' ? users : vipUsers;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">
                    Hệ thống
                </h2>
                 <button 
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700"
                >
                    + Thêm Thành viên mới
                </button>
            </div>
             <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-4">
                    <TabButton name={`Quản lý Thành viên (${users.length})`} icon={<div/>} isActive={activeSubTab === 'members'} onClick={() => setActiveSubTab('members')} />
                    <TabButton name={`Danh sách VIP (${vipUsers.length})`} icon={<div/>} isActive={activeSubTab === 'vips'} onClick={() => setActiveSubTab('vips')} />
                </div>
                 <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                            {displayedUsers.map(user => (
                                <div key={user.id} className="p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-md">
                                    <div className="flex justify-between items-start flex-wrap gap-2">
                                        <div className="space-y-1 flex-grow">
                                            <p className="font-semibold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                                                {user.fullName || user.username}
                                                {user.isVipCustomer && <StarIcon className="w-4 h-4 text-yellow-500" title="Khách hàng VIP"/>}
                                                {user.id === currentUser?.id && '(Bạn)'}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400"><strong>Username:</strong> {user.username}</p>
                                            <p className="text-sm text-slate-500 dark:text-zinc-400"><strong>Zalo:</strong> {user.zalo}</p>
                                            <div className="mt-2">
                                                    <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Vai trò vận hành:</label>
                                                    <select
                                                        value={user.operationalRole || ''}
                                                        onChange={(e) => handleOperationalRoleChange(user.id, e.target.value as OperationalRole || null)}
                                                        disabled={currentUser?.id === user.id && !currentUser.purchasedPlans.includes('admin')}
                                                        className="w-full max-w-[200px] p-1.5 mt-1 border border-slate-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-800 text-sm focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                                                    >
                                                        <option value="">Không có chức vụ</option>
                                                        {Object.entries(OPERATIONAL_ROLE_NAMES).map(([key, name]) => (
                                                             <option key={key} value={key}>{name}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            <div className="flex flex-wrap gap-1 pt-1">
                                                {user.purchasedPlans.map(planId => {
                                                    const plans = loadPlans();
                                                    return (
                                                        <span key={planId} className="text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full">{plans[planId]?.name || planId}</span>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                         <div className="flex items-center flex-wrap justify-end gap-2 flex-shrink-0">
                                            {!user.isVipCustomer && !user.purchasedPlans.includes('admin') && (
                                                <button onClick={() => handleVipStatusToggle(user.id, true)} className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded-md">
                                                    <StarIcon className="w-4 h-4" /> Thêm VIP
                                                </button>
                                            )}
                                            {user.isVipCustomer && !user.purchasedPlans.includes('admin') && (
                                                <button onClick={() => handleVipStatusToggle(user.id, false)} className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 bg-red-100 dark:bg-red-900/50 px-2 py-1 rounded-md">
                                                    <XIcon className="w-4 h-4" /> Xóa VIP
                                                </button>
                                            )}
                                             <button onClick={() => setEditingPasswordFor(p => p === user.id ? null : user.id)} className="text-xs font-semibold text-green-600 hover:underline">Đổi MK</button>
                                             <button onClick={() => setEditingUserId(p => p === user.id ? null : user.id)} className="text-xs font-semibold text-blue-600 hover:underline">Sửa Gói</button>
                                            <button onClick={() => onDeleteUser(user.id)} disabled={user.id === currentUser?.id || user.purchasedPlans.includes('admin')} className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full disabled:opacity-50"><XIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                    {user.pendingPayment?.hasBill && (
                                         <div className="mt-3 pt-3 border-t border-slate-200 dark:border-zinc-600 space-y-2">
                                            <p className="text-sm font-bold text-red-500 animate-blink">Yêu cầu xác nhận thanh toán</p>
                                        </div>
                                    )}
                                    {editingUserId === user.id && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-600">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                 {Object.values(loadPlans()).filter(p => p.price !== 'N/A').map(plan => {
                                                    const planId = Object.keys(loadPlans()).find(k => loadPlans()[k as PlanId] === plan) as PlanId;
                                                    return (
                                                        <label key={planId} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-600 cursor-pointer">
                                                            <input type="checkbox" checked={user.purchasedPlans.includes(planId)} onChange={() => handlePlanToggle(user.id, planId)} className="h-4 w-4 rounded" />
                                                            <span className="ml-2">{plan.name}</span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                     {editingPasswordFor === user.id && (
                                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-zinc-600 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="relative flex-grow">
                                                    <input type={isUserPasswordVisible ? 'text' : 'password'} value={newPasswordForUser} onChange={(e) => setNewPasswordForUser(e.target.value)} className="w-full px-3 py-1.5 border rounded-md dark:bg-zinc-800" placeholder="Nhập mật khẩu mới" />
                                                    <button type="button" onClick={() => setIsUserPasswordVisible(!isUserPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center"><EyeIcon className="w-5 h-5" /></button>
                                                </div>
                                                <button onClick={() => handleSavePassword(user.id)} className="px-3 py-1.5 bg-green-600 text-white text-sm font-semibold rounded-md">Lưu</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <BankAccountSettings accounts={bankAccounts} onUpdate={onUpdateBankAccounts} />
                 <InterfaceCustomizationSettings key={iconUpdateKey} onManageLibrary={() => setIsIconLibraryOpen(true)} />
             </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                 <div>
                    <h3 className="text-xl font-bold mb-4">Điều hướng nhanh</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => navigateTo({ page: 'pricing_management' })} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 font-semibold text-center hover:bg-slate-50 dark:hover:bg-zinc-700">Quản lý Bảng giá</button>
                        <button onClick={() => navigateTo({ page: 'product_management' })} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 font-semibold text-center hover:bg-slate-50 dark:hover:bg-zinc-700">Quản lý Sản phẩm</button>
                        <button onClick={() => navigateTo({ page: 'catalog_management' })} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 font-semibold text-center hover:bg-slate-50 dark:hover:bg-zinc-700">Quản lý Danh mục</button>
                        <button onClick={() => navigateTo({ page: 'plan_management' })} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 font-semibold text-center hover:bg-slate-50 dark:hover:bg-zinc-700">Quản lý Gói DV</button>
                    </div>
                </div>
             </div>
             {isAddUserModalOpen && <AddUserModal onClose={() => setIsAddUserModalOpen(false)} onAddUser={onAddUser} />}
             {isIconLibraryOpen && <IconLibraryModal onClose={() => setIsIconLibraryOpen(false)} onUpdate={() => setIconUpdateKey(p => p + 1)} />}
        </div>
    );
};

const PersonnelManagementTab: React.FC<UserManagementPageProps> = ({ users, personnelProfiles, onUpdatePersonnelProfile }) => {
    const personnel = users.filter(u => u.operationalRole);
    const [editingProfile, setEditingProfile] = useState<PersonnelProfile | null>(null);

    const handleEdit = (user: User) => {
        const profile = personnelProfiles.find(p => p.userId === user.id) || { userId: user.id };
        setEditingProfile(profile);
    };
    
    const handleSave = (profile: PersonnelProfile) => {
        onUpdatePersonnelProfile(profile.userId, profile);
        setEditingProfile(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personnel.map(user => {
                const profile = personnelProfiles.find(p => p.userId === user.id);
                return (
                    <div key={user.id} className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700 flex flex-col items-center text-center">
                        <img src={profile?.idPhotoUrl || `https://ui-avatars.com/api/?name=${user.fullName.replace(/\s/g, '+')}&background=random`} alt="Ảnh thẻ" className="w-24 h-24 rounded-full object-cover border-4 border-slate-200 dark:border-zinc-700 mb-3" />
                        <h3 className="font-bold text-lg">{user.fullName}</h3>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{user.operationalRole ? OPERATIONAL_ROLE_NAMES[user.operationalRole] : ''}</p>
                        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">Zalo: {user.zalo}</p>
                        <button onClick={() => handleEdit(user)} className="mt-4 px-4 py-2 bg-slate-200 dark:bg-zinc-700 text-sm font-semibold rounded-md hover:bg-slate-300 dark:hover:bg-zinc-600">
                            Cập nhật Hồ sơ
                        </button>
                    </div>
                )
            })}
             {personnel.length === 0 && <p className="text-slate-500">Chưa có nhân viên nào được gán vai trò vận hành.</p>}

            {editingProfile && <PersonnelEditModal profile={editingProfile} onClose={() => setEditingProfile(null)} onSave={handleSave} />}
        </div>
    );
};


const CustomerManagementTab: React.FC<UserManagementPageProps> = ({ users, onUpdateUser }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const filteredUsers = users.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.zalo.includes(searchTerm)
    );
    
    const handleSave = (user: User, updates: Partial<User>) => {
        onUpdateUser(user.id, updates);
        setEditingUser(null);
    };

    return (
         <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
            <input 
                type="search" 
                placeholder="Tìm khách hàng theo tên hoặc Zalo..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full max-w-sm p-2 mb-4 border rounded-md dark:bg-zinc-700 dark:border-zinc-600"
            />
             <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                 {filteredUsers.map(user => (
                    <div key={user.id} className="p-3 bg-slate-50 dark:bg-zinc-700/50 rounded-md flex justify-between items-center">
                        <div>
                            <p className="font-semibold flex items-center gap-2">{user.fullName} {user.isVipCustomer && <StarIcon className="w-4 h-4 text-yellow-500"/>}</p>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">Zalo: {user.zalo}</p>
                            <p className="text-sm text-slate-500 dark:text-zinc-400">Địa chỉ: {user.address || 'Chưa có'}</p>
                        </div>
                        <button onClick={() => setEditingUser(user)} className="text-sm font-semibold text-blue-600 hover:underline">Xem / Ghi chú</button>
                    </div>
                 ))}
             </div>
             {editingUser && <CustomerEditModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSave} />}
         </div>
    );
};

type AdminTab = 'accounts' | 'personnel' | 'customers' | 'loyalty' | 'inventory' | 'hr_payroll' | 'reports' | 'expenses';

const UserManagementPage: React.FC<UserManagementPageProps> = (props) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('accounts');

    const renderTabContent = () => {
        return (
            <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader /></div>}>
                {(() => {
                    switch (activeTab) {
                        case 'personnel': return <PersonnelManagementTab {...props} />;
                        case 'customers': return <CustomerManagementTab {...props} />;
                        case 'loyalty': return <LoyaltyProgramPage 
                            settings={props.loyaltySettings}
                            onUpdateSettings={props.onUpdateLoyaltySettings}
                            users={props.users}
                            onManualPointUpdate={props.onManualPointUpdate}
                            rewards={props.rewards}
                            onUpdateRewards={props.onUpdateRewards}
                            products={props.products}
                        />;
                        case 'inventory': return <InventoryManagementPage {...props} />;
                        case 'hr_payroll': return <HRPayrollTab {...props} />;
                        case 'reports': return <ReportsPage {...props} />;
                        case 'expenses': return <ExpenseManagementPage {...props} />;
                        case 'accounts': default: return <AccountManagementTab {...props} />;
                    }
                })()}
            </Suspense>
        );
    };

    return (
        <main className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-zinc-100 mb-8">Quản Trị</h1>
            <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-8 overflow-x-auto">
                <TabButton name="Tài khoản" icon={<UsersIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'accounts'} onClick={() => setActiveTab('accounts')} />
                <TabButton name="Nhân sự" icon={<IdCardIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'personnel'} onClick={() => setActiveTab('personnel')} />
                <TabButton name="Khách hàng" icon={<UsersIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
                <TabButton name="Lương" icon={<BanknotesIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'hr_payroll'} onClick={() => setActiveTab('hr_payroll')} />
                <TabButton name="Khách hàng TT" icon={<TrophyIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'loyalty'} onClick={() => setActiveTab('loyalty')} />
                <TabButton name="Kho Vật tư" icon={<ArchiveBoxIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                <TabButton name="Quản lý Chi phí" icon={<OfficeBuildingIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} />
                <TabButton name="Báo cáo" icon={<DocumentTextIcon className="w-5 h-5 mr-2"/>} isActive={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
            </div>
            <div>
                {renderTabContent()}
            </div>
        </main>
    );
};

export default UserManagementPage;