// inventoryStore.ts

export interface Material {
    id: string;
    code: string; 
    name: string;
    unit: string; 
    size?: string; 
    unitPrice: number;
    stock: Record<string, number>;
    lowStockThreshold: number;
    imageUrl?: string;
    // New accounting fields
    accountingCode?: '152' | '153' | '155' | '156';
    expenseType?: 'valid_vat' | 'valid_no_vat' | 'invalid';
}

export interface ProductBOM { // Bill of Materials
    productId: string;
    items: {
        materialId: string;
        quantity: number;
    }[];
}

export type AssetCategory = 'Váy cưới' | 'Vest' | 'Áo dài' | 'Phụ kiện' | 'Đạo cụ';
export type AssetStatus = 'Sẵn sàng' | 'Đang thuê' | 'Giặt ủi' | 'Bảo trì' | 'Hỏng';

export interface AssetLog {
    timestamp: number;
    action: 'Cho thuê' | 'Trả lại' | 'Bảo trì' | 'Sẵn sàng' | 'Tạo mới';
    notes?: string;
    relatedCustomerId?: string;
}

export interface StudioAsset {
    id: string;
    name: string;
    code: string;
    category: AssetCategory;
    size?: string;
    imageUrl: string;
    status: AssetStatus;
    purchasePrice?: number;
    history: AssetLog[];
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    debtAmount: number; 
    taxCode?: string;
}

export type TransactionType = 'inbound' | 'outbound_production' | 'outbound_sale' | 'outbound_return' | 'adjustment_audit' | 'adjustment_destroy' | 'transfer_out' | 'transfer_in' | 'outbound_payment';

export interface InventoryTransaction {
    id: string;
    timestamp: number;
    materialId?: string;
    type: TransactionType;
    quantity: number; 
    unitPrice: number;
    notes?: string;
    supplierId?: string;
    relatedOrderId?: string; 
    staffId: string; 
    warehouseId?: string;
    // New accounting fields
    invoiceNumber?: string;
    invoiceDate?: string;
    taxRate?: number; // As a percentage
}

export interface PurchaseOrderItem {
    materialId: string;
    quantity: number;
    unitPrice: number; 
    taxRate?: number;
}

export interface PurchaseOrder {
    id: string;
    timestamp: number;
    supplierId: string;
    items: PurchaseOrderItem[];
    totalAmount: number;
    status: 'pending' | 'received'; 
    notes?: string;
    createdBy: string; 
    // New accounting fields
    invoiceNumber?: string;
    invoiceDate?: string;
}

// New Interfaces for Multi-Warehouse
export interface Warehouse {
    id: string;
    name: string;
    address?: string;
}

export interface WarehouseTransfer {
    id: string;
    timestamp: number;
    fromWarehouseId: string;
    toWarehouseId: string;
    items: { materialId: string; quantity: number }[];
    status: 'pending' | 'completed';
    notes?: string;
    staffId: string;
}


const MATERIALS_KEY = 'app_inventory_materials_v1';
const BOMS_KEY = 'app_inventory_boms_v1';
const STUDIO_ASSETS_KEY = 'app_studio_assets_v1';
const SUPPLIERS_KEY = 'app_inventory_suppliers_v1';
const TRANSACTIONS_KEY = 'app_inventory_transactions_v1';
const PURCHASE_ORDERS_KEY = 'app_inventory_purchase_orders_v1';
const WAREHOUSES_KEY = 'app_inventory_warehouses_v1';
const WAREHOUSE_TRANSFERS_KEY = 'app_inventory_warehouse_transfers_v1';


const generateCodeFromName = (name: string): string => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase() + Math.floor(Math.random() * 100);
};


// Materials Management
export const getMaterials = (): Material[] => {
    try {
        const json = localStorage.getItem(MATERIALS_KEY);
        let materials: Material[] = json ? JSON.parse(json) : [];
        
        let needsSave = false;
        materials = materials.map(mat => {
            if (!mat.code) {
                mat.code = generateCodeFromName(mat.name);
                needsSave = true;
            }
            // Migration: Convert single stock number to warehouse-based stock
            if (typeof mat.stock === 'number') {
                const defaultWarehouse = getWarehouses()[0];
                mat.stock = { [defaultWarehouse.id]: mat.stock as unknown as number };
                needsSave = true;
            }
            return mat;
        });

        if (needsSave) {
            saveMaterials(materials);
        }

        return materials;
    } catch {
        return [];
    }
};

export const saveMaterials = (materials: Material[]): void => {
    localStorage.setItem(MATERIALS_KEY, JSON.stringify(materials));
};

