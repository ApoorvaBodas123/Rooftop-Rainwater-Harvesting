const weatherService = require('./weatherService');

class CalculationService {
  constructor() {
    // Runoff coefficients for different roof materials
    this.runoffCoefficients = {
      concrete: 0.85,
      metal: 0.90,
      tiled: 0.75,
      asbestos: 0.85,
      other: 0.70
    };

    // First flush diverter loss (liters per mm of rainfall)
    this.firstFlushLoss = 2; // mm

    // Storage efficiency factors
    this.storageEfficiency = 0.95;

    // Cost estimation per system type (INR)
    this.systemCosts = {
      small: {
        base: 25000,
        perSqM: 150,
        description: 'Basic system with 1000L tank'
      },
      medium: {
        base: 60000,
        perSqM: 200,
        description: 'Intermediate system with 3000L tank'
      },
      large: {
        base: 120000,
        perSqM: 250,
        description: 'Advanced system with 5000L+ tank'
      }
    };
  }

  /**
   * Calculate comprehensive rainwater harvesting potential
   */
  async calculateHarvestingPotential(assessmentData) {
    const { location, roofArea, roofType, waterDemand } = assessmentData;
    const safeRoofArea = Number(roofArea) || 0;
    const safeWaterDemand = Number(waterDemand) || 0;
    const [lon, lat] = location.coordinates;

    // Get real rainfall data
    const rainfallData = await weatherService.getRainfallData(lat, lon);
    const soilData = weatherService.getSoilData(lat, lon);

    // Calculate monthly and annual harvest
    const harvestCalculations = this.calculateMonthlyHarvest(
      safeRoofArea, 
      roofType, 
      rainfallData.historical.monthlyRainfall
    );

    // Determine optimal system size
    const systemRecommendation = this.recommendSystem(
      harvestCalculations.annualHarvest,
      safeWaterDemand,
      safeRoofArea
    );

    // Calculate costs
    const costAnalysis = this.calculateCosts(
      systemRecommendation.size,
      safeRoofArea,
      harvestCalculations.annualHarvest
    );

    // Environmental impact
    const environmentalImpact = this.calculateEnvironmentalImpact(
      harvestCalculations.annualHarvest,
      safeWaterDemand
    );

    // Recharge potential
    const rechargeAnalysis = this.calculateRechargeStructures(
      safeRoofArea,
      soilData,
      harvestCalculations.annualHarvest
    );

    return {
      location: {
        coordinates: [lon, lat],
        climateZone: rainfallData.historical.zone,
        soilType: soilData.type
      },
      rainfall: {
        annual: rainfallData.historical.annualRainfall,
        monthly: rainfallData.historical.monthlyRainfall,
        source: rainfallData.source
      },
      harvest: harvestCalculations,
      system: systemRecommendation,
      costs: costAnalysis,
      environmental: environmentalImpact,
      recharge: rechargeAnalysis,
      confidence: rainfallData.historical.confidence || 0.8
    };
  }

  calculateMonthlyHarvest(roofArea, roofType, monthlyRainfall) {
    const area = Number(roofArea) || 0;
    const runoffCoeff = this.runoffCoefficients[roofType] || 0.70;
    const months = Array.isArray(monthlyRainfall) ? monthlyRainfall : Array(12).fill(0);
    
    const monthlyHarvest = months.map(rainfall => {
      // Apply first flush diverter loss
      const effectiveRainfall = Math.max(0, (Number(rainfall) || 0) - this.firstFlushLoss);
      
      // Calculate harvest: Area (m²) × Rainfall (mm) × Runoff coefficient × Storage efficiency
      // Convert mm to liters: 1mm over 1m² = 1 liter
      const harvest = area * effectiveRainfall * runoffCoeff * this.storageEfficiency;
      
      return Math.round(harvest);
    });

    const annualHarvest = monthlyHarvest.reduce((sum, month) => sum + (Number(month) || 0), 0);
    const dailyAverage = Math.round(annualHarvest / 365);

    // Peak harvest month for system sizing
    const peakMonthHarvest = Math.max(...monthlyHarvest);

    return {
      annual: annualHarvest,
      monthly: monthlyHarvest,
      daily: dailyAverage,
      peak: peakMonthHarvest,
      efficiency: runoffCoeff
    };
  }

  recommendSystem(annualHarvest, dailyWaterDemand, roofArea) {
    const annualDemand = Math.max(0, Number(dailyWaterDemand) || 0) * 365;
    const demandCoverage = (annualHarvest / annualDemand) * 100;

    let systemSize = 'small';
    let tankCapacity = 1000;
    let description = '';

    if (annualHarvest > 150000 || roofArea > 200) {
      systemSize = 'large';
      tankCapacity = 5000;
      description = 'Large-scale system with multiple collection points';
    } else if (annualHarvest > 75000 || roofArea > 100) {
      systemSize = 'medium';
      tankCapacity = 3000;
      description = 'Medium system with enhanced filtration';
    } else {
      tankCapacity = 1500;
      description = 'Compact system suitable for residential use';
    }

    return {
      size: systemSize,
      tankCapacity,
      description,
      demandCoverage: Math.round(Number.isFinite(demandCoverage) ? demandCoverage : 0),
      recommended: demandCoverage >= 30 // Recommend if covers at least 30% of demand
    };
  }

