// permissionStore.ts
import { PlanId, ActiveApp, ALL_TOOLS } from './userStore';

export type PermissionsTable = { [key in PlanId]?: (ActiveApp | 'admin')[] };

const PERMISSIONS_STORAGE_KEY = 'app_permissions_v1';

// This was the original hard-coded permission set
const initializePermissions = (): PermissionsTable => {
    return {
        free: ['introduction', 'idPhoto', 'photoRestorer', 'proAiRelight', 'imageGenerator', 'conceptPhoto', 'familyPhotoComposer'],
        id_restore: ['introduction', 'idPhoto', 'photoRestorer'],
        concept: ['introduction', 'conceptPhoto'],
        family: ['introduction', 'familyPhotoComposer'],
        pro: ['introduction', 'idPhoto', 'photoRestorer', 'conceptPhoto', 'familyPhotoComposer'],
        vip_pro: ['introduction', 'idPhoto', 'photoRestorer', 'conceptPhoto', 'familyPhotoComposer', 'proAiRelight', 'imageGenerator', 'socialMediaPostGenerator'],
        vip: ['introduction', 'idPhoto', 'photoRestorer', 'proAiRelight', 'imageGenerator', 'conceptPhoto', 'familyPhotoComposer', 'photoLab', 'batchColorCorrector', 'socialMediaPostGenerator'],
        admin: [...ALL_TOOLS]
    };
};

export const loadPermissions = (): PermissionsTable => {
    try {
        const stored = localStorage.getItem(PERMISSIONS_STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Basic validation
            if (parsed.admin && parsed.free) {
                return parsed;
            }
        }
        const initial = initializePermissions();
        savePermissions(initial);
        return initial;
    } catch (e) {
        console.error("Failed to load permissions, initializing.", e);
        const initial = initializePermissions();
        savePermissions(initial);
        return initial;
    }
};

export const savePermissions = (permissions: PermissionsTable): void => {
    try {
        localStorage.setItem(PERMISSIONS_STORAGE_KEY, JSON.stringify(permissions));
    } catch (e) {
        console.error("Failed to save permissions.", e);
    }
};
