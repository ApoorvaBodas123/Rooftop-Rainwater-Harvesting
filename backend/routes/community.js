const express = require('express');
const router = express.Router();
const {
  getCommunityImpact,
  getLeaderboard,
  getShareMessage
} = require('../controllers/communityController');

// GET /api/community/impact - Get community impact data
router.get('/impact', getCommunityImpact);

// GET /api/community/leaderboard - Get neighbor leaderboard
router.get('/leaderboard', getLeaderboard);

// GET /api/community/share-message - Get pre-generated share message
router.get('/share-message', getShareMessage);

// POST /api/community/challenge - Join a community challenge
router.post('/challenge', (req, res) => {
  const { challengeId } = req.body;
  
  // Mock challenge data
  const challenges = {
    1: { name: 'Monsoon Maximizer', target: 5000, reward: 'Water Warrior Badge' },
    2: { name: 'Neighbor Helper', target: 3, reward: 'Community Leader Badge' },
    3: { name: 'Consistency Champion', target: 30, reward: 'Dedication Medal' }
  };
  
  const challenge = challenges[challengeId];
  if (!challenge) {
    return res.status(404).json({ error: 'Challenge not found' });
  }
  
  res.json({
    success: true,
    message: `Successfully joined ${challenge.name} challenge!`,
    challenge: {
      id: challengeId,
      ...challenge,
      progress: 0,
      joined: true
    }
  });
});

module.exports = router;
