import { services } from './data/serviceData';

export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice: number | null;
    imageUrl: string;
    description?: string;
    frameInfo?: {
        id: string;
        name: string;
    };
    isHot?: boolean;
    gallery?: string[];
    contentSections?: any[];
    // Add serviceId and serviceName for context
    serviceId: string;
    serviceName: string;
    cogs?: number; // Cost of Goods Sold
}

const PRODUCT_STORAGE_KEY = 'app_products_v1';
const PRODUCT_BASES_STORAGE_KEY = 'app_product_bases_v1';

const initializeProducts = (): Product[] => {
    const allProducts: Product[] = [];
    services.forEach(service => {
        service.products?.forEach(product => {
            allProducts.push({
                ...product,
                serviceId: service.id,
                serviceName: service.name,
            });
        });
    });
    return allProducts;
};

export const getProducts = (): Product[] => {
    try {
        const productsJson = localStorage.getItem(PRODUCT_STORAGE_KEY);
        if (productsJson) {
            // Basic validation
            const parsed = JSON.parse(productsJson);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        }
        const initialProducts = initializeProducts();
        saveProducts(initialProducts);
        return initialProducts;
    } catch (e) {
        console.error("Failed to load products, initializing.", e);
        const initialProducts = initializeProducts();
        saveProducts(initialProducts);
        return initialProducts;
    }
};

export const saveProducts = (products: Product[]): void => {
    try {
        localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
        console.error("Failed to save products.", e);
    }
};

const DEFAULT_PRODUCT_BASES = [
    'ảnh mica bọc viền 12ly',
    'ảnh mica 9ly',
    'ảnh mica fomek 10ly',
    'ảnh mica fomek 15ly',
    'ảnh mica fomek 5ly',
    'ảnh mica fomek 3ly',
    'ảnh gỗ lụa',
    'khung ảnh composite'
];


export const getProductBases = (): string[] => {
    try {
        const basesJson = localStorage.getItem(PRODUCT_BASES_STORAGE_KEY);
        if (basesJson) {
            const parsed = JSON.parse(basesJson);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        saveProductBases(DEFAULT_PRODUCT_BASES);
        return DEFAULT_PRODUCT_BASES;
    } catch (e) {
        console.error("Failed to load product bases.", e);
        return DEFAULT_PRODUCT_BASES;
    }
};

export const saveProductBases = (bases: string[]): void => {
    try {
        localStorage.setItem(PRODUCT_BASES_STORAGE_KEY, JSON.stringify(bases));
    } catch (e) {
        console.error("Failed to save product bases.", e);
    }
};