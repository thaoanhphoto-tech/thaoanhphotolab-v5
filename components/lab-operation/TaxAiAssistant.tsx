import React, { useState, useMemo } from 'react';
// Fix: Corrected type imports to their respective store files.
import { PrintRequest } from '../../userStore';
import { Product } from '../../productStore';
import { Material, ProductBOM } from '../../inventoryStore';
import { Expense } from '../../expenseStore';
import { generateTaxAnalysis } from '../../services/geminiService';
import { Loader } from '../Loader';

interface TaxAiAssistantProps {
    requests: PrintRequest[];
    expenses: Expense[];
    products: Product[];
    materials: Material[];
    productBOMs: ProductBOM[];
}

type FilterType = 'this_month' | 'this_quarter' | 'custom';

const calculateCogs = (order: PrintRequest, products: Product[], materials: Material[], productBOMs: ProductBOM[]): number => {
    if (!order.manualOrderItems) return 0;
    let totalCogs = 0;
    for (const item of order.manualOrderItems) {
        const product = products.find(p => p.id === item.productCode);
        if (product && product.cogs) {
            totalCogs += product.cogs * item.quantity;
            continue;
        }

        const bom = productBOMs.find(b => b.productId === item.productCode);
        if (bom) {
            let itemCogs = 0;
            for (const bomItem of bom.items) {
                const material = materials.find(m => m.id === bomItem.materialId);
                if (material) {
                    itemCogs += bomItem.quantity * material.unitPrice;
                }
            }
            totalCogs += itemCogs * item.quantity;
        }
    }
    return totalCogs;
};

// A simple markdown to HTML converter for the report
const renderMarkdown = (text: string) => {
    let html = text;
    // Bold **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold mt-8 mb-4">$1</h1>');
    // List items * item
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    // Replace newlines with <br>
    html = html.replace(/\n/g, '<br />');
    // Fix <br> inside <li>
    html = html.replace(/<li(.*?)<br \/>/g, '<li$1');
     // Wrap lists in <ul>, handling multiple lists
    html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
    html = html.replace(/<\/ul><br \/><ul>/g, '');

    return { __html: html };
};


const TaxAiAssistant: React.FC<TaxAiAssistantProps> = ({ requests, expenses, products, materials, productBOMs }) => {
    const [filterType, setFilterType] = useState<FilterType>('this_month');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalysis = async () => {
        setIsLoading(true);
        setReport(null);
        setError(null);

        const now = new Date();
        let startTime = 0;
        let endTime = Infinity;

        switch (filterType) {
            case 'this_month':
                startTime = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
                endTime = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
                break;
            case 'this_quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                startTime = new Date(now.getFullYear(), quarter * 3, 1).getTime();
                endTime = new Date(now.getFullYear(), quarter * 3 + 3, 0, 23, 59, 59, 999).getTime();
                break;
            case 'custom':
                if (customRange.start) startTime = new Date(customRange.start).getTime();
                if (customRange.end) endTime = new Date(customRange.end).setHours(23, 59, 59, 999);
                break;
        }

        const filteredRequests = requests.filter(r => r.timestamp >= startTime && r.timestamp <= endTime);
        const filteredExpenses = expenses.filter(e => {
            const expenseDate = new Date(e.date).getTime();
            return expenseDate >= startTime && expenseDate <= endTime;
        });
        
        const completedRequests = filteredRequests.filter(r => r.workflowStatus === 'delivered' || r.workflowStatus === 'archived');
        
        const totalRevenue = completedRequests.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
        const totalCogs = completedRequests.reduce((sum, r) => sum + calculateCogs(r, products, materials, productBOMs), 0);
        const totalOpex = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
        
        try {
            const aiReport = await generateTaxAnalysis({
                totalRevenue,
                totalCogs,
                totalOpex,
                startDate: new Date(startTime).toLocaleDateString('vi-VN'),
                endDate: new Date(endTime).toLocaleDateString('vi-VN'),
            });
            if (aiReport) {
                setReport(aiReport);
            } else {
                setError('AI không thể tạo báo cáo. Vui lòng thử lại.');
            }
        } catch (e) {
            console.error("Tax analysis failed:", e);
            setError('Đã xảy ra lỗi khi kết nối với AI. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const FilterButton: React.FC<{ type: FilterType, children: React.ReactNode }> = ({ type, children }) => (
        <button onClick={() => setFilterType(type)} className={`px-3 py-1.5 text-sm font-semibold rounded-md ${filterType === type ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-zinc-700 hover:bg-slate-300'}`}>{children}</button>
    );

    return (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-800 dark:text-zinc-100 mb-4">Trợ lý Thuế AI</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">Chọn một khoảng thời gian để AI phân tích doanh thu, chi phí và đưa ra báo cáo thuế ước tính.</p>

            <div className="flex flex-wrap items-center gap-2 mb-4 p-3 bg-slate-100 dark:bg-zinc-900/50 rounded-md">
                <FilterButton type="this_month">Tháng này</FilterButton>
                <FilterButton type="this_quarter">Quý này</FilterButton>
                <FilterButton type="custom">Tùy chọn</FilterButton>
                {filterType === 'custom' && (
                    <div className="flex items-center gap-2 text-sm">
                        <input type="date" value={customRange.start} onChange={e => setCustomRange(p => ({...p, start: e.target.value}))} className="p-1.5 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"/>
                        <span>-</span>
                        <input type="date" value={customRange.end} onChange={e => setCustomRange(p => ({...p, end: e.target.value}))} className="p-1.5 border rounded dark:bg-zinc-700 text-slate-800 dark:text-zinc-200"/>
                    </div>
                )}
                 <button onClick={handleAnalysis} disabled={isLoading} className="ml-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                    {isLoading ? 'Đang phân tích...' : 'Phân tích bằng AI'}
                </button>
            </div>
            
            <div className="mt-6 border-t dark:border-zinc-700 pt-6">
                {isLoading && <div className="flex justify-center"><Loader /></div>}
                {error && <div className="text-center text-red-500 p-4">{error}</div>}
                {report && (
                    <div 
                        className="prose prose-sm dark:prose-invert max-w-none bg-slate-50 dark:bg-zinc-900/50 p-6 rounded-lg"
                        dangerouslySetInnerHTML={renderMarkdown(report)} 
                    />
                )}
                 {!isLoading && !report && !error && (
                    <div className="text-center py-10 text-slate-500 dark:text-zinc-400">
                        <p>Báo cáo phân tích thuế sẽ được hiển thị ở đây.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaxAiAssistant;