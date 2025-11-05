import { Customer, Interaction } from './components/studio-management/crm/types';

const getCrmStorageKey = (ownerId: string) => `app_crm_customers_${ownerId}`;

const createInitialCustomers = (ownerId: string): Customer[] => {
    // Only create initial customers for the admin user
    if (ownerId !== 'admin-default-001') {
        return [];
    }
    return [
        {
            id: 'cust-1',
            name: 'Nguyễn Văn An',
            phone: '0901234567',
            zalo: '0901234567',
            address: '123 Đường ABC, Quận 1, TP. HCM',
            source: 'Facebook Ads',
            assignedTo: 'Trần Thị Bích',
            status: 'new',
            interactions: [
                { id: 'int-1', timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, type: 'note', content: 'Khách hàng quan tâm gói chụp cưới ngoại cảnh Đà Lạt.', staffName: 'Admin' }
            ],
            createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        },
        {
            id: 'cust-2',
            name: 'Trần Thị Bích',
            phone: '0987654321',
            zalo: '0987654321',
            address: '456 Đường XYZ, Quận 3, TP. HCM',
            source: 'Zalo',
            assignedTo: 'Trần Thị Bích',
            status: 'consulting',
            interactions: [
                 { id: 'int-2', timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, type: 'call', content: 'Đã gọi tư vấn, gửi báo giá qua Zalo. Khách hẹn trả lời.', staffName: 'Trần Thị Bích' }
            ],
            createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
        },
         {
            id: 'cust-3',
            name: 'Lê Hoàng Cường',
            phone: '0912345678',
            zalo: '0912345678',
            address: '789 Đường LMN, TP. Thủ Đức',
            source: 'Giới thiệu',
            assignedTo: 'Admin',
            status: 'closed',
            interactions: [],
            createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        }
    ];
};

export const getCustomers = (ownerId: string): Customer[] => {
    try {
        const json = localStorage.getItem(getCrmStorageKey(ownerId));
        if (json) {
            return JSON.parse(json);
        }
        const initialCustomers = createInitialCustomers(ownerId);
        saveCustomers(ownerId, initialCustomers);
        return initialCustomers;
    } catch (e) {
        return createInitialCustomers(ownerId);
    }
};

export const saveCustomers = (ownerId: string, customers: Customer[]): void => {
    try {
        localStorage.setItem(getCrmStorageKey(ownerId), JSON.stringify(customers));
    } catch (e) {
        console.error("Failed to save CRM customers.", e);
    }
};

export const addCustomer = (ownerId: string, customer: Omit<Customer, 'id' | 'createdAt' | 'interactions'>): Customer => {
    const customers = getCustomers(ownerId);
    const newCustomer: Customer = {
        ...customer,
        id: `cust-${Date.now()}`,
        createdAt: Date.now(),
        interactions: [],
    };
    customers.unshift(newCustomer);
    saveCustomers(ownerId, customers);
    return newCustomer;
};

export const updateCustomer = (ownerId: string, updatedCustomer: Customer): Customer[] => {
    let customers = getCustomers(ownerId);
    customers = customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c);
    saveCustomers(ownerId, customers);
    return customers;
};

export const deleteCustomer = (ownerId: string, customerId: string): Customer[] => {
    let customers = getCustomers(ownerId);
    customers = customers.filter(c => c.id !== customerId);
    saveCustomers(ownerId, customers);
    return customers;
};