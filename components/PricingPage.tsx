

import React from 'react';
import { User, PlanId } from '../userStore';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import type { PageState } from '../App';
import { PlanDetailsTable } from '../planStore';

interface PricingPageProps {
    currentUser: User | null;
    onPurchaseRequest: (planId: PlanId) => void;
    navigateTo: (state: PageState) => void;
    plans: PlanDetailsTable;
}

export const PricingPage: React.FC<PricingPageProps> = ({ currentUser, onPurchaseRequest, navigateTo, plans }) => {
    const plansToShow: PlanId[] = ['free', 'id_restore', 'concept', 'family', 'pro', 'vip_pro', 'vip'];

    return (
        <main className="container mx-auto px-4 py-12 sm:py-20">
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 dark:text-zinc-100">
                    Chọn Gói Phù Hợp Với Bạn
                </h1>
                <p className="mt-4 text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto">
                    Mở khóa các công cụ AI mạnh mẽ để nâng tầm tác phẩm của bạn.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                {plansToShow.map(planId => {
                    const plan = plans[planId];
                    if (!plan) return null;

                    const isOwned = currentUser?.purchasedPlans.includes(planId);
                    const [priceValue, pricePeriod] = plan.price.split('/');

                    return (
                        <div 
                            key={plan.name}
                            className={`relative bg-white dark:bg-zinc-800/50 p-8 rounded-2xl shadow-lg border-2 flex flex-col transition-all duration-300 ${plan.isPopular ? 'border-purple-500' : 'border-slate-200 dark:border-zinc-700'}`}
                        >
                            {plan.isPopular && (
                                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                                    <span className="bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full uppercase">Phổ biến nhất</span>
                                </div>
                            )}
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h2>
                            <p className="mt-2 text-slate-500 dark:text-zinc-400 h-10">{plan.description}</p>
                            <p className="mt-6">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{priceValue}</span>
                                {pricePeriod && <span className="text-lg font-medium text-slate-500 dark:text-zinc-400"> / {pricePeriod}</span>}
                            </p>

                            <ul className="mt-8 space-y-4 text-slate-600 dark:text-zinc-300 flex-grow">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircleIcon className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-10">
                                {isOwned ? (
                                    <button disabled className="w-full py-3 px-4 bg-slate-300 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400 font-bold rounded-lg cursor-not-allowed">
                                        Đã sở hữu
                                    </button>
                                ) : (
                                     <button 
                                        onClick={() => onPurchaseRequest(planId)}
                                        className={`w-full py-3 px-4 font-bold rounded-lg transition-colors ${
                                            plan.isPopular 
                                            ? 'bg-purple-600 text-white hover:bg-purple-700' 
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {currentUser ? 'Mua Gói Này' : 'Đăng nhập để mua'}
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
};
