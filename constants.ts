
import type { Background, Outfit, Hairstyle, AspectRatio, GenderOption, RetouchOption, CountryTemplate, DocumentType, LightingOption, ExpressionOption } from './types';

export const BACKGROUNDS: Background[] = [
  { id: 'white', name: 'Trắng', tailwindColor: 'bg-white' },
  { id: 'light-gray', name: 'Xám nhạt', tailwindColor: 'bg-slate-200' },
  { id: 'light-blue', name: 'Xanh nhạt', tailwindColor: 'bg-blue-100' },
  { id: 'xanh-lam-1', name: 'Xanh lam 1', tailwindColor: 'bg-xanh-lam-1' },
  { id: 'off-white', name: 'Trắng ngà', tailwindColor: 'bg-slate-50' },
  { id: 'custom-color', name: 'Tùy chọn', tailwindColor: '' },
];

export const OUTFITS: Outfit[] = [
  { id: 'none', name: 'Giữ nguyên trang phục', previewUrl: 'https://i.imgur.com/N2a2m4J.png' },
  // Nữ
  { id: 'womens-blouse-white', name: "Áo sơ mi trắng", previewUrl: 'https://i.imgur.com/ETpE4Wa.png', gender: 'Nữ', documentTypes: ['passport-visa', 'cccd', 'student', 'professional'] },
  { id: 'womens-blouse-blue', name: "Sơ mi xanh pastel", previewUrl: 'https://i.imgur.com/plWq8aT.png', gender: 'Nữ', documentTypes: ['student', 'cccd'] },
  { id: 'womens-blazer-black', name: "Áo blazer đen", previewUrl: 'https://i.imgur.com/a4YfP0t.png', gender: 'Nữ', documentTypes: ['passport-visa', 'professional'] },
  { id: 'womens-suit-navy', name: "Vest xanh navy", previewUrl: 'https://i.imgur.com/8h4A2T6.png', gender: 'Nữ', documentTypes: ['passport-visa', 'professional'] },
  { id: 'womens-dress-black', name: "Váy công sở đen", previewUrl: 'https://i.imgur.com/tV3Zw4n.png', gender: 'Nữ', documentTypes: ['professional'] },
  { id: 'womens-turtleneck-black', name: "Áo len cổ lọ", previewUrl: 'https://i.imgur.com/sY7aD2R.png', gender: 'Nữ' },
  { id: 'womens-ao-dai-white', name: "Áo dài trắng", previewUrl: 'https://i.imgur.com/83J2b7W.png', gender: 'Nữ', documentTypes: ['student'] },
  { id: 'womens-ao-dai-pink', name: "Áo dài hồng", previewUrl: 'https://i.imgur.com/2A4ASVA.png', gender: 'Nữ', documentTypes: ['student'] },
  { id: 'womens-ao-dai-blue', name: "Áo dài xanh", previewUrl: 'https://i.imgur.com/5B1d5zL.png', gender: 'Nữ', documentTypes: ['student'] },
  { id: 'womens-graduation-gown', name: "Áo tốt nghiệp", previewUrl: 'https://i.imgur.com/tY7zSAQ.png', gender: 'Nữ', documentTypes: ['student', 'professional'] },

  // Nam
  { id: 'mens-shirt-white', name: "Áo sơ mi trắng", previewUrl: 'https://i.imgur.com/7P7Lqg0.png', gender: 'Nam', documentTypes: ['passport-visa', 'cccd', 'student', 'professional'] },
  { id: 'mens-shirt-blue', name: "Áo sơ mi xanh", previewUrl: 'https://i.imgur.com/8N3C7t3.png', gender: 'Nam', documentTypes: ['passport-visa', 'cccd', 'student'] },
  { id: 'mens-polo-white', name: "Áo polo trắng", previewUrl: 'https://i.imgur.com/Q0AS6G9.png', gender: 'Nam', documentTypes: ['student', 'cccd'] },
  { id: 'mens-suit-black', name: "Vest đen", previewUrl: 'https://i.imgur.com/8n22aSU.png', gender: 'Nam', documentTypes: ['passport-visa', 'professional'] },
  { id: 'mens-suit-navy', name: "Vest xanh navy", previewUrl: 'https://i.imgur.com/DDA62yT.png', gender: 'Nam', documentTypes: ['passport-visa', 'professional'] },
  { id: 'mens-suit-beige', name: "Vest màu be", previewUrl: 'https://i.imgur.com/eP4zXf5.png', gender: 'Nam', documentTypes: ['professional'] },
  { id: 'mens-sweater-vest', name: "Vest gile len", previewUrl: 'https://i.imgur.com/M6Lg4gJ.png', gender: 'Nam', documentTypes: ['student'] },
  { id: 'mens-sweater-gray', name: "Áo len xám", previewUrl: 'https://i.imgur.com/x4xYmUn.png', gender: 'Nam' },
  { id: 'mens-graduation-gown', name: "Áo tốt nghiệp", previewUrl: 'https://i.imgur.com/kP4Ff8v.png', gender: 'Nam', documentTypes: ['student', 'professional'] },
];


