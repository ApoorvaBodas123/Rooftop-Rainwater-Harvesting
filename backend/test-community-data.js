const mongoose = require('mongoose');
const Assessment = require('./models/Assessment');

// Test data for community dashboard
const testAssessments = [
  {
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827],
      address: 'Anna Nagar, Chennai, Tamil Nadu, India'
    },
    roofArea: 1500,
    roofType: 'concrete',
    averageRainfall: 1400,
    waterDemand: 500,
    userName: 'Sarah Johnson',
    userEmail: 'sarah.johnson@example.com',
    neighborhoodId: 'anna-nagar-chennai-tamil-nadu'
  },
  {
    location: {
      type: 'Point',
      coordinates: [80.2808, 13.0878],
      address: 'T. Nagar, Chennai, Tamil Nadu, India'
    },
    roofArea: 1200,
    roofType: 'metal',
    averageRainfall: 1400,
    waterDemand: 400,
    userName: 'Mike Chen',
    userEmail: 'mike.chen@example.com',
    neighborhoodId: 't-nagar-chennai-tamil-nadu'
  },
  {
    location: {
      type: 'Point',
      coordinates: [80.2500, 13.0600],
      address: 'Adyar, Chennai, Tamil Nadu, India'
    },
    roofArea: 2000,
    roofType: 'tiled',
    averageRainfall: 1400,
    waterDemand: 600,
    userName: 'Emma Davis',
    userEmail: 'emma.davis@example.com',
    neighborhoodId: 'adyar-chennai-tamil-nadu'
  },
  {
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827],
      address: 'Anna Nagar, Chennai, Tamil Nadu, India'
    },
    roofArea: 800,
    roofType: 'concrete',
    averageRainfall: 1400,
    waterDemand: 300,
    userName: 'Carlos Rodriguez',
    userEmail: 'carlos.rodriguez@example.com',
    neighborhoodId: 'anna-nagar-chennai-tamil-nadu'
  },
  {
    location: {
      type: 'Point',
      coordinates: [80.2707, 13.0827],
      address: 'Anna Nagar, Chennai, Tamil Nadu, India'
    },
    roofArea: 1800,
    roofType: 'metal',
    averageRainfall: 1400,
    waterDemand: 550,
    userName: 'Lisa Wang',
    userEmail: 'lisa.wang@example.com',
    neighborhoodId: 'anna-nagar-chennai-tamil-nadu'
  }
];

// Helper functions from assessmentController
const calculateSustainabilityScore = (roofArea, waterDemand, rainfall) => {
  let score = 0;
  const annualHarvest = roofArea * rainfall * 0.8;
  const harvestEfficiency = annualHarvest / (roofArea * rainfall);
  score += Math.min(harvestEfficiency * 40, 40);
  const areaScore = Math.min(roofArea / 1000 * 20, 20);
  score += areaScore;
  const demandCoverage = annualHarvest / (waterDemand * 365);
  score += Math.min(demandCoverage * 20, 20);
  const environmentScore = Math.min(annualHarvest / 10000 * 20, 20);
  score += environmentScore;
  return Math.round(Math.min(score, 100));
};

const generateMonthlyData = (annualHarvest, rainfall) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map(month => ({
    month,
    waterSaved: Math.round(annualHarvest / 12 * (0.8 + Math.random() * 0.4)),
    rainfall: Math.round(rainfall / 12 * (0.8 + Math.random() * 0.4)),
    efficiency: Math.round(75 + Math.random() * 25)
  }));
};

async function createTestData() {
  try {
    // Connect to MongoDB (assuming it's running)
    await mongoose.connect('mongodb://localhost:27017/rainwater-harvesting', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Clear existing assessments
    await Assessment.deleteMany({});
    console.log('Cleared existing assessments');
    
    // Create test assessments
    for (const testData of testAssessments) {
      const annualHarvest = testData.roofArea * testData.averageRainfall * 0.8;
      const monthlyHarvest = Array(12).fill(0).map(() => annualHarvest / 12 * (0.8 + Math.random() * 0.4));
      const sustainabilityScore = calculateSustainabilityScore(testData.roofArea, testData.waterDemand, testData.averageRainfall);
      const monthlyData = generateMonthlyData(annualHarvest, testData.averageRainfall);
      
      const achievements = [
        {
          id: 1,
          title: 'Water Warrior',
          description: 'Saved over 10,000 liters',
          earned: annualHarvest >= 10000,
          earnedDate: annualHarvest >= 10000 ? new Date() : null,
          icon: '💧'
        },
        {
          id: 2,
          title: 'Top 5 Saver',
          description: 'High sustainability score',
          earned: sustainabilityScore >= 75,
          earnedDate: sustainabilityScore >= 75 ? new Date() : null,
          icon: '🏆'
        },
        {
          id: 3,
          title: 'Consistency King',
          description: 'Consistent water saving',
          earned: true,
          earnedDate: new Date(),
          icon: '👑'
        },
        {
          id: 4,
          title: 'Community Leader',
          description: 'Leading by example with large system',
          earned: testData.roofArea >= 2000,
          earnedDate: testData.roofArea >= 2000 ? new Date() : null,
          icon: '🌟'
        },
        {
          id: 5,
          title: 'Monsoon Master',
          description: 'Maximized collection during monsoon',
          earned: annualHarvest >= 15000,
          earnedDate: annualHarvest >= 15000 ? new Date() : null,
          icon: '🌧️'
        }
      ];
      
      const assessment = new Assessment({
        ...testData,
        potentialHarvest: {
          annual: Math.round(annualHarvest),
          monthly: monthlyHarvest.map(m => Math.round(m)),
          daily: Math.round(annualHarvest / 365)
        },
        recommendedSystem: testData.roofArea > 2000 ? 'large' : testData.roofArea > 1000 ? 'medium' : 'small',
        estimatedCost: Math.round(testData.roofArea * 50 + 10000),
        paybackPeriod: Math.round(10 + Math.random() * 5),
        environmentalImpact: {
          waterSaved: Math.round(annualHarvest),
          co2Reduction: Math.round(annualHarvest * 0.0003),
          energySaved: Math.round(annualHarvest * 0.001),
          groundwaterRecharge: Math.round(annualHarvest * 0.7),
          equivalentTrees: Math.round(annualHarvest / 1000)
        },
        sustainabilityScore,
        monthlyWaterSaved: monthlyData,
        totalWaterSaved: Math.round(annualHarvest),
        achievements
      });
      
      await assessment.save();
      console.log(`Created assessment for ${testData.userName} with score ${sustainabilityScore}`);
    }
    
    console.log('Test data created successfully!');
    console.log('\nYou can now test the community endpoints:');
    console.log('- GET /api/community/impact?neighborhoodId=anna-nagar-chennai-tamil-nadu&userId=sarah.johnson@example.com');
    console.log('- GET /api/community/leaderboard?neighborhoodId=anna-nagar-chennai-tamil-nadu');
    console.log('- GET /api/community/share-message?userId=sarah.johnson@example.com');
    
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run if called directly
if (require.main === module) {
  createTestData();
}

module.exports = { createTestData };
