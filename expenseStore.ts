// expenseStore.ts
    
export interface Expense {
    id: string;
    date: string; // YYYY-MM-DD
    description: string;
    amount: number;
    category: ExpenseCategory;
    notes?: string;
}

export type ExpenseCategory = 'Tiện ích' | 'Văn phòng phẩm & Vật tư' | 'Tiếp khách & Sự kiện' | 'Vận hành' | 'Chi phí khác';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['Tiện ích', 'Văn phòng phẩm & Vật tư', 'Tiếp khách & Sự kiện', 'Vận hành', 'Chi phí khác'];

const EXPENSES_STORAGE_KEY = 'app_expenses_v1';

export const getExpenses = (): Expense[] => {
    try {
        const expensesJson = localStorage.getItem(EXPENSES_STORAGE_KEY);
        const expenses = expensesJson ? JSON.parse(expensesJson) : [];
        // Sort by newest first
        return expenses.sort((a: Expense, b: Expense) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (e) {
        console.error("Failed to load expenses from localStorage:", e);
        return [];
    }
};

export const saveExpenses = (expenses: Expense[]): void => {
    try {
        localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
        console.error("Failed to save expenses to localStorage:", e);
    }
};

export const addExpense = (expenseData: Omit<Expense, 'id'>): void => {
    const expenses = getExpenses();
    const newExpense: Expense = {
        ...expenseData,
        id: `exp-${Date.now()}`,
    };
    expenses.unshift(newExpense);
    saveExpenses(expenses);
};