  calculateCosts(systemSize, roofArea, annualHarvest) {
    const systemConfig = this.systemCosts[systemSize];
    
    const equipmentCost = systemConfig.base + (roofArea * systemConfig.perSqM);
    const installationCost = equipmentCost * 0.3; // 30% of equipment cost
    const totalCost = equipmentCost + installationCost;

    // Calculate savings and payback
    const waterCostPerLiter = 0.015; // INR per liter (average)
    const safeAnnualHarvest = (Number(annualHarvest) || 0);
    const annualSavings = safeAnnualHarvest * waterCostPerLiter;
    const paybackPeriod = annualSavings > 0 ? (totalCost / annualSavings) : Infinity;

    // Government subsidies (varies by state)
    const subsidyPercentage = 0.25; // 25% average subsidy
    const subsidyAmount = totalCost * subsidyPercentage;
    const netCost = totalCost - subsidyAmount;

    const safePayback = Number.isFinite(paybackPeriod) ? Math.round(paybackPeriod * 10) / 10 : 0;
    const roiRaw = netCost > 0 ? (annualSavings / netCost) * 100 : 0;

    return {
      equipment: Math.round(equipmentCost),
      installation: Math.round(installationCost),
      total: Math.round(totalCost),
      subsidy: Math.round(subsidyAmount),
      netCost: Math.round(netCost),
      annualSavings: Math.round(annualSavings),
      paybackYears: safePayback,
      roi: Math.round(roiRaw)
    };
  }

  calculateEnvironmentalImpact(annualHarvest, dailyWaterDemand) {
    // Water conservation
    const waterSaved = Math.max(0, Number(annualHarvest) || 0);
    
    // CO2 reduction (water treatment and distribution)
    const co2PerLiter = 0.0003; // kg CO2 per liter
    const co2Reduction = waterSaved * co2PerLiter;

    // Energy savings (pumping and treatment)
    const energyPerLiter = 0.002; // kWh per liter
    const energySaved = waterSaved * energyPerLiter;

    // Groundwater recharge potential
    const rechargeContribution = waterSaved * 0.7; // 70% contributes to groundwater

    return {
      waterSaved: Math.round(waterSaved),
      co2Reduction: Math.round(co2Reduction),
      energySaved: Math.round(energySaved),
      groundwaterRecharge: Math.round(rechargeContribution),
      equivalentTrees: Math.round(co2Reduction / 21.77) // Trees needed to offset CO2
    };
  }

  calculateRechargeStructures(roofArea, soilData, annualHarvest) {
    const percolationRate = soilData.percolationRate;
    
    // Calculate required recharge pit dimensions
    const rechargePitArea = (annualHarvest / 1000) / (percolationRate * 365); // m²
    const recommendedPits = Math.ceil(rechargePitArea / 4); // 2m x 2m pits

    // Recharge well specifications
    const rechargeWellDepth = 15; // meters
    const rechargeWellDiameter = 0.5; // meters

    const structures = [];

    if (roofArea < 100) {
      structures.push({
        type: 'recharge_pit',
        quantity: Math.max(1, recommendedPits),
        dimensions: '2m x 2m x 2m',
        cost: 15000 * Math.max(1, recommendedPits),
        description: 'Simple recharge pits with gravel filter'
      });
    } else {
      structures.push({
        type: 'recharge_well',
        quantity: 1,
        dimensions: `${rechargeWellDiameter}m dia x ${rechargeWellDepth}m deep`,
        cost: 45000,
        description: 'Bore well for groundwater recharge'
      });
      
      if (recommendedPits > 0) {
        structures.push({
          type: 'recharge_pit',
          quantity: recommendedPits,
          dimensions: '2m x 2m x 2m',
          cost: 15000 * recommendedPits,
          description: 'Additional recharge pits'
        });
      }
    }

    const totalRechargeCost = structures.reduce((sum, struct) => sum + (Number(struct.cost) || 0), 0);

    return {
      soilSuitability: percolationRate > 0.5 ? 'Good' : 'Moderate',
      structures,
      totalCost: totalRechargeCost,
      rechargeCapacity: Math.round(((Number(annualHarvest) || 0) * (Number(percolationRate) || 0))),
      recommendation: percolationRate > 0.6 ? 
        'Excellent for groundwater recharge' : 
        'Suitable with proper filtration'
    };
  }
}

module.exports = new CalculationService();
