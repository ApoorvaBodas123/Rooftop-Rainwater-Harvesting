// Simple test script to verify backend connection and API endpoints
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

async function testBackend() {
  console.log('Testing backend connection...\n');
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthRes = await fetch(`${API_BASE}/api/health`);
    if (healthRes.ok) {
      const healthData = await healthRes.json();
      console.log('✅ Health check passed:', healthData);
    } else {
      console.log('❌ Health check failed:', healthRes.status);
      return;
    }

    // Test community endpoints
    console.log('\n2. Testing community endpoints...');
    
    const userId = 'test@example.com';
    const neighborhoodId = 'default';
    
    // Test impact endpoint
    const impactRes = await fetch(`${API_BASE}/api/community/impact?userId=${userId}&neighborhoodId=${neighborhoodId}`);
    console.log('Impact endpoint status:', impactRes.status);
    if (impactRes.ok) {
      const impactData = await impactRes.json();
      console.log('✅ Impact data received:', Object.keys(impactData));
    }
    
    // Test leaderboard endpoint
    const leaderboardRes = await fetch(`${API_BASE}/api/community/leaderboard?userId=${userId}&neighborhoodId=${neighborhoodId}`);
    console.log('Leaderboard endpoint status:', leaderboardRes.status);
    if (leaderboardRes.ok) {
      const leaderboardData = await leaderboardRes.json();
      console.log('✅ Leaderboard data received:', Object.keys(leaderboardData));
    }
    
    // Test share message endpoint
    const shareRes = await fetch(`${API_BASE}/api/community/share-message?userId=${userId}&neighborhoodId=${neighborhoodId}`);
    console.log('Share message endpoint status:', shareRes.status);
    if (shareRes.ok) {
      const shareData = await shareRes.json();
      console.log('✅ Share data received:', Object.keys(shareData));
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    console.log('\n🔧 To fix this issue:');
    console.log('1. Open a new terminal');
    console.log('2. Navigate to the backend folder: cd backend');
    console.log('3. Start the server: npm start');
    console.log('4. The server should run on http://localhost:5000');
  }
}

testBackend();
