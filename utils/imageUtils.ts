import { User } from "../userStore";

// This utility simulates client-side image compression.
// In a real-world scenario, you might use a library like 'browser-image-compression'.

const MAX_WIDTH = 1920;
const MAX_HEIGHT = 1920;
const QUALITY = 0.8;

export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        image.src = e.target.result;
      } else {
        reject(new Error("Couldn't read file."));
      }
    };

    image.onload = () => {
      let width = image.width;
      let height = image.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error("Couldn't get canvas context."));
        return;
      }

      ctx.drawImage(image, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas to Blob conversion failed."));
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: `image/jpeg`,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        QUALITY
      );
    };

    image.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

export const applyWatermark = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous'; // Important for loading images from other origins
        image.src = imageUrl;

        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context"));
            }

            // Draw the original image
            ctx.drawImage(image, 0, 0);

            // Prepare watermark text
            const watermarkText = 'Thảo Anh Photo Lab';
            const fontSize = Math.max(30, Math.floor(canvas.width / 20));
            ctx.font = `bold ${fontSize}px Arial`;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Rotate context to draw diagonal text
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate(-Math.PI / 6); // Rotate by -30 degrees

            // Draw the watermark multiple times
            const textMetrics = ctx.measureText(watermarkText);
            const textWidth = textMetrics.width * 1.5; // Add spacing
            const textHeight = fontSize * 2.5;

            for (let y = -centerY * 1.5; y < centerY * 1.5; y += textHeight) {
                for (let x = -centerX * 1.5; x < centerX * 1.5; x += textWidth) {
                     ctx.fillText(watermarkText, x, y);
                }
            }

            // Reset transformation
            ctx.rotate(Math.PI / 6);
            ctx.translate(-centerX, -centerY);

            resolve(canvas.toDataURL('image/png'));
        };

        image.onerror = (error) => {
            console.error("Failed to load image for watermarking:", error);
            reject(new Error("Failed to load image for watermarking."));
        };
    });
};

export const dataURLtoFile = (dataurl: string, filename: string): File | null => {
    const arr = dataurl.split(',');
    if (arr.length < 2) { return null; }
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) { return null; }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};
