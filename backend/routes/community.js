const express = require('express');
const router = express.Router();

// Mock data for community impact dashboard
const mockNeighbors = [
  { id: 1, name: 'Sarah Johnson', score: 95, waterSaved: 15000, rank: 1, avatar: '👩‍🌾' },
  { id: 2, name: 'Mike Chen', score: 88, waterSaved: 12500, rank: 2, avatar: '👨‍💼' },
  { id: 3, name: 'You', score: 82, waterSaved: 11200, rank: 3, avatar: '🏠' },
  { id: 4, name: 'Emma Davis', score: 78, waterSaved: 9800, rank: 4, avatar: '👩‍🎓' },
  { id: 5, name: 'Carlos Rodriguez', score: 75, waterSaved: 9200, rank: 5, avatar: '👨‍🔧' },
  { id: 6, name: 'Lisa Wang', score: 72, waterSaved: 8500, rank: 6, avatar: '👩‍💻' },
  { id: 7, name: 'David Kim', score: 68, waterSaved: 7800, rank: 7, avatar: '👨‍🍳' },
  { id: 8, name: 'Anna Smith', score: 65, waterSaved: 7200, rank: 8, avatar: '👩‍🏫' }
];

const mockMonthlyData = [
  { month: 'Jan', community: 45000, individual: 1200, rainfall: 25 },
  { month: 'Feb', community: 52000, individual: 1400, rainfall: 30 },
  { month: 'Mar', community: 48000, individual: 1300, rainfall: 28 },
  { month: 'Apr', community: 38000, individual: 1000, rainfall: 20 },
  { month: 'May', community: 25000, individual: 650, rainfall: 12 },
  { month: 'Jun', community: 65000, individual: 1800, rainfall: 45 },
  { month: 'Jul', community: 78000, individual: 2100, rainfall: 55 },
  { month: 'Aug', community: 72000, individual: 1950, rainfall: 52 },
  { month: 'Sep', community: 58000, individual: 1600, rainfall: 38 },
  { month: 'Oct', community: 42000, individual: 1150, rainfall: 25 },
  { month: 'Nov', community: 35000, individual: 950, rainfall: 18 },
  { month: 'Dec', community: 40000, individual: 1100, rainfall: 22 }
];

// GET /api/community/impact - Get community impact data
router.get('/impact', (req, res) => {
  const totalCommunityWater = mockMonthlyData.reduce((sum, month) => sum + month.community, 0);
  const totalIndividualWater = mockMonthlyData.reduce((sum, month) => sum + month.individual, 0);
  
  // Calculate equivalents
  const olympicPools = Math.floor(totalCommunityWater / 2500000); // 1 Olympic pool = 2.5M liters
  const households = Math.floor(totalCommunityWater / 150000); // Average household uses 150k liters/year
  const trees = Math.floor(totalCommunityWater / 1000); // 1 tree needs ~1000 liters/year
  
  res.json({
    months: mockMonthlyData.map(d => d.month),
    communityData: mockMonthlyData.map(d => d.community),
    individualData: mockMonthlyData.map(d => d.individual),
    rainfallData: mockMonthlyData.map(d => d.rainfall),
    totalCommunityWater,
    totalIndividualWater,
    userScore: 82,
    userRank: 3,
    totalParticipants: mockNeighbors.length,
    equivalents: {
      olympicPools,
      households,
      trees,
      carbonOffset: Math.floor(totalCommunityWater * 0.0003), // kg CO2 saved
    },
    achievements: [
      { id: 1, title: 'Water Warrior', description: 'Saved over 10,000 liters', earned: true, icon: '💧' },
      { id: 2, title: 'Top 5 Saver', description: 'Ranked in top 5 neighbors', earned: true, icon: '🏆' },
      { id: 3, title: 'Consistency King', description: 'Saved water for 6 months straight', earned: true, icon: '👑' },
      { id: 4, title: 'Community Leader', description: 'Helped 3+ neighbors start harvesting', earned: false, icon: '🌟' },
      { id: 5, title: 'Monsoon Master', description: 'Maximized collection during monsoon', earned: true, icon: '🌧️' }
    ]
  });
});

// GET /api/community/leaderboard - Get neighbor leaderboard
router.get('/leaderboard', (req, res) => {
  res.json({
    neighbors: mockNeighbors,
    userPosition: 3,
    totalParticipants: mockNeighbors.length
  });
});

// GET /api/community/share-message - Get pre-generated share message
router.get('/share-message', (req, res) => {
  const userScore = 82;
  const waterSaved = 11200;
  const rank = 3;
  
  const messages = {
    whatsapp: `🌧️ I'm making a difference with rainwater harvesting! 💧\n\n✅ Saved ${waterSaved.toLocaleString()} liters this year\n🏆 Ranked #${rank} in my neighborhood\n🌱 Score: ${userScore}/100\n\nJoin me in conserving water for a sustainable future! 🌍\n\n#RainwaterHarvesting #WaterConservation #SustainableLiving`,
    
    twitter: `🌧️ Proud to share my rainwater harvesting impact! 💧\n\n✅ ${waterSaved.toLocaleString()}L saved this year\n🏆 #${rank} in neighborhood\n🌱 ${userScore}/100 sustainability score\n\nEvery drop counts! Join the movement 🌍\n\n#RainwaterHarvesting #WaterConservation #ClimateAction`,
    
    linkedin: `I'm excited to share my progress in sustainable water management through rooftop rainwater harvesting!\n\n🌧️ This year's impact:\n• ${waterSaved.toLocaleString()} liters of water conserved\n• Ranked #${rank} among neighbors\n• Sustainability score: ${userScore}/100\n\nSmall actions lead to big environmental changes. Consider implementing rainwater harvesting in your community!\n\n#Sustainability #WaterConservation #EnvironmentalImpact #GreenTechnology`
  };
  
  res.json(messages);
});

// POST /api/community/challenge - Join a community challenge
router.post('/challenge', (req, res) => {
  const { challengeId } = req.body;
  
  // Mock challenge data
  const challenges = {
    1: { name: 'Monsoon Maximizer', target: 5000, reward: 'Water Warrior Badge' },
    2: { name: 'Neighbor Helper', target: 3, reward: 'Community Leader Badge' },
    3: { name: 'Consistency Champion', target: 30, reward: 'Dedication Medal' }
  };
  
  const challenge = challenges[challengeId];
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  res.json({
    success: true,
    message: `Successfully joined ${challenge.name} challenge!`,
    challenge: {
      id: challengeId,
      ...challenge,
      progress: 0,
      joined: true
    }
  });
});

module.exports = router;
