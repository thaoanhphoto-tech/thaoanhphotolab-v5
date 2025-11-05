import React from 'react';
import { EditableText } from './EditableText';
import { EditableImage } from './EditableImage';
import { promotions } from '../data/promotionData';
import type { PageState } from '../App';

interface PromotionsPageProps {
  navigateTo: (state: PageState) => void;
  isAdminMode: boolean;
}

export const PromotionsPage: React.FC<PromotionsPageProps> = ({ navigateTo, isAdminMode }) => {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-950 text-slate-800 dark:text-zinc-200">
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12">
          <EditableText
            as="h1"
            contentKey="promotions_main_title"
            defaultValue="🔥 Chương Trình Khuyến Mãi Hấp Dẫn 🔥"
            isAdminMode={isAdminMode}
            className="text-3xl sm:text-4xl font-extrabold text-slate-800 dark:text-zinc-100"
          />
          <EditableText
            as="p"
            contentKey="promotions_main_subtitle"
            defaultValue="Đừng bỏ lỡ các ưu đãi đặc biệt từ Thảo Anh Photo Lab!"
            isAdminMode={isAdminMode}
            className="mt-4 text-lg text-slate-500 dark:text-zinc-400 max-w-2xl mx-auto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {promotions.map(promo => (
            <div key={promo.id} className="bg-white dark:bg-zinc-800/50 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-zinc-700 flex flex-col">
              <div className="relative aspect-video">
                <EditableImage
                  contentKey={`promo_${promo.id}_image`}
                  defaultSrc={promo.imageUrl}
                  alt={promo.title}
                  isAdminMode={isAdminMode}
                  className="w-full h-full"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col">
                <EditableText
                  as="h2"
                  contentKey={`promo_${promo.id}_title`}
                  defaultValue={promo.title}
                  isAdminMode={isAdminMode}
                  className="text-xl font-bold text-slate-900 dark:text-white uppercase"
                />
                <EditableText
                  as="p"
                  contentKey={`promo_${promo.id}_description`}
                  defaultValue={promo.description}
                  isAdminMode={isAdminMode}
                  className="mt-2 text-sm text-slate-600 dark:text-zinc-300 flex-grow"
                />
                <EditableText
                  as="p"
                  contentKey={`promo_${promo.id}_duration`}
                  defaultValue={promo.duration}
                  isAdminMode={isAdminMode}
                  className="mt-4 text-xs font-semibold text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded inline-block"
                />
                <div className="mt-6">
                  <button
                    onClick={() => navigateTo({ page: 'service', serviceId: promo.link })}
                    className="w-full px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem Dịch Vụ Ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
