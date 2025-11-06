
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import type { ImageAnalysisResult, Gender } from "../types";
import type { RelightSettings, Quality, UpscaleQuality } from '../components/pro-ai-relight/types';
import type { UploadedPortrait, FamilyMember, MemberRole } from '../components/concept-photo/types';


// Lazy initialization for the GoogleGenAI client to prevent errors on module load.
let aiInstance: GoogleGenAI | null = null;
const getAi = (): GoogleGenAI => {
    if (!aiInstance) {
        // FIX: Use process.env.API_KEY as per the guidelines
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            console.error("API_KEY is not defined in the environment.");
            throw new Error("API key is missing.");
        }
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
};

async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve(''); // Should not happen with readAsDataURL
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
}

async function dataUrlToGenerativePart(dataUrl: string) {
    const [header, data] = dataUrl.split(',');
    const mimeType = header.match(/:(.*?);/)?.[1] || 'image/png';
    return {
      inlineData: { data, mimeType },
    };
}

// Helper to safely parse image model responses
const parseImageModelResponse = (response: GenerateContentResponse): { image: string | null; text: string | null } => {
    let generatedImage: string | null = null;
    let generatedText: string | null = null;

    if (!response.candidates || response.candidates.length === 0) {
        return { image: null, text: "The AI model did not return a response. This could be due to a network issue or an internal error." };
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason === 'SAFETY') {
        return { image: null, text: "The request was blocked due to safety settings. Please modify your prompt or image." };
    }
    
    if (candidate.finishReason === 'RECITATION') {
         return { image: null, text: "The request was blocked due to recitation policy." };
    }
    
    if (!candidate.content || !candidate.content.parts) {
         return { image: null, text: "The AI model returned an empty or blocked response. Please try again." };
    }

    for (const part of candidate.content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            generatedImage = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
            generatedText = part.text;
        }
    }

    return { image: generatedImage, text: generatedText };
};


export async function analyzeImage(imageFile: File): Promise<ImageAnalysisResult> {
  const ai = getAi();
  const imagePart = await fileToGenerativePart(imageFile);
  const prompt = `Bạn là một chuyên gia AI kiểm tra ảnh hộ chiếu/visa với độ chính xác cao. Phân tích kỹ lưỡng hình ảnh được cung cấp và thực hiện ba nhiệm vụ:
1.  **Xác định giới tính:** Nhận diện giới tính của người trong ảnh.
2.  **Ước tính độ tuổi:** Cung cấp một khoảng tuổi ước tính (ví dụ: 25-30 tuổi).
3.  **Kiểm tra hợp lệ:** Đánh giá xem ảnh có khả năng bị từ chối khi nộp hồ sơ chính thức hay không dựa trên các tiêu chí nghiêm ngặt sau.

**Tiêu chí kiểm tra:**
- **Phông nền:** Nền phải là màu trơn, trung tính, không có bóng hoặc hoa văn.
- **Ánh sáng:** Khuôn mặt phải được chiếu sáng đều, không có bóng tối che khuất đường nét.
- **Tư thế:** Người phải nhìn thẳng vào máy ảnh, đầu thẳng, không nghiêng.
- **Biểu cảm:** Biểu cảm phải trung tính, mắt mở to, miệng ngậm.
- **Vật cản:** Khuôn mặt phải hoàn toàn rõ ràng, không bị tóc che mắt/chân mày, kính không lóa.
- **Chất lượng:** Ảnh phải rõ nét, không mờ, nhiễu hạt.

**Định dạng đầu ra:**
Cung cấp kết quả dưới dạng một đối tượng JSON duy nhất.
- Ở cấp cao nhất, thêm trường "gender" (giá trị "Nam" hoặc "Nữ") và trường "age" (ví dụ: "25-30 tuổi").
- Thêm một trường "feedback" là một mảng các đối tượng. Đối với mỗi tiêu chí kiểm tra, tạo một đối tượng trong mảng này với:
  - "isGood": true nếu đạt, false nếu không đạt.
  - "message": Một câu phản hồi. Nếu không đạt, bắt đầu bằng "Ảnh bạn có thể bị từ chối vì...".`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          gender: { 
            type: Type.STRING, 
            description: "Giới tính được phát hiện, chỉ có thể là 'Nam' hoặc 'Nữ'." 
          },
          age: {
            type: Type.STRING,
            description: "Độ tuổi ước tính của người trong ảnh, ví dụ: '25-30 tuổi'."
          },
          feedback: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                isGood: { type: Type.BOOLEAN },
                message: { type: Type.STRING },
              },
              required: ['isGood', 'message']
            },
          },
        },
        required: ['gender', 'feedback']
      },
    },
  });

  try {
    const jsonString = response.text.trim();
    // Gemini may wrap the JSON in markdown, so we need to strip it
    const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
    const parsed = JSON.parse(cleanedJsonString);
    if (parsed.gender !== 'Nam' && parsed.gender !== 'Nữ') {
        // Handle cases where AI returns an invalid gender string
        delete parsed.gender;
    }
    if (!Array.isArray(parsed.feedback)) {
      parsed.feedback = [{ isGood: false, message: "Phản hồi từ AI không hợp lệ." }];
    }
    return parsed as ImageAnalysisResult;
  } catch (e) {
    console.error("Failed to parse JSON from analysis response:", response.text);
    // Return a default error feedback
    return {
      feedback: [{ isGood: false, message: "Không thể phân tích ảnh. Vui lòng thử lại." }]
    };
  }
}

