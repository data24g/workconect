/**
 * Utility Script: Clear All Auth Data
 * 
 * USE THIS WHEN:
 * - Frontend shows dashboard but can't load data
 * - Stuck in infinite loop between login and dashboard
 * - Token errors appearing in console
 * 
 * HOW TO USE:
 * 1. Open browser (http://localhost:3000)
 * 2. Open DevTools Console (F12)
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Refresh page (F5)
 */

console.log('🔧 Clearing all authentication data...');

// Clear all auth-related items from localStorage
localStorage.removeItem('admin_token');
localStorage.removeItem('admin_user');

// Also check for any other auth-related keys
const allKeys = Object.keys(localStorage);
console.log('📦 All localStorage keys:', allKeys);

const authKeys = allKeys.filter(key =>
    key.includes('token') ||
    key.includes('auth') ||
    key.includes('user') ||
    key.includes('admin')
);

if (authKeys.length > 0) {
    console.log('🗑️  Removing auth-related keys:', authKeys);
    authKeys.forEach(key => localStorage.removeItem(key));
}

console.log('✅ All auth data cleared!');
console.log('🔄 Redirecting to login...');

// Redirect to login page
window.location.href = '/login';