// BOMs Management
export const getProductBOMs = (): ProductBOM[] => {
    try {
        const json = localStorage.getItem(BOMS_KEY);
        return json ? JSON.parse(json) : [];
    } catch {
        return [];
    }
};

export const saveProductBOMs = (boms: ProductBOM[]): void => {
    localStorage.setItem(BOMS_KEY, JSON.stringify(boms));
};

// --- Studio Assets (Dresses, Suits, Props) ---
const initialStudioAssets: StudioAsset[] = [
    {
        id: 'asset-1',
        name: 'Váy cưới công chúa trễ vai',
        code: 'VC001',
        category: 'Váy cưới',
        size: 'M',
        imageUrl: 'https://i.imgur.com/example_dress1.jpg',
        status: 'Sẵn sàng',
        history: []
    },
    {
        id: 'asset-2',
        name: 'Vest chú rể Hàn Quốc',
        code: 'VEST001',
        category: 'Vest',
        size: 'L',
        imageUrl: 'https://i.imgur.com/example_vest1.jpg',
        status: 'Đang thuê',
        history: [
            { timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, action: 'Cho thuê', relatedCustomerId: 'cust-3' }
        ]
    }
];

export const getStudioAssets = (): StudioAsset[] => {
    try {
        const json = localStorage.getItem(STUDIO_ASSETS_KEY);
        if(json) {
            return JSON.parse(json);
        }
        saveStudioAssets(initialStudioAssets);
        return initialStudioAssets;
    } catch {
        return initialStudioAssets;
    }
};

export const saveStudioAssets = (assets: StudioAsset[]): void => {
    localStorage.setItem(STUDIO_ASSETS_KEY, JSON.stringify(assets));
};

export const addAssetLog = (assetId: string, log: Omit<AssetLog, 'timestamp'>): void => {
    const assets = getStudioAssets();
    const updatedAssets = assets.map(asset => {
        if (asset.id === assetId) {
            const newLog: AssetLog = {
                ...log,
                timestamp: Date.now(),
            };
            return {
                ...asset,
                history: [newLog, ...asset.history],
            };
        }
        return asset;
    });
    saveStudioAssets(updatedAssets);
};


// --- Supplier Management ---
export const getSuppliers = (): Supplier[] => {
    try {
        const json = localStorage.getItem(SUPPLIERS_KEY);
        return json ? JSON.parse(json) : [];
    } catch { return []; }
};

export const saveSuppliers = (suppliers: Supplier[]): void => {
    localStorage.setItem(SUPPLIERS_KEY, JSON.stringify(suppliers));
};

// --- Inventory Transaction Management ---
export const getInventoryTransactions = (): InventoryTransaction[] => {
    try {
        const json = localStorage.getItem(TRANSACTIONS_KEY);
        const transactions = json ? JSON.parse(json) : [];
        return transactions.sort((a: InventoryTransaction, b: InventoryTransaction) => b.timestamp - a.timestamp);
    } catch { return []; }
};

export const saveInventoryTransactions = (transactions: InventoryTransaction[]): void => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const addInventoryTransaction = (transactionData: Omit<InventoryTransaction, 'id' | 'timestamp'>): void => {
    const transactions = getInventoryTransactions();
    const newTransaction: InventoryTransaction = {
        ...transactionData,
        id: `trans-${Date.now()}`,
        timestamp: Date.now(),
    };
    transactions.unshift(newTransaction);
    saveInventoryTransactions(transactions);

    // Atomically update stock only for relevant transaction types
    if (newTransaction.materialId && newTransaction.warehouseId && !['outbound_payment'].includes(newTransaction.type)) {
        const materials = getMaterials();
        const materialIndex = materials.findIndex(m => m.id === newTransaction.materialId);
        if (materialIndex !== -1) {
            if (!materials[materialIndex].stock) {
                materials[materialIndex].stock = {};
            }
            const currentStock = materials[materialIndex].stock[newTransaction.warehouseId] || 0;
            materials[materialIndex].stock[newTransaction.warehouseId] = currentStock + newTransaction.quantity;
            saveMaterials(materials);
        }
    }


    // Update supplier debt
    if (newTransaction.supplierId) {
        const suppliers = getSuppliers();
        const supplierIndex = suppliers.findIndex(s => s.id === newTransaction.supplierId);
        if (supplierIndex !== -1) {
            if (newTransaction.type === 'inbound') {
                const taxMultiplier = 1 + ((newTransaction.taxRate || 0) / 100);
                suppliers[supplierIndex].debtAmount += newTransaction.quantity * newTransaction.unitPrice * taxMultiplier;
            } else if (newTransaction.type === 'outbound_payment') {
                suppliers[supplierIndex].debtAmount -= newTransaction.unitPrice;
            }
            saveSuppliers(suppliers);
        }
    }
};