export const GENDERS: GenderOption[] = [
  { id: 'Nữ', name: 'Nữ' },
  { id: 'Nam', name: 'Nam' }
];

export const HAIRSTYLES: Hairstyle[] = [
    { id: 'none', name: 'Giữ nguyên', previewUrl: 'https://i.imgur.com/N2a2m4J.png' }, // No gender, available for both
    // Nữ
    { id: 'womens-long-wavy', name: 'Tóc dài gợn sóng', previewUrl: 'https://i.imgur.com/p1f7M5M.png', gender: 'Nữ' },
    { id: 'womens-long-straight', name: 'Tóc dài thẳng', previewUrl: 'https://i.imgur.com/oZnO5Q9.png', gender: 'Nữ' },
    { id: 'womens-short-bob', name: 'Tóc bob ngắn', previewUrl: 'https://i.imgur.com/uHo4m8y.png', gender: 'Nữ' },
    { id: 'womens-pixie-edgy', name: 'Tóc tém pixie cá tính', previewUrl: 'https://i.imgur.com/8B9X2vM.png', gender: 'Nữ' },
    { id: 'womens-curly-layers', name: 'Tóc layer uốn xoăn', previewUrl: 'https://i.imgur.com/5A0t2zG.png', gender: 'Nữ' },
    { id: 'womens-french-bob', name: 'Tóc bob kiểu Pháp', previewUrl: 'https://i.imgur.com/tH7zX6Y.png', gender: 'Nữ' },
    { id: 'womens-wolf-cut', name: 'Tóc wolf-cut hiện đại', previewUrl: 'https://i.imgur.com/mR6gN9K.png', gender: 'Nữ' },
    // Nam
    { id: 'mens-short', name: 'Tóc ngắn gọn gàng', previewUrl: 'https://i.imgur.com/jC1N54F.png', gender: 'Nam' },
    { id: 'mens-side-part', name: 'Tóc rẽ ngôi', previewUrl: 'https://i.imgur.com/o2pYH8W.png', gender: 'Nam' },
    { id: 'mens-light-perm', name: 'Tóc uốn xoăn nhẹ', previewUrl: 'https://i.imgur.com/9n9s8Z2.png', gender: 'Nam' },
    { id: 'mens-two-block', name: 'Tóc two-block layer', previewUrl: 'https://i.imgur.com/6E2wJ5H.png', gender: 'Nam' },
    { id: 'mens-eboy-curtain', name: 'Tóc E-boy vuốt rủ', previewUrl: 'https://i.imgur.com/sK5p8zF.png', gender: 'Nam' },
    { id: 'mens-buzz-cut', name: 'Tóc buzz cut', previewUrl: 'https://i.imgur.com/yF5wE4R.png', gender: 'Nam' },
];

export const RETOUCH_OPTIONS: RetouchOption[] = [
  { id: 'none', name: 'Không', description: 'Giữ nguyên làn da như ảnh gốc.' },
  { id: 'gentle', name: 'Nhẹ nhàng', description: 'Làm mịn da nhẹ và đều màu, giữ lại kết cấu da tự nhiên.' },
  { id: 'professional', name: 'Chuyên nghiệp', description: 'Làm mịn da, tạo khối và bắt sáng để làm nổi bật đường nét.' }
];

