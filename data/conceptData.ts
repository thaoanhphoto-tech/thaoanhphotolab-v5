import type { ConceptCategory, Concept, Pose } from '../components/concept-photo/types';

// Raw data structure from user
interface PromptSet {
  id: string;
  name: string;
  category: string;
  prompts: string[];
  numPortraits?: number;
  isFamilyPrompt?: boolean;
  simpleFamilyMode?: boolean;
}

const promptSets: PromptSet[] = [
// Ảnh trung thu
{
id: 'mid-autumn-festival',
name: 'Ảnh trung thu',
category: 'Lễ Hội & Truyền Thống',
prompts: [
"Ultra realistic portrait of a young Vietnamese woman in traditional red and white floral áo yếm with a long flowing red skirt. She sits gracefully on ancient stone steps, holding a carp-shaped lantern on a stick. She looks softly at the camera with a warm smile, sunset rays glowing through tree leaves in the foreground. Cinematic golden light, 8K UHD, pastel tones, nostalgic and romantic atmosphere.",
"Ultra realistic portrait of a young Vietnamese woman in red floral áo yếm and long red skirt, standing elegantly by an old wooden balcony. She holds a carp lantern on a stick with both hands, gazing sideways with a dreamy expression. Golden sunset shines from behind, forming radiant beams around her hair. Background: blurred greenery, cinematic warm tones, ultra detailed, 8K UHD.",
"Ultra realistic portrait of a young Vietnamese woman wearing a red floral áo yếm and flowing skirt, walking slowly in a temple courtyard at sunset. She holds a carp-shaped lantern gently in one hand, the other hand lifting her skirt slightly while walking. Soft breeze moves her hair, sunset golden rays fill the background. Cinematic soft lighting, sharp focus, romantic atmosphere, 8K UHD.",
"Ultra realistic portrait of a young Vietnamese woman dressed in red and white floral áo yếm with a flowing skirt, sitting gracefully on a rustic wooden chair. She holds the carp lantern close to her chest, tilting her head slightly with a serene smile. Warm sunset light bathes her face, cinematic golden tones, soft romantic atmosphere, ultra sharp 8K UHD.",
"Ultra realistic portrait of a young Vietnamese woman in traditional áo yếm, long red skirt, holding up a carp lantern high with both hands as if admiring it. Her braided hair glows under the golden rays of the setting sun. Background: ancient temple gate in soft blur, cinematic pastel golden light, 8K UHD, sharp focus, pure and nostalgic feeling."
]
},
// Nàng thơ & Hoa Loa Kèn
{
id: 'lily-muse',
name: 'Nàng thơ & Hoa Loa Kèn',
category: 'Nàng Thơ & Studio',
prompts: [
"A 30-year-old Vietnamese woman with a delicate face, smooth white skin, light makeup with rosy cheeks, and natural pink lips. Her long black hair is tied low, with a few strands of hair falling loosely, and a large white lily pinned to her ear. Keeping the same facial expression from the uploaded photo. She wears a modern white off-the-shoulder dress She places one hand close to her face, looking gentle and feminine. In front of her is a branch of blooming white lilies with detailed petals and fresh green leaves. Background: light beige studio backdrop, soft lighting, creating a pure and romantic atmosphere. Style: Ultra realistic, 8K UHD, sharp focus, pastel tones, cinematic soft light.",
"Close-up portrait focusing on her serene expression, with a single white lily gently brushing against her cheek. Her eyes are closed softly. The lighting is ethereal, creating a soft glow on her skin and the flower petals. The background is a simple, out-of-focus light beige. Ultra realistic, cinematic, 8K UHD.",
"She is sitting gracefully, holding a bouquet of white lilies on her lap. She looks down at the flowers with a tender, shy smile. The modern white off-the-shoulder dress drapes elegantly. The studio light mimics a soft morning sunbeam from the side. Romantic and pure atmosphere, 8K UHD.",
"A full-body shot where she stands elegantly, turning slightly to the side, with a backdrop of cascading white lilies. One hand gently touches a lily petal. The lighting creates dramatic yet soft shadows, emphasizing the contours of her dress and figure. Style: high-fashion editorial, ultra realistic, 8K UHD.",
"She is captured in a moment of playful innocence, lightly smelling a white lily held in her hand, with a genuine, happy smile. The focus is sharp on her face and the flower, with the background softly blurred. The lighting is bright and airy. Joyful and romantic mood, 8K UHD, cinematic."
]
},
{
id: 'painter-muse',
name: 'Nàng Thơ hoạ sĩ',
category: 'Nàng Thơ & Studio',
prompts: [
"Ultra realistic, high-definition studio portrait. A beautiful young painter muse is sitting on the floor amidst an abundance of pink flowers like lilies and peonies. She wears a delicate outfit, a crochet hat, and blue gloves, winking playfully at the camera while resting her chin on her hand. An easel stands in the background. The lighting is soft and cinematic, creating a dreamy and artistic atmosphere. 8K UHD, sharp focus, flawless skin.",
"Ultra realistic studio portrait. The painter muse stands in front of her easel, holding a palette and a brush as if about to start a masterpiece. She looks over her shoulder at the camera with a gentle, creative smile. She is surrounded by vases of pink flowers. The lighting is bright and inspiring. 8K UHD, artistic concept.",
"Ultra realistic, close-up beauty shot. The painter muse, wearing her crochet hat, holds a large pink peony close to her face, looking at the camera with soft, dreamy eyes. The background is a soft blur of her art studio and flowers. The lighting is ethereal, highlighting her flawless skin and the delicate flower petals. 8K UHD, romantic.",
"Ultra realistic portrait. The painter muse is kneeling on the floor, carefully arranging flowers on her blank canvas, creating a piece of living art. Her expression is focused and serene. The studio is filled with soft, natural light, creating a calm and creative mood. 8K UHD, candid moment.",
"Ultra realistic studio portrait. The painter muse sits on a rustic wooden stool, looking thoughtfully at the blank canvas on the easel. A single paintbrush is held loosely in her hand. The floor is scattered with pink flower petals. The atmosphere is contemplative and full of potential. 8K UHD, cinematic lighting."
]
},
{
id: 'muse-flower-basket',
name: 'Nàng thơ + Giỏ hoa',
category: 'Nàng Thơ & Studio',
prompts: [
"Ultra realistic, high-definition studio portrait. A beautiful young woman is crouching gracefully. She has long, wavy dark hair with a floral bandana and small flowers tucked behind her ear. She wears a charming patchwork floral dress, lace arm warmers, and white boots. She holds a white woven basket filled with a vibrant mix of colorful flowers. A small yellow watering can sits beside her. She looks at the camera with a gentle, sweet expression. The background is a clean, bright white studio. Lighting is soft and bright, creating a fresh and pure atmosphere. 8K UHD, cinematic, sharp focus.",
"Ultra realistic studio portrait. The young woman is kneeling on the floor, looking down with a tender smile at the colorful flowers in the white basket she's holding. Her long, wavy hair falls gently over her shoulder. The floral patchwork dress, lace arm warmers, and white boots are visible. The bright white studio background is clean and minimalist. The lighting mimics soft, natural morning light, creating a serene and gentle mood. 8K UHD, detailed.",
"Ultra realistic, close-up beauty shot. The young woman looks directly at the camera with a soft, inviting gaze. Her face is framed by her wavy hair, floral bandana, and the flowers she's holding up in the basket. The focus is on her flawless skin and gentle makeup. The background is a soft, out-of-focus white. Ethereal and romantic atmosphere, 8K UHD, cinematic lighting.",
"Ultra realistic, full-body studio portrait. The young woman stands elegantly, holding the basket of flowers with one hand. She looks over her shoulder at the camera with a bright, friendly smile. The patchwork floral dress flows around her. The yellow watering can is on the floor. The background is a minimalist, bright white studio. Cheerful and fresh mood, 8K UHD, sharp focus.",
"Ultra realistic studio portrait. The young woman is sitting on the floor, pretending to water the flowers in her basket with the small yellow watering can. She has a playful, laughing expression. Her floral bandana and patchwork dress create a whimsical vibe. The bright white studio background keeps the focus on her joyful action. Playful and charming atmosphere, 8K UHD, cinematic."
]
},
{
id: 'studio-white-lily',
name: 'Studio với hoa loa kèn trắng',
category: 'Nàng Thơ & Studio',
prompts: [
"Elegant studio beauty portrait of a young woman with dark hair in a bun, white lily flower in her hair, wearing an off-shoulder cream dress, soft natural makeup, flawless porcelain skin, romantic lighting, photorealistic, ultra-detailed, 8K UHD, cinematic.",
"Close-up studio beauty portrait. The young woman looks gently at the camera, her face partially framed by a large white lily. The focus is on her serene expression and the delicate texture of the flower petals. Soft, diffused lighting creates an ethereal glow. Romantic and pure atmosphere, 8K UHD.",
"Profile view studio portrait. The woman is looking away from the camera, her elegant neckline and the bun in her hair are highlighted. A single beam of soft light illuminates her profile. The background is a simple, muted tone to keep the focus on her. Artistic, minimalist, 8K UHD.",
"She is holding a single stem of a white lily, looking down at it with a soft, contemplative smile. The off-shoulder cream dress drapes gracefully. The lighting is soft and warm, creating a tender and intimate mood. Storytelling portrait, 8K UHD.",
"A portrait capturing a moment of quiet joy. She is gently touching the lily in her hair, with a slight, genuine smile. The camera is at eye level, creating a connection with the viewer. The lighting is bright and airy, conveying a sense of freshness and elegance. 8K UHD, cinematic."
]
},
{
id: 'thanh-xuan-concept',
name: 'Concept Thanh Xuân',
category: 'Nàng Thơ & Studio',
prompts: [
    "Dáng 1: Chân dung siêu thực của một nữ sinh trong tà áo dài trắng tinh khôi, đứng duyên dáng trên sân trường ngập nắng. Tà áo dài bay nhẹ trong gió. Hậu cảnh là hàng phượng vĩ đỏ rực và ghế đá. Ánh sáng trong trẻo, không khí hoài niệm. 8K UHD, cinematic.",
    "Dáng 2: Nữ sinh mặc đồng phục học sinh, ngồi ngay ngắn bên bàn học trong một lớp học cũ. Ánh nắng chiều chiếu xiên qua khung cửa sổ, tạo vệt sáng trên trang vở. Vẻ mặt trong sáng, mơ màng nhìn ra ngoài. Không khí yên tĩnh, đậm chất thơ. 8K UHD.",
    "Dáng 3: Khoảnh khắc năng động trên sân bóng rổ của trường. Nữ sinh mặc đồng phục thể dục, tóc buộc cao, tay cầm quả bóng rổ và nở nụ cười rạng rỡ. Hậu cảnh là sân trường và bảng rổ. Ánh sáng mạnh mẽ, đầy sức sống. 8K UHD.",
    "Dáng 4: Trong thư viện trường, nữ sinh mặc áo sơ mi trắng, ngồi tựa vào kệ sách, chăm chú đọc một cuốn tiểu thuyết. Ánh sáng mềm mại từ đèn bàn chiếu lên khuôn mặt thanh tú. Không gian tĩnh lặng, trí thức. 8K UHD.",
    "Dáng 5: Một ngày mưa, nữ sinh mặc đồng phục, cầm một chiếc ô trong suốt đứng bên cửa sổ nhìn ra ngoài. Những giọt mưa đọng trên kính. Vẻ mặt có chút suy tư, lãng mạn. Tông màu lạnh, không khí điện ảnh. 8K UHD."
]
},
{
id: 'yearbook-photo',
name: 'Ảnh Kỷ Yếu',
category: 'Nàng Thơ & Studio',
prompts: [
    "Dáng 1: Chân dung Áo Cử Nhân. Chân dung siêu thực của một sinh viên trong bộ đồ cử nhân, đầu đội mũ, tay cầm tấm bằng tốt nghiệp cuộn lại có thắt nơ đỏ. Nền studio màu xám nhạt. Ánh sáng chuyên nghiệp, vẻ mặt tự tin và rạng rỡ. 8K UHD, cinematic.",
    "Dáng 2: Tung Mũ Cử Nhân. Khoảnh khắc sinh viên vui mừng tung mũ cử nhân lên không trung. Chụp từ góc thấp hướng lên, hậu cảnh là bầu trời xanh và sân trường đại học. Bắt trọn khoảnh khắc mũ đang bay. 8K UHD, không khí tưng bừng, đầy hy vọng.",
    "Dáng 3: Chân dung Áo Dài/Sơ Mi Trắng. Nữ sinh trong tà áo dài trắng hoặc nam sinh trong áo sơ mi trắng, quần tây, đứng trên sân trường lộng gió. Vẻ mặt trong sáng, hoài niệm. Hậu cảnh là ghế đá, hàng cây xanh. 8K UHD, không khí thanh xuân.",
    "Dáng 4: Tạo dáng với Bằng. Ảnh chụp cận cảnh từ ngực trở lên, sinh viên mặc áo cử nhân, tự hào cầm tấm bằng tốt nghiệp mở ra trước ngực. Nụ cười rạng rỡ. Lấy nét vào khuôn mặt và tấm bằng. 8K UHD.",
    "Dáng 5: Trong Thư Viện. Sinh viên mặc áo cử nhân, ngồi bên chồng sách cao trong thư viện. Vẻ mặt trầm tư, nhìn về tương lai. Ánh sáng mềm mại từ cửa sổ chiếu vào. 8K UHD, không khí tri thức và yên tĩnh."
]
},
{
    id: 'kindergarten-graduate',
    name: 'Cử nhân mầm non',
    category: 'Nàng Thơ & Studio',
    prompts: [
        "Dáng 1: Chân dung siêu thực của một em bé trong bộ đồ cử nhân mầm non, đầu đội mũ, tay cầm tấm 'bằng tốt nghiệp' cuộn lại. Bé ngồi ngay ngắn, nhìn thẳng vào máy ảnh với nụ cười ngây thơ. Bối cảnh studio màu pastel nhẹ nhàng. 8K UHD, không khí trang trọng nhưng đáng yêu.",
        "Dáng 2: Khoảnh khắc vui nhộn khi bé tung chiếc mũ cử nhân nhỏ xinh lên không trung. Chụp từ góc thấp để bắt trọn khoảnh khắc mũ đang bay. Bé cười rạng rỡ, đầy phấn khích. Bối cảnh studio sáng sủa với bóng bay nhiều màu sắc. 8K UHD, không khí tưng bừng.",
        "Dáng 3: Em bé mặc đồ cử nhân, ngồi cạnh một chú gấu bông cũng đội một chiếc mũ tốt nghiệp nhỏ. Bé ôm bạn gấu, cả hai cùng nhìn vào máy ảnh. Bối cảnh ấm cúng với những khối gỗ đồ chơi. 8K UHD, không khí dễ thương và tình bạn.",
        "Dáng 4: Ảnh chụp cận cảnh bé tự hào giơ cao tấm 'bằng tốt nghiệp' của mình. Vẻ mặt hãnh diện và đáng yêu. Tiêu điểm vào khuôn mặt rạng rỡ của bé và tấm bằng. 8K UHD, ghi lại khoảnh khắc đáng nhớ.",
        "Dáng 5: Bé mặc đồ cử nhân, ngồi bên một chồng sách thiếu nhi nhiều màu sắc. Bé giả vờ đọc sách một cách 'nghiêm túc'. Bối cảnh thư viện nhỏ xinh dành cho trẻ em. 8K UHD, không khí tri thức và ngộ nghĩnh."
    ]
},
// Váy trễ vai trắng & hoa
{
id: 'white-off-shoulder-dress',
name: 'Váy trễ vai trắng & hoa',
category: 'Nàng Thơ & Studio',
prompts: [
"Elegant studio portrait of a young woman in an off-shoulder white dress with puff sleeves, flawless porcelain skin, soft natural makeup, black hair in a neat bun, surrounded by white flowers and green leaves, sitting gracefully, romantic atmosphere, photorealistic, ultra-detailed, 8K UHD, cinematic.",
"Close-up studio beauty portrait of the young woman. She looks softly at the camera, her face framed by white flowers and delicate green leaves. Her black hair is in a neat bun. The focus is on her flawless skin and serene expression. Soft, diffused lighting creates an ethereal glow. Romantic and pure atmosphere, 8K UHD.",
"Full-body studio portrait of the young woman standing elegantly amidst a setting of white flowers and green plants. She is looking over her shoulder at the camera with a gentle smile. The off-shoulder white dress with puff sleeves flows gracefully. The lighting is soft and flattering, creating a dreamy and enchanting mood. 8K UHD.",
"Profile view studio portrait of the young woman. She is looking away, her elegant neckline and the neat bun highlighted. A single soft light illuminates her profile. The background is a soft arrangement of blurred white flowers and leaves, keeping the focus on her. Artistic, minimalist, 8K UHD.",
"Studio portrait of the woman sitting, holding a single white flower in her hands and looking down at it with a soft, contemplative expression. The puff sleeves of her white off-shoulder dress are a key feature. The lighting is warm and gentle, creating a tender and intimate mood. Storytelling portrait, 8K UHD."
]
},
// Áo Dài & Lồng Đèn Lễ Hội
{
id: 'ao-dai-lantern-festival',
name: 'Áo Dài & Lồng Đèn Lễ Hội',
category: 'Lễ Hội & Truyền Thống',
prompts: [
"A festive outdoor portrait of a young Vietnamese woman at a Mid-Autumn Festival market. She has a slim and graceful figure, with fair, luminous white skin that enhances her elegance. She wears a long flowing white áo dài with delicate floral embroidery. In her hands, she holds a traditional folding fan, positioned elegantly at her waist. Her straight dark hair is styled simply, flowing down over one shoulder, highlighting her refined look. The background is filled with colorful Mid-Autumn lanterns, including red and gold fish-shaped lanterns, star lanterns, and other festive decorations, creating a lively and joyful atmosphere. The lighting is warm golden hour sunlight, casting a soft glow on her fair skin and outfit, while enriching the vibrant colors of the lanterns. Use the exact face from the uploaded image, preserving all natural features and expression accurately. Style: Cultural portrait photography, festive, realistic. Mood: Joyful, elegant, traditional.",
"She is sitting on a small wooden stool amidst the lantern stalls, looking up at a large star-shaped lantern with a curious and joyful expression. Her white áo dài spreads neatly around her. The folding fan is gently placed on her lap. The scene is illuminated by the warm, ambient light from hundreds of lanterns, creating a magical bokeh effect in the background. Ultra realistic, 8K UHD.",
"A candid shot of her walking through the bustling festival market, a gentle smile on her face as she glances at the camera. She holds the fan half-open in one hand. The motion blurs the background slightly, conveying a sense of movement and liveliness. The warm lantern light catches the floral embroidery on her áo dài. Cinematic, joyful, 8K UHD.",
"Close-up portrait where she holds the folding fan open, partially covering the lower half of her face, her eyes smiling warmly at the camera. The intricate details of the fan and the delicate embroidery on her áo dài are in sharp focus. The background is a soft blur of vibrant lantern colors. Elegant, mysterious, 8K UHD.",
"She is seen from the side, releasing a small floating lantern into the air. Her profile is illuminated by the lantern's glow, creating a serene and hopeful moment. The background shows other people and lanterns, but the focus is on her graceful pose and the floating light. Atmospheric, poignant, 8K UHD."
]
},
// Nàng Thơ & Bánh Kem Sinh Nhật
{
id: 'birthday-muse-cake',
name: 'Nàng Thơ & Bánh Kem Sinh Nhật',
category: 'Nàng Thơ & Studio',
prompts: [
"Ultra realistic, high definition, fairy tale style studio portrait. A young Vietnamese girl around 20-35 years old, delicate face, clear white-pink skin, big sparkling eyes, soft pink lips. Keep the same facial expression from the uploaded photo. She has long, silky black hair, loosely tied with a white bow at the back of her head. She wears a fluffy cream-yellow princess dress, soft silk material, naturally fluttering. In front of her is a white birthday cake decorated with light pink pastel roses. She places her two hands gently under her chin, her eyes sparkling, gentle and pure. The minimalist studio background is light beige, the soft light creates a romantic feeling, like a scene in a fairy tale. Ultra realistic, 8k UHD, cinematic lighting, dreamy and elegant atmosphere.",
"She is making a wish with her eyes closed, hands clasped together near the glowing candles on the birthday cake. A soft smile plays on her lips. The only light source is the warm candlelight, casting a gentle glow on her face and creating soft shadows. Intimate, magical atmosphere, 8K UHD.",
"A joyful, candid shot of her clapping her hands in delight after blowing out the candles. A few wisps of smoke rise from the wicks. Her expression is one of pure happiness. The lighting is bright and cheerful. Dreamy and celebratory mood, 8K UHD.",
"She is sitting beside the table with the cake, looking directly at the camera with a serene and graceful expression. One hand rests gently on the table near the cake. The fluffy princess dress fills the lower frame. The lighting is soft and even, like a classic portrait. Elegant, pure, 8K UHD.",
"A close-up shot focusing on her hands as she delicately cuts the first slice of the birthday cake. The cake is beautifully detailed with pastel roses. Her face is slightly in the background, out of focus but with a gentle smile visible. The focus is on the act of celebration. Storytelling, detailed, 8K UHD."
]
},
// Váy Vàng Studio
{
id: 'pastel-yellow-dress-studio',
name: 'váy vàng studio',
category: 'Nàng Thơ & Studio',
prompts: [
"Cinematic studio portrait of a beautiful young woman in a pastel yellow dress, surrounded by decorative white and purple flowers and lush green plants, long wavy dark hair, flawless glowing skin, dreamy expression, professional soft lighting, photorealistic, ultra-detailed, 8K UHD.",
"Close-up cinematic studio portrait of a beautiful young woman in a pastel yellow dress. She gently touches a white flower near her face, her long wavy dark hair cascading over one shoulder. Her expression is soft and dreamy, eyes looking slightly away from the camera. The background is a soft-focus arrangement of white and purple flowers and green plants. Professional soft lighting illuminates her flawless glowing skin. Photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a beautiful young woman sitting gracefully on a velvet stool. She wears a pastel yellow dress, surrounded by an artful arrangement of white and purple flowers and lush green plants. Her hands are resting on her lap, holding a single purple flower. Her long wavy dark hair is elegantly styled. The lighting is soft and romantic, creating a dreamy and serene atmosphere. Photorealistic, ultra-detailed, 8K UHD.",
"Profile view cinematic studio portrait of a beautiful young woman in a pastel yellow dress. She is looking to the side, her silhouette framed by lush green plants and soft white and purple flowers. A gentle light highlights the contours of her face and her long wavy dark hair. Her expression is calm and contemplative. The atmosphere is ethereal and artistic. Photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a beautiful young woman in a pastel yellow dress, looking over her shoulder at the camera with a gentle, inviting smile. Her long wavy dark hair flows down her back. The foreground is blurred with lush green leaves and soft purple flowers, creating a sense of depth. The background is a soft, floral setting. Professional soft lighting creates a warm, enchanting glow. Photorealistic, ultra-detailed, 8K UHD."
]
},
// Sinh nhật Tone Hồng
{
id: 'pink-tone-birthday',
name: 'Sinh nhật Tone Hồng',
category: 'Nàng Thơ & Studio',
prompts: [
"Ultra realistic, high-definition studio portrait. A beautiful young woman celebrates her birthday. She wears an elegant white strapless dress and a large white bow in her dark, styled hair, with a delicate white choker. She sits at a table decorated in a pastel pink theme, with a delicate white birthday cake topped with a crown, glasses of champagne tied with pink ribbons, and glowing candles. She poses gracefully with hands clasped under her chin, looking at the camera with a sweet, gentle smile. The background is a soft, muted gray. Lighting is soft and cinematic, creating a dreamy and romantic atmosphere. 8K UHD, sharp focus, flawless skin.",
"Close-up beauty shot. The woman leans her head on her hands, showing off her flawless makeup with rosy pink blush. A strand of hair falls gently across her face. The background is a soft blur of the pink-themed party table. The lighting is ethereal, highlighting her sparkling eyes and soft lips. Elegant and pure atmosphere, 8K UHD.",
"She playfully holds a champagne glass, looking at the camera with a charming wink. The pink ribbons on the glass add a festive touch. The focus is on her joyful expression and the elegant details of the scene. The lighting is bright and celebratory. 8K UHD, cinematic.",
"A serene moment as she closes her eyes to make a birthday wish in front of the beautifully decorated cake. Her hands are clasped near her heart. The candlelight casts a warm, gentle glow on her face, creating an intimate and magical mood. 8K UHD.",
"She looks back over her shoulder with a captivating smile. The large white bow in her hair is a prominent feature. The background is softly blurred, keeping the focus on her elegant posture and the delicate details of her white dress. High-fashion, romantic, 8K UHD."
]
},
// Sinh nhật vest đen + Gấu
{
id: 'black-vest-teddy-bear',
name: 'Sinh nhật vest đen + Gấu',
category: 'Fashion & Phong Cách',
prompts: [
"Ultra realistic, high-definition fashion studio portrait. A beautiful young woman with long wavy brown hair and stylish glasses. She wears a chic oversized black blazer as a dress, paired with black combat boots. She is sitting on a black leather sofa with her legs elegantly crossed, hugging a teddy bear to her chest. She rests her chin on her hand, gazing thoughtfully at the camera. The background is a clean white studio, surrounded by numerous cute brown teddy bears. The atmosphere is a mix of sophisticated and cute. 8K UHD, cinematic lighting.",
"Ultra realistic fashion studio portrait. A young woman with long brown hair and stylish glasses, wearing a black blazer dress and combat boots. She sits confidently on the edge of a black leather sofa, her legs stretched forward. She holds a large teddy bear in her lap with one hand, while the other adjusts her glasses with a chic gesture. The background is a clean white studio with other teddy bears scattered around. The look is powerful and intellectual. 8K UHD, sharp focus.",
"Ultra realistic fashion studio portrait. A playful shot of a young woman in a black blazer dress and glasses, nestled amongst a pile of teddy bears on a black leather sofa. She is hugging several of them at once and looks at the camera with a sweet, happy smile. The contrast between the serious outfit and the cute bears creates a charming atmosphere. Clean white studio background. 8K UHD.",
"Ultra realistic, full-body fashion studio portrait. A young woman in a black blazer dress and combat boots stands next to a black leather sofa. She holds a teddy bear under one arm like a clutch bag, looking over her shoulder at the camera with a confident expression. The background is a clean white studio. High-fashion editorial style. 8K UHD.",
"Ultra realistic, close-up beauty shot. A young woman with stylish glasses peeks playfully over the top of a large teddy bear she holds up to her face. Only her eyes and the top of her head are visible. The background is a soft-focus white studio setting. The expression is playful and mysterious. 8K UHD."
]
},
// Áo yếm đỏ - cá chép & đèn lồng
{
id: 'red-ao-yem-koi-lantern',
name: 'Áo yếm đỏ - cá chép & đèn lồng',
category: 'Lễ Hội & Truyền Thống',
prompts: [
"Ultra realistic studio portrait of a young Vietnamese woman wearing a modernized traditional red and white floral áo yếm with a layered flowing red silk skirt. Her long black hair is styled in soft waves with a red flower accessory. She smiles gently while holding a cute, glowing carp-shaped lantern. Background: artistic studio decorated with floating red lanterns, sheer red fabric, and large paper koi fish suspended in the air. Lighting: soft cinematic spotlight highlighting her delicate face and glowing skin. Atmosphere: festive, romantic, dreamy. High detail, sharp focus, 8K UHD, pastel cinematic tones.",
"She is sitting gracefully among the decorations, holding a traditional paper fan beside her face, revealing only her expressive eyes looking at the camera. The sheer red fabric drapes around her. The lighting is soft and diffused, creating a mysterious and alluring mood. Elegant, artistic, 8K UHD.",
"A full-body shot where she stands with one hand on her waist and the other gently holding the flowing red skirt, as if she is about to dance. She looks to the side with a happy, carefree expression. The suspended koi fish and lanterns create a dynamic, three-dimensional background. Joyful, graceful, 8K UHD.",
"A serene portrait where she is gazing softly at the camera with her hands folded gently near her chest. The focus is tight on her delicate face and the floral pattern of the áo yếm. The background is a soft blur of red lanterns and fabric. Pure, romantic, 8K UHD.",
"She is interacting with the set, gently touching one of the large suspended paper koi fish, looking up at it with a sense of wonder. The lighting creates a beautiful rim light around her hair and profile. The atmosphere is magical and dreamlike. Whimiscal, cinematic, 8K UHD."
]
},
// Yếm Trung Thu
{
id: 'yem-trung-thu',
name: 'Yếm Trung Thu',
category: 'Lễ Hội & Truyền Thống',
prompts: [
"Ultra realistic portrait of a young Vietnamese woman in a vibrant orange dragonfly-patterned áo yếm and skirt. Her long black hair is in a thick, elaborate braid with red tassels. She stands before a festive wall of colorful miniature lion dance heads, looking over her shoulder with a gentle gaze. Soft lighting highlights the details of her outfit. Mood: Playful and elegant. 8K UHD, cinematic.",
"Ultra realistic portrait of a young Vietnamese woman in an orange dragonfly-patterned áo yếm. Seated in profile, her eyes are closed, one hand to her face. A giant, glowing full moon provides dramatic backlighting, creating a warm, ethereal halo. Atmosphere: Dreamy, contemplative, magical. 8K UHD, sharp focus on her profile.",
"Ultra realistic full-body portrait of a young Vietnamese woman in an orange dragonfly-patterned áo yếm. She stands confidently before a massive glowing full moon, holding an orange lion dance head. The background is framed by red lanterns and paper fish. Lighting is a mix of backlight and soft frontal light. Atmosphere: Powerful and festive. 8K UHD.",
"Ultra realistic portrait of a young Vietnamese woman in an elegant orange dragonfly-patterned áo yếm. She reclines gracefully on a rustic bamboo bench, surrounded by straw and traditional fishing baskets. She looks at the camera with a calm, alluring expression. Lighting is soft and natural, emphasizing textures. Mood: Rustic elegance. 8K UHD.",
"Ultra realistic close-up portrait from the chest up. A young Vietnamese woman in an orange dragonfly-patterned áo yếm, her elaborate braid visible. She holds two small, colorful lion dance heads on either side of her face, smiling playfully at the camera. The background is a soft blur of festive lights. Lighting is bright and joyful. 8K UHD."
]
},
// Hoài niệm ký ức
{
id: 'memory-lane',
name: 'Hoài niệm ký ức',
category: 'Gia Đình & Cặp Đôi',
numPortraits: 2,
isFamilyPrompt: true,
prompts: [
"Dáng 1: Tựa tường nhìn nhau. Cinematic photorealistic full-body, adult meets childhood self in an old alley with a big mango tree. Side view: the adult leans on a wall, gazing softly at their childhood self. The child looks up at the adult with admiration. The scene is bathed in the warm light of the golden hour, creating long shadows and a nostalgic mood. QUAN TRỌNG TỐI CAO: Giữ lại chính xác 100% các đặc điểm trên khuôn mặt của người lớn ([face1]) và trẻ em ([face2]) từ các bức ảnh đã tải lên. Không được thay đổi, chỉnh sửa hay làm đẹp khuôn mặt. Mục tiêu là một sự sao chép chân thực và chính xác tuyệt đối, giữ lại mọi chi tiết như hình dạng mắt, mũi, miệng và các đặc điểm riêng biệt. Tái tạo lại khuôn mặt một cách chân thực nhất có thể bằng cách sử dụng tất cả các ảnh tham chiếu được cung cấp cho mỗi người. Vertical 9:16, realistic skin, natural expressions, cinematic depth, warm tones.",
"Dáng 2: Ngồi trên ghế dài. Cinematic photorealistic full-body, adult and childhood self sit side-by-side on a rustic wooden bench under a large mango tree in an old alley. The adult ([face1]) has a gentle arm around the child's ([face2]) shoulder, both looking towards the same point off-camera with soft smiles. The child holds a small, vintage toy car. The scene is bathed in the warm light of the golden hour, creating long shadows and a nostalgic mood. QUAN TRỌNG TỐI CAO: Giữ lại chính xác 100% các đặc điểm trên khuôn mặt của người lớn ([face1]) và trẻ em ([face2]) từ các bức ảnh đã tải lên. Không được thay đổi, chỉnh sửa hay làm đẹp khuôn mặt. Mục tiêu là một sự sao chép chân thực và chính xác tuyệt đối, giữ lại mọi chi tiết như hình dạng mắt, mũi, miệng và các đặc điểm riêng biệt. Tái tạo lại khuôn mặt một cách chân thực nhất có thể bằng cách sử dụng tất cả các ảnh tham chiếu được cung cấp cho mỗi người. Vertical 9:16, realistic skin, natural expressions, cinematic depth, warm tones.",
"Dáng 3: Chơi xích đu. Cinematic photorealistic full-body, adult ([face1]) gently pushes their childhood self ([face2]) on a simple rope swing hanging from a large mango tree in an old alley. The child is laughing with joy, looking back at the adult who is smiling warmly. The scene is captured mid-motion, filled with the warm light of the golden hour, creating dappled light through the leaves and a joyful, nostalgic mood. QUAN TRỌNG TỐI CAO: Giữ lại chính xác 100% các đặc điểm trên khuôn mặt của người lớn ([face1]) và trẻ em ([face2]) từ các bức ảnh đã tải lên. Không được thay đổi, chỉnh sửa hay làm đẹp khuôn mặt. Mục tiêu là một sự sao chép chân thực và chính xác tuyệt đối, giữ lại mọi chi tiết như hình dạng mắt, mũi, miệng và các đặc điểm riêng biệt. Tái tạo lại khuôn mặt một cách chân thực nhất có thể bằng cách sử dụng tất cả các ảnh tham chiếu được cung cấp cho mỗi người. Vertical 9:16, realistic skin, natural expressions, cinematic depth, warm tones.",
"Dáng 4: Thì thầm. Cinematic photorealistic, adult ([face1]) is kneeling down to the same height as their childhood self ([face2]) in an old alley next to a large mango tree. The child is leaning in close, cupping a hand to whisper in the adult's ear. The adult is listening intently with a warm, loving smile. The scene is intimate, bathed in the warm light of the golden hour, creating soft shadows and a heartwarming, nostalgic mood. QUAN TRỌNG TỐI CAO: Giữ lại chính xác 100% các đặc điểm trên khuôn mặt của người lớn ([face1]) và trẻ em ([face2]) từ các bức ảnh đã tải lên. Không được thay đổi, chỉnh sửa hay làm đẹp khuôn mặt. Mục tiêu là một sự sao chép chân thực và chính xác tuyệt đối, giữ lại mọi chi tiết như hình dạng mắt, mũi, miệng và các đặc điểm riêng biệt. Tái tạo lại khuôn mặt một cách chân thực nhất có thể bằng cách sử dụng tất cả các ảnh tham chiếu được cung cấp cho mỗi người. Vertical 9:16, realistic skin, natural expressions, cinematic depth, warm tones.",
"Dáng 5: Nắm tay bước đi. Cinematic photorealistic, view from behind. Adult ([face1]) and childhood self ([face2]) walk hand-in-hand down an old alley, away from the camera, under a large mango tree. Their long shadows stretch out before them on the sun-drenched ground. The adult is slightly turned, looking down at the child with a fond expression. The scene is bathed in the warm light of the golden hour, creating a poignant and nostalgic mood. QUAN TRỌNG TỐI CAO: Giữ lại chính xác 100% các đặc điểm trên khuôn mặt của người lớn ([face1]) và trẻ em ([face2]) từ các bức ảnh đã tải lên. Không được thay đổi, chỉnh sửa hay làm đẹp khuôn mặt. Mục tiêu là một sự sao chép chân thực và chính xác tuyệt đối, giữ lại mọi chi tiết như hình dạng mắt, mũi, miệng và các đặc điểm riêng biệt. Tái tạo lại khuôn mặt một cách chân thực nhất có thể bằng cách sử dụng tất cả các ảnh tham chiếu được cung cấp cho mỗi người. Vertical 9:16, realistic skin, natural expressions, cinematic depth, warm tones."
]
},
{
id: 'gia-dinh-cay-xoai',
name: 'Gia đình cây xoài',
category: 'Gia Đình & Cặp Đôi',
isFamilyPrompt: true,
prompts: [
"Dáng 1: Chân dung gia đình. Cinematic photorealistic full-body, cả gia đình (người lớn và trẻ em) đang tạo dáng chụp ảnh cùng nhau dưới một gốc cây xoài lớn trong một con ngõ cũ. Người lớn có thể đứng hoặc ngồi, trẻ em ở phía trước. Mọi người đều mỉm cười ấm áp nhìn vào máy ảnh. Ánh sáng vàng của buổi hoàng hôn, không khí hoài niệm. Vertical 9:16.",
"Dáng 2: Cùng nhau đi dạo. Cinematic photorealistic, góc nhìn từ phía sau. Cả gia đình đang nắm tay nhau đi dạo trên con đường làng, xa dần máy ảnh, dưới tán cây xoài. Bóng của họ đổ dài về phía trước. Cảnh hoàng hôn ấm áp, không khí yên bình và gắn kết. Vertical 9:16.",
"Dáng 3: Kể chuyện. Cinematic photorealistic. Một người lớn đang ngồi dựa vào gốc cây xoài, cầm một cuốn sách và đọc truyện cho những đứa trẻ đang ngồi quây quần xung quanh lắng nghe một cách chăm chú. Những người lớn khác có thể ngồi cạnh, mỉm cười quan sát. Ánh nắng hoàng hôn xuyên qua kẽ lá, tạo nên một khung cảnh ấm cúng. Vertical 9:16.",
"Dáng 4: Picnic. Cinematic photorealistic. Gia đình đang có một buổi picnic vui vẻ trên một tấm thảm trải dưới gốc cây xoài. Có một giỏ trái cây, bánh mì. Mọi người đang cười đùa, trò chuyện. Một đứa trẻ có thể đang với lấy một quả xoài. Không khí vui vẻ, hạnh phúc. Ánh sáng hoàng hôn. Vertical 9:16.",
"Dáng 5: Chơi thả diều. Cinematic photorealistic. Trên một cánh đồng gần con ngõ có cây xoài, một người lớn và một đứa trẻ đang cùng nhau thả một con diều. Những thành viên khác trong gia đình đứng gần đó cổ vũ và mỉm cười. Bầu trời hoàng hôn rực rỡ. Không khí năng động, đầy ắp tiếng cười. Vertical 9:16."
]
},
{
id: 'loving-family',
name: 'gia đình yêu thương❤',
category: 'Gia Đình & Cặp Đôi',
isFamilyPrompt: true,
simpleFamilyMode: true,
prompts: [
"Dáng 1: Cuộc chiến gối. Một bức ảnh chân thực, rõ ràng theo phong cách máy ảnh polaroid, có hiệu ứng mờ nhẹ và ánh sáng flash. Gia đình đang có một trận chiến gối vui nhộn trên giường, lông vũ bay tung tóe. Mọi người đều cười sảng khoái. Bối cảnh phòng ngủ ấm cúng với rèm trắng.",
"Dáng 2: Xem lại kỷ niệm. Một bức ảnh chân thực, rõ ràng theo phong cách máy ảnh polaroid, có hiệu ứng mờ nhẹ và ánh sáng flash. Gia đình đang quây quần trên sàn nhà, cùng nhau xem một cuốn album ảnh cũ. Mọi người chỉ trỏ và mỉm cười khi nhớ lại những kỷ niệm. Ánh sáng ấm áp từ đèn bàn chiếu rọi. Rèm cửa màu trắng.",
"Dáng 3: Bếp vui nhộn. Một bức ảnh chân thực, rõ ràng theo phong cách máy ảnh polaroid, có hiệu ứng mờ nhẹ và ánh sáng flash. Cả gia đình đang cùng nhau làm bánh trong bếp, bột mì dính trên mặt và quần áo. Mọi người đang cười đùa với nhau. Bối cảnh nhà bếp có rèm trắng.",
"Dáng 4: Xây pháo đài. Một bức ảnh chân thực, rõ ràng theo phong cách máy ảnh polaroid, có hiệu ứng mờ nhẹ và ánh sáng flash. Gia đình đang ở bên trong một 'pháo đài' tự làm từ chăn và gối trong phòng khách. Mọi người chen chúc nhìn ra ngoài và cười. Ánh sáng từ đèn pin tạo nên không khí phiêu lưu. Rèm cửa trắng phía sau.",
"Dáng 5: Khiêu vũ trong phòng khách. Một bức ảnh chân thực, rõ ràng theo phong cách máy ảnh polaroid, có hiệu ứng mờ nhẹ và ánh sáng flash. Cả gia đình đang nhảy múa một cách ngẫu hứng và vui nhộn trong phòng khách. Khoảnh khắc trànầy năng lượng và tiếng cười. Bối cảnh có rèm trắng."
]
},
{
id: 'dai-duong',
name: 'Lơ Lửng giữa đại dương',
category: 'Concept NAM',
prompts: [
"Dáng 1: Một cảnh dưới nước siêu thực và bí ẩn. Một bóng người nam đơn độc, mặc trang phục lụa mỏng nhẹ, bồng bềnh, duyên dáng thả mình trên lưng trong một vực thẳm đại dương bao la, tối tăm, trống rỗng. Anh ấy ở vị trí hơi lệch về bên trái, cơ thể cong một cách thanh lịch, mặt và mắt hướng lên trên về phía một chùm ánh sáng mặt trời duy nhất, tập trung xuyên qua mặt nước từ ngay phía trên. Anh ấy đeo kính, và một tay nhẹ nhàng vươn lên, gần như chạm tới ánh sáng. Mái tóc ngắn của anh ấy bồng bềnh tự nhiên theo dòng nước nhẹ. Góc máy thấp, nhìn lên trên về phía mặt nước, nhấn mạnh sự lơ lửng của anh ấy giữa vực sâu không xác định và ánh sáng dẫn lối. Không khí tổng thể siêu thực, bí ẩn và thanh thản. Độ phân giải 8K chi tiết cao.",
"Dáng 2: Một cảnh dưới nước siêu thực. Một người nam đơn độc mặc lụa bồng bềnh và đeo kính, bơi một cách duyên dáng lên trên về phía một chùm ánh sáng mặt trời duy nhất. Cơ thể anh ấy hướng về phía ánh sáng, cánh tay duỗi ra trong một cú sải tay nhẹ nhàng, thể hiện một cảm giác quyết tâm thanh thản. Góc máy từ bên dưới nhấn mạnh hành trình của anh ấy từ vực thẳm tối tăm, không có đặc điểm gì, lên trên. Ánh sáng chiếu rọi khuôn mặt và con đường phía trước của anh ấy. Bầu không khí đầy hy vọng và siêu thực. Độ phân giải 8K chi tiết cao.",
"Dáng 3: Một vực thẳm dưới nước bí ẩn. Một người nam đơn độc trong trang phục lụa mỏng và đeo kính lơ lửng trong tư thế bào thai yên bình trong một chùm ánh sáng mặt trời hình nón sắc nét. Đôi mắt anh ấy nhắm lại, khuôn mặt nghiêng về phía ánh sáng, một vẻ thanh thản sâu sắc. Tấm vải bồng bềnh nhẹ nhàng bao bọc anh ấy. Cảnh tượng gợi lên cảm giác tái sinh và sự cô độc tĩnh lặng. Góc máy thấp, nhìn lên trên, nhấn mạnh sự tương phản giữa sự an toàn trong ánh sáng và sự bao la của bóng tối. Độ phân giải 8K chi tiết cao.",
"Dáng 4: Một khoảng không dưới nước kỳ lạ và siêu thực. Một chùm ánh sáng mặt trời duy nhất xuyên qua bóng tối, chiếu sáng lưng của một người nam đơn độc trong trang phục lụa bồng bềnh và đeo kính. Anh ấy lơ lửng theo chiều dọc, hướng mặt xuống dưới, nhìn chằm chằm vào vực thẳm đen vô tận bên dưới. Khuôn mặt anh ấy chìm trong bóng tối sâu thẳm, tạo ra một cảm giác bí ẩn và nội tâm mạnh mẽ. Ánh sáng bắt lấy các cạnh của tóc và quần áo anh ấy, nhưng bóng tối lại vẫy gọi. Độ phân giải 8K chi tiết cao.",
"Dáng 5: Một cảnh dưới nước thanh thản và siêu thực. Trong một cột ánh sáng mặt trời hoàn hảo, một người nam đơn độc lơ lửng với hai tay dang rộng sang hai bên, như trong trạng thái hoàn toàn buông xuôi. Anh ấy mặc lụa mỏng nhẹ, bồng bềnh và đeo kính, khuôn mặt hướng lên ánh sáng với một biểu cảm yên bình. Máy quay nhìn lên từ xa, ghi lại tư thế hình chữ thập của anh ấy trên nền khoảng không đại dương bao la, tối tăm. Một vài bong bóng lung linh bay lên xung quanh anh ấy, tăng thêm không khí thanh tao và tâm linh. Độ phân giải 8K chi tiết cao."
]
},
{
id: 'studio-portrait',
name: 'chân dung studio nền đỏ',
category: 'Concept NAM',
prompts: [
"Dáng 1: Chân dung nửa người, chụp từ góc thấp hướng lên để tôn lên đường xương hàm và cổ. Người mẫu nam mặc vest đen và áo sơ mi đen. Nền màu đỏ thẫm. Ánh sáng điện ảnh: một bên mặt có highlight vàng, bên còn lại chìm trong bóng tối sâu, tạo độ tương phản mạnh. Ống kính 85mm, độ sâu trường ảnh nông. Khuôn mặt siêu chi tiết, sắc nét, đôi mắt trong veo, kết cấu da chân thực, vẻ đẹp điêu khắc, toát lên sự thống trị trầm lặng. Ảnh dọc 1080x1920, độ nét cao.",
"Dáng 2: Cận cảnh khuôn mặt, ánh mắt nhìn thẳng vào ống kính đầy mãnh liệt. Người mẫu nam mặc áo sơ mi đen. Nền màu đỏ thẫm. Ánh sáng Chiaroscuro: một nguồn sáng vàng mềm mại duy nhất từ bên cạnh chiếu sáng một nửa khuôn mặt, nửa còn lại chìm trong bóng tối sâu thẳm. Lấy nét vào đôi mắt. Ống kính 85mm, độ sâu trường ảnh cực nông. Chi tiết cực cao, tập trung vào kết cấu da và đôi mắt. Toát lên vẻ nội tâm và quyền lực thầm lặng. Ảnh dọc 1080x1920.",
"Dáng 3: Chụp góc nghiêng ba phần tư, người mẫu nam mặc vest và áo sơ mi đen, nhìn ra xa khỏi máy ảnh. Đường xương hàm và góc nghiêng được xác định rõ nét. Nền màu đỏ thẫm. Ánh sáng viền vàng mạnh mẽ chạy dọc theo khuôn mặt, cổ và vai, tách anh ra khỏi nền tối. Phần lớn khuôn mặt chìm trong bóng tối. Ống kính 85mm, độ sâu trường ảnh nông. Thể hiện cảm giác trầm ngâm và vẻ đẹp điêu khắc. Ảnh dọc 1080x1920.",
"Dáng 4: Chân dung chụp từ ngực trở lên, đầu hơi cúi xuống, mắt nhìn xuống và ra xa như đang suy tư. Người mẫu nam mặc vest đen. Nền màu đỏ thẫm. Ánh sáng dịu hơn, từ trên cao và một bên, tạo ra vầng sáng vàng nhẹ trên tóc và sống mũi, với bóng đổ mềm mại trên gò má. Ống kính 85mm, độ sâu trường ảnh rất nông, lấy nét vào hàng mi. Tâm trạng cô độc nhưng tự tin, tĩnh lặng. Ảnh dọc 1080x1920.",
"Dáng 5: Chân dung nửa người, khuôn mặt hơi nghiêng sang một bên. Một vệt sáng vàng mạnh cắt ngang qua mắt và gò má, như ánh sáng lọt qua khe cửa, phần còn lại của khuôn mặt chìm trong bóng tối sâu. Nền màu đỏ thẫm. Ống kính 85mm, độ sâu trường ảnh nông. Sự tương phản gay gắt giữa ánh sáng và bóng tối tạo ra một không khí bí ẩn, mạnh mẽ. Lấy nét cực sắc vào phần được chiếu sáng của khuôn mặt. Ảnh dọc 1080x1920."
]
},
{
id: 'art-museum-portrait',
name: 'Chân dung tại Bảo tàng',
category: 'Concept Nghệ Thuật',
prompts: [
"Photorealistic art museum scene, wooden floor, cinematic warm spotlights; uploaded person from behind looking at a large ornate framed oil painting of themselves (romantic pastel oil painting style); ultra-detailed 8K.",
"Photorealistic art museum scene, soft gallery lighting. The uploaded person stands in profile, hands clasped behind their back, thoughtfully observing a large, ornately framed oil painting of themselves. The painting is in a romantic pastel style. The camera is positioned slightly to the side, capturing the person's contemplative expression. Wooden floor reflects the soft light. Ultra-detailed 8K.",
"Photorealistic art museum, gallery with a polished wooden bench in the center. The uploaded person is sitting on the bench, leaning forward slightly, gazing up at a massive, ornate-framed oil painting of themselves on the far wall. The painting is a romantic pastel masterpiece. Cinematic spotlights create a dramatic focus on the painting and the person. Ultra-detailed 8K.",
"Photorealistic art museum setting. A close-up shot over the shoulder of the uploaded person, focusing on the large, ornate-framed oil painting of themselves. The painting's texture is visible, rendered in a soft, romantic pastel style. The person's silhouette is softly blurred in the foreground. Warm, cinematic spotlights illuminate the artwork. Ultra-detailed 8K.",
"Photorealistic, grand art museum hall with high ceilings and marble columns, polished wooden floors. The uploaded person stands alone in the vast space, looking at a single, large, ornate-framed oil painting of themselves, which is spotlit. The painting is in a romantic pastel style. The scene feels grand and slightly solitary. Cinematic warm lighting. Ultra-detailed 8K."
]
},
{
id: 'car-muse',
name: 'Nàng thơ bên xe',
category: 'Concept Nghệ Thuật',
prompts: [
"Chân dung siêu thực của một phụ nữ Việt Nam trẻ đẹp ngồi trên ghế lái của một chiếc xe hơi cổ điển màu xanh đậm cổ kính. Cô mặc một chiếc váy cưới ren trắng không dây thanh lịch. Tóc cô được trang trí bằng những bông hoa vàng nhỏ và lá xanh. Cô ôm một bó hoa lan vàng rực rỡ rất lớn, tràn ra cả bên ngoài xe. Cửa xe mở, để lộ nội thất da màu nâu. Bối cảnh là một khu vườn xanh mướt, ngập nắng. Ánh sáng ấm áp và tự nhiên, tạo nên một không khí lãng mạn và mơ mộng. Điện ảnh, 8K UHD, lấy nét sắc sảo.",
"Ảnh chụp toàn thân siêu thực của một phụ nữ Việt Nam trẻ đẹp trong một chiếc xe hơi cổ điển. Cô mặc một chiếc váy cưới ren trắng bồng bềnh và cài hoa vàng trên tóc. Cô dựa lưng vào ghế da màu nâu, một tay đặt trên vô lăng, duyên dáng nhìn về phía máy ảnh. Một bó hoa vàng lớn đặt trên đùi cô. Khung cảnh khu vườn xanh mướt có thể nhìn thấy qua cửa xe và cửa sổ đang mở. Ánh sáng rực rỡ và nắng đẹp, làm nổi bật kết cấu của ren và hoa. Không khí thanh tao và trang nhã, 8K UHD, điện ảnh.",
"Chân dung siêu thực của một phụ nữ trẻ đang bước ra khỏi chiếc xe hơi cổ màu xanh đậm. Cô mặc một chiếc váy ren trắng tuyệt đẹp và cầm một bó hoa vàng lớn. Một chân cô đã đặt xuống đất khi cô nhìn qua vai với một nụ cười dịu dàng. Bối cảnh khu vườn xanh mướt và được tắm trong ánh nắng ấm áp. Cảnh chụp ghi lại khoảnh khắc chuyển động thanh lịch. Lãng mạn và điện ảnh, 8K UHD.",
"Chân dung siêu thực của một phụ nữ trẻ đứng cạnh một chiếc xe hơi cổ điển. Cô duyên dáng dựa vào thân xe màu xanh đậm, tay cầm bó hoa vàng. Chiếc váy ren trắng của cô tương phản tuyệt đẹp với màu sơn tối của xe. Khu vườn ngập nắng tạo nên một bối cảnh mềm mại, lãng mạn. Cô trầm ngâm nhìn xa xăm. Không khí mơ mộng và hoài niệm, 8K UHD.",
"Ảnh chụp cận cảnh vẻ đẹp siêu thực của một phụ nữ trẻ ngồi trong xe hơi cổ. Tiêu điểm tập trung vào biểu cảm thanh thản của cô và những bông hoa vàng tinh tế trên tóc. Cô đang cầm bó hoa lớn, với một vài bông hoa che một phần khuôn mặt. Ánh sáng tự nhiên, dịu nhẹ từ cửa xe mở chiếu sáng làn da không tì vết của cô. Nội thất da màu nâu của xe được làm mờ nhẹ ở hậu cảnh. Thân mật và lãng mạn, 8K UHD, ánh sáng điện ảnh."
]
},
{
id: 'chill-chill-oto',
name: 'Chill Chill Ôtô',
category: 'Concept NAM',
prompts: [
"Wong Kar-wai cinematic style. The subject sits inside an old taxi, head against the rain-streaked window. Streetlight refracts through the glass, casting blurred streaks of light across his face. Shot from outside, with reflections overlapping his contemplative expression. Red-green neon lights pass by, shifting the color palette. Mood of loneliness and solitude in a big city. Thick film grain, pronounced motion blur, hazy glow. The subject wears a black button-down shirt.",
"Wong Kar-wai cinematic style. Inside an old taxi on a rainy night. The subject, in a black shirt, looks into the rearview mirror, his face half-lit by passing red and green neon lights. The reflection shows his lonely eyes, while raindrops streak down the windshield in the background. Thick film grain, motion blur, hazy glow.",
"Wong Kar-wai cinematic style. Shot from the front seat of an old taxi. The subject sits in the back, looking out the rear window at the blurred, receding city lights. His silhouette is framed by the rain-streaked glass. The interior is dark, with occasional flashes of red and green neon illuminating his profile. Mood of solitude, thick film grain, hazy glow. He wears a black button-down shirt.",
"Wong Kar-wai cinematic style. A close-up shot of the subject's hand resting on the rain-streaked taxi window. His face is a soft, out-of-focus reflection in the glass, colored by passing neon lights. The focus is on the contrast between the warmth of his skin and the cold glass. Mood of quiet contemplation, thick film grain, red-green contrast. He wears a black button-down shirt.",
"Wong Kar-wai cinematic style. The taxi has stopped. The subject looks out the side window at a blurry, neon-lit destination. His face is illuminated by a mix of streetlight and colored signs, creating complex shadows. The rain has slowed to a drizzle on the window. A sense of ambiguous arrival, loneliness, thick film grain, hazy glow. He wears a black button-down shirt."
]
},
{
    id: 'korean-studio-nam',
    name: 'studio hàn quốc',
    category: 'Concept NAM',
    prompts: [
        "Dáng 1: Chân dung toàn thân, người mẫu nam mặc trang phục tối giản (áo len cổ lọ màu be và quần tây) đứng cạnh một chiếc ghế gỗ đơn giản trên nền studio màu trắng kem. Ánh sáng tự nhiên mềm mại từ một cửa sổ lớn. Vẻ mặt điềm tĩnh, nhìn thẳng vào máy ảnh. Phong cách trong trẻo, sạch sẽ, 8K UHD, điện ảnh.",
        "Dáng 2: Người mẫu nam ngồi trên sàn nhà, dựa lưng vào bức tường trắng, một chân co, một chân duỗi. Anh mặc một chiếc áo sơ mi trắng oversized và quần jean sáng màu. Anh nhìn ra xa, vẻ mặt trầm tư. Ánh sáng dịu nhẹ, tạo bóng mềm. Không khí yên bình, tối giản. 8K UHD.",
        "Dáng 3: Chụp cận cảnh từ ngực trở lên. Người mẫu nam mặc áo thun trắng đơn giản, tay nhẹ nhàng đưa lên chạm vào cổ. Anh nhìn vào máy ảnh với một nụ cười nhẹ, thân thiện. Nền trơn màu xám nhạt. Lấy nét vào đôi mắt, làn da mịn màng, trong trẻo. Ánh sáng studio chuyên nghiệp, 8K UHD.",
        "Dáng 4: Người mẫu nam đứng nghiêng người, dựa vào một bức tường màu pastel, hai tay đút túi quần. Anh mặc một bộ suit thoải mái, không cà vạt. Vẻ mặt thư thái, nhìn sang một bên. Bố cục tối giản, tập trung vào hình khối và đường nét. 8K UHD, phong cách tạp chí thời trang Hàn Quốc.",
        "Dáng 5: Người mẫu nam ngồi trên một chiếc ghế đẩu, cầm một cuốn sách đang đọc dở. Anh mặc một chiếc áo cardigan dệt kim và quần kaki. Ánh nắng nhẹ chiếu xiên qua cửa sổ, tạo vệt sáng trên sàn. Không khí ấm cúng, trí thức. 8K UHD, cinematic."
    ]
},
{
    id: 'street-style-nam',
    name: 'đường phố',
    category: 'Concept NAM',
    prompts: [
        "Dáng 1: Chụp toàn thân, người mẫu nam mặc trang phục street style (hoodie, bomber jacket, sneakers) đang tự tin bước qua vạch sang đường trong một thành phố lớn. Chuyển động được bắt trọn, hậu cảnh là những tòa nhà cao tầng và dòng xe cộ mờ ảo. Ánh sáng ban ngày, phong cách năng động, 8K UHD.",
        "Dáng 2: Người mẫu nam ngồi trên bậc thềm của một tòa nhà cổ, mặc áo khoác da và quần jean rách. Anh nhìn thẳng vào ống kính với vẻ mặt lạnh lùng, cá tính. Hậu cảnh là bức tường gạch cũ kỹ. Ánh sáng chiều tà, tạo bóng đổ dài. Phong cách gai góc, điện ảnh, 8K UHD.",
        "Dáng 3: Chụp trong một con hẻm nhỏ với những bức tường graffiti đầy màu sắc. Người mẫu nam mặc trang phục hip-hop, tạo dáng tự do, thể hiện sự phóng khoáng. Ánh sáng tương phản mạnh, màu sắc sống động. 8K UHD, phong cách nghệ thuật đường phố.",
        "Dáng 4: Bối cảnh ban đêm trên một con phố đông đúc với ánh đèn neon rực rỡ. Người mẫu nam đứng dựa vào cột đèn, mặc một chiếc áo khoác dài. Ánh đèn neon phản chiếu trên trang phục và khuôn mặt anh. Hiệu ứng bokeh từ đèn xe và cửa hiệu. Không khí cô đơn, huyền ảo. 8K UHD, cinematic.",
        "Dáng 5: Người mẫu nam đang đi bộ trên vỉa hè, tay cầm ván trượt. Anh mặc áo phông, quần short và mũ lưỡi trai. Một khoảnh khắc đời thường, tự nhiên được bắt lại. Ánh nắng hè rực rỡ. Phong cách thể thao, trẻ trung. 8K UHD."
    ]
},
{
    id: 'car-side-nam',
    name: 'bên ô tô',
    category: 'Concept NAM',
    prompts: [
        "Dáng 1: Người mẫu nam mặc bộ vest lịch lãm, dựa vào hông một chiếc xe thể thao cổ điển màu đỏ bóng loáng. Anh khoanh tay trước ngực, nhìn vào máy ảnh với vẻ tự tin. Bối cảnh là một con đường ven biển lúc hoàng hôn. Ánh sáng vàng ấm áp. 8K UHD, phong cách sang trọng, điện ảnh.",
        "Dáng 2: Người mẫu nam ngồi ở ghế lái một chiếc xe mui trần hiện đại, một tay đặt trên vô lăng, tay kia gác lên cửa xe. Anh đeo kính râm, nhìn ra xa. Bối cảnh là một cây cầu trong thành phố về đêm, ánh đèn lung linh. 8K UHD, phong cách sành điệu, hiện đại.",
        "Dáng 3: Chụp từ góc thấp, người mẫu nam mặc trang phục bụi bặm (áo khoác denim, quần jean) đang ngồi trên nắp capo của một chiếc xe bán tải cũ kỹ. Bối cảnh là một vùng nông thôn hoang vắng. Anh nhìn vào ống kính với vẻ mặt bất cần. Ánh sáng ban ngày gay gắt. 8K UHD, phong cách mạnh mẽ, nam tính.",
        "Dáng 4: Người mẫu nam đứng trong gara sửa xe, xung quanh là các dụng cụ và phụ tùng. Anh mặc quần yếm công nhân, tay cầm cờ lê, dựa vào một chiếc xe cơ bắp đang được độ lại. Ánh sáng công nghiệp, không khí thô ráp. 8K UHD, phong cách gai góc.",
        "Dáng 5: Cảnh đêm mưa, người mẫu nam đứng dưới một chiếc ô, bên cạnh là chiếc sedan sang trọng đang đỗ bên lề đường. Ánh đèn đường và đèn xe phản chiếu trên mặt đường ướt át. Anh nhìn xa xăm, vẻ mặt trầm tư. Không khí lãng mạn, bí ẩn. 8K UHD, cinematic."
    ]
},
{
    id: 'sunset-portrait-nam',
    name: 'hoàng Hôn',
    category: 'Concept NAM',
    prompts: [
        "Dáng 1: Bóng của người mẫu nam nổi bật trên nền trời hoàng hôn rực rỡ trên bãi biển. Anh đứng một mình, nhìn ra biển cả mênh mông. Sóng biển vỗ nhẹ vào bờ. Không khí yên bình, tĩnh lặng. 8K UHD, phong cách tối giản.",
        "Dáng 2: Chân dung cận cảnh, ánh sáng vàng của hoàng hôn chiếu vào một bên mặt người mẫu nam, tạo nên hiệu ứng viền (rim light) đẹp mắt. Anh nhắm mắt, tận hưởng những tia nắng cuối ngày. Hậu cảnh là bầu trời chuyển màu. 8K UHD, lãng mạn, nghệ thuật.",
        "Dáng 3: Người mẫu nam đứng trên sân thượng của một tòa nhà cao tầng, nhìn xuống thành phố đang lên đèn lúc hoàng hôn. Gió nhẹ thổi bay mái tóc. Bối cảnh là một bức tranh toàn cảnh đô thị hùng vĩ. 8K UHD, cinematic, cảm giác tự do.",
        "Dáng 4: Người mẫu nam đi bộ trên một con đường đất trên đồi, ánh nắng hoàng hôn chiếu từ phía sau lưng, tạo nên một vầng hào quang. Anh nhìn qua vai và mỉm cười với máy ảnh. Khung cảnh đồng quê thanh bình. 8K UHD, ấm áp, hoài niệm.",
        "Dáng 5: Người mẫu nam ngồi trên một mỏm đá, chơi guitar. Mặt trời đang lặn dần xuống phía sau những ngọn núi ở xa. Ánh hoàng hôn nhuộm đỏ cả một vùng trời. Không khí phiêu lãng, tự do. 8K UHD, nghệ sĩ."
    ]
},
{
id: 'titanic-legend',
name: 'Titanic huyền thoại',
category: 'Concept NAM',
numPortraits: 1,
prompts: [
"A hyper-realistic close-up group photo, natural daylight, realistic skin tones. The subject (keep the uploaded face) wears a white cap, dark sunglasses, black vest with a white tie, black trousers and polished black western shoes. He is standing next to Jack (Leonardo DiCaprio) and Rose (Kate Winslet) in their iconic Titanic costumes. All three smile naturally, standing close together like a straightforward group selfie. They are positioned in front of the moored Titanic, its massive steel hull towering in the background. The ship’s name “TITANIC” is clearly painted in bold letters on the side. The hull plating texture is finely detailed, period-accurate, with rivets and weathered metallic shine. The atmosphere feels historic yet authentic, blending cinematic aura with the look of an ordinary snapshot. The composition resembles a slightly imperfect iPhone photo: sharp clothes detail, lifelike skin, natural depth of field, subtle daylight shadowing. The scene feels grounded, as if casually captured in front of the legendary ship rather than a polished movie still. Ultra-detailed, photorealistic, cinematic lighting, authentic 1912 period styling, 8K resolution.",
"A hyper-realistic, action-shot style photo from the bow of the Titanic. Jack (Leonardo DiCaprio) and Rose (Kate Winslet) are in their famous 'I'm flying' pose at the very front rail. The subject (keep the uploaded face), wearing a white cap, dark sunglasses, black vest, and black trousers, stands just behind them with a wide, joyful grin, photobombing the iconic moment. The vast ocean stretches out behind them, with the sky showing a beautiful sunset. The composition feels like a candid, slightly shaky snapshot taken by a friend. Natural daylight, realistic skin tones, subtle motion blur on the water. Ultra-detailed, photorealistic, cinematic lighting, authentic 1912 period styling, 8K resolution.",
"A hyper-realistic candid photo on the docks next to the moored Titanic. The subject (keep the uploaded face) in a white cap, sunglasses, black vest and trousers, is laughing heartily alongside Jack (Leonardo DiCaprio) and Rose (Kate Winslet). Jack is in the middle of telling a story, gesturing with his hands, while Rose listens with a smile. They are leaning against some wooden cargo crates. The massive hull of the Titanic fills the background, its name clearly visible. The lighting is bright, natural daylight, casting realistic shadows. The scene feels like a captured moment of friendship, not a posed picture. Lifelike skin, sharp details on clothing, authentic 1912 period styling, 8K resolution.",
"A hyper-realistic photo taken from the perspective of someone on the dock, looking up at the Titanic's deck. The subject (keep the uploaded face), wearing a white cap, sunglasses, and black vest, stands between Jack (Leonardo DiCaprio) and Rose (Kate Winslet) at the ship's railing. All three are smiling and waving enthusiastically towards the camera, as if saying goodbye as the great ship is about to depart. Streamers and confetti might be subtly visible in the air. The atmosphere is energetic and full of excitement. Natural daylight, realistic skin tones, authentic 1912 period styling, 8K resolution.",
"A hyper-realistic, opulent indoor photo on the Grand Staircase of the Titanic. The subject (keep the uploaded face), in their modern outfit of a white cap, sunglasses, black vest, and trousers, stands confidently on a step between Jack (Leonardo DiCaprio) in his tuxedo and Rose (Kate Winslet) in her elegant evening gown. The contrast between the subject's modern attire and the formal 1912 setting is a key element. They are all looking at the camera for a formal group portrait. The iconic 'Honor and Glory Crowning Time' clock is visible in the background. The lighting is warm and grand, coming from the ornate light fixtures. The scene blends cinematic grandeur with a touch of modern anachronism. Ultra-detailed, photorealistic, cinematic lighting, 8K resolution."
]
},
{
id: 'gucci-fashion-editorial',
name: 'Gucci Fashion Editorial',
category: 'Fashion & Phong Cách',
prompts: [
"RAW photo, ultra-realistic, high dynamic range, full-body cinematic fashion editorial. A confident person stands against a stark, dark background, dramatically illuminated by a bold, intense red frontal key light that wraps softly around their form, enhancing the textures and rich details of the outfit. Wearing an opulent Gucci-inspired ensemble: a tailored emerald green velvet blazer with intricate gold embroidery, paired with high-waisted cream wide-leg trousers with a flawless crease. Under the blazer, a silky champagne blouse with a soft drape and subtle sheen. Statement accessories include a chunky gold chain necklace, oversized tinted sunglasses, and a slim leather belt with an iconic GG buckle. On the feet, sleek polished black loafers with gold hardware. Rich textures — velvet, silk, leather — are captured in exquisite detail, showing stitching, folds, and realistic reflections. Lighting emphasizes depth and contour, creating a moody, high-fashion atmosphere. Shot with Leica SL2 + APO-Summicron-SL 90mm f/2 ASPH lens, ISO 100, f/1.8, 1/250 sec, professional Vogue-style composition. 9:16 ratio.",
"RAW photo, ultra-realistic, cinematic fashion editorial. The confident person is seated on a minimalist black cube against a stark, dark background. Dramatically illuminated by a bold, intense red frontal key light. Wearing a Gucci-inspired emerald green velvet blazer with gold embroidery, cream wide-leg trousers, and a silky champagne blouse. The pose is relaxed yet powerful, one leg crossed, showcasing sleek black loafers. Oversized sunglasses and a chunky gold chain complete the look. Moody, high-fashion atmosphere. Shot with Leica SL2, 90mm f/2 lens, professional Vogue-style composition. 9:16 ratio.",
"RAW photo, ultra-realistic, cinematic fashion editorial, waist-up portrait. The person looks directly at the camera with a piercing gaze, illuminated by a bold, red key light against a dark backdrop. The focus is on the opulent Gucci-inspired emerald green velvet blazer, its intricate gold embroidery, and the silky champagne blouse beneath. A chunky gold chain necklace and oversized tinted sunglasses add to the high-fashion aesthetic. Moody atmosphere. Shot with Leica SL2, 90mm f/2 lens, professional Vogue-style composition. 9:16 ratio.",
"RAW photo, ultra-realistic, full-body cinematic fashion editorial, shot from a low angle. A confident person stands tall against a dark background, projecting power. A dramatic red frontal light highlights the Gucci-inspired ensemble: emerald green velvet blazer, cream wide-leg trousers, and black loafers. The low angle elongates the figure and emphasizes the flawless tailoring. Moody, high-fashion atmosphere. Shot with Leica SL2, 90mm f/2 lens, professional Vogue-style composition. 9:16 ratio.",
"RAW photo, ultra-realistic, full-body cinematic fashion editorial. The person is captured in profile, looking off-camera with a contemplative expression. A dramatic red light sculpts their form against a stark, dark background. The opulent Gucci-inspired outfit—emerald green velvet blazer, cream trousers, champagne blouse—is shown from the side, highlighting the silhouette and texture. Moody, high-fashion atmosphere. Shot with Leica SL2, 90mm f/2 lens, professional Vogue-style composition. 9:16 ratio."
]
},
{
id: 'white-shirt-dress-outfit',
name: 'Outfit váy sơ mi trắng',
category: 'Nàng Thơ & Studio',
prompts: [
"Cinematic studio portrait of a young woman in a short white dress and sneakers, long wavy dark hair, soft natural makeup. She is standing straight, holding a bag of flowers. Minimal white background, photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a young woman in a short white dress and sneakers, long wavy dark hair, soft natural makeup. She is sitting on a white pedestal, one leg propped up casually. Minimal white background, photorealistic, ultra-detailed, 8K UHD.",
"Cinematic close-up studio portrait of a young woman in a short white dress, long wavy dark hair, soft natural makeup. She is resting her chin on her hand, looking thoughtfully at the camera. Minimal white background, photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a young woman in a short white dress and sneakers, long wavy dark hair, soft natural makeup. She is sitting down, hugging a bag of flowers to her chest, looking closely and gently at the camera. Minimal white background, photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a young woman in a short white dress and sneakers, long wavy dark hair, soft natural makeup. She is spreading her arms wide with a joyful, happy expression. Minimal white background, photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a young woman in a short white dress and sneakers, long wavy dark hair, soft natural makeup. She is bending down and leaning slightly to hold a bag of flowers on the floor. Minimal white background, photorealistic, ultra-detailed, 8K UHD.",
"Cinematic studio portrait of a young woman in a short white dress and sneakers, long wavy dark hair, soft natural makeup. She is sitting in a relaxed pose, with her eyes closed and a serene smile on her face. Minimal white background, photorealistic, ultra-detailed, 8K UHD."
]
},
{
id: 'single-bride',
name: 'cô dâu đơn',
category: 'Nàng Thơ & Studio',
prompts: [
"Bridal photoshoot of a beautiful bride in an elegant long-sleeved A-line lace wedding gown with a wide flare. She is looking slightly to the side with a gentle expression. Flawless makeup, delicate hairstyle with veil. Cinematic outdoor garden backdrop with lush greenery and white flowers, photorealistic, ultra-detailed, 8K UHD.",
"Bridal photoshoot of a beautiful bride sitting on the lush green grass. Her elegant wedding gown flares out, swirling in a perfect circle around her. Flawless makeup, delicate hairstyle with veil. Cinematic outdoor garden backdrop with white flowers, photorealistic, ultra-detailed, 8K UHD.",
"Bridal photoshoot of a beautiful bride in a solemn, straight standing pose. She wears an elegant wedding gown, her hands clasped gracefully in front of the dress. Flawless makeup, delicate hairstyle with veil. Cinematic outdoor garden backdrop with lush greenery and white flowers, photorealistic, ultra-detailed, 8K UHD.",
"Bridal photoshoot of a beautiful bride in a modern, sleeveless satin wedding gown featuring large ruffles at the chest and a thin, delicate veil draped across her shoulders. Flawless makeup, elegant hairstyle. Cinematic outdoor garden backdrop with lush greenery and white flowers, photorealistic, ultra-detailed, 8K UHD.",
"Bridal photoshoot of a beautiful bride sitting with her back to the camera. Her elegant flared wedding gown spreads out beautifully behind her. She turns her head over her shoulder to give a gentle, warm smile. Flawless makeup, delicate hairstyle with veil. Cinematic outdoor garden backdrop with lush greenery and white flowers, photorealistic, ultra-detailed, 8K UHD."
]
},
{
id: 'by-the-window',
name: 'Bên cửa sổ',
category: 'Nàng Thơ & Studio',
prompts: [
"Ultra realistic, modern studio style portrait. A young woman is sitting comfortably on a bed with soft white sheets. She wears an oversized pure white shirt, light blue wide-leg jeans, and white socks. The background is a bright room with natural light gently streaming through a window with white horizontal blinds. A few magazines and a pair of black headphones are placed next to the subject. The overall feeling is gentle, pure, and youthful. 8K UHD, cinematic soft light.",
"Ultra realistic, modern studio style portrait. A young woman kneels on the soft white bed, gazing thoughtfully out the window with its white blinds. The gentle sunlight highlights her profile. She is dressed in an oversized white shirt and light blue wide-leg jeans. The atmosphere is serene and introspective. 8K UHD, cinematic lighting.",
"Ultra realistic, modern studio style portrait. A young woman leans against a pillow on the white bed, focused on a magazine she holds. She wears an oversized white shirt and light blue wide-leg jeans. Black headphones rest on the sheets nearby. The room is filled with soft, natural light from the window. The mood is quiet and relaxed. 8K UHD, cinematic soft light.",
"Ultra realistic, modern studio style portrait. A young woman lies on her stomach on the white bed, wearing black headphones and smiling softly. Her outfit is an oversized white shirt and light blue jeans. Soft sunlight filters through the window blinds, creating a warm and cheerful atmosphere. The feeling is relaxed and joyful. 8K UHD, cinematic soft light.",
"Ultra realistic, close-up portrait. A young woman sits on the white bed, hugging her knees to her chest and looking at the camera with a gentle smile. She wears a simple oversized white shirt. The background is a soft-focus view of the bright room and window. The lighting is soft and flattering, creating an intimate and pure mood. 8K UHD, cinematic."
]
},
{
    id: 'muse-daisy',
    name: 'Nàng thơ và Cúc Họa Mi',
    category: 'Nàng Thơ & Studio',
    prompts: [
        "Dáng 1: Chân dung siêu thực của một thiếu nữ Việt Nam mặc áo dài trắng tinh khôi, ngồi duyên dáng giữa một cánh đồng cúc họa mi trắng muốt. Cô nhẹ nhàng cầm một bông hoa, ánh mắt mơ màng nhìn xa xăm. Ánh nắng ban mai dịu nhẹ, không khí trong trẻo, lãng mạn. 8K UHD, cinematic.",
        "Dáng 2: Cận cảnh vẻ đẹp trong veo của cô gái với một bông cúc họa mi cài nhẹ sau vành tai. Cô mỉm cười e ấp, đôi mắt lấp lánh niềm vui. Làn da trắng mịn, trang điểm tự nhiên. Hậu cảnh là cánh đồng hoa được làm mờ. 8K UHD, lãng mạn.",
        "Dáng 3: Cô gái đang ngồi trên bãi cỏ, tỉ mỉ kết một vòng hoa cúc họa mi. Vẻ mặt tập trung, dịu dàng. Tà áo dài trắng trải dài trên thảm cỏ xanh. Ánh sáng mềm mại, không khí yên bình. 8K UHD, cinematic.",
        "Dáng 4: Cô gái nằm trên thảm cúc họa mi, mắt nhắm hờ, tận hưởng không khí trong lành. Mái tóc đen dài xõa tự nhiên. Góc chụp từ trên cao xuống, tạo cảm giác thơ mộng. 8K UHD.",
        "Dáng 5: Cô gái đứng giữa cánh đồng, ôm một bó cúc họa mi lớn trong tay. Gió nhẹ làm tà áo dài và mái tóc bay bay. Cô nhìn thẳng vào máy ảnh với nụ cười rạng rỡ. 8K UHD, trong trẻo, đầy sức sống."
    ]
},
{
    id: 'muse-golden-chrysanthemum',
    name: 'Nàng thơ và Cúc Chi Vàng',
    category: 'Nàng Thơ & Studio',
    prompts: [
        "Dáng 1: Một thiếu nữ Việt trong chiếc váy vintage màu vàng nhạt, ngồi bên bàn trà gỗ trong một ngôi nhà cổ. Cô thanh tao nâng tách trà cúc chi vàng, mắt nhìn ra cửa sổ. Một bình cúc chi vàng rực rỡ đặt trên bàn. Ánh nắng chiều ấm áp. 8K UHD, không khí hoài niệm.",
        "Dáng 2: Cô gái đi dạo trong một khu vườn ngập tràn cúc chi vàng. Cô mặc áo dài màu kem, quay đầu nhìn lại máy ảnh với nụ cười dịu dàng. Ánh hoàng hôn nhuộm vàng cả không gian. 8K UHD, lãng mạn, cinematic.",
        "Dáng 3: Cận cảnh cô gái nhẹ nhàng đưa tay chạm vào một bông cúc chi vàng. Ánh sáng vàng ấm áp chiếu lên khuôn mặt thanh tú của cô. Hậu cảnh là khu vườn hoa mờ ảo. 8K UHD, tinh tế, nghệ thuật.",
        "Dáng 4: Cô gái ngồi trên hiên nhà gỗ, bên cạnh là một rổ đầy cúc chi vàng. Cô đang nhặt hoa, vẻ mặt bình yên. Nắng chiều chiếu xiên qua mái hiên. 8K UHD, không khí thanh bình, mộc mạc.",
        "Dáng 5: Cô gái đứng tựa vào một bức tường cũ, tay cầm một vài bông cúc chi vàng. Cô nhìn xa xăm, vẻ mặt trầm tư. Ánh sáng và bóng tối đan xen, tạo chiều sâu cho bức ảnh. 8K UHD, cinematic, đậm chất thơ."
    ]
},
{
    id: 'muse-lotus',
    name: 'Nàng thơ và Hoa Sen',
    category: 'Nàng Thơ & Studio',
    prompts: [
        "Dáng 1: Nét đẹp thuần khiết của người con gái Việt trong tà áo yếm hồng phấn, ngồi trên chiếc thuyền gỗ nhỏ giữa hồ sen. Tay cô nâng niu một búp sen hồng. Sương sớm mờ ảo bao phủ mặt hồ. 8K UHD, không khí thanh tịnh, thoát tục.",
        "Dáng 2: Cô gái mặc áo dài trắng, đứng giữa hồ sen, tay nhẹ nhàng chạm vào một đóa sen đang nở. Mặt nước phẳng lặng như gương, phản chiếu bóng hình cô và bầu trời. Ánh sáng ban mai trong trẻo. 8K UHD, duyên dáng, thanh cao.",
        "Dáng 3: Cận cảnh cô gái dùng một chiếc lá sen lớn để che đầu, mỉm cười tinh nghịch. Vài giọt sương còn đọng trên lá. Vẻ đẹp tự nhiên, mộc mạc. 8K UHD.",
        "Dáng 4: Cô gái ngồi bên bờ hồ, tay ôm bó sen hồng. Cô nhìn vào máy ảnh với ánh mắt dịu dàng. Tà áo dài thướt tha trải trên cỏ. Hậu cảnh là hồ sen bát ngát. 8K UHD, lãng mạn.",
        "Dáng 5: Cô gái đứng trong hồ sen, nâng một đóa sen ngang tầm mắt, hít hà hương thơm tinh khiết. Vẻ mặt thanh thản, an nhiên. Ánh sáng mềm mại, tập trung vào chủ thể. 8K UHD, cinematic."
    ]
},
{
    id: 'baby-balloons',
    name: 'Bé Yêu & Bóng Bay',
    category: 'Concept Baby',
    isFamilyPrompt: true,
    simpleFamilyMode: true,
    prompts: [
        "Dáng 1: Một em bé bụ bẫm đang ngồi giữa một chùm bóng bay màu pastel (hồng, xanh, vàng). Bé tò mò nhìn vào một quả bóng, tay nhỏ xíu sắp chạm vào. Bối cảnh studio trắng sáng, ánh sáng mềm mại. Phong cách ảnh chụp polaroid, chân thực, ấm áp.",
        "Dáng 2: Em bé đang nằm ngửa trên tấm thảm lông mềm mại, xung quanh là những quả bóng bay lơ lửng. Bé cười toe toét, giơ tay và chân lên không trung như đang vui đùa với bóng. Phong cách ảnh chụp polaroid, chân thực, ấm áp.",
        "Dáng 3: Em bé đang cố gắng đứng vịn vào một quả bóng bay khổng lồ. Vẻ mặt tập trung và đáng yêu. Ánh sáng tự nhiên từ cửa sổ chiếu vào. Phong cách ảnh chụp polaroid, chân thực, ấm áp.",
        "Dáng 4: Ảnh chụp cận cảnh em bé đang ôm một quả bóng bay, áp má vào quả bóng với vẻ thích thú. Tiêu điểm vào đôi mắt to tròn và biểu cảm trong veo của bé. Phong cách ảnh chụp polaroid, chân thực, ấm áp.",
        "Dáng 5: Em bé ngồi trong một chiếc giỏ mây lớn, xung quanh là bóng bay. Bé nhìn thẳng vào máy ảnh và cười. Phong cách ảnh chụp polaroid, chân thực, ấm áp."
    ]
},
{
    id: 'baby-chef',
    name: 'Đầu Bếp Nhí',
    category: 'Concept Baby',
    isFamilyPrompt: true,
    simpleFamilyMode: true,
    prompts: [
        "Dáng 1: Đầu bếp nhí bụ bẫm mặc tạp dề trắng và đội mũ đầu bếp to sụ. Bé ngồi trên sàn bếp sạch sẽ, xung quanh là các dụng cụ làm bánh (cây cán bột, bát trộn bột) và một ít bột mì vương vãi. Bé tò mò nếm thử bột trên tay. Phong cách ảnh chụp polaroid, chân thực, vui nhộn.",
        "Dáng 2: Bé đang ngồi trong một chiếc bát trộn bột lớn, tay cầm một chiếc phới lồng, cười toe toét. Mũ đầu bếp hơi lệch trông rất ngộ nghĩnh. Bối cảnh bếp sáng sủa. Phong cách ảnh chụp polaroid, chân thực, vui nhộn.",
        "Dáng 3: Ảnh chụp cận cảnh bé với mặt lấm lem bột mì, miệng chúm chím như đang ăn vụng. Đôi mắt mở to nhìn máy ảnh. Phong cách ảnh chụp polaroid, chân thực, đáng yêu.",
        "Dáng 4: Bé đang cố gắng dùng cây cán bột để cán một miếng bột nhỏ. Vẻ mặt rất tập trung và nghiêm túc. Xung quanh là rau củ quả nhiều màu sắc. Phong cách ảnh chụp polaroid, chân thực, vui nhộn.",
        "Dáng 5: Đầu bếp nhí đang ngồi trên ghế cao, trước mặt là một chiếc bánh cupcake nhỏ. Bé chỉ tay vào chiếc bánh với vẻ mặt háo hức. Phong cách ảnh chụp polaroid, chân thực, vui nhộn."
    ]
},
{
    id: 'baby-angel',
    name: 'Thiên Thần Nhỏ',
    category: 'Concept Baby',
    isFamilyPrompt: true,
    simpleFamilyMode: false,
    prompts: [
        "Dáng 1: Em bé với đôi cánh thiên thần trắng muốt đang nằm ngủ say sưa trên một đám mây bồng bềnh. Ánh sáng vàng dịu nhẹ chiếu từ trên cao. Bối cảnh bầu trời đêm với những vì sao lấp lánh. Không khí yên bình, thần tiên. 8K UHD, cinematic.",
        "Dáng 2: Thiên thần nhỏ đang ngồi, tò mò nhìn vào một quả cầu ánh sáng lơ lửng trước mặt. Đôi cánh trắng mềm mại xòe rộng sau lưng. Bối cảnh khu vườn cổ tích với hoa lá phát sáng. 8K UHD, cinematic.",
        "Dáng 3: Ảnh chụp từ phía sau, thiên thần nhỏ đang nhìn ra một khung cửa sổ lớn, hướng về phía mặt trăng tròn vành vạnh. Đôi cánh thiên thần là điểm nhấn chính. Không khí tĩnh lặng, mơ màng. 8K UHD, cinematic.",
        "Dáng 4: Thiên thần nhỏ đang nằm sấp trên mây, hai tay chống cằm, nhìn xuống dưới với nụ cười tinh nghịch. Đôi cánh nhỏ xinh vểnh lên. 8K UHD, cinematic.",
        "Dáng 5: Chân dung cận cảnh thiên thần nhỏ đang mỉm cười, đôi mắt trong veo. Một vầng hào quang mờ ảo tỏa ra từ trên đầu. Ánh sáng ethereal, mềm mại. 8K UHD, cinematic."
    ]
},
{
    id: 'baby-in-basket',
    name: 'Bé Yêu Trong Giỏ',
    category: 'Concept Baby',
    isFamilyPrompt: true,
    simpleFamilyMode: false,
    prompts: [
        "Dáng 1: Em bé sơ sinh đang cuộn tròn ngủ ngon lành trong một chiếc giỏ mây được lót chăn len mềm mại. Bối cảnh studio tối giản với nền gỗ. Ánh sáng tự nhiên mềm mại từ một phía. 8K UHD, không khí ấm cúng, yên bình.",
        "Dáng 2: Em bé đang thức, nằm ngửa trong giỏ, đôi mắt mở to nhìn lên trên. Chiếc giỏ được trang trí bằng hoa tươi và lá cây. Bối cảnh ngoài trời trong một khu vườn xanh mướt. 8K UHD, trong trẻo, tự nhiên.",
        "Dáng 3: Em bé được quấn trong một chiếc khăn len, chỉ hở khuôn mặt, đặt gọn gàng trong một chiếc giỏ gỗ. Bé đang ngáp trông rất đáng yêu. Bối cảnh studio với đạo cụ là những quả bí ngô nhỏ (chủ đề mùa thu). 8K UHD, ấm áp.",
        "Dáng 4: Em bé đang ngồi dậy trong giỏ, hai tay vịn vào thành giỏ. Bé mỉm cười toe toét nhìn thẳng vào máy ảnh. Bối cảnh bãi biển với cát trắng và sóng biển mờ ảo phía sau. 8K UHD, vui tươi, năng động.",
        "Dáng 5: Chụp từ trên cao xuống, em bé nằm trong giỏ được bao quanh bởi một vòng hoa lớn. Bé đang ngủ say. Bố cục đối xứng, nghệ thuật. 8K UHD, thanh tao, đẹp như tranh vẽ."
    ]
},
{
    id: 'beach-prewedding',
    name: 'Cặp đôi bên bờ biển',
    category: 'Concept WEDDING PHOTOS',
    isFamilyPrompt: true,
    numPortraits: 2,
    prompts: [
        "Dáng 1: Nắm tay đi dạo. Cinematic photo of a couple walking hand-in-hand on a sandy beach at sunset. The groom ([face1]) wears a white linen shirt and khaki trousers. The bride ([face2]) wears a long, flowing white dress. Warm golden light, waves gently lapping the shore. 8K UHD, romantic.",
        "Dáng 2: Bế công chúa. Cinematic photo of the groom ([face1]) lifting the bride ([face2]) in his arms on the beach. They are both laughing joyfully. The ocean and a dramatic sunset sky in the background. 8K UHD, playful and romantic.",
        "Dáng 3: Ngồi trên cát. Cinematic photo of the couple sitting close together on the sand, watching the sunset. The bride ([face2]) rests her head on the groom's ([face1]) shoulder. The scene is peaceful and intimate. 8K UHD.",
        "Dáng 4: Nụ hôn trán. Close-up cinematic photo of the groom ([face1]) gently kissing the bride's ([face2]) forehead. The wind blows her hair softly. The background is a soft-focus ocean. Tender and emotional moment. 8K UHD.",
        "Dáng 5: Chạy nhảy. A dynamic cinematic shot of the couple running playfully along the shoreline, splashing in the water. Full of energy and happiness. Golden hour lighting. 8K UHD."
    ]
},
{
    id: 'classic-studio-wedding',
    name: 'Studio Cưới Cổ Điển',
    category: 'Concept WEDDING PHOTOS',
    isFamilyPrompt: true,
    numPortraits: 2,
    prompts: [
        "Dáng 1: Chân dung cổ điển. Classic studio wedding portrait. The couple stands formally, the groom ([face1]) behind the bride ([face2]) with his hands on her waist. They both look at the camera. Soft, elegant lighting against a simple, textured backdrop (light gray or beige). 8K UHD, timeless.",
        "Dáng 2: Nhìn nhau trìu mến. The couple faces each other, holding hands and gazing into each other's eyes with loving smiles. The bride ([face2]) holds a bouquet of white roses. Studio lighting highlights their expressions. 8K UHD, romantic.",
        "Dáng 3: Khiêu vũ. The groom ([face1]) leads the bride ([face2]) in a gentle dance. Her wedding dress twirls slightly. The moment is captured as if in a slow dance. Dramatic studio lighting. 8K UHD, elegant.",
        "Dáng 4: Nụ hôn. A tasteful and elegant photo of the couple sharing a gentle kiss. The focus is soft, creating a dreamy and romantic atmosphere. 8K UHD.",
        "Dáng 5: Cô dâu ngồi. The bride ([face2]) sits on an elegant chaise lounge, her wedding dress spread out beautifully. The groom ([face1]) stands beside her, looking down at her with adoration. Classic and sophisticated. 8K UHD."
    ]
},
{
    id: 'swordswoman-heroine',
    name: 'Kiếm Hiệp Nữ Nhân',
    category: 'Concept CỔ TRANG',
    prompts: [
        "Dáng 1: Tuốt kiếm. A powerful female warrior in traditional flowing robes stands in a dense bamboo forest. She is drawing a longsword from its scabbard, her expression focused and intense. Dappled sunlight filters through the bamboo stalks. Cinematic, 8K UHD, wuxia style.",
        "Dáng 2: Thiền định. The female warrior sits in meditation on a flat rock by a waterfall. Her sword rests beside her. The mist from the waterfall surrounds her, creating a mystical and serene atmosphere. 8K UHD.",
        "Dáng 3: Đứng trên vách núi. The female warrior stands heroically on the edge of a cliff, her robes and long hair billowing in the wind. She looks out over a landscape of mist-filled valleys and mountains. Epic and majestic. 8K UHD.",
        "Dáng 4: Giao đấu. A dynamic action shot of the female warrior leaping through the air, sword extended, as if in the middle of a fight. The background is a blur of motion. Powerful and energetic. 8K UHD.",
        "Dáng 5: Nghỉ ngơi bên suối. The female warrior kneels by a clear stream to drink water, her sword placed on the ground next to her. A moment of peace amidst her journey. The water reflects the sky and trees. 8K UHD."
    ]
},
{
    id: 'scholar-by-moonlight',
    name: 'Thư Sinh Nguyệt Hạ',
    category: 'Concept CỔ TRANG',
    prompts: [
        "Dáng 1: Đọc sách. A young scholar in elegant ancient robes sits by a window in a traditional wooden house. He is engrossed in reading a scroll under the soft light of a lantern. Outside, a full moon shines brightly. Quiet and intellectual atmosphere. 8K UHD.",
        "Dáng 2: Thổi sáo. The scholar stands on a small wooden bridge over a lotus pond, playing a bamboo flute. The full moon is reflected in the water. The scene is serene and poetic. 8K UHD.",
        "Dáng 3: Thưởng trà. The scholar sits at a stone table in a garden, pouring tea. The moonlight illuminates the steam rising from the teacup. Contemplative and refined. 8K UHD.",
        "Dáng 4: Viết thư pháp. The scholar is practicing calligraphy at his desk, his brush poised over the paper. The room is simple but elegant, with moonlight streaming in. Focused and artistic. 8K UHD.",
        "Dáng 5: Ngắm trăng. The scholar leans against a pavilion railing, looking up at the full moon with a thoughtful expression. The garden around him is bathed in silvery moonlight. Melancholic and beautiful. 8K UHD."
    ]
},
{
    id: 'royal-palace-lady',
    name: 'Concept Hoàng Cung',
    category: 'Concept CỔ TRANG',
    prompts: [
        "Chân dung siêu thực của một mệnh phụ phu nhân Việt Nam thời xưa, mặc Áo Nhật Bình màu hồng phấn thêu họa tiết vàng tinh xảo, đeo vòng cổ ngọc trai. Đầu đội khăn vành màu xanh lam. Bà ngồi uy nghi, tay cầm một chiếc quạt lụa vẽ tranh thủy mặc. Ánh mắt hiền hậu nhưng đầy quyền uy nhìn thẳng vào máy ảnh. Bối cảnh studio với phông nền màu nâu ấm, bên cạnh là một bình gốm cắm hoa sen trắng. Ánh sáng studio mềm mại, cổ điển. 8K UHD, siêu chi tiết, không khí trang trọng.",
        "Ảnh chụp toàn thân một mệnh phụ phu nhân trong trang phục Áo Nhật Bình màu hồng phấn, đứng trong một hành lang cung điện với những cột gỗ và cửa sổ được chạm khắc tinh xảo. Bà nhìn ra ngoài cửa sổ, vẻ mặt trầm tư. Ánh nắng nhẹ chiếu vào, làm nổi bật các chi tiết thêu trên trang phục. 8K UHD, cinematic, không khí hoài cổ.",
        "Ảnh chụp cận cảnh vẻ đẹp quý phái của mệnh phụ. Tiêu điểm là khuôn mặt được trang điểm theo phong cách cung đình, khăn vành màu xanh lam và đôi hoa tai ngọc trai. Bà nhìn vào máy ảnh với một nụ cười nhẹ, bí ẩn. Ánh sáng mềm mại làm nổi bật làn da không tì vết. Hậu cảnh mờ ảo. 8K UHD, sang trọng.",
        "Mệnh phụ phu nhân trong trang phục Áo Nhật Bình đang ngồi bên một bàn trà bằng gỗ mun, tay thanh tao chuẩn bị một ấm trà sen. Ánh mắt bà tập trung vào bộ trà cụ tinh xảo. Bối cảnh là một gian phòng hoàng gia với bình phong và đồ nội thất cổ. Không khí tĩnh lặng, thanh cao. 8K UHD, cinematic.",
        "Mệnh phụ phu nhân trong bộ Áo Nhật Bình đang thong thả dạo bước trong ngự viên. Bà nhẹ nhàng đưa tay chạm vào một cành hoa mẫu đơn. Ánh nắng chiều dịu nhẹ xuyên qua tán lá, tạo nên một khung cảnh thơ mộng. 8K UHD, lãng mạn, đậm chất thơ."
    ]
},
{
    id: 'maxi-on-the-beach',
    name: 'Maxi trên bãi biển',
    category: 'Concept MAXI',
    prompts: [
        "Dáng 1: Dạo bước. A woman in a long, flowing floral maxi dress walks along the wet sand at the shoreline. The wind catches her dress, making it billow out behind her. Sunset or sunrise lighting. 8K UHD, carefree and beautiful.",
        "Dáng 2: Quay lưng. Shot from behind, the woman stands facing the ocean, her maxi dress spread out around her on the sand. She has a wide-brimmed straw hat on. Peaceful and expansive feel. 8K UHD.",
        "Dáng 3: Vui đùa với sóng. The woman is lifting the hem of her maxi dress and playfully kicking at the gentle waves. A joyful, candid moment. Bright daylight. 8K UHD.",
        "Dáng 4: Ngồi trên đá. The woman sits gracefully on a large rock formation by the sea, her maxi dress draping over the rocks. She looks out at the horizon. Dramatic and contemplative. 8K UHD.",
        "Dáng 5: Cầm nón. Close-up shot of the woman holding her straw hat against the wind, with her hair and maxi dress flowing. The focus is on her happy expression and the sense of freedom. 8K UHD."
    ]
},
{
    id: 'maxi-in-flower-field',
    name: 'Maxi giữa cánh đồng hoa',
    category: 'Concept MAXI',
    prompts: [
        "Dáng 1: Chạy giữa đồng hoa. A woman in a vibrant maxi dress runs through a field of wildflowers (e.g., sunflowers or lavender), her arms outstretched. A sense of joy and freedom. Bright, sunny day. 8K UHD.",
        "Dáng 2: Ngồi giữa hoa. The woman is sitting down, nestled among the tall flowers. Her maxi dress blends with the colors of the field. She is smiling softly, looking at the camera. 8K UHD.",
        "Dáng 3: Hái hoa. The woman is gently picking a flower, her expression focused and delicate. The maxi dress has a romantic, bohemian style. Soft, golden hour light. 8K UHD.",
        "Dáng 4: Khiêu vũ. The woman is twirling in her maxi dress, causing the skirt to flare out in a circle. The flower field is a blur of color around her. Dynamic and joyful. 8K UHD.",
        "Dáng 5: Nằm trên cỏ. The woman is lying on her back in a clearing in the flower field, her maxi dress spread out. She looks up at the sky with a peaceful expression. A unique, dreamy perspective. 8K UHD."
    ]
},
{
    id: 'nhat-binh-traditional-dress',
    name: 'Concept áo nhật bình truyền thống',
    category: 'Lễ Hội & Truyền Thống',
    prompts: [
        "Chân dung siêu thực của một phụ nữ Việt Nam trong trang phục Áo Nhật Bình truyền thống màu đỏ thêu phượng hoàng vàng, đội mũ Phốc Địch. Cô đứng uy nghi trong Cung điện cổ kính với các chi tiết kiến trúc gỗ được chạm khắc tinh xảo. Ánh sáng mềm mại, điện ảnh chiếu qua khung cửa sổ, tạo nên một không khí trang trọng và quý phái. 8K UHD, siêu chi tiết.",
        "Người phụ nữ trong trang phục Áo Nhật Bình màu xanh ngọc, đang ngồi trên một chiếc sập gụ trong một gian phòng hoàng cung. Cô cầm một chiếc quạt lụa, ánh mắt nhìn xa xăm đầy suy tư. Hậu cảnh là bình phong được trang trí công phu. Ánh sáng ấm áp từ những ngọn đèn lồng. 8K UHD, không khí hoài cổ.",
        "Ảnh chụp cận cảnh vẻ đẹp của người phụ nữ mặc Áo Nhật Bình, tập trung vào các chi tiết tinh xảo của trang phục và mũ đội đầu. Lớp trang điểm của cô mang phong cách cung đình, nhấn vào đôi môi đỏ và đôi mắt sắc sảo. Ánh sáng dịu nhẹ làm nổi bật làn da mịn màng. Hậu cảnh mờ ảo. 8K UHD, lãng mạn.",
        "Người phụ nữ trong trang phục Áo Nhật Bình màu vàng đang đi dạo trong một khu vườn thượng uyển, giữa những bông hoa mẫu đơn. Tà áo dài quét nhẹ trên lối đi lát sỏi. Cô nhìn sang một bên với nụ cười nhẹ nhàng. Ánh nắng chiều dịu dàng. 8K UHD, cinematic, thơ mộng.",
        "Chân dung người phụ nữ trong trang phục Áo Nhật Bình, một tay cầm quạt lụa che nửa khuôn mặt, chỉ để lộ đôi mắt bí ẩn và quyến rũ. Bối cảnh là một hành lang cung điện với những hàng cột gỗ đỏ. Ánh sáng và bóng tối đan xen tạo chiều sâu. 8K UHD, đầy kịch tính."
    ]
}
];


