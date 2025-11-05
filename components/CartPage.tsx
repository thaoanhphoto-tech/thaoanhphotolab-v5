
import React from 'react';
import { CartItem } from '../cartStore';
import { Product } from '../productStore';
import { PageState } from '../App';
import { PricingTable, getProductPrice } from '../pricingStore';
import { User } from '../userStore';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface CartPageProps {
    cart: CartItem[];
    products: Product[];
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onRemove: (productId: string) => void;
    navigateTo: (state: PageState) => void;
    prices: PricingTable;
    currentUser: User | null;
}

const formatPrice = (price: number | null) => {
    if (price === null || price === undefined) return 'N/A';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
}

export const CartPage: React.FC<CartPageProps> = ({ cart, products, onUpdateQuantity, onRemove, navigateTo, prices, currentUser }) => {

    const cartDetails = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        const priceInfo = getProductPrice(product.id, currentUser, prices);
        return {
            ...item,
            product,
            price: priceInfo.sellingPrice,
            lineTotal: priceInfo.sellingPrice * item.quantity,
        };
    }).filter(Boolean) as (CartItem & { product: Product, price: number, lineTotal: number })[];

    const subtotal = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Giỏ hàng của bạn</h1>

            {cartDetails.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-slate-500 dark:text-zinc-400">Giỏ hàng của bạn đang trống.</p>
                    <button onClick={() => navigateTo({ page: 'home' })} className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg">Tiếp tục mua sắm</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cartDetails.map(item => (
                            <div key={item.productId} className="flex items-center gap-4 bg-white dark:bg-zinc-800 p-4 rounded-lg shadow-sm border dark:border-zinc-700">
                                <img src={item.product.imageUrl} alt={item.product.name} className="w-24 h-24 object-cover rounded-md" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold">{item.product.name}</h3>
                                    <p className="text-sm text-slate-500">{formatPrice(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => onUpdateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                                        className="w-16 p-1 border rounded text-center dark:bg-zinc-700"
                                    />
                                </div>
                                <p className="font-semibold w-24 text-right">{formatPrice(item.lineTotal)}</p>
                                <button onClick={() => onRemove(item.productId)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border dark:border-zinc-700 space-y-4">
                            <h2 className="text-xl font-bold">Tổng kết</h2>
                            <div className="flex justify-between">
                                <span>Tạm tính</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                             <div className="flex justify-between font-bold text-lg border-t pt-4">
                                <span>Tổng cộng</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <button className="w-full mt-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Tiến hành Thanh toán</button>
                             <button onClick={() => navigateTo({ page: 'home' })} className="w-full mt-2 text-sm text-center text-blue-600 dark:text-blue-400 font-semibold flex items-center justify-center gap-2">
                                <ArrowLeftIcon className="w-4 h-4" /> Tiếp tục mua sắm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;
