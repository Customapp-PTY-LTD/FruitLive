/**
 * Debug script to check data loading
 * Add this to browser console or run after page loads
 */

async function debugDataLoading() {
    console.log('=== DATA LOADING DEBUG ===');
    
    // Check dataFunctions availability
    console.log('1. dataFunctions available?', typeof dataFunctions !== 'undefined');
    if (typeof dataFunctions !== 'undefined') {
        console.log('   - getWorkers exists?', typeof dataFunctions.getWorkers === 'function');
        console.log('   - getFarms exists?', typeof dataFunctions.getFarms === 'function');
    }
    
    // Check authentication
    const token = localStorage.getItem('lambda_token');
    console.log('2. Authentication token exists?', !!token);
    if (token) {
        console.log('   - Token length:', token.length);
        console.log('   - Token preview:', token.substring(0, 20) + '...');
    }
    
    // Check user info
    const userInfo = localStorage.getItem('user_info');
    console.log('3. User info exists?', !!userInfo);
    if (userInfo) {
        try {
            const user = JSON.parse(userInfo);
            console.log('   - User:', user);
        } catch (e) {
            console.error('   - Error parsing user info:', e);
        }
    }
    
    // Test API call
    if (typeof dataFunctions !== 'undefined' && typeof dataFunctions.getFarms === 'function') {
        console.log('4. Testing getFarms API call...');
        try {
            const farms = await dataFunctions.getFarms();
            console.log('   - Farms response:', farms);
            console.log('   - Type:', typeof farms);
            console.log('   - Is array?', Array.isArray(farms));
            if (farms && !Array.isArray(farms)) {
                console.log('   - Keys:', Object.keys(farms));
                if (farms.farms) console.log('   - farms.farms:', farms.farms);
                if (farms.data) console.log('   - farms.data:', farms.data);
                if (farms.result) console.log('   - farms.result:', farms.result);
            }
            if (Array.isArray(farms)) {
                console.log('   - Count:', farms.length);
                if (farms.length > 0) {
                    console.log('   - First farm:', farms[0]);
                }
            }
        } catch (error) {
            console.error('   - Error calling getFarms:', error);
            console.error('   - Error message:', error.message);
            console.error('   - Error stack:', error.stack);
        }
    }
    
    // Test workers call
    if (typeof dataFunctions !== 'undefined' && typeof dataFunctions.getWorkers === 'function') {
        console.log('5. Testing getWorkers API call...');
        try {
            const workers = await dataFunctions.getWorkers({});
            console.log('   - Workers response:', workers);
            console.log('   - Type:', typeof workers);
            console.log('   - Is array?', Array.isArray(workers));
            if (workers && !Array.isArray(workers)) {
                console.log('   - Keys:', Object.keys(workers));
                if (workers.workers) console.log('   - workers.workers:', workers.workers);
                if (workers.data) console.log('   - workers.data:', workers.data);
                if (workers.result) console.log('   - workers.result:', workers.result);
            }
            if (Array.isArray(workers)) {
                console.log('   - Count:', workers.length);
                if (workers.length > 0) {
                    console.log('   - First worker:', workers[0]);
                }
            }
        } catch (error) {
            console.error('   - Error calling getWorkers:', error);
            console.error('   - Error message:', error.message);
        }
    }
    
    // Check selected farm
    const selectedFarmId = localStorage.getItem('selectedFarmId');
    console.log('6. Selected farm ID:', selectedFarmId);
    
    console.log('=== END DEBUG ===');
}

// Auto-run if in browser
if (typeof window !== 'undefined') {
    window.debugDataLoading = debugDataLoading;
    console.log('Run debugDataLoading() in console to debug data loading');
}