// Transform it to the structure the app uses
const concepts: Concept[] = promptSets.map(set => {
    const poses: Pose[] = set.prompts.map((prompt, index) => {
        // Attempt to parse a name like "Dáng 1: ..."
        const match = prompt.match(/^(Dáng \d+:?)\s*(.*)/);
        if (match) {
            return {
                id: `${set.id}-p${index}`,
                name: match[1].replace(':', ''),
                prompt: prompt,
            };
        }
        // Fallback to generic naming
        return {
            id: `${set.id}-p${index}`,
            name: `Dáng ${index + 1}`,
            prompt: prompt,
        };
    });

    // Replace [face] with [face1] for consistency
    const updatedPrompts = set.prompts.map(p => p.replace(/\[face\]/g, '[face1]'));

    return {
        ...set,
        prompts: updatedPrompts,
        poses: poses.map(p => ({ ...p, prompt: p.prompt.replace(/\[face\]/g, '[face1]') })),
        requiredPortraits: set.numPortraits || 1,
        maxPortraits: set.numPortraits,
    };
});

// Group by category
const categoriesMap: { [key: string]: Concept[] } = concepts.reduce((acc, concept) => {
    const categoryName = concept.category;
    if (!acc[categoryName]) {
        acc[categoryName] = [];
    }
    acc[categoryName].push(concept);
    return acc;
}, {} as { [key: string]: Concept[] });

export const conceptCategories: ConceptCategory[] = Object.entries(categoriesMap).map(([categoryName, concepts]) => ({
    id: categoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
    name: categoryName,
    concepts: concepts,
}));