export const EXPRESSION_OPTIONS: ExpressionOption[] = [
  { id: 'none', name: 'Giữ nguyên', description: 'Không thay đổi biểu cảm khuôn mặt.' },
  { id: 'slight-smile', name: 'Cười mỉm nhẹ', description: 'Thêm một nụ cười nhẹ, tự nhiên và thân thiện.' },
  { id: 'bright-smile', name: 'Cười tươi', description: 'Tạo một nụ cười rạng rỡ, có thể hở răng.' },
  { id: 'neutral', name: 'Nghiêm túc', description: 'Đảm bảo biểu cảm hoàn toàn trung tính, phù hợp với giấy tờ nghiêm ngặt.' }
];

export const ASPECT_RATIOS: AspectRatio[] = [
    { id: '3x4', name: '3x4' },
    { id: '4x6', name: '4x6' },
    { id: '2x3', name: '2x3' },
    { id: '2x2', name: '2x2 (Hộ chiếu Mỹ)' },
    { id: '3.5x4.5cm', name: '3.5cm x 4.5cm (Schengen)' },
    { id: 'original', name: 'Ảnh gốc' },
];

export const COUNTRY_TEMPLATES: CountryTemplate[] = [
  { id: 'custom', name: 'Tùy chỉnh', backgroundId: '', aspectRatioId: ''},
  { id: 'vn-cccd', name: 'Việt Nam (CCCD/Hộ chiếu)', backgroundId: 'light-blue', aspectRatioId: '4x6'},
  { id: 'us-passport', name: 'Mỹ (Hộ chiếu/Visa)', backgroundId: 'white', aspectRatioId: '2x2'},
  { id: 'schengen-visa', name: 'Châu Âu (Visa Schengen)', backgroundId: 'light-gray', aspectRatioId: '3.5x4.5cm'},
];

export const DOCUMENT_TYPES: DocumentType[] = [
  { id: 'all', name: 'Tất cả trang phục' },
  { id: 'passport-visa', name: 'Hộ chiếu & Visa' },
  { id: 'cccd', name: 'CCCD/CMND' },
  { id: 'student', name: 'Thẻ sinh viên' },
  { id: 'professional', name: 'Hồ sơ chuyên nghiệp' },
];

export const LIGHTING_OPTIONS: LightingOption[] = [
  { id: 'on', name: 'Bật' },
  { id: 'off', name: 'Tắt' },
];

// New constants for Old Photo Restorer
export const OLD_PHOTO_OUTFITS: Outfit[] = [
  { id: 'none', name: 'Giữ nguyên', previewUrl: 'https://via.placeholder.com/40' },
  { id: 'ao-dai-xua-nu', name: 'Áo dài xưa', gender: 'Nữ', previewUrl: 'https://via.placeholder.com/40' },
  { id: 'vest-co-dien-nu', name: 'Vest cổ điển', gender: 'Nữ', previewUrl: 'https://via.placeholder.com/40' },
  { id: 'ao-dai-khan-dong-nam', name: 'Áo dài khăn đóng', gender: 'Nam', previewUrl: 'https://via.placeholder.com/40' },
  { id: 'vest-co-dien-nam', name: 'Vest cổ điển', gender: 'Nam', previewUrl: 'https://via.placeholder.com/40' },
];

export const OLD_PHOTO_HAIRSTYLES: Hairstyle[] = [
  { id: 'none', name: 'Giữ nguyên', previewUrl: 'https://via.placeholder.com/40' },
  { id: 'toc-bui-cao-nu', name: 'Tóc búi cao', gender: 'Nữ', previewUrl: 'https://via.placeholder.com/40' },
  { id: 'toc-re-ngoi-nam', name: 'Tóc rẽ ngôi', gender: 'Nam', previewUrl: 'https://via.placeholder.com/40' },
];

export const OLD_PHOTO_ACCESSORIES: { id: string, name: string }[] = [
    { id: 'khan-xep', name: 'Khăn xếp' },
    { id: 'vong-tai', name: 'Vòng tai' },
    { id: 'day-chuyen', name: 'Dây chuyền' },
    { id: 'vong-cuom-ngoc', name: 'Vòng cườm, ngọc' },
];