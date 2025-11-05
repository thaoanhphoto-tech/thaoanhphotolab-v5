import type { Concept, Pose } from '../components/concept-photo/types';

// Helper to create poses from a simpler structure
const createPoses = (conceptId: string, prompts: { name: string; prompt: string }[]): Pose[] => {
    return prompts.map((p, index) => ({
        id: `${conceptId}-p${index}`,
        name: p.name,
        prompt: p.prompt,
    }));
};

const koreanStudioPrompts = [
    { name: 'Chân dung chính thức', prompt: 'A bright and airy Korean-style studio family portrait. The family is posed elegantly against a clean, minimalist off-white background. The lighting is soft and natural, creating clear, dewy skin tones. Everyone is looking at the camera with gentle, happy smiles. The overall mood is pure, warm, and sophisticated.' },
    { name: 'Tương tác tự nhiên', prompt: 'A candid Korean-style studio family portrait. The family is interacting naturally on a simple wooden bench, laughing and looking at each other. The background is a clean, bright white. Soft, diffused light fills the scene, creating a warm and heartwarming atmosphere.' },
    { name: 'Ngồi trên sàn', prompt: 'A cozy and minimalist Korean-style studio family portrait. The family is sitting together on a light-colored wooden floor against a plain beige wall. They are dressed in coordinating neutral-colored outfits (whites, beiges, light browns). The mood is relaxed and intimate. The lighting is soft and warm.' },
];

const studioPrompts = [
    { name: 'Chân dung cổ điển', prompt: 'A classic, elegant studio family portrait. The family is posed formally against a simple, textured backdrop (light gray or beige). The lighting is soft and flattering, creating a timeless feel. Everyone is looking at the camera with warm smiles.' },
    { name: 'Vui vẻ trên sofa', prompt: 'A candid-style studio family portrait. The family is sitting together on a modern, comfortable sofa, laughing and interacting with each other. The lighting is bright and cheerful. Minimalist studio setting.' },
    { name: 'Nền tối ấn tượng', prompt: 'A dramatic, fine art studio family portrait against a dark background (deep gray or black). The lighting is cinematic, creating soft highlights and deep shadows, sculpting each person. The mood is intimate and powerful.' },
];

const beachPrompts = [
    { name: 'Dạo bờ biển', prompt: 'A beautiful family portrait on a sandy beach at sunset. The family is walking hand-in-hand along the shoreline. The warm golden light of the setting sun creates a romantic and peaceful atmosphere. The waves are gently lapping at the shore.' },
    { name: 'Chơi đùa với sóng', prompt: 'A joyful and dynamic family photo on the beach. The family is playfully running and splashing in the shallow water. Everyone is laughing. The lighting is bright and sunny, capturing the energy of the moment.' },
    { name: 'Hoàng hôn yên bình', prompt: 'A serene family portrait on the beach. The family is sitting together on the sand, silhouetted against a spectacular sunset. They are looking out at the ocean. The mood is calm and contemplative.' },
];

const picnicPrompts = [
    { name: 'Trên thảm picnic', prompt: 'A heartwarming family portrait during a picnic in a lush green park. The family is sitting together on a checkered blanket, surrounded by a basket of fruit and snacks. Everyone is smiling and happy. The scene is bathed in soft, dappled sunlight filtering through the trees.' },
    { name: 'Chơi đùa trên cỏ', prompt: 'An active and fun family photo in the park. The family is playing together on the grass, maybe throwing a ball or blowing bubbles. The scene is full of movement and laughter. Bright, sunny day.' },
    { name: 'Tựa gốc cây', prompt: 'A rustic family portrait in a park. The family is gathered together, sitting and leaning against the trunk of a large, old tree. The mood is relaxed and natural. The lighting is soft and warm.' },
];

export const familyConcepts: Concept[] = [
    {
        id: 'family-korean-studio',
        name: 'Studio Hàn Quốc',
        category: 'Gia Đình',
        description: 'Phong cách chụp ảnh gia đình trong trẻo, tinh tế và đầy cảm xúc.',
        poses: createPoses('family-korean-studio', koreanStudioPrompts),
        prompts: [],
        requiredPortraits: 2,
        isFamilyPrompt: true,
        simpleFamilyMode: false,
        maxPortraits: 5,
        previewUrl: 'https://i.imgur.com/ETpE4Wa.png'
    },
    {
        id: 'family-studio',
        name: 'Studio Chuyên Nghiệp',
        category: 'Gia Đình',
        description: 'Chân dung gia đình trong studio với ánh sáng và phông nền chuyên nghiệp.',
        poses: createPoses('family-studio', studioPrompts),
        prompts: [], // This is redundant, poses has the prompts
        requiredPortraits: 2,
        isFamilyPrompt: true,
        simpleFamilyMode: false,
        maxPortraits: 5,
        previewUrl: 'https://i.imgur.com/8n22aSU.png'
    },
    {
        id: 'family-beach',
        name: 'Dã ngoại bãi biển',
        category: 'Gia Đình',
        description: 'Những khoảnh khắc vui vẻ và lãng mạn của gia đình trên bãi biển.',
        poses: createPoses('family-beach', beachPrompts),
        prompts: [],
        requiredPortraits: 2,
        isFamilyPrompt: true,
        simpleFamilyMode: false,
        maxPortraits: 5,
        previewUrl: 'https://i.imgur.com/eP4zXf5.png'
    },
    {
        id: 'family-picnic',
        name: 'Picnic trong công viên',
        category: 'Gia Đình',
        description: 'Ghi lại những khoảnh khắc ấm cúng và tự nhiên trong công viên.',
        poses: createPoses('family-picnic', picnicPrompts),
        prompts: [],
        requiredPortraits: 2,
        isFamilyPrompt: true,
        simpleFamilyMode: false,
        maxPortraits: 5,
        previewUrl: 'https://i.imgur.com/M6Lg4gJ.png'
    },
     {
        id: 'loving-family-simplified',
        name: 'Khoảnh khắc đời thường',
        category: 'Gia Đình',
        description: 'Ảnh chụp chân thực, ấm áp theo phong cách máy ảnh film/polaroid.',
        poses: createPoses('loving-family-simplified', [
            { name: 'Cuộc chiến gối', prompt: 'A candid, clear photograph in the style of a polaroid camera, with a slight blur effect and flash lighting. The family is having a fun pillow fight on the bed, with feathers flying around. Everyone is laughing heartily. The setting is a cozy bedroom with white curtains.' },
            { name: 'Xem lại kỷ niệm', prompt: 'A candid, clear photograph in the style of a polaroid camera, with a slight blur effect and flash lighting. The family is gathered on the floor, looking through an old photo album together. People are pointing and smiling as they remember memories. Warm light from a table lamp illuminates the scene. White curtains.' },
            { name: 'Bếp vui nhộn', prompt: 'A candid, clear photograph in the style of a polaroid camera, with a slight blur effect and flash lighting. The whole family is baking together in the kitchen, with flour on their faces and clothes. They are laughing and joking with each other. The kitchen setting has white curtains.' },
        ]),
        prompts: [],
        requiredPortraits: 2,
        isFamilyPrompt: true,
        simpleFamilyMode: true,
        maxPortraits: 5,
        previewUrl: 'https://i.imgur.com/x4xYmUn.png'
    },
];
