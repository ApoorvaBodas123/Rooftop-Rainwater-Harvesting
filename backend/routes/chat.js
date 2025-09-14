const express = require('express');
const aiChatService = require('../services/aiChatService');

const router = express.Router();

// @route   POST /api/chat
// @desc    Get AI-powered chat response
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }

    // Build conversation context from history
    const context = aiChatService.buildConversationHistory(conversationHistory);
    
    // Generate AI response
    const result = await aiChatService.generateResponse(message, context);

    res.json({
      success: true,
      data: {
        response: result.response,
        source: result.source,
        category: result.category || 'general',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate response'
    });
  }
});

// @route   GET /api/chat/suggestions
// @desc    Get suggested questions for users
// @access  Public
router.get('/suggestions', (req, res) => {
  const suggestions = [
    "What is the cost of installing a rainwater harvesting system?",
    "How much water can I collect from my roof?",
    "What are the benefits of rainwater harvesting?",
    "How do I maintain my rainwater harvesting system?",
    "Are there government subsidies available?",
    "What components do I need for installation?",
    "How does soil type affect recharge structures?",
    "What's the payback period for investment?"
  ];

  res.json({
    success: true,
    data: suggestions
  });
});

module.exports = router;
