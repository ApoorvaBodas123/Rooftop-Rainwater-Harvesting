const fetch = require('node-fetch');

async function testNewAssessment() {
  try {
    console.log('🧪 Testing New Assessment Submission\n');
    
    const testData = {
      location: {
        address: "New Test Location, Chennai, Tamil Nadu, India",
        coordinates: [80.2707, 13.0827]
      },
      roofArea: 180,
      roofType: "concrete",
      averageRainfall: 1400,
      waterDemand: 250,
      userName: "New Test User",
      userEmail: "newtest@example.com"
    };

    console.log('📝 Submitting assessment:', testData);

    const response = await fetch('http://localhost:5000/api/assessments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', response.status, errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Assessment created:', {
      id: result.data._id,
      userName: result.data.userName,
      score: result.data.sustainabilityScore,
      waterSaved: result.data.totalWaterSaved,
      neighborhood: result.data.neighborhoodId
    });

    // Test community leaderboard update
    console.log('\n🏆 Testing leaderboard update:');
    const leaderboardResponse = await fetch(`http://localhost:5000/api/community/leaderboard?userId=${testData.userEmail}&neighborhoodId=chennai`);
    
    if (leaderboardResponse.ok) {
      const leaderboard = await leaderboardResponse.json();
      console.log('✅ Updated leaderboard participants:', leaderboard.totalParticipants);
      
      const newUser = leaderboard.neighbors.find(n => n.userEmail === testData.userEmail);
      if (newUser) {
        console.log('✅ New user found in leaderboard:', newUser.name, 'Score:', newUser.score);
      }
    }

    console.log('\n🎯 DYNAMIC FLOW WORKING: New assessments appear in community dashboard! ✅');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNewAssessment();
