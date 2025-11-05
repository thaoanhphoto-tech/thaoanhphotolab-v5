import React, { useState, lazy, Suspense } from 'react';
import { Material, Supplier, InventoryTransaction, PurchaseOrder, Warehouse, WarehouseTransfer } from '../inventoryStore';
import { PageState } from '../App';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { useToast } from './Toast';
import { Loader } from './Loader';
import { User } from '../userStore';
import { SparklesIcon } from './icons/SparklesIcon';

// Correctly lazy load components with default exports
const InventoryAuditModal = lazy(() => import('./InventoryAuditModal'));
const StockLevelsTab = lazy(() => import('./inventory/StockLevelsTab'));
const SupplierManagementTab = lazy(() => import('./inventory/SupplierManagementTab'));
const TransactionHistoryTab = lazy(() => import('./inventory/TransactionHistoryTab'));
const InboundSlipModal = lazy(() => import('./inventory/InboundSlipModal'));
const OutboundSlipModal = lazy(() => import('./inventory/OutboundSlipModal'));
const PurchaseRequisitionModal = lazy(() => import('./inventory/PurchaseRequisitionModal'));
const AiInboundSlipModal = lazy(() => import('./inventory/AiInboundSlipModal'));
const PurchaseOrdersTab = lazy(() => import('./inventory/PurchaseOrdersTab'));
const WarehouseManagementTab = lazy(() => import('./inventory/WarehouseManagementTab'));
const WarehouseTransfersTab = lazy(() => import('./inventory/WarehouseTransfersTab'));
const WarehouseTransferModal = lazy(() => import('./inventory/WarehouseTransferModal'));


interface InventoryManagementPageProps {
    navigateTo: (state: PageState) => void;
    materials: Material[];
    onUpdateMaterials: (materials: Material[]) => void;
    onApplyAudit: (updatedMaterials: { id: string; newStock: number; warehouseId: string }[], notes: string, warehouseId: string) => void;
    currentUser: User;
    suppliers: Supplier[];
    onUpdateSuppliers: (suppliers: Supplier[]) => void;
    transactions: InventoryTransaction[];
    onAddTransaction: (transaction: Omit<InventoryTransaction, 'id' | 'timestamp'>) => void;
    sizes: string[];
    purchaseOrders: PurchaseOrder[];
    onAddPurchaseOrder: (orderData: Omit<PurchaseOrder, 'id' | 'timestamp'>) => void;
    onUpdatePurchaseOrder: (orderId: string, updates: Partial<PurchaseOrder>) => void;
    // New props for multi-warehouse
    warehouses: Warehouse[];
    onUpdateWarehouses: (warehouses: Warehouse[]) => void;
    warehouseTransfers: WarehouseTransfer[];
    onAddWarehouseTransfer: (transferData: Omit<WarehouseTransfer, 'id' | 'timestamp' | 'status'>) => void;
    onCompleteWarehouseTransfer: (transferId: string) => void;
}

type ActiveTab = 'stock' | 'suppliers' | 'history' | 'purchase_orders' | 'warehouses' | 'transfers';

