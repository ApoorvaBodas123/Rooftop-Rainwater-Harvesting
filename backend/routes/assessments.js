const express = require('express');
const { check } = require('express-validator');
const {
  createAssessment,
  getAssessments,
  getAssessment
} = require('../controllers/assessmentController');
const locationService = require('../services/locationService');

const router = express.Router();

// @route   POST api/assessments
// @desc    Create a new assessment
// @access  Public
router.post(
  '/',
  [
    check('location.coordinates', 'Please provide valid coordinates')
      .isArray({ min: 2, max: 2 }),
    check('roofArea', 'Please provide a valid roof area in square meters')
      .isNumeric()
      .isFloat({ min: 1 }),
    check('roofType', 'Please select a valid roof type')
      .isIn(['concrete', 'metal', 'tiled', 'other']),
    check('waterDemand', 'Please provide daily water demand in liters')
      .isNumeric()
      .isFloat({ min: 1 })
  ],
  createAssessment
);

// @route   GET api/assessments
// @desc    Get all assessments
// @access  Public
router.get('/', getAssessments);

// @route   GET api/assessments/:id
// @desc    Get single assessment
// @access  Public
router.get('/:id', getAssessment);

// @route   GET api/assessments/location/search
// @desc    Search for locations by query
// @access  Public
router.get('/location/search', async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = await locationService.searchLocation(q, parseInt(limit));
    res.json(results);
  } catch (error) {
    console.error('Location search error:', error);
    res.status(500).json({ error: 'Failed to search locations' });
  }
});

// @route   GET api/assessments/location/reverse
// @desc    Get location details from coordinates
// @access  Public
router.get('/location/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await locationService.getLocationDetails(parseFloat(lat), parseFloat(lng));
    res.json(result);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ error: 'Failed to get location details' });
  }
});

module.exports = router;
