
import { ServicePackage, Contract, Payment } from './components/studio-management/contracts/types';

const PACKAGES_KEY = 'app_studio_packages_v1';
const CONTRACTS_KEY = 'app_studio_contracts_v1';

const initialPackages: ServicePackage[] = [
    {
        id: 'pkg-prewedding-hanoi',
        name: 'Gói chụp Pre-wedding Hà Nội',
        price: 8900000,
        items: [
            '01 váy cưới thiết kế cao cấp',
            '01 vest chú rể nhập khẩu',
            'Trang điểm và làm tóc theo concept',
            '01 album photobook 30x30 (20 trang)',
            '01 ảnh cổng 60x90 tráng gương',
            'Toàn bộ file ảnh gốc',
        ]
    },
    {
        id: 'pkg-phong-su-cuoi',
        name: 'Gói quay Phóng sự cưới',
        price: 12500000,
        items: [
            'Ekip 2 máy quay chuyên nghiệp',
            'Quay trong ngày ăn hỏi và ngày cưới',
            'Dựng 1 phim highlight (3-5 phút)',
            'Dựng 1 phim full (20-30 phút)',
            'Sử dụng flycam cho các cảnh ngoại cảnh',
        ]
    }
];

const initialContracts: Contract[] = [
    {
        id: 'contract-1',
        customerId: 'cust-3', // Lê Hoàng Cường
        customerName: 'Lê Hoàng Cường',
        servicePackageIds: ['pkg-prewedding-hanoi'],
        additionalItems: [{ description: 'Thuê thêm 1 váy dạ hội', price: 1500000 }],
        discount: 500000,
        totalAmount: 9900000,
        depositAmount: 3000000,
        status: 'deposit_pending',
        createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    }
];


// --- Service Packages ---
export const getServicePackages = (): ServicePackage[] => {
    try {
        const json = localStorage.getItem(PACKAGES_KEY);
        if (json) {
            return JSON.parse(json);
        }
        saveServicePackages(initialPackages);
        return initialPackages;
    } catch (e) {
        return initialPackages;
    }
};

export const saveServicePackages = (packages: ServicePackage[]): void => {
    try {
        localStorage.setItem(PACKAGES_KEY, JSON.stringify(packages));
    } catch (e) {
        console.error("Failed to save service packages.", e);
    }
};


// --- Contracts ---
export const getContracts = (): Contract[] => {
    try {
        const json = localStorage.getItem(CONTRACTS_KEY);
        if (json) {
            return JSON.parse(json);
        }
        saveContracts(initialContracts);
        return initialContracts;
    } catch (e) {
        return initialContracts;
    }
};

export const saveContracts = (contracts: Contract[]): void => {
    try {
        localStorage.setItem(CONTRACTS_KEY, JSON.stringify(contracts));
    } catch (e) {
        console.error("Failed to save contracts.", e);
    }
};

// Fix: Implement and export the missing addPaymentToContract function.
export const addPaymentToContract = (contractId: string, payment: Payment): Contract[] => {
    const contracts = getContracts();
    const updatedContracts = contracts.map(c => {
        if (c.id === contractId) {
            const newPayments = [...(c.payments || []), payment];
            return { ...c, payments: newPayments };
        }
        return c;
    });
    saveContracts(updatedContracts);
    return updatedContracts;
};