export const InventoryManagementPage: React.FC<InventoryManagementPageProps> = (props) => {
    const { navigateTo, materials, onUpdateMaterials, currentUser, suppliers, onUpdateSuppliers, transactions, onAddTransaction, sizes, purchaseOrders, onAddPurchaseOrder, onUpdatePurchaseOrder, warehouses, onUpdateWarehouses, warehouseTransfers, onAddWarehouseTransfer, onCompleteWarehouseTransfer } = props;
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<ActiveTab>('stock');
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
    const [isInboundModalOpen, setIsInboundModalOpen] = useState(false);
    const [isOutboundModalOpen, setIsOutboundModalOpen] = useState(false);
    const [isRequisitionModalOpen, setIsRequisitionModalOpen] = useState(false);
    const [isAiInboundModalOpen, setIsAiInboundModalOpen] = useState(false);
    const [inboundFromPO, setInboundFromPO] = useState<PurchaseOrder | null>(null);
    const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

    const handleApplyAuditWithTransaction = (updates: { id: string; newStock: number; warehouseId: string }[], notes: string, warehouseId: string) => {
        updates.forEach(update => {
            const material = materials.find(m => m.id === update.id);
            if (material) {
                const currentStock = material.stock[warehouseId] || 0;
                const difference = update.newStock - currentStock;
                if (difference !== 0) {
                    onAddTransaction({
                        materialId: update.id,
                        type: 'adjustment_audit',
                        quantity: difference,
                        unitPrice: material.unitPrice, 
                        notes: `Kiểm kê tại ${warehouses.find(w => w.id === warehouseId)?.name}: ${notes}`,
                        staffId: currentUser.id,
                        warehouseId: warehouseId,
                    });
                }
            }
        });
        showToast('Đã áp dụng kết quả kiểm kê và tạo phiếu điều chỉnh.', 'success');
    };
    
    const handleReceiveFromPO = (po: PurchaseOrder) => {
        setInboundFromPO(po);
        setIsInboundModalOpen(true);
    };

    const handleCloseInboundModal = () => {
        setIsInboundModalOpen(false);
        setInboundFromPO(null);
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'suppliers':
                return <SupplierManagementTab suppliers={suppliers} onUpdateSuppliers={onUpdateSuppliers} onAddTransaction={onAddTransaction} currentUser={currentUser} />;
            case 'history':
                return <TransactionHistoryTab transactions={transactions} materials={materials} suppliers={suppliers} users={[]} />;
            case 'purchase_orders':
                return <PurchaseOrdersTab purchaseOrders={purchaseOrders} suppliers={suppliers} materials={materials} onReceive={handleReceiveFromPO} />;
            case 'warehouses':
                return <WarehouseManagementTab warehouses={warehouses} onUpdateWarehouses={onUpdateWarehouses} />;
            case 'transfers':
                return <WarehouseTransfersTab transfers={warehouseTransfers} warehouses={warehouses} materials={materials} onCompleteTransfer={onCompleteWarehouseTransfer} />;
            case 'stock':
            default:
                return <StockLevelsTab materials={materials} onUpdateMaterials={onUpdateMaterials} sizes={sizes} warehouses={warehouses} />;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <button
                onClick={() => navigateTo({ page: 'user_management' })}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-6"
            >
                <ArrowLeftIcon className="w-4 h-4" />
                Quay lại trang Quản trị
            </button>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý Kho Vật tư</h1>
                <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setIsAiInboundModalOpen(true)} className="px-3 py-1.5 font-semibold rounded-lg bg-teal-500 hover:bg-teal-600 text-white text-xs flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4" /> Nhập kho (AI)
                    </button>
                    <button onClick={() => setIsInboundModalOpen(true)} className="px-3 py-1.5 font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs">
                        + Nhập Kho
                    </button>
                    <button onClick={() => setIsOutboundModalOpen(true)} className="px-3 py-1.5 font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs">
                        - Xuất Kho
                    </button>
                    <button onClick={() => setIsTransferModalOpen(true)} className="px-3 py-1.5 font-semibold rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs">
                        Chuyển Kho
                    </button>
                     <button onClick={() => setIsAuditModalOpen(true)} className="px-3 py-1.5 font-semibold rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-xs">
                        Kiểm Kê
                    </button>
                     <button onClick={() => setIsRequisitionModalOpen(true)} className="px-3 py-1.5 font-semibold rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs">
                        Tạo ĐH Mua
                    </button>
                </div>
            </div>

            <div className="flex border-b border-slate-200 dark:border-zinc-700 mb-6 overflow-x-auto">
                <TabButton name="Tồn Kho" isActive={activeTab === 'stock'} onClick={() => setActiveTab('stock')} />
                <TabButton name="Nhà Cung Cấp" isActive={activeTab === 'suppliers'} onClick={() => setActiveTab('suppliers')} />
                <TabButton name="Đơn Mua Hàng" isActive={activeTab === 'purchase_orders'} onClick={() => setActiveTab('purchase_orders')} />
                <TabButton name="Các Kho" isActive={activeTab === 'warehouses'} onClick={() => setActiveTab('warehouses')} />
                <TabButton name="Chuyển Kho" isActive={activeTab === 'transfers'} onClick={() => setActiveTab('transfers')} />
                <TabButton name="Lịch sử Giao dịch" isActive={activeTab === 'history'} onClick={() => setActiveTab('history')} />
            </div>

            <Suspense fallback={<Loader />}>
                {renderContent()}
            </Suspense>

            {isAuditModalOpen && (
                <Suspense fallback={<div />}>
                    <InventoryAuditModal
                        materials={materials}
                        warehouses={warehouses}
                        onClose={() => setIsAuditModalOpen(false)}
                        onApply={handleApplyAuditWithTransaction}
                    />
                </Suspense>
            )}
            {isInboundModalOpen && (
                 <Suspense fallback={<div />}>
                    <InboundSlipModal
                        materials={materials}
                        suppliers={suppliers}
                        currentUser={currentUser}
                        onClose={handleCloseInboundModal}
                        onSave={onAddTransaction}
                        onUpdateSuppliers={onUpdateSuppliers}
                        purchaseOrder={inboundFromPO}
                        onUpdatePurchaseOrder={onUpdatePurchaseOrder}
                        warehouses={warehouses}
                    />
                 </Suspense>
            )}
            {isOutboundModalOpen && (
                <Suspense fallback={<div />}>
                    <OutboundSlipModal
                        materials={materials}
                        currentUser={currentUser}
                        onClose={() => setIsOutboundModalOpen(false)}
                        onSave={onAddTransaction}
                        warehouses={warehouses}
                    />
                </Suspense>
            )}
             {isRequisitionModalOpen && (
                <Suspense fallback={<div />}>
                    <PurchaseRequisitionModal
                        materials={materials}
                        suppliers={suppliers}
                        transactions={transactions}
                        onClose={() => setIsRequisitionModalOpen(false)}
                        onSave={onAddPurchaseOrder}
                        currentUser={currentUser}
                    />
                </Suspense>
            )}
            {isAiInboundModalOpen && (
                <Suspense fallback={<div />}>
                    <AiInboundSlipModal
                        materials={materials}
                        suppliers={suppliers}
                        currentUser={currentUser}
                        onClose={() => setIsAiInboundModalOpen(false)}
                        onUpdateSuppliers={onUpdateSuppliers}
                        onAddTransaction={onAddTransaction}
                        warehouses={warehouses}
                    />
                </Suspense>
            )}
            {isTransferModalOpen && (
                <Suspense fallback={<div/>}>
                    <WarehouseTransferModal
                        materials={materials}
                        warehouses={warehouses}
                        currentUser={currentUser}
                        onClose={() => setIsTransferModalOpen(false)}
                        onSave={onAddWarehouseTransfer}
                    />
                </Suspense>
            )}
        </div>
    );
};

const TabButton: React.FC<{ name: string, isActive: boolean, onClick: () => void }> = ({ name, isActive, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2 text-sm font-semibold transition-colors flex-shrink-0 ${isActive ? 'border-b-2 border-blue-500 text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}>
        {name}
    </button>
);

export default InventoryManagementPage;