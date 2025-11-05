

import React, { useState, useMemo } from 'react';
import { User, PersonnelProfile, TimeClockEntry } from '../../userStore';
import { Payslip } from './Payslip';
import { TrashIcon } from '../icons/TrashIcon';

interface HRPayrollTabProps {
  users: User[];
  personnelProfiles: PersonnelProfile[];
  timeClockEntries: TimeClockEntry[];
}

interface AdjustmentItem {
    description: string;
    amount: number;
}

// Fix: Add the formatCurrency function, which was missing from this file.
const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value) + 'đ';

export const HRPayrollTab: React.FC<HRPayrollTabProps> = ({ users, personnelProfiles, timeClockEntries }) => {
  const [activeSubTab, setActiveSubTab] = useState<'timesheet' | 'payroll'>('timesheet');

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button onClick={() => setActiveSubTab('timesheet')} className={`px-4 py-2 rounded-md font-semibold ${activeSubTab === 'timesheet' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-700'}`}>Bảng Chấm công</button>
        <button onClick={() => setActiveSubTab('payroll')} className={`px-4 py-2 rounded-md font-semibold ${activeSubTab === 'payroll' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-700'}`}>Tính lương</button>
      </div>

      {activeSubTab === 'timesheet' && <TimesheetView users={users} timeClockEntries={timeClockEntries} />}
      {activeSubTab === 'payroll' && <PayrollView users={users} personnelProfiles={personnelProfiles} timeClockEntries={timeClockEntries} />}
    </div>
  );
};

