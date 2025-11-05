
export interface CartItem {
    productId: string;
    quantity: number;
}

const CART_STORAGE_KEY = 'app_shopping_cart_v1';

export const getCart = (): CartItem[] => {
    try {
        const cartJson = localStorage.getItem(CART_STORAGE_KEY);
        return cartJson ? JSON.parse(cartJson) : [];
    } catch (e) {
        return [];
    }
};

export const saveCart = (cart: CartItem[]): void => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage.", e);
    }
};

export const addToCart = (productId: string, quantity: number): CartItem[] => {
    const cart = getCart();
    const existingItemIndex = cart.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({ productId, quantity });
    }

    saveCart(cart);
    return cart;
};

export const updateCartQuantity = (productId: string, quantity: number): CartItem[] => {
    const cart = getCart();
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
        if (quantity > 0) {
            cart[itemIndex].quantity = quantity;
        } else {
            cart.splice(itemIndex, 1);
        }
    }

    saveCart(cart);
    return cart;
};

export const removeFromCart = (productId: string): CartItem[] => {
    const cart = getCart();
    const newCart = cart.filter(item => item.productId !== productId);
    saveCart(newCart);
    return newCart;
};

export const clearCart = (): void => {
    saveCart([]);
};