export async function analyzeInvoiceForStockIn(imageFile: File): Promise<any> {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `Bạn là một trợ lý kế toán AI, chuyên trích xuất dữ liệu từ hóa đơn. Phân tích hình ảnh hóa đơn này và trả về một đối tượng JSON. Cố gắng trích xuất tên Nhà cung cấp, ngày hóa đơn, và danh sách các mặt hàng. Đối với mỗi mặt hàng, trích xuất tên, số lượng, và đơn giá. Nếu không tìm thấy thông tin nào, hãy để trống chuỗi hoặc giá trị là 0.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    supplierName: {
                        type: Type.STRING,
                        description: "Tên của nhà cung cấp trên hóa đơn.",
                    },
                    invoiceDate: {
                        type: Type.STRING,
                        description: "Ngày trên hóa đơn, định dạng YYYY-MM-DD.",
                    },
                    items: {
                        type: Type.ARRAY,
                        description: "Danh sách các mặt hàng trên hóa đơn.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                materialName: { type: Type.STRING, description: "Tên mặt hàng." },
                                quantity: { type: Type.NUMBER, description: "Số lượng." },
                                unitPrice: { type: Type.NUMBER, description: "Đơn giá." },
                            },
                        },
                    },
                },
            },
        },
    });
    
    try {
        const jsonString = response.text.trim();
        const cleanedJsonString = jsonString.replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(cleanedJsonString);
    } catch (e) {
        console.error("Failed to parse invoice JSON:", response.text);
        throw new Error("AI không thể đọc được hóa đơn. Vui lòng thử lại với ảnh rõ nét hơn.");
    }
}


export async function generateIdPhoto(
  imageFile: File,
  background: string,
  outfit: string,
  gender: string,
  hairstyle: string,
  aspectRatio: string,
  retouch: string,
  lighting: string,
  expression: string,
  customPrompt: string
): Promise<{ image: string | null; text: string | null }> {
  const ai = getAi();
  const imagePart = await fileToGenerativePart(imageFile);

  let retouchPromptPart = '';
  switch (retouch) {
    case 'Nhẹ nhàng':
      retouchPromptPart = `**Skin Retouching (Gentle):** Perform gentle skin retouching. Smooth out minor blemishes, spots, or redness. Even out the skin tone slightly but you MUST preserve the natural skin texture. **Crucially, maintain the original skin tone and color; do not make it warmer or otherwise alter its hue.** The result should look natural, not overly airbrushed or fake.`;
      break;
    case 'Chuyên nghiệp':
      retouchPromptPart = `**Skin Retouching (Professional):** Apply professional-level skin retouching. Smooth the skin and even out the skin tone. **It is absolutely essential to maintain the original skin tone and color palette of the person. Do not make the skin tone warmer, cooler, or change its hue in any way.** Perform subtle dodging and burning to enhance facial contours (cheeks, nose, jawline) and add dimension, making the face look more defined. It is CRITICAL that you preserve essential details like skin texture for a realistic yet polished and high-end look.`;
      break;
    default: // 'Không'
      break;
  }
  
  let backgroundPromptPart: string;
  let framingPromptPart: string;
  const isStyledPortrait = background.startsWith('Style: ');

  if (isStyledPortrait) {
    backgroundPromptPart = `**Background:** Create a beautiful, photorealistic background based on this theme: "${background.substring(7)}". The person should be seamlessly integrated into this new environment.`;
    framingPromptPart = `**Framing & Aspect Ratio:** Compose a well-balanced portrait. The person is the main subject, but include enough of the styled background to create an atmospheric and visually appealing image. The final image should be cropped to an aspect ratio of '${aspectRatio}'. If 'Ảnh gốc' (Original) is selected, maintain the original aspect ratio but still apply all other edits.`;
  } else {
    backgroundPromptPart = `**Background:** Completely replace the current background with a solid, even '${background}' color.`;
    framingPromptPart = `**Cropping & Aspect Ratio:** The final image must be a front-facing portrait, focusing on the head and shoulders. Crop the photo to a standard ID photo aspect ratio of '${aspectRatio}'. If 'Ảnh gốc' (Original) is selected, maintain the original aspect ratio but still apply all other edits.`;
  }

  const edits = [
    backgroundPromptPart,
    `**Outfit:** ${outfit !== 'Giữ nguyên trang phục' ? `Dress the person in a '${outfit}'. The outfit should look natural, fit the person's posture, and be appropriate for their specified gender: '${gender}'.` : 'Maintain the original outfit. Do not change the person\'s clothing.'}`,
    `**Hairstyle:** ${hairstyle !== 'Giữ nguyên' ? `Change the person's hairstyle to '${hairstyle}'.` : 'Maintain the original hairstyle.'} The new hairstyle must look realistic and suit their face.`
  ];

  if (expression === 'Giữ nguyên') {
    edits.push(`**Facial Expression Preservation:** It is absolutely mandatory to preserve the person's exact original facial expression. Do not add a smile, do not open the mouth, do not alter the eyes or eyebrows. Maintain the neutral or existing expression from the source photo without any modification.`);
  } else {
    edits.push(`**Facial Expression Adjustment:** Modify the person's facial expression to '${expression}'. The adjustment must be subtle, natural, and believable. **IMPORTANT:** This is a very sensitive change. You MUST strictly adhere to the main crucial instruction to preserve the person's core identity and facial structure. The expression change should not make the person unrecognizable.`);
  }

  if (lighting === 'Bật') {
      edits.push(`**Lighting Adjustment (Studio Quality):** Simulate professional studio lighting on the person's face. The lighting must be soft and even. **Eliminate any harsh shadows, especially under the nose, chin, and around the eyes.** Ensure there are no hotspots or blown-out highlights on the skin. The goal is to create a balanced, well-lit portrait where facial features are clear and distinct.`);
  }

  if (retouchPromptPart) {
      edits.push(retouchPromptPart);
  }
  
  edits.push(framingPromptPart);
  edits.push(`**Quality:** The final image must be of the highest possible resolution and quality, free from any digital noise or compression artifacts. Aim for a professional, sharp, and clear result suitable for printing. Do not add any text, watermarks, or other artifacts.`);
  
  const numberedEdits = edits.map((edit, index) => `${index + 1}. ${edit}`).join('\n\n');

  let prompt = `Please edit the user's photo to make it a professional, high-quality portrait.

**CRUCIAL INSTRUCTION: You MUST NOT alter the person's facial features, identity, or expression.** The primary goal is to preserve the exact likeness of the individual from the original photo. Any changes to the facial structure, eyes, nose, mouth, or skin tone are strictly forbidden. The person in the output image must be perfectly recognizable as the same person in the input image. This is the most important rule.

Apply the following edits based on the user's selections, while strictly adhering to the crucial instruction above:

${numberedEdits}
`;

  if (customPrompt) {
    prompt += `\n**Additional User Request:** ${customPrompt}\nThis is a high-priority instruction from the user that you must follow carefully.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        imagePart,
        { text: prompt },
      ],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  return parseImageModelResponse(response);
}


export async function restorePhoto(
  imageFile: File,
  outfit: string,
  hairstyle: string,
  accessories: string[],
  customRequest: string
): Promise<{ image: string | null; text: string | null }> {
  const ai = getAi();
  const imagePart = await fileToGenerativePart(imageFile);

  const edits = [
    "**1. Phục hồi & Nâng cấp chất lượng:**",
    "   - Sửa chữa tất cả các vết xước, nếp gấp, vết ố và các hư hỏng khác.",
    "   - Tăng cường độ nét và chi tiết trên toàn bộ ảnh, đặc biệt là khuôn mặt.",
    "   - Khử nhiễu (noise) và làm mịn các vùng bị hạt (grainy).",
    "   - Tô màu cho ảnh (nếu là ảnh đen trắng) với màu sắc tự nhiên, chân thực, mang phong cách ảnh chụp xưa.",
    "",
    "**2. Giữ nguyên nhận dạng:**",
    "   - **YÊU CẦU TỐI QUAN TRỌNG:** Phải giữ lại 100% nhận dạng, đường nét khuôn mặt, và biểu cảm gốc của người trong ảnh. Không được thay đổi hay làm đẹp khuôn mặt.",
    "",
    "**3. Tùy chỉnh theo yêu cầu:**"
  ];

  if (outfit && outfit !== 'Giữ nguyên') {
    edits.push(`   - Thay đổi trang phục của người trong ảnh thành '${outfit}' theo phong cách cổ điển, phù hợp với không khí của một bức ảnh chân dung xưa.`);
  }

  if (hairstyle && hairstyle !== 'Giữ nguyên') {
    edits.push(`   - Thay đổi kiểu tóc thành '${hairstyle}' theo phong cách cổ điển, phù hợp với khuôn mặt.`);
  }
  
  if (accessories && accessories.length > 0) {
      edits.push(`   - Thêm các phụ kiện sau một cách tinh tế và phù hợp: ${accessories.join(', ')}.`);
  }

  if (customRequest) {
      edits.push(`   - **Yêu cầu đặc biệt từ người dùng:** ${customRequest}.`);
  }

  const prompt = `Bạn là một chuyên gia phục chế và chỉnh sửa ảnh chân dung cũ. Nhiệm vụ của bạn là biến bức ảnh gốc được cung cấp thành một tác phẩm chân dung nghệ thuật, chất lượng cao, mang phong cách hoài cổ. Hãy thực hiện các bước sau một cách cẩn thận:\n\n${edits.join('\n')}`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [imagePart, { text: prompt }] },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  return parseImageModelResponse(response);
}

export async function relightImage(
    imageFile: File,
    settings: RelightSettings
): Promise<{ image: string | null; text: string | null }> {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(imageFile);

    let prompt = `Bạn là một chuyên gia chỉnh sửa ảnh chuyên về ánh sáng studio. Nhiệm vụ của bạn là tái tạo ánh sáng cho bức chân dung được cung cấp dựa trên thông số của người dùng. **QUAN TRỌNG: Bạn PHẢI giữ nguyên nhận dạng và đặc điểm khuôn mặt của người đó chính xác như trong ảnh gốc.**
`;

    if (settings.preserveExpression) {
        prompt += `\n**Quy tắc Biểu cảm Khuôn mặt:** Bắt buộc phải giữ nguyên biểu cảm khuôn mặt gốc. KHÔNG thêm nụ cười hoặc thay đổi miệng, mắt. Đây là một yêu cầu nghiêm ngặt.\n`;
    }

    prompt += `
**Thiết lập Ánh sáng:**
- **Loại ánh sáng:** Áp dụng thiết lập '${settings.lightType}'.
`;

    switch (settings.lightType) {
        case 'natural':
            prompt += '- Mô phỏng ánh sáng tự nhiên, mềm mại, như từ một cửa sổ lớn. Đảm bảo chiếu sáng đều và bóng đổ nhẹ nhàng.';
            break;
        case 'one-light':
            prompt += `- Sử dụng một nguồn sáng duy nhất. Đặt đèn chính để tạo hiệu ứng ngược sáng '${settings.backlightDirection}', với màu đèn chính là '${settings.lightColor1}'.`;
            break;
        case 'two-lights':
            prompt += `- Sử dụng thiết lập hai đèn. Đèn chính là '${settings.lightColor1}' và đèn phụ/viền là '${settings.lightColor2}'. Tạo ra một diện mạo năng động và chuyên nghiệp.`;
            break;
        case 'three-lights':
            prompt += `- Sử dụng thiết lập ba điểm sáng cổ điển. Đèn chính là '${settings.lightColor1}', đèn phụ là '${settings.lightColor2}', và đèn ngược/tóc là '${settings.lightColor3}'. Tạo ra một diện mạo bóng bẩy, thương mại.`;
            break;
    }
    
    prompt += `\n- **Chất lượng Đầu ra:** Độ phân giải ảnh cuối cùng nên là '${settings.quality}'.`;

    if (settings.customPrompt) {
        prompt += `\n- **Hướng dẫn Bổ sung:** ${settings.customPrompt}`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    return parseImageModelResponse(response);
}

export async function generateImageFromPrompt(
    prompt: string,
    aspectRatio: string,
): Promise<{ images: string[] | null; text: string | null }> {
    const ai = getAi();
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 2,
                outputMimeType: 'image/png',
                aspectRatio: aspectRatio as "1:1" | "16:9" | "9:16" | "4:3" | "3:4",
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const images = response.generatedImages.map(img => `data:image/png;base64,${img.image.imageBytes}`);
            return { images, text: null };
        }
        return { images: null, text: "No images were generated." };
    } catch (e: any) {
        console.error("Image generation failed:", e);
        return { images: null, text: e.message || "An unexpected error occurred during image generation." };
    }
}

export async function generateConceptPhoto(
    portraits: (UploadedPortrait | FamilyMember)[],
    prompt: string,
    isFamilyPrompt: boolean,
    simpleFamilyMode: boolean,
    preserveFaces: boolean,
    arrangementRequest?: string,
    additionalRequest?: string
): Promise<{ image: string | null; text: string | null }> {
    const ai = getAi();
    
    let fullPrompt = prompt;

    if (isFamilyPrompt) {
        let faceMapping = 'Character Definitions:\n';
        portraits.forEach((p, index) => {
            if ('role' in p) { // FamilyMember
                const member = p as FamilyMember;
                let description = `[face${index + 1}] is the person in image ${index + 1} (role: ${member.role}`;
                if (member.height) {
                    description += `, height: ${member.height}cm`;
                }
                description += '). ';
                faceMapping += description;
            } else { // UploadedPortrait (for single person concepts)
                faceMapping += `[face${index + 1}] is the person in image ${index + 1}. `;
            }
        });
        fullPrompt = `${faceMapping}\n\n**Scene Description:**\n${prompt}`;
        
        if (arrangementRequest) {
            fullPrompt += `\n\n**Arrangement:** ${arrangementRequest}. Use the height information to scale the people realistically.`;
        } else {
            fullPrompt += `\n\n**Arrangement:** Arrange the people naturally based on their roles and heights.`;
        }
    }

    if (preserveFaces) {
        fullPrompt = `**CRUCIAL INSTRUCTION: You MUST preserve the exact facial features, identity, and likeness of each person from their respective input photos.** This includes their facial expressions. Do not add smiles or change their expressions. The output faces must be perfectly recognizable.\n\n${fullPrompt}`;
    }
    
    if (additionalRequest) {
        fullPrompt += `\n\n**Additional User Request:** ${additionalRequest}`;
    }

    const imageParts = await Promise.all(portraits.map(p => fileToGenerativePart(p.file)));

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [...imageParts, { text: fullPrompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    return parseImageModelResponse(response);
}

export async function analyzeStyleFromImage(imageFile: File): Promise<string | null> {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = "You are an expert art director and colorist. Analyze the provided image and describe its visual style, color palette, lighting, and overall mood in a concise, descriptive prompt that can be used to replicate this style on another image. Focus on keywords. For example: 'Cinematic, warm golden hour lighting, high contrast, desaturated blues, vibrant oranges, nostalgic and romantic mood, soft focus.'";

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
    });

    return response.text.trim();
}

export async function applyColorGrade(
    imageFile: File,
    colorPrompt: string,
    quality: UpscaleQuality | 'none'
): Promise<{ image: string | null; text: string | null }> {
    const ai = getAi();
    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `You are a professional colorist. Apply the following color grade and style to the user's image. **CRUCIAL: Do not change the content, composition, or subjects of the image. Only adjust the colors, lighting, and overall aesthetic.**

**Target Style:** ${colorPrompt}

**Output Quality:** Upscale the image to ${quality} resolution if specified, otherwise maintain original resolution.
`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, { text: prompt }],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    return parseImageModelResponse(response);
}

export async function generateAdvancedSocialMediaPost(
    mainImages: File[],
    templateImage: File,
    logoImage: File | null,
    additionalRequest: string
): Promise<{ image: string | null; text: string | null }> {
    const ai = getAi();

    const parts = [];

    const templatePart = await fileToGenerativePart(templateImage);
    parts.push(templatePart);
    let prompt = "You are a professional graphic designer creating a social media post. Use the first image provided as the main design template/background.\n\n";

    for (let i = 0; i < mainImages.length; i++) {
        const mainImagePart = await fileToGenerativePart(mainImages[i]);
        parts.push(mainImagePart);
        prompt += `- Integrate the subject from the image #${i + 2} seamlessly into the template. Remove its original background. Preserve the subject's appearance and identity.\n`;
    }

    if (logoImage) {
        const logoPart = await fileToGenerativePart(logoImage);
        parts.push(logoPart);
        prompt += `- Place the logo (last image provided) tastefully onto the design, usually in a corner or a designated logo area. Ensure it is clear and legible.\n`;
    }

    if (additionalRequest) {
        prompt += `\n**Additional Instructions:** ${additionalRequest}\n`;
    }
    
    prompt += "\nCombine all elements to create a polished, professional, and eye-catching social media post.";

    parts.push({ text: prompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    return parseImageModelResponse(response);
}

export async function generateTaxAnalysis(data: {
    totalRevenue: number;
    totalCogs: number;
    totalOpex: number;
    startDate: string;
    endDate: string;
}): Promise<string | null> {
    const ai = getAi();
    const { totalRevenue, totalCogs, totalOpex, startDate, endDate } = data;

    const prompt = `Bạn là một trợ lý kế toán thuế AI chuyên nghiệp tại Việt Nam. Dựa trên các số liệu tài chính được cung cấp cho khoảng thời gian từ ${startDate} đến ${endDate}, hãy tạo một báo cáo phân tích và ước tính thuế.

**Dữ liệu đầu vào:**
-   **Tổng Doanh thu:** ${totalRevenue.toLocaleString('vi-VN')} VNĐ
-   **Tổng Giá vốn hàng bán (COGS):** ${totalCogs.toLocaleString('vi-VN')} VNĐ
-   **Tổng Chi phí hoạt động (OPEX):** ${totalOpex.toLocaleString('vi-VN')} VNĐ

**Yêu cầu báo cáo:**
Hãy trình bày báo cáo một cách rõ ràng, chuyên nghiệp bằng tiếng Việt, bao gồm các mục sau:

1.  **Tóm tắt tài chính:**
    *   Tổng Doanh thu.
    *   Lợi nhuận gộp (Doanh thu - COGS).
    *   Lợi nhuận trước thuế (Lợi nhuận gộp - OPEX).

2.  **Ước tính Nghĩa vụ Thuế (Giả định):**
    *   **Thuế Giá trị gia tăng (GTGT):** Giả sử thuế suất là 10% và 80% chi phí (COGS + OPEX) có hóa đơn đầu vào hợp lệ để khấu trừ. Hãy tính số thuế GTGT đầu ra, thuế GTGT đầu vào được khấu trừ, và số thuế GTGT dự kiến phải nộp.
    *   **Thuế Thu nhập doanh nghiệp (TNDN):** Giả sử thuế suất là 20%. Hãy tính số thuế TNDN tạm tính dựa trên lợi nhuận trước thuế.

3.  **Tư vấn và Tóm tắt:**
    *   Cung cấp một đoạn tóm tắt ngắn gọn về tình hình tài chính và nghĩa vụ thuế dự kiến.
    *   Đưa ra một vài lời khuyên chung về việc quản lý chi phí và tối ưu hóa thuế (ví dụ: tầm quan trọng của việc thu thập hóa đơn đầu vào).

**Quan trọng:** Bắt đầu báo cáo với tiêu đề "**BÁO CÁO PHÂN TÍCH THUẾ TỪ TRỢ LÝ AI**" và kết thúc bằng tuyên bố miễn trừ trách nhiệm sau: "*Lưu ý: Báo cáo này được tạo bởi AI và chỉ mang tính chất tham khảo, ước tính. Vui lòng tham khảo ý kiến của kế toán viên chuyên nghiệp để có thông tin chính xác và tuân thủ pháp luật.*"

Sử dụng định dạng markdown để làm nổi bật các tiêu đề và con số quan trọng.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
    });

    return response.text.trim();
}