// Timesheet Component
const TimesheetView: React.FC<{ users: User[], timeClockEntries: TimeClockEntry[] }> = ({ users, timeClockEntries }) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const filteredEntries = useMemo(() => {
        return timeClockEntries
            .filter(entry => {
                if (selectedUserId && entry.userId !== selectedUserId) return false;
                const entryDate = new Date(entry.timestamp);
                if (dateRange.start && entryDate < new Date(dateRange.start)) return false;
                if (dateRange.end) {
                    const endDate = new Date(dateRange.end);
                    endDate.setHours(23, 59, 59, 999);
                    if (entryDate > endDate) return false;
                }
                return true;
            })
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [timeClockEntries, selectedUserId, dateRange]);

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Lịch sử Chấm công</h3>
            <div className="flex gap-4 mb-4">
                <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="p-2 border rounded dark:bg-zinc-700">
                    <option value="">Tất cả Nhân viên</option>
                    {users.filter(u => u.operationalRole).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                </select>
                <input type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="p-2 border rounded dark:bg-zinc-700" />
                <input type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="p-2 border rounded dark:bg-zinc-700" />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                {filteredEntries.length > 0 ? (
                    filteredEntries.map(entry => {
                        const user = users.find(u => u.id === entry.userId);
                        return (
                            <div key={entry.id} className="flex items-start gap-4 p-2 bg-slate-50 dark:bg-zinc-700/50 rounded-md">
                                <img src={entry.photoDataUrl} alt="Clock-in" className="w-16 h-16 object-cover rounded-md"/>
                                <div>
                                    <p className="font-semibold">{user?.fullName}</p>
                                    <p className={`text-sm ${entry.type === 'clock_in' ? 'text-green-600' : 'text-red-600'}`}>
                                        {entry.type === 'clock_in' ? 'Chấm công vào' : 'Chấm công ra'}
                                    </p>
                                    <p className="text-xs text-slate-500">{new Date(entry.timestamp).toLocaleString('vi-VN')}</p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 text-slate-500 dark:text-zinc-400">
                        <p>Chưa có dữ liệu chấm công nào được ghi nhận.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Payroll Component
const PayrollView: React.FC<{ users: User[], personnelProfiles: PersonnelProfile[], timeClockEntries: TimeClockEntry[] }> = ({ users, personnelProfiles, timeClockEntries }) => {
    const [selectedUserId, setSelectedUserId] = useState('');
    const [payPeriod, setPayPeriod] = useState({ start: '', end: '' });
    const [standardHours, setStandardHours] = useState(176);
    const [bonuses, setBonuses] = useState<AdjustmentItem[]>([]);
    const [deductions, setDeductions] = useState<AdjustmentItem[]>([]);
    const [payrollResult, setPayrollResult] = useState<any>(null);

    const calculatePayroll = () => {
        if (!selectedUserId || !payPeriod.start || !payPeriod.end) {
            alert('Vui lòng chọn nhân viên và kỳ lương.');
            return;
        }

        const user = users.find(u => u.id === selectedUserId);
        const profile = personnelProfiles.find(p => p.userId === selectedUserId);
        if (!user || !profile || !profile.baseSalary || !profile.salaryType) {
            alert('Nhân viên này chưa được thiết lập thông tin lương.');
            return;
        }

        const startTime = new Date(payPeriod.start).getTime();
        const endTime = new Date(payPeriod.end).setHours(23, 59, 59, 999);

        const relevantEntries = timeClockEntries
            .filter(e => e.userId === selectedUserId && e.timestamp >= startTime && e.timestamp <= endTime)
            .sort((a, b) => a.timestamp - b.timestamp);

        let totalHours = 0;
        for (let i = 0; i < relevantEntries.length - 1; i++) {
            if (relevantEntries[i].type === 'clock_in' && relevantEntries[i+1].type === 'clock_out') {
                const duration = relevantEntries[i+1].timestamp - relevantEntries[i].timestamp;
                totalHours += duration / (1000 * 60 * 60);
                i++; // Skip the next entry as it's paired
            }
        }
        
        let baseSalaryCalc = 0;
        let overtimeHours = 0;
        let overtimePay = 0;
        
        if (profile.salaryType === 'monthly') {
            baseSalaryCalc = profile.baseSalary;
            overtimeHours = Math.max(0, totalHours - standardHours);
            if (overtimeHours > 0) {
                const hourlyRate = profile.baseSalary / standardHours;
                overtimePay = overtimeHours * hourlyRate * (profile.overtimeRate || 1.5);
            }
        } else { // hourly
            baseSalaryCalc = totalHours * profile.baseSalary;
            // Overtime for hourly workers can be added as a bonus for simplicity
        }

        const allowanceTotal = (profile.allowances || []).reduce((sum, item) => sum + item.amount, 0);
        const bonusTotal = bonuses.reduce((sum, item) => sum + item.amount, 0);
        const deductionTotal = deductions.reduce((sum, item) => sum + item.amount, 0);
        
        const finalSalary = baseSalaryCalc + overtimePay + allowanceTotal + bonusTotal - deductionTotal;
        
        setPayrollResult({
            user,
            profile,
            payPeriod,
            totalHours,
            finalSalary,
            baseSalaryCalc,
            overtimeHours,
            overtimePay,
            allowanceTotal: allowanceTotal + bonusTotal, // Combine for display
            deductionTotal,
            allowances: [...(profile.allowances || []), ...bonuses]
        });
    };
    
    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-4">Công cụ Tính lương</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 items-end">
                <div>
                    <label className="text-sm">Nhân viên</label>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700">
                        <option value="">-- Chọn nhân viên --</option>
                        {users.filter(u => u.operationalRole).map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="text-sm">Từ ngày</label>
                    <input type="date" value={payPeriod.start} onChange={e => setPayPeriod(p => ({...p, start: e.target.value}))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700" />
                </div>
                 <div>
                    <label className="text-sm">Đến ngày</label>
                    <input type="date" value={payPeriod.end} onChange={e => setPayPeriod(p => ({...p, end: e.target.value}))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700" />
                </div>
                <div>
                    <label className="text-sm">Giờ chuẩn/tháng</label>
                    <input type="number" value={standardHours} onChange={e => setStandardHours(Number(e.target.value))} className="w-full mt-1 p-2 border rounded dark:bg-zinc-700" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <AdjustmentSection title="Thưởng / Phụ cấp khác" items={bonuses} setItems={setBonuses} />
                <AdjustmentSection title="Các khoản khấu trừ / Phạt" items={deductions} setItems={setDeductions} />
            </div>

            <button onClick={calculatePayroll} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700">Tính lương</button>

            {payrollResult && (
                <div className="mt-6 border-t pt-6">
                    <h4 className="font-bold text-xl mb-4">Bảng lương chi tiết cho {payrollResult.user.fullName}</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <ResultRow label="Kỳ lương" value={`${payPeriod.start} đến ${payPeriod.end}`} />
                        <ResultRow label="Tổng giờ làm" value={`${payrollResult.totalHours.toFixed(2)} giờ`} />
                        <ResultRow label="Lương cơ bản" value={formatCurrency(payrollResult.baseSalaryCalc)} />
                        <ResultRow label="Lương tăng ca" value={`${formatCurrency(payrollResult.overtimePay)} (${payrollResult.overtimeHours.toFixed(2)} giờ)`} />
                        <ResultRow label="Tổng phụ cấp & thưởng" value={formatCurrency(payrollResult.allowanceTotal)} />
                        <ResultRow label="Tổng khấu trừ" value={formatCurrency(payrollResult.deductionTotal)} isDeduction />
                        <div className="col-span-2 mt-4 pt-4 border-t">
                            <ResultRow label="LƯƠNG THỰC NHẬN" value={formatCurrency(payrollResult.finalSalary)} isTotal />
                        </div>
                    </div>
                    <button onClick={() => window.print()} className="mt-6 px-4 py-2 bg-green-600 text-white rounded no-print">Xuất Phiếu lương</button>
                    <div className="print-only hidden">
                         <Payslip {...payrollResult} />
                    </div>
                </div>
            )}
        </div>
    );
};

const AdjustmentSection: React.FC<{title: string, items: AdjustmentItem[], setItems: React.Dispatch<React.SetStateAction<AdjustmentItem[]>>}> = ({ title, items, setItems }) => {
    const handleItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };
    const addItem = () => setItems([...items, { description: '', amount: 0 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    return (
        <div className="space-y-2">
            <h4 className="text-sm font-semibold">{title}</h4>
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input type="text" placeholder="Mô tả" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} className="flex-grow p-1 border rounded text-sm dark:bg-zinc-700"/>
                    <input type="number" placeholder="Số tiền" value={item.amount} onChange={e => handleItemChange(index, 'amount', Number(e.target.value))} className="w-28 p-1 border rounded text-sm dark:bg-zinc-700"/>
                    <button onClick={() => removeItem(index)}><TrashIcon className="w-4 h-4 text-red-500"/></button>
                </div>
            ))}
            <button onClick={addItem} className="text-xs font-semibold text-blue-500">+ Thêm mục</button>
        </div>
    );
};

const ResultRow: React.FC<{label: string, value: string, isDeduction?: boolean, isTotal?: boolean}> = ({ label, value, isDeduction, isTotal }) => (
    <>
        <dt className={`font-semibold ${isTotal ? 'text-lg' : ''}`}>{label}:</dt>
        <dd className={`text-right ${isDeduction ? 'text-red-600' : ''} ${isTotal ? 'text-2xl font-bold text-blue-600' : 'font-medium'}`}>{value}</dd>
    </>
);
