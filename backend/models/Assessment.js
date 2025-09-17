const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String,
    city: String,
    state: String,
    country: String
  },
  roofArea: {
    type: Number,
    required: true
  },
  roofType: {
    type: String,
    enum: ['concrete', 'metal', 'tiled', 'other'],
    required: true
  },
  averageRainfall: {
    type: Number,
    required: true
  },
  waterDemand: {
    type: Number,
    required: true
  },
  potentialHarvest: {
    annual: Number,
    monthly: [Number],
    daily: Number
  },
  recommendedSystem: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: true
  },
  estimatedCost: {
    type: Number,
    required: true
  },
  paybackPeriod: Number,
  environmentalImpact: {
    waterSaved: Number,
    co2Reduction: Number,
    energySaved: Number,
    groundwaterRecharge: Number,
    equivalentTrees: Number
  },
  // Additional fields for real data
  climateZone: String,
  soilType: String,
  systemDetails: {
    tankCapacity: Number,
    description: String,
    demandCoverage: Number,
    recommended: Boolean
  },
  costBreakdown: {
    equipment: Number,
    installation: Number,
    total: Number,
    subsidy: Number,
    netCost: Number,
    annualSavings: Number,
    paybackYears: Number,
    roi: Number
  },
  rechargeAnalysis: {
    soilSuitability: String,
    structures: [{
      // Use nested object to allow a property literally named 'type'
      type: { type: String },
      quantity: Number,
      dimensions: String,
      cost: Number,
      description: String
    }],
    totalCost: Number,
    rechargeCapacity: Number,
    recommendation: String
  },
  dataConfidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create geospatial index
assessmentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Assessment', assessmentSchema);
