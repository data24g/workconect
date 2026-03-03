// Test Frontend connection to Backend
// Run: node test-frontend-backend.js

const API_URL = 'http://localhost:8086/api';

console.log('🧪 Testing Frontend → Backend Connection');
console.log('═'.repeat(50));
console.log(`Backend URL: ${API_URL}`);
console.log('');

// Test 1: Health check
async function testConnection() {
    try {
        console.log('1️⃣ Testing basic connection...');
        const response = await fetch(`${API_URL}/auth/admin-login`, {
            method: 'OPTIONS'
        });
        console.log('   ✅ Server is reachable!');
    } catch (error) {
        console.log('   ❌ Cannot connect to server:', error.message);
        return false;
    }

    // Test 2: Login
    try {
        console.log('\n2️⃣ Testing admin login...');
        const response = await fetch(`${API_URL}/auth/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: 'admin@workconnect.com',
                password: 'Admin@123'
            })
        });

        const data = await response.json();

        if (response.ok && data.token) {
            console.log('   ✅ Login successful!');
            console.log(`   Token: ${data.token.substring(0, 30)}...`);

            // Test 3: Authenticated request
            console.log('\n3️⃣ Testing authenticated request...');
            const statsResponse = await fetch(`${API_URL}/admin/stats/dashboard`, {
                headers: {
                    'Authorization': `Bearer ${data.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const stats = await statsResponse.json();

            if (statsResponse.ok) {
                console.log('   ✅ Dashboard stats retrieved!');
                console.log(`   Total Users: ${stats.totalUsers}`);
                console.log(`   Total Workers: ${stats.totalWorkers}`);
                console.log(`   Active Jobs: ${stats.activeJobs}`);

                console.log('\n' + '═'.repeat(50));
                console.log('🎉 ALL TESTS PASSED!');
                console.log('Frontend can successfully connect to Backend!');
                return true;
            } else {
                console.log('   ❌ Failed to get stats:', stats);
                return false;
            }
        } else {
            console.log('   ❌ Login failed:', data);
            return false;
        }
    } catch (error) {
        console.log('   ❌ Error:', error.message);
        return false;
    }
}

testConnection();
