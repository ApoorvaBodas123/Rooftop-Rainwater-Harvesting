const express = require('express');
const { check } = require('express-validator');
const {
  createAssessment,
  getAssessments,
  getAssessment
} = require('../controllers/assessmentController');

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

module.exports = router;
