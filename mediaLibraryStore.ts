// mediaLibraryStore.ts
import { loadTextContent, saveTextContent } from './contentStore';

export interface LibraryImage {
    id: string;
    url: string;
}

const getLibraryKey = (itemKey: string) => `media_library_${itemKey}`;

// This function gets the library for an item, and transparently creates it if it doesn't exist
export const getMediaLibrary = (itemKey: string, currentImageUrl: string): LibraryImage[] => {
    const libraryKey = getLibraryKey(itemKey);
    const libraryJson = loadTextContent(libraryKey, '[]');
    
    try {
        const library = JSON.parse(libraryJson) as LibraryImage[];
        // Migration: if library is empty, create it with the current image
        if (library.length === 0 && currentImageUrl && !currentImageUrl.startsWith('https://i.imgur.com')) { // Don't migrate default placeholders
            const singleImageUrl = localStorage.getItem(itemKey); // Use raw localStorage to check if it's a real stored value
            if (singleImageUrl) {
                 const initialImage: LibraryImage = { id: `img-${Date.now()}`, url: currentImageUrl };
                 saveMediaLibrary(itemKey, [initialImage]);
                 return [initialImage];
            }
        }
        return library;
    } catch {
        // If parsing fails, check for a single image to migrate
        if (currentImageUrl && !currentImageUrl.startsWith('https://i.imgur.com')) {
            const singleImageUrl = localStorage.getItem(itemKey);
            if (singleImageUrl) {
                const initialImage: LibraryImage = { id: `img-${Date.now()}`, url: currentImageUrl };
                saveMediaLibrary(itemKey, [initialImage]);
                return [initialImage];
            }
        }
        return [];
    }
};

export const saveMediaLibrary = (itemKey: string, library: LibraryImage[]): void => {
    const libraryKey = getLibraryKey(itemKey);
    saveTextContent(libraryKey, JSON.stringify(library));
};

export const addImageToLibrary = (itemKey: string, imageUrl: string): LibraryImage[] => {
    const library = getMediaLibrary(itemKey, ''); // No need for current image URL when adding
    const newImage: LibraryImage = { id: `img-${Date.now()}-${Math.random()}`, url: imageUrl };
    const newLibrary = [newImage, ...library]; // Add to the front
    saveMediaLibrary(itemKey, newLibrary);
    return newLibrary;
};

export const removeImageFromLibrary = (itemKey: string, imageId: string): LibraryImage[] => {
    const library = getMediaLibrary(itemKey, '');
    const newLibrary = library.filter(img => img.id !== imageId);
    saveMediaLibrary(itemKey, newLibrary);
    return newLibrary;
};
