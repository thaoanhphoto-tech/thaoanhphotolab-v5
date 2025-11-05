
// pricingStore.ts
import { services } from './data/serviceData';
import { User } from './userStore';

export interface PriceEntry {
    originalPrice: number;
    sellingPrice: number;
}

export interface PricingTable {
    retail: Record<string, PriceEntry>;
    wholesale: Record<string, PriceEntry>;
}

const PRICING_STORAGE_KEY = 'app_pricing_v1';

// Function to initialize prices if they don't exist
const initializePrices = (): PricingTable => {
    const retail: Record<string, PriceEntry> = {};
    const wholesale: Record<string, PriceEntry> = {};

    services.forEach(service => {
        service.products?.forEach(product => {
            const entry: PriceEntry = {
                originalPrice: product.originalPrice ?? product.price,
                sellingPrice: product.price,
            };
            retail[product.id] = entry;
            // By default, wholesale is same as retail. Admin can adjust it later.
            wholesale[product.id] = { ...entry };
        });
    });

    return { retail, wholesale };
};

// Load prices from localStorage or initialize
export const loadPrices = (): PricingTable => {
    try {
        const storedPrices = localStorage.getItem(PRICING_STORAGE_KEY);
        if (storedPrices) {
            const parsed = JSON.parse(storedPrices) as PricingTable;
            // Simple validation to check if structure is correct
            if (parsed.retail && parsed.wholesale) {
                return parsed;
            }
        }
        // If not found or invalid, initialize
        const initial = initializePrices();
        savePrices(initial);
        return initial;
    } catch (e) {
        console.error("Failed to load prices, initializing.", e);
        const initial = initializePrices();
        savePrices(initial);
        return initial;
    }
};

// Save prices to localStorage
export const savePrices = (prices: PricingTable): void => {
    try {
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(prices));
    } catch (e) {
        console.error("Failed to save prices.", e);
    }
};

// The core function to get the right price for a user
export const getProductPrice = (productId: string, user: User | null, prices: PricingTable): PriceEntry => {
    const defaultPrice = { originalPrice: 0, sellingPrice: 0 };

    if (user && user.isVipCustomer) {
        return prices.wholesale[productId] || prices.retail[productId] || defaultPrice;
    }
    
    return prices.retail[productId] || defaultPrice;
};
