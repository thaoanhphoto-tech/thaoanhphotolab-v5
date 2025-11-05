// iconStore.ts
import React from 'react';
import { PhoneIcon } from './components/icons/PhoneIcon';
import { PhoneIconAlt1 } from './components/icons/PhoneIconAlt1';
import ZaloIcon from './components/icons/ZaloIcon';
import { FacebookIcon } from './components/icons/FacebookIcon';
import { FacebookIconAlt1 } from './components/icons/FacebookIconAlt1';

export type IconID = string;

export interface CustomIcon {
    id: string;
    name: string;
    type: 'phone' | 'zalo' | 'facebook';
    dataUrl: string;
}

const CUSTOM_ICONS_KEY = 'app_custom_icons_v1';
const ICON_SETTINGS_KEY = 'app_icon_settings_v1';

// --- Icon Library Management ---

const DEFAULT_ICON_COMPONENTS: Record<string, React.FC<any>> = {
    'phone-default': PhoneIcon,
    'phone-alt1': PhoneIconAlt1,
    'zalo-default': ZaloIcon,
    'facebook-default': FacebookIcon,
    'facebook-alt1': FacebookIconAlt1,
};

const DEFAULT_ICON_OPTIONS: { [key in 'phone' | 'zalo' | 'facebook']: { id: IconID; name: string }[] } = {
    phone: [{ id: 'phone-default', name: 'Mặc định (Viền)' }, { id: 'phone-alt1', name: 'Thay thế (Đặc)' }],
    zalo: [{ id: 'zalo-default', name: 'Mặc định' }],
    facebook: [{ id: 'facebook-default', name: 'Mặc định (Chữ F)' }, { id: 'facebook-alt1', name: 'Thay thế (Tròn)' }],
};

export const getCustomIcons = (): CustomIcon[] => {
    try {
        const json = localStorage.getItem(CUSTOM_ICONS_KEY);
        return json ? JSON.parse(json) : [];
    } catch { return []; }
};

export const saveCustomIcons = (icons: CustomIcon[]): void => {
    localStorage.setItem(CUSTOM_ICONS_KEY, JSON.stringify(icons));
};

export const addCustomIcon = (icon: CustomIcon): CustomIcon[] => {
    const icons = getCustomIcons();
    const newIcons = [icon, ...icons];
    saveCustomIcons(newIcons);
    return newIcons;
};

export const removeCustomIcon = (iconId: string): CustomIcon[] => {
    const icons = getCustomIcons();
    const newIcons = icons.filter(i => i.id !== iconId);
    saveCustomIcons(newIcons);
    return newIcons;
};

export const getIconComponent = (iconId: IconID): React.FC<any> => {
    if (DEFAULT_ICON_COMPONENTS[iconId]) {
        return DEFAULT_ICON_COMPONENTS[iconId];
    }
    const customIcon = getCustomIcons().find(i => i.id === iconId);
    if (customIcon) {
        return (props) => React.createElement('img', { ...props, src: customIcon.dataUrl, alt: customIcon.name });
    }
    // Fallback to a default icon if something goes wrong
    return PhoneIcon; 
};

export const getIconOptionsForType = (type: 'phone' | 'zalo' | 'facebook'): { id: IconID, name: string }[] => {
    const defaults = DEFAULT_ICON_OPTIONS[type];
    const customs = getCustomIcons()
        .filter(icon => icon.type === type)
        .map(icon => ({ id: icon.id, name: icon.name }));
    return [...defaults, ...customs];
};

// --- User Settings Management ---

export interface CustomIconSettings {
    phone: IconID;
    zalo: IconID;
    facebook: IconID;
}

const defaultIconSettings: CustomIconSettings = {
    phone: 'phone-default',
    zalo: 'zalo-default',
    facebook: 'facebook-default',
};

export const loadIconSettings = (): CustomIconSettings => {
    try {
        const json = localStorage.getItem(ICON_SETTINGS_KEY);
        if (json) {
            return { ...defaultIconSettings, ...JSON.parse(json) };
        }
    } catch (e) {
        console.error("Failed to load icon settings", e);
    }
    return defaultIconSettings;
};

export const saveIconSettings = (settings: CustomIconSettings): void => {
    try {
        localStorage.setItem(ICON_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
        console.error("Failed to save icon settings", e);
    }
};
