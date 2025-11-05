export interface Promotion {
    id: string;
    title: string;
    description: string;
    duration: string;
    imageUrl: string;
    link: string; // serviceId
}

export const promotions: Promotion[] = [
    {
        id: 'promo-ep-go',
        title: 'GIẢM SỐC 30% IN ẢNH ÉP GỖ',
        description: 'Tri ân khách hàng, Thảo Anh Photo Lab giảm giá cực mạnh cho tất cả các kích thước ảnh ép gỗ (lụa và tráng gương). Chất lượng không đổi, giá siêu hời!',
        duration: 'Áp dụng: 01/09 - 30/09',
        imageUrl: 'https://i.imgur.com/lZ6eP7r.jpeg',
        link: 'in-anh-ep-go',
    },
    {
        id: 'promo-anh-the',
        title: 'IN ẢNH THẺ LẤY NGAY - CHỈ 40K',
        description: 'Cần ảnh thẻ gấp? Chỉ 5 phút có ngay ảnh thẻ chất lượng cao, đúng chuẩn quy định. Chụp tại studio hoặc sử dụng Trợ lý AI để tự tạo ảnh thẻ chuyên nghiệp.',
        duration: 'Áp dụng: Vô thời hạn',
        imageUrl: 'https://i.imgur.com/nQ1h2tF.jpeg',
        link: 'in-anh-kts',
    },
    {
        id: 'promo-combo-100',
        title: 'COMBO 100 ẢNH 10X15 CHỈ 225K',
        description: 'In trọn bộ 100 kỷ niệm của bạn với giá không thể tốt hơn. Ảnh được ép plastic siêu bền, chống nước, không phai màu. Hoàn hảo để làm album hoặc quà tặng.',
        duration: 'Áp dụng: Đến khi có thông báo mới',
        imageUrl: 'https://i.imgur.com/Y1gA3n5.jpeg',
        link: 'in-anh-kts',
    },
    {
        id: 'promo-photobook',
        title: 'THIẾT KẾ PHOTOBOOK MIỄN PHÍ',
        description: 'Lưu giữ câu chuyện của bạn theo cách đặc biệt nhất. Khi đặt in photobook tại Thảo Anh Photo Lab, bạn sẽ được miễn phí hoàn toàn chi phí thiết kế và dàn trang.',
        duration: 'Áp dụng: Cho 100 khách hàng đầu tiên',
        imageUrl: 'https://i.imgur.com/5J3m1mJ.jpeg',
        link: 'photobook',
    }
];
