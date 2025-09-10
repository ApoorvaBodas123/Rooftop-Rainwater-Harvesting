const Assessment = require('../models/Assessment');

// @desc    Create a new assessment
// @route   POST /api/assessments
// @access  Public
exports.createAssessment = async (req, res) => {
  try {
    const {
      location,
      roofArea,
      roofType,
      averageRainfall,
      waterDemand,
      user
    } = req.body;

    // Calculate potential harvest (simplified calculation)
    const runoffCoefficient = {
      concrete: 0.9,
      metal: 0.8,
      tiled: 0.7,
      other: 0.6
    };

    const annualHarvest = roofArea * averageRainfall * runoffCoefficient[roofType];
    
    // Calculate monthly distribution (simplified for demonstration)
    const monthlyHarvest = Array(12).fill(0).map((_, i) => {
      // This is a simplified model - in a real app, use actual monthly rainfall data
      const monthlyFactor = [0.05, 0.03, 0.02, 0.01, 0.005, 0.01, 0.1, 0.2, 0.15, 0.1, 0.05, 0.05];
      return Math.round(annualHarvest * monthlyFactor[i]);
    });

    // Determine recommended system size
    let recommendedSystem = 'small';
    let estimatedCost = 50000; // Base cost in INR
    
    if (annualHarvest > 100000) { // More than 100,000 liters
      recommendedSystem = 'large';
      estimatedCost = 150000;
    } else if (annualHarvest > 50000) { // 50,000 - 100,000 liters
      recommendedSystem = 'medium';
      estimatedCost = 100000;
    }

    // Calculate payback period (simplified)
    const waterCostPerLiter = 0.01; // Average cost of water per liter in INR
    const annualSavings = waterDemand * 365 * waterCostPerLiter;
    const paybackPeriod = Math.ceil(estimatedCost / annualSavings);

    // Calculate environmental impact
    const waterSaved = annualHarvest;
    const co2Reduction = annualHarvest * 0.3; // 0.3 kg CO2 per liter of water saved (approximate)

    const assessment = new Assessment({
      location,
      roofArea,
      roofType,
      averageRainfall,
      waterDemand,
      potentialHarvest: {
        annual: Math.round(annualHarvest),
        monthly: monthlyHarvest,
        daily: Math.round(annualHarvest / 365)
      },
      recommendedSystem,
      estimatedCost,
      paybackPeriod,
      environmentalImpact: {
        waterSaved: Math.round(waterSaved),
        co2Reduction: Math.round(co2Reduction)
      },
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
      error: 'Server Error' 
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
