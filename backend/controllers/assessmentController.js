const Assessment = require('../models/Assessment');
const calculationService = require('../services/calculationService');
const mongoose = require('mongoose');

// Helper function to calculate sustainability score
const calculateSustainabilityScore = (assessment, harvestData) => {
  let score = 0;
  
  // Base score from water harvesting potential (40 points)
  const harvestEfficiency = harvestData.annual / (assessment.roofArea * assessment.averageRainfall * 0.8);
  score += Math.min(harvestEfficiency * 40, 40);
  
  // Roof area efficiency (20 points)
  const areaScore = Math.min(assessment.roofArea / 1000 * 20, 20);
  score += areaScore;
  
  // Water demand coverage (20 points)
  const demandCoverage = harvestData.annual / (assessment.waterDemand * 365);
  score += Math.min(demandCoverage * 20, 20);
  
  // Environmental impact (20 points)
  const environmentScore = Math.min(harvestData.annual / 10000 * 20, 20);
  score += environmentScore;
  
  return Math.round(Math.min(score, 100));
};

// Helper function to generate monthly data
const generateMonthlyData = (harvestData, averageRainfall) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = [];
  
  for (let i = 0; i < 12; i++) {
    const monthlyHarvest = harvestData.monthly[i] || (harvestData.annual / 12);
    const monthlyRainfall = averageRainfall / 12 * (0.8 + Math.random() * 0.4);
    
    monthlyData.push({
      month: months[i],
      waterSaved: Math.round(monthlyHarvest),
      rainfall: Math.round(monthlyRainfall),
      efficiency: Math.round(75 + Math.random() * 25)
    });
  }
  
  return monthlyData;
};

// Helper function to check and award achievements
const checkAchievements = (assessment, harvestData, sustainabilityScore) => {
  const achievements = [];
  const totalWater = harvestData.annual;
  
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
    earned: sustainabilityScore >= 75,
    earnedDate: sustainabilityScore >= 75 ? new Date() : null,
    icon: '🏆'
  });
  
  // Consistency King - Large roof area
  achievements.push({
    id: 3,
    title: 'Consistency King',
    description: 'Consistent water saving potential',
    earned: assessment.roofArea >= 100,
    earnedDate: assessment.roofArea >= 100 ? new Date() : null,
    icon: '👑'
  });
  
  // Community Leader - Large roof area (proxy for helping neighbors)
  achievements.push({
    id: 4,
    title: 'Community Leader',
    description: 'Leading by example with large system',
    earned: assessment.roofArea >= 200,
    earnedDate: assessment.roofArea >= 200 ? new Date() : null,
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

    // Parse numeric values
    const parsedRoofArea = parseFloat(roofArea);
    const parsedWaterDemand = parseFloat(waterDemand);
    const parsedRainfall = parseFloat(averageRainfall);

    // Use real calculation service
    const calculationResults = await calculationService.calculateHarvestingPotential({
      location,
      roofArea: parsedRoofArea,
      roofType,
      waterDemand: parsedWaterDemand
    });

<<<<<<< HEAD
    // Extract harvest data
    const harvestData = calculationResults.harvest;
    
    // Generate neighborhood ID based on location (simplified)
    const neighborhoodId = location.address ? 
      location.address.split(',')[0].toLowerCase().replace(/\s+/g, '-') : 
      'default';

    // Calculate community dashboard data
    const sustainabilityScore = calculateSustainabilityScore({
      roofArea: parsedRoofArea,
      waterDemand: parsedWaterDemand,
      averageRainfall: parsedRainfall
    }, harvestData);

    const monthlyData = generateMonthlyData(harvestData, parsedRainfall);
    const achievements = checkAchievements({
      roofArea: parsedRoofArea
    }, harvestData, sustainabilityScore);

    const assessment = new Assessment({
      location: {
        type: 'Point',
        coordinates: calculationResults.location.coordinates,
        address: location.address || '',
        city: location.address ? location.address.split(',')[0] : '',
        state: location.address ? location.address.split(',')[1] : '',
        country: 'India'
      },
      roofArea: parsedRoofArea,
=======
    // Build GeoJSON location with required type 'Point'
    const [lon, lat] = calculationResults.location.coordinates || location.coordinates || [];
    const geoLocation = {
      type: 'Point',
      coordinates: [lon, lat],
      address: location?.address || undefined,
      city: location?.city || undefined,
      state: location?.state || undefined,
      country: location?.country || undefined
    };

    const assessment = new Assessment({
      location: geoLocation,
      roofArea,
>>>>>>> d238aaabaf1545c94ddecbec855cca69ee325f5e
      roofType,
      averageRainfall: parsedRainfall,
      waterDemand: parsedWaterDemand,
      potentialHarvest: {
        annual: Math.round(harvestData.annual),
        monthly: harvestData.monthly.map(m => Math.round(m)),
        daily: Math.round(harvestData.daily)
      },
      recommendedSystem: calculationResults.system.size,
      estimatedCost: calculationResults.costs.total,
      paybackPeriod: calculationResults.costs.paybackYears,
      environmentalImpact: calculationResults.environmental,
      climateZone: calculationResults.location.climateZone,
      soilType: calculationResults.location.soilType,
      systemDetails: {
        tankCapacity: calculationResults.system.tankCapacity,
        description: calculationResults.system.description,
        demandCoverage: calculationResults.system.demandCoverage,
        recommended: calculationResults.system.recommended
      },
      costBreakdown: calculationResults.costs,
      rechargeAnalysis: calculationResults.recharge,
      dataConfidence: calculationResults.confidence,
      // Community dashboard fields
      userName: userName || 'Anonymous User',
      userEmail: userEmail || 'anonymous@example.com',
      sustainabilityScore,
      monthlyWaterSaved: monthlyData,
      totalWaterSaved: Math.round(harvestData.annual),
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
    // Handle Mongoose validation errors more clearly
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        details: Object.fromEntries(
          Object.entries(error.errors || {}).map(([k, v]) => [k, v.message])
        )
      });
    }
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
