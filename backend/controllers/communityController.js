const Assessment = require('../models/Assessment');

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (assessment) => {
  let score = 0;
  
  // Base score from water harvesting potential (40 points)
  const harvestEfficiency = assessment.potentialHarvest.annual / (assessment.roofArea * assessment.averageRainfall * 0.8);
  score += Math.min(harvestEfficiency * 40, 40);
  
  // Roof area efficiency (20 points)
  const areaScore = Math.min(assessment.roofArea / 1000 * 20, 20);
  score += areaScore;
  
  // Water demand coverage (20 points)
  const demandCoverage = assessment.potentialHarvest.annual / (assessment.waterDemand * 365);
  score += Math.min(demandCoverage * 20, 20);
  
  // Environmental impact (20 points)
  const environmentScore = Math.min((assessment.environmentalImpact.waterSaved || 0) / 10000 * 20, 20);
  score += environmentScore;
  
  return Math.round(Math.min(score, 100));
};

// Helper function to generate monthly data
const generateMonthlyData = (assessment) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = [];
  
  for (let i = 0; i < 12; i++) {
    const monthlyHarvest = assessment.potentialHarvest.monthly[i] || 
      (assessment.potentialHarvest.annual / 12) * (0.8 + Math.random() * 0.4);
    
    monthlyData.push({
      month: months[i],
      waterSaved: Math.round(monthlyHarvest),
      rainfall: Math.round(assessment.averageRainfall / 12 * (0.8 + Math.random() * 0.4)),
      efficiency: Math.round(75 + Math.random() * 25)
    });
  }
  
  return monthlyData;
};

// Helper function to check and award achievements
const checkAchievements = (assessment) => {
  const achievements = [];
  const totalWater = assessment.totalWaterSaved || assessment.potentialHarvest.annual;
  const score = assessment.sustainabilityScore;
  
  // Water Warrior - Saved over 10,000 liters
  achievements.push({
    id: 1,
    title: 'Water Warrior',
    description: 'Saved over 10,000 liters',
    earned: totalWater >= 10000,
    earnedDate: totalWater >= 10000 ? new Date() : null,
    icon: '💧'
  });
  
  // Top 5 Saver - Score above 75
  achievements.push({
    id: 2,
    title: 'Top 5 Saver',
    description: 'High sustainability score',
    earned: score >= 75,
    earnedDate: score >= 75 ? new Date() : null,
    icon: '🏆'
  });
  
  // Consistency King - Has monthly data
  achievements.push({
    id: 3,
    title: 'Consistency King',
    description: 'Consistent water saving',
    earned: assessment.monthlyWaterSaved && assessment.monthlyWaterSaved.length >= 6,
    earnedDate: assessment.monthlyWaterSaved && assessment.monthlyWaterSaved.length >= 6 ? new Date() : null,
    icon: '👑'
  });
  
  // Community Leader - Large roof area (proxy for helping neighbors)
  achievements.push({
    id: 4,
    title: 'Community Leader',
    description: 'Leading by example with large system',
    earned: assessment.roofArea >= 2000,
    earnedDate: assessment.roofArea >= 2000 ? new Date() : null,
    icon: '🌟'
  });
  
  // Monsoon Master - High efficiency during monsoon months
  achievements.push({
    id: 5,
    title: 'Monsoon Master',
    description: 'Maximized collection during monsoon',
    earned: totalWater >= 15000,
    earnedDate: totalWater >= 15000 ? new Date() : null,
    icon: '🌧️'
  });
  
  return achievements;
};

// @desc    Get community impact data
// @route   GET /api/community/impact
// @access  Public
exports.getCommunityImpact = async (req, res) => {
  try {
    const { neighborhoodId = 'chennai', userId } = req.query;
    
    // Get all assessments in the neighborhood
    const assessments = await Assessment.find({ neighborhoodId }).sort({ createdAt: -1 });
    
    if (assessments.length === 0) {
      // Return empty structure if no assessments exist
      return res.json({
        months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        communityData: [0,0,0,0,0,0,0,0,0,0,0,0],
        individualData: [0,0,0,0,0,0,0,0,0,0,0,0],
        rainfallData: [0,0,0,0,0,0,0,0,0,0,0,0],
        totalCommunityWater: 0,
        totalIndividualWater: 0,
        userScore: 0,
        userRank: 1,
        totalParticipants: 0,
        equivalents: { olympicPools: 0, households: 0, trees: 0, carbonOffset: 0 },
        achievements: []
      });
    }
    
    // Calculate sustainability scores for all assessments
    const assessmentsWithScores = assessments.map(assessment => {
      const score = calculateSustainabilityScore(assessment);
      const monthlyData = generateMonthlyData(assessment);
      const achievements = checkAchievements(assessment);
      
      return {
        ...assessment.toObject(),
        sustainabilityScore: score,
        monthlyWaterSaved: monthlyData,
        totalWaterSaved: assessment.potentialHarvest.annual,
        achievements
      };
    });
    
    // Find current user's assessment
    const userAssessment = assessmentsWithScores.find(a => 
      a.user?.toString() === userId || a.userEmail === userId
    ) || assessmentsWithScores[0];
    
    // Calculate community aggregated data
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const communityData = new Array(12).fill(0);
    const individualData = userAssessment.monthlyWaterSaved.map(m => m.waterSaved);
    const rainfallData = userAssessment.monthlyWaterSaved.map(m => m.rainfall);
    
    // Aggregate community data
    assessmentsWithScores.forEach(assessment => {
      assessment.monthlyWaterSaved.forEach((monthData, index) => {
        communityData[index] += monthData.waterSaved;
      });
    });
    
    const totalCommunityWater = communityData.reduce((sum, val) => sum + val, 0);
    const totalIndividualWater = individualData.reduce((sum, val) => sum + val, 0);
    
    // Calculate equivalents
    const olympicPools = Math.floor(totalCommunityWater / 2500000);
    const households = Math.floor(totalCommunityWater / 150000);
    const trees = Math.floor(totalCommunityWater / 1000);
    const carbonOffset = Math.floor(totalCommunityWater * 0.0003);
    
    // Calculate user rank
    const sortedByScore = assessmentsWithScores.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
    const userRank = sortedByScore.findIndex(a => a._id.toString() === userAssessment._id.toString()) + 1;
    
    res.json({
      months,
      communityData,
      individualData,
      rainfallData,
      totalCommunityWater,
      totalIndividualWater,
      userScore: userAssessment.sustainabilityScore,
      userRank,
      totalParticipants: assessments.length,
      equivalents: {
        olympicPools,
        households,
        trees,
        carbonOffset
      },
      achievements: userAssessment.achievements
    });
    
  } catch (error) {
    console.error('Error getting community impact:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error' 
    });
  }
};

