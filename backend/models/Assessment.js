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
    co2Reduction: Number
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
