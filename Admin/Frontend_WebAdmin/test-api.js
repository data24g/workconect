// Quick API Test Script
// Run this in browser console at http://localhost:5173

const API_BASE = 'http://150.95.114.135:8090/api';

async function testAPIs() {
    console.log('🧪 Testing Admin APIs...\n');

    const tests = [
        { name: 'Businesses', url: `${API_BASE}/admin/businesses` },
        { name: 'Jobs', url: `${API_BASE}/admin/jobs` },
        { name: 'Users', url: `${API_BASE}/admin/users` },
        { name: 'Work Sessions', url: `${API_BASE}/admin/work-sessions` },
        { name: 'Reviews', url: `${API_BASE}/admin/reviews` },
        { name: 'Reports', url: `${API_BASE}/admin/reports` },
        { name: 'Articles/News', url: `${API_BASE}/admin/news` },
        { name: 'Banners', url: `${API_BASE}/admin/banners` },
    ];

    for (const test of tests) {
        try {
            const response = await fetch(test.url);
            const data = await response.json();

            // Unwrap data if wrapped
            const unwrapped = data.data || data;
            const count = Array.isArray(unwrapped) ? unwrapped.length : 'N/A';

            console.log(`✅ ${test.name}: ${response.status} - ${count} items`);
            console.log(`   Response format: ${data.success ? 'Wrapped' : 'Direct'}`);
        } catch (error) {
            console.error(`❌ ${test.name}: ${error.message}`);
        }
    }

    console.log('\n✨ Test complete!');
}

// Run tests
testAPIs();
