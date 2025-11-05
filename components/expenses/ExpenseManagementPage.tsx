import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, EXPENSE_CATEGORIES } from '../../expenseStore';
import { XIcon } from '../icons/XIcon';
import { PlusCircleIcon } from '../icons/PlusCircleIcon';

interface ExpenseManagementPageProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

const formatCurrency = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

export const ExpenseManagementPage: React.FC<ExpenseManagementPageProps> = ({ expenses, onAddExpense }) => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all');
    const [filterDate, setFilterDate] = useState('');

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            if (filterCategory !== 'all' && expense.category !== filterCategory) {
                return false;
            }
            if (filterDate && !expense.date.startsWith(filterDate.substring(0, 7))) { // Filter by YYYY-MM
                return false;
            }
            return true;
        });
    }, [expenses, filterCategory, filterDate]);

    const totalFilteredAmount = useMemo(() => {
        return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    }, [filteredExpenses]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100">Quản lý Chi phí Hoạt động</h2>
                <button 
                    onClick={() => setIsAddModalOpen(true)} 
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md text-sm hover:bg-green-700 flex items-center gap-2"
                >
                    <PlusCircleIcon className="w-5 h-5" /> Thêm Chi phí
                </button>
            </div>

            <div className="bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-md border border-slate-200 dark:border-zinc-700">
                <div className="flex flex-wrap gap-4 mb-4">
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value as any)} className="p-2 border rounded dark:bg-zinc-700">
                        <option value="all">Tất cả Danh mục</option>
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                     <input type="month" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="p-2 border rounded dark:bg-zinc-700" />
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-left bg-slate-50 dark:bg-zinc-700/50">
                            <tr>
                                <th className="p-2">Ngày</th>
                                <th className="p-2">Mô tả</th>
                                <th className="p-2">Danh mục</th>
                                <th className="p-2 text-right">Số tiền</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredExpenses.map(expense => (
                                <tr key={expense.id} className="border-t dark:border-zinc-700">
                                    <td className="p-2">{new Date(expense.date).toLocaleDateString('vi-VN')}</td>
                                    <td className="p-2">{expense.description}</td>
                                    <td className="p-2 text-slate-500">{expense.category}</td>
                                    <td className="p-2 text-right font-semibold text-red-600">-{formatCurrency(expense.amount)}đ</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 dark:border-zinc-600 font-bold">
                                <td colSpan={3} className="p-2 text-right">Tổng cộng:</td>
                                <td className="p-2 text-right text-red-600">-{formatCurrency(totalFilteredAmount)}đ</td>
                            </tr>
                        </tfoot>
                    </table>
                     {filteredExpenses.length === 0 && <p className="text-center text-slate-500 py-6">Không có chi phí nào khớp với bộ lọc.</p>}
                </div>
            </div>

            {isAddModalOpen && (
                <AddExpenseModal onClose={() => setIsAddModalOpen(false)} onSave={onAddExpense} />
            )}
        </div>
    );
};

const AddExpenseModal: React.FC<{
    onClose: () => void;
    onSave: (expense: Omit<Expense, 'id'>) => void;
}> = ({ onClose, onSave }) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [category, setCategory] = useState<ExpenseCategory>(EXPENSE_CATEGORIES[0]);
    
    const handleSubmit = () => {
        if (!description.trim() || amount <= 0) {
            alert('Vui lòng nhập mô tả và số tiền hợp lệ.');
            return;
        }
        onSave({ date, description, amount, category });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-zinc-700">
                    <h2 className="text-lg font-semibold">Thêm Chi phí mới</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </header>
                <div className="p-6 space-y-4">
                    <InputField label="Ngày" type="date" value={date} onChange={setDate} />
                    <InputField label="Mô tả" value={description} onChange={setDescription} placeholder="VD: Tiền điện tháng 8" required/>
                    <InputField label="Số tiền" type="number" value={String(amount)} onChange={val => setAmount(Number(val))} required/>
                    <InputField label="Danh mục" as="select" value={category} onChange={setCategory as any}>
                        {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </InputField>
                </div>
                <footer className="p-4 bg-slate-50 dark:bg-zinc-900/50 rounded-b-xl flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Lưu Chi phí</button>
                </footer>
            </div>
        </div>
    );
};

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

export default ExpenseManagementPage;