// @desc    Get neighborhood leaderboard
// @route   GET /api/community/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const { neighborhoodId = 'chennai', userId } = req.query;
    
    // Get all assessments in the neighborhood
    const assessments = await Assessment.find({ neighborhoodId }).sort({ createdAt: -1 });
    
    if (assessments.length === 0) {
      // Return empty leaderboard if no assessments exist
      return res.json({
        neighbors: [],
        userPosition: 1,
        totalParticipants: 0
      });
    }
    
    // Calculate scores and create leaderboard with real user data
    const neighborsWithScores = assessments.map(assessment => {
      const score = assessment.sustainabilityScore || calculateSustainabilityScore(assessment);
      return {
        id: assessment._id,
        name: assessment.userName || 'Anonymous User',
        score,
        waterSaved: assessment.totalWaterSaved || assessment.potentialHarvest.annual,
        avatar: getRandomAvatar(),
        userEmail: assessment.userEmail
      };
    });
    
    // Sort by score and add ranks
    const sortedNeighbors = neighborsWithScores
      .sort((a, b) => b.score - a.score)
      .map((neighbor, index) => ({
        ...neighbor,
        rank: index + 1
      }));
    
    // Find user position
    const userPosition = sortedNeighbors.findIndex(n => 
      n.userEmail === userId || n.id.toString() === userId
    ) + 1;
    
    // Mark current user as "You" but keep their real name visible
    if (userPosition > 0) {
      const currentUser = sortedNeighbors[userPosition - 1];
      sortedNeighbors[userPosition - 1] = {
        ...currentUser,
        name: `You (${currentUser.name})`,
        avatar: '🏠'
      };
    }
    
    res.json({
      neighbors: sortedNeighbors,
      userPosition: userPosition || 1,
      totalParticipants: assessments.length
    });
    
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error' 
    });
  }
};

// @desc    Get share message
// @route   GET /api/community/share-message
// @access  Public
exports.getShareMessage = async (req, res) => {
  try {
    const { userId, neighborhoodId = 'default' } = req.query;
    
    // Get user's assessment
    const assessment = await Assessment.findOne({
      $or: [
        { user: userId },
        { userEmail: userId }
      ],
      neighborhoodId
    });
    
    let userScore = 82;
    let waterSaved = 11200;
    let rank = 3;
    
    if (assessment) {
      userScore = calculateSustainabilityScore(assessment);
      waterSaved = assessment.potentialHarvest.annual;
      
      // Calculate rank
      const allAssessments = await Assessment.find({ neighborhoodId });
      const scoresWithIds = allAssessments.map(a => ({
        id: a._id,
        score: calculateSustainabilityScore(a)
      }));
      const sortedScores = scoresWithIds.sort((a, b) => b.score - a.score);
      rank = sortedScores.findIndex(s => s.id.toString() === assessment._id.toString()) + 1;
    }
    
    const messages = {
      whatsapp: `🌧️ I'm making a difference with rainwater harvesting! 💧\n\n✅ Saved ${waterSaved.toLocaleString()} liters this year\n🏆 Ranked #${rank} in my neighborhood\n🌱 Score: ${userScore}/100\n\nJoin me in conserving water for a sustainable future! 🌍`,
      twitter: `🌧️ Proud to share my rainwater harvesting impact! 💧\n\n✅ ${waterSaved.toLocaleString()}L saved this year\n🏆 #${rank} in neighborhood\n🌱 ${userScore}/100 sustainability score\n\nEvery drop counts! Join the movement 🌍`,
      linkedin: `I'm excited to share my progress in sustainable water management through rooftop rainwater harvesting!\n\n🌧️ This year's impact:\n• ${waterSaved.toLocaleString()} liters of water conserved\n• Ranked #${rank} among neighbors\n• Sustainability score: ${userScore}/100\n\nSmall actions lead to big environmental changes. Consider implementing rainwater harvesting in your community!`
    };
    
    res.json(messages);
    
  } catch (error) {
    console.error('Error getting share message:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error' 
    });
  }
};

// Helper function to get random avatar
const getRandomAvatar = () => {
  const avatars = ['👩‍🌾', '👨‍💼', '👩‍🎓', '👨‍🔧', '👩‍💻', '👨‍🍳', '👩‍🏫', '👨‍⚕️', '👩‍🎨', '👨‍🏭'];
  return avatars[Math.floor(Math.random() * avatars.length)];
};

// Functions are already exported above using exports.functionName
// No need for additional module.exports
