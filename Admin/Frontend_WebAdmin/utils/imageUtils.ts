// src/utils/imageUtils.ts

/**
 * Utility functions for handling image URLs.
 *
 * Supports:
 * - Full URLs (http/https)
 * - Image IDs (number / numeric string) resolved via `${API_BASE_URL}/images/:id`
 * - Base64 data URIs
 * - Absolute/relative server paths like `/uploads/...`
 */

const DEFAULT_API_BASE_URL = 'http://localhost:8086/api';

const getApiBaseUrl = (): string => {
    return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
};

// Base origin for non-API static paths (e.g. `/uploads/...`)
const getServerOrigin = (): string => {
    const apiBase = getApiBaseUrl();
    try {
        const url = new URL(apiBase);
        // Strip trailing `/api` so we can resolve `/uploads/...` at server root.
        url.pathname = url.pathname.replace(/\/api\/?$/, '');
        const path = url.pathname.replace(/\/$/, '');
        return `${url.origin}${path}`;
    } catch {
        return '';
    }
};

/**
 * Converts any image value to a displayable URL
 * @param imageValue - Can be: full URL, image ID (number/string), Base64, or empty
 * @param fallback - Optional fallback image URL
 * @returns Displayable image URL or fallback
 */
export const getImageUrl = (imageValue: string | number | undefined | null, fallback?: string): string => {
    // Handle empty/null/undefined
    if (!imageValue) {
        return fallback || getPlaceholderImage();
    }

    // If it's already a full URL (http/https)
    if (typeof imageValue === 'string' && (imageValue.startsWith('http://') || imageValue.startsWith('https://'))) {
        return imageValue;
    }

    // If it's Base64 data
    if (typeof imageValue === 'string' && imageValue.startsWith('data:')) {
        return imageValue;
    }

    // If it's an image ID (number or numeric string)
    // Check if it's a numeric ID
    const numericId = Number(imageValue);
    if (!isNaN(numericId) && numericId > 0) {
        return `${getApiBaseUrl()}/images/${numericId}`;
    }

    // If backend returns absolute server path like `/uploads/...`
    if (typeof imageValue === 'string' && imageValue.startsWith('/')) {
        const origin = getServerOrigin();
        if (origin) return `${origin}${imageValue}`;
        return fallback || getPlaceholderImage();
    }

    // If backend returns a relative path like `uploads/...`
    if (typeof imageValue === 'string' && imageValue.length > 0) {
        const origin = getServerOrigin();
        if (origin) {
            const normalized = imageValue.startsWith('/') ? imageValue : `/${imageValue}`;
            return `${origin}${normalized}`;
        }
        return fallback || getPlaceholderImage();
    }

    return fallback || getPlaceholderImage();
};

/**
 * Returns a placeholder image URL for empty states
 */
export const getPlaceholderImage = (type: 'avatar' | 'card' | 'generic' = 'generic'): string => {
    switch (type) {
        case 'avatar':
            return 'https://ui-avatars.com/api/?background=random&name=User';
        case 'card':
            return 'https://via.placeholder.com/400x300?text=No+Image';
        case 'generic':
        default:
            return 'https://via.placeholder.com/400x300?text=Image';
    }
};

/**
 * Returns initials avatar URL
 */
export const getInitialsAvatar = (name: string): string => {
    const encodedName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
};

/**
 * Check if image value is valid (not empty)
 */
export const hasImage = (imageValue: string | number | undefined | null): boolean => {
    if (!imageValue) return false;
    if (typeof imageValue === 'number' && imageValue > 0) return true;
    if (typeof imageValue === 'string' && imageValue.length > 0) return true;
    return false;
};

