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
      user
    } = req.body;

    // Use real calculation service instead of dummy data
    const calculationResults = await calculationService.calculateHarvestingPotential({
      location,
      roofArea,
      roofType,
      waterDemand
    });

    const assessment = new Assessment({
      location: calculationResults.location,
      roofArea,
      roofType,
      averageRainfall: calculationResults.rainfall.annual,
      waterDemand,
      potentialHarvest: {
        annual: calculationResults.harvest.annual,
        monthly: calculationResults.harvest.monthly,
        daily: calculationResults.harvest.daily
      },
      recommendedSystem: calculationResults.system.size,
      estimatedCost: calculationResults.costs.total,
      paybackPeriod: calculationResults.costs.paybackYears,
      environmentalImpact: {
        waterSaved: calculationResults.environmental.waterSaved,
        co2Reduction: calculationResults.environmental.co2Reduction
      },
      // Store additional real data
      climateZone: calculationResults.location.climateZone,
      soilType: calculationResults.location.soilType,
      systemDetails: calculationResults.system,
      costBreakdown: calculationResults.costs,
      rechargeAnalysis: calculationResults.recharge,
      dataConfidence: calculationResults.confidence,
      user
    });

    await assessment.save();
    
    res.status(201).json({
      success: true,
      data: assessment,
      calculations: calculationResults
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