// --- Purchase Order Management ---
export const getPurchaseOrders = (): PurchaseOrder[] => {
    try {
        const json = localStorage.getItem(PURCHASE_ORDERS_KEY);
        const orders = json ? JSON.parse(json) : [];
        return orders.sort((a: PurchaseOrder, b: PurchaseOrder) => b.timestamp - a.timestamp);
    } catch { return []; }
};

export const savePurchaseOrders = (orders: PurchaseOrder[]): void => {
    localStorage.setItem(PURCHASE_ORDERS_KEY, JSON.stringify(orders));
};

export const addPurchaseOrder = (orderData: Omit<PurchaseOrder, 'id' | 'timestamp'>): void => {
    const orders = getPurchaseOrders();
    const newOrder: PurchaseOrder = {
        ...orderData,
        id: `po-${Date.now()}`,
        timestamp: Date.now(),
    };
    orders.unshift(newOrder);
    savePurchaseOrders(orders);
};

export const updatePurchaseOrder = (orderId: string, updates: Partial<PurchaseOrder>): void => {
    const orders = getPurchaseOrders();
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, ...updates } : o);
    savePurchaseOrders(updatedOrders);
};

// --- Warehouse Management ---
export const getWarehouses = (): Warehouse[] => {
    try {
        const json = localStorage.getItem(WAREHOUSES_KEY);
        if (json) {
            const parsed = JSON.parse(json);
            if (Array.isArray(parsed) && parsed.length > 0) {
                return parsed;
            }
        }
        const defaultWarehouse = [{ id: 'default-warehouse', name: 'Kho Chính' }];
        saveWarehouses(defaultWarehouse);
        return defaultWarehouse;
    } catch {
        return [{ id: 'default-warehouse', name: 'Kho Chính' }];
    }
};

export const saveWarehouses = (warehouses: Warehouse[]): void => {
    localStorage.setItem(WAREHOUSES_KEY, JSON.stringify(warehouses));
};

// --- Warehouse Transfer Management ---
export const getWarehouseTransfers = (): WarehouseTransfer[] => {
    try {
        const json = localStorage.getItem(WAREHOUSE_TRANSFERS_KEY);
        return json ? JSON.parse(json).sort((a: WarehouseTransfer, b: WarehouseTransfer) => b.timestamp - a.timestamp) : [];
    } catch { return []; }
};

export const saveWarehouseTransfers = (transfers: WarehouseTransfer[]): void => {
    localStorage.setItem(WAREHOUSE_TRANSFERS_KEY, JSON.stringify(transfers));
};

export const addWarehouseTransfer = (transferData: Omit<WarehouseTransfer, 'id' | 'timestamp' | 'status'>): void => {
    const transfers = getWarehouseTransfers();
    const newTransfer: WarehouseTransfer = {
        ...transferData,
        id: `xfer-${Date.now()}`,
        timestamp: Date.now(),
        status: 'pending'
    };
    transfers.unshift(newTransfer);
    saveWarehouseTransfers(transfers);

    // Create outbound transactions for each item from the source warehouse
    transferData.items.forEach(item => {
        const material = getMaterials().find(m => m.id === item.materialId);
        addInventoryTransaction({
            materialId: item.materialId,
            type: 'transfer_out',
            quantity: -Math.abs(item.quantity),
            unitPrice: material?.unitPrice || 0,
            notes: `Chuyển đến kho ID: ${transferData.toWarehouseId}. Lệnh: ${newTransfer.id}`,
            staffId: transferData.staffId,
            warehouseId: transferData.fromWarehouseId,
        });
    });
};

export const completeWarehouseTransfer = (transferId: string, staffId: string): void => {
    const transfers = getWarehouseTransfers();
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer || transfer.status === 'completed') return;

    transfer.status = 'completed';
    saveWarehouseTransfers(transfers);

    // Create inbound transactions for each item to the destination warehouse
    transfer.items.forEach(item => {
        const material = getMaterials().find(m => m.id === item.materialId);
        addInventoryTransaction({
            materialId: item.materialId,
            type: 'transfer_in',
            quantity: Math.abs(item.quantity),
            unitPrice: material?.unitPrice || 0,
            notes: `Nhận từ kho ID: ${transfer.fromWarehouseId}. Lệnh: ${transfer.id}`,
            staffId: staffId,
            warehouseId: transfer.toWarehouseId,
        });
    });
};