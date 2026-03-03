/**
 * Debug Script - Run in Browser Console
 * 
 * Paste this into Browser Console (F12) to debug Business Verification
 */

console.log('🔍 Debugging Business Verification...\n');

// Check sessionStorage
const token = sessionStorage.getItem('admin_token');
console.log('1. Token exists:', !!token);
if (token) {
    console.log('   Token preview:', token.substring(0, 50) + '...');
}

// Test API call directly
async function testBusinessesAPI() {
    try {
        console.log('\n2. Testing /api/businesses endpoint...');

        const response = await fetch('http://150.95.114.135:8090/api/businesses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('   Status:', response.status);

        const data = await response.json();
        console.log('   Response type:', Array.isArray(data) ? 'Array' : typeof data);

        // Check if wrapped
        const businesses = data.data || data;
        console.log('   Total businesses:', Array.isArray(businesses) ? businesses.length : 'Not an array');

        if (Array.isArray(businesses)) {
            // Count by status
            const pending = businesses.filter(b => b.verifyStatus === 'PENDING');
            const verified = businesses.filter(b => b.verifyStatus === 'VERIFIED');
            const rejected = businesses.filter(b => b.verifyStatus === 'REJECTED');

            console.log('\n3. Business Status Breakdown:');
            console.log('   ⏳ PENDING:', pending.length);
            console.log('   ✅ VERIFIED:', verified.length);
            console.log('   ❌ REJECTED:', rejected.length);

            if (pending.length > 0) {
                console.log('\n4. PENDING Businesses:');
                pending.forEach((b, i) => {
                    console.log(`   ${i + 1}. ${b.name} (${b.industry}) - ${b.verifyStatus}`);
                });
            } else {
                console.log('\n⚠️  NO PENDING BUSINESSES FOUND!');

                // Show first business to check structure
                if (businesses.length > 0) {
                    console.log('\n5. Sample business (to check field names):');
                    console.log(businesses[0]);
                }
            }
        } else {
            console.log('\n❌ Response is not an array:', data);
        }

    } catch (error) {
        console.error('\n❌ Error:', error);
    }
}

// Run test
testBusinessesAPI();
