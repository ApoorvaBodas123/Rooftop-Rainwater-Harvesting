const Assessment = require('../models/Assessment');
const calculationService = require('../services/calculationService');

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Public
exports.createAssessment = async (req, res) => {
  try {
    const {
      location,
      roofArea,
      roofType,
      waterDemand,
      averageRainfall,
      user,
      userName,
      userEmail
    } = req.body;

    // Generate neighborhood ID based on location (simplified)
    const neighborhoodId = location.address ? 
      location.address.split(',').slice(-2).join(',').trim().toLowerCase().replace(/\s+/g, '-') : 
      'default';

    // Calculate sustainability score
    const calculateSustainabilityScore = (roofArea, waterDemand, rainfall) => {
      let score = 0;
      const annualHarvest = roofArea * rainfall * 0.8; // 80% efficiency
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

    // Generate monthly data
    const generateMonthlyData = (annualHarvest, rainfall) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map(month => ({
        month,
        waterSaved: Math.round(annualHarvest / 12 * (0.8 + Math.random() * 0.4)),
        rainfall: Math.round(rainfall / 12 * (0.8 + Math.random() * 0.4)),
        efficiency: Math.round(75 + Math.random() * 25)
      }));
    };

    // Calculate basic harvest potential
    const annualHarvest = roofArea * averageRainfall * 0.8; // 80% efficiency
    const monthlyHarvest = Array(12).fill(0).map(() => annualHarvest / 12 * (0.8 + Math.random() * 0.4));
    const sustainabilityScore = calculateSustainabilityScore(roofArea, waterDemand, averageRainfall);
    const monthlyData = generateMonthlyData(annualHarvest, averageRainfall);

    // Generate achievements
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
        earned: roofArea >= 2000,
        earnedDate: roofArea >= 2000 ? new Date() : null,
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
      location: {
        type: 'Point',
        coordinates: location.coordinates,
        address: location.address
      },
      roofArea: parseFloat(roofArea),
      roofType,
      averageRainfall: parseFloat(averageRainfall),
      waterDemand: parseFloat(waterDemand),
      potentialHarvest: {
        annual: Math.round(annualHarvest),
        monthly: monthlyHarvest.map(m => Math.round(m)),
        daily: Math.round(annualHarvest / 365)
      },
      recommendedSystem: roofArea > 2000 ? 'large' : roofArea > 1000 ? 'medium' : 'small',
      estimatedCost: Math.round(roofArea * 50 + 10000), // Rough estimate
      paybackPeriod: Math.round(10 + Math.random() * 5),
      environmentalImpact: {
        waterSaved: Math.round(annualHarvest),
        co2Reduction: Math.round(annualHarvest * 0.0003),
        energySaved: Math.round(annualHarvest * 0.001),
        groundwaterRecharge: Math.round(annualHarvest * 0.7),
        equivalentTrees: Math.round(annualHarvest / 1000)
      },
      // Community dashboard fields
      userName: userName || 'Anonymous User',
      userEmail: userEmail || 'anonymous@example.com',
      sustainabilityScore,
      monthlyWaterSaved: monthlyData,
      totalWaterSaved: Math.round(annualHarvest),
      achievements,
      neighborhoodId,
      user
    });

    await assessment.save();
    
    res.status(201).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error creating assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server Error' 
    });
  }
};

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Public
exports.getAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: assessments.length,
      data: assessments
    });
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error' 
    });
  }
};

// @desc    Get single assessment
// @route   GET /api/assessments/:id
// @access  Public
exports.getAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    
    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: assessment
    });
  } catch (error) {
    console.error('Error fetching assessment:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server Error' 
    });
  }
};
