// contentStore.ts

// Helper to save text content
export const saveTextContent = (key: string, content: string): void => {
    try {
        localStorage.setItem(key, content);
    } catch (error) {
        console.error(`Failed to save text content for key "${key}" to localStorage`, error);
    }
};

// Helper to load text content
export const loadTextContent = (key: string, defaultValue: string): string => {
    try {
        const storedContent = localStorage.getItem(key);
        return storedContent !== null ? storedContent : defaultValue;
    } catch (error) {
        console.error(`Failed to load text content for key "${key}" from localStorage`, error);
        return defaultValue;
    }
};

// Helper to save image content (as Data URL)
export const saveImageContent = (key: string, dataUrl: string): void => {
    try {
        localStorage.setItem(key, dataUrl);
    } catch (error) {
        console.error(`Failed to save image content for key "${key}" to localStorage`, error);
        alert('Failed to save image. Storage might be full.');
    }
};

// Helper to load image content
export const loadImageContent = (key: string, defaultUrl: string): string => {
    try {
        const storedContent = localStorage.getItem(key);
        return storedContent !== null ? storedContent : defaultUrl;
    } catch (error) {
        console.error(`Failed to load image content for key "${key}" from localStorage`, error);
        return defaultUrl;
    }
};
