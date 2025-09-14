const express = require('express');
const router = express.Router();

// Mock user data - in production, this would come from database
const userData = {
  '1': {
    lifetimeWaterSaved: 8500,
    currentStreak: 12,
    lastActivity: new Date().toISOString(),
    activities: [
      { date: '2024-01-15', liters: 150, type: 'rainwater_collection' },
      { date: '2024-01-14', liters: 200, type: 'greywater_reuse' },
      { date: '2024-01-13', liters: 180, type: 'rainwater_collection' }
    ],
    badges: [
      { id: 'eco_hero', name: '🌱 Eco Hero', earned: true, earnedAt: '2024-01-10', requirement: 1000 },
      { id: 'rain_saver', name: '💧 Rain Saver', earned: true, earnedAt: '2024-01-12', requirement: 5000 },
      { id: 'community_champion', name: '🏆 Community Champion', earned: false, requirement: 20000 },
      { id: 'water_warrior', name: '⚡ Water Warrior', earned: false, requirement: 15000 },
      { id: 'sustainability_star', name: '⭐ Sustainability Star', earned: false, requirement: 30000 }
    ],
    milestones: [
      { id: 'first_drop', name: 'First Drop', description: 'Save your first liter', target: 1, achieved: true, achievedAt: '2024-01-01' },
      { id: 'week_warrior', name: '7-Day Warrior', description: '7 days of water saving', target: 7, achieved: true, achievedAt: '2024-01-08' },
      { id: 'month_master', name: 'Month Master', description: '30 days of consistent saving', target: 30, achieved: false },
      { id: 'liter_legend', name: 'Liter Legend', description: 'Save 10,000 liters', target: 10000, achieved: false }
    ],
    treesSponsored: 3,
    nextTreeAt: 10000
  }
};

// GET /api/sustainability/user/:userId - Main tracker data
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const user = userData[userId] || userData['1'];
  
  res.json({
    lifetimeWaterSaved: user.lifetimeWaterSaved,
    currentStreak: user.currentStreak,
    lastActivity: user.lastActivity,
    treesSponsored: user.treesSponsored,
    nextTreeAt: user.nextTreeAt,
    progressToNextTree: (user.lifetimeWaterSaved / user.nextTreeAt) * 100
  });
});

// POST /api/sustainability/user/:userId/activity - Add water saving activity
router.post('/user/:userId/activity', (req, res) => {
  const { userId } = req.params;
  const { liters, type = 'rainwater_collection' } = req.body;
  
  if (!userData[userId]) {
    userData[userId] = { ...userData['1'] };
  }
  
  const user = userData[userId];
  const newActivity = {
    date: new Date().toISOString(),
    liters: parseInt(liters),
    type
  };
  
  user.activities.unshift(newActivity);
  user.lifetimeWaterSaved += parseInt(liters);
  user.lastActivity = new Date().toISOString();
  
  // Update streak logic (simplified)
  const today = new Date().toDateString();
  const lastActivityDate = new Date(user.lastActivity).toDateString();
  if (today === lastActivityDate) {
    user.currentStreak += 1;
  }
  
  res.json({
    success: true,
    newTotal: user.lifetimeWaterSaved,
    currentStreak: user.currentStreak,
    activity: newActivity
  });
});

// GET /api/sustainability/user/:userId/badges - User badges
router.get('/user/:userId/badges', (req, res) => {
  const { userId } = req.params;
  const user = userData[userId] || userData['1'];
  
  // Update badge status based on current water saved
  const updatedBadges = user.badges.map(badge => ({
    ...badge,
    earned: user.lifetimeWaterSaved >= badge.requirement,
    progress: Math.min((user.lifetimeWaterSaved / badge.requirement) * 100, 100)
  }));
  
  res.json(updatedBadges);
});

// GET /api/sustainability/user/:userId/milestones - Milestones
router.get('/user/:userId/milestones', (req, res) => {
  const { userId } = req.params;
  const user = userData[userId] || userData['1'];
  
  const updatedMilestones = user.milestones.map(milestone => {
    let achieved = milestone.achieved;
    let progress = 0;
    
    if (milestone.id === 'week_warrior' || milestone.id === 'month_master') {
      progress = Math.min((user.currentStreak / milestone.target) * 100, 100);
      achieved = user.currentStreak >= milestone.target;
    } else if (milestone.id === 'liter_legend') {
      progress = Math.min((user.lifetimeWaterSaved / milestone.target) * 100, 100);
      achieved = user.lifetimeWaterSaved >= milestone.target;
    } else {
      progress = 100;
    }
    
    return {
      ...milestone,
      achieved,
      progress
    };
  });
  
  res.json(updatedMilestones);
});

// GET /api/sustainability/user/:userId/trees - Tree rewards
router.get('/user/:userId/trees', (req, res) => {
  const { userId } = req.params;
  const user = userData[userId] || userData['1'];
  
  res.json({
    treesSponsored: user.treesSponsored,
    nextTreeAt: user.nextTreeAt,
    progressToNextTree: Math.min((user.lifetimeWaterSaved / user.nextTreeAt) * 100, 100),
    litersToNextTree: Math.max(user.nextTreeAt - user.lifetimeWaterSaved, 0)
  });
});

// GET /api/sustainability/user/:userId/dashboard - Bulk data endpoint
router.get('/user/:userId/dashboard', async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Simulate async calls to get all data
    const [trackerData, badges, milestones, trees] = await Promise.all([
      Promise.resolve(userData[userId] || userData['1']),
      Promise.resolve(userData[userId]?.badges || userData['1'].badges),
      Promise.resolve(userData[userId]?.milestones || userData['1'].milestones),
      Promise.resolve({
        treesSponsored: userData[userId]?.treesSponsored || userData['1'].treesSponsored,
        nextTreeAt: userData[userId]?.nextTreeAt || userData['1'].nextTreeAt
      })
    ]);
    
    res.json({
      tracker: {
        lifetimeWaterSaved: trackerData.lifetimeWaterSaved,
        currentStreak: trackerData.currentStreak,
        lastActivity: trackerData.lastActivity
      },
      badges: badges.map(badge => ({
        ...badge,
        earned: trackerData.lifetimeWaterSaved >= badge.requirement,
        progress: Math.min((trackerData.lifetimeWaterSaved / badge.requirement) * 100, 100)
      })),
      milestones: milestones.map(milestone => {
        let achieved = milestone.achieved;
        let progress = 0;
        
        if (milestone.id === 'week_warrior' || milestone.id === 'month_master') {
          progress = Math.min((trackerData.currentStreak / milestone.target) * 100, 100);
          achieved = trackerData.currentStreak >= milestone.target;
        } else if (milestone.id === 'liter_legend') {
          progress = Math.min((trackerData.lifetimeWaterSaved / milestone.target) * 100, 100);
          achieved = trackerData.lifetimeWaterSaved >= milestone.target;
        } else {
          progress = 100;
        }
        
        return { ...milestone, achieved, progress };
      }),
      trees: {
        treesSponsored: trees.treesSponsored,
        nextTreeAt: trees.nextTreeAt,
        progressToNextTree: Math.min((trackerData.lifetimeWaterSaved / trees.nextTreeAt) * 100, 100),
        litersToNextTree: Math.max(trees.nextTreeAt - trackerData.lifetimeWaterSaved, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /api/sustainability/dashboard - Simplified dashboard endpoint (uses default user)
router.get('/dashboard', (req, res) => {
  const user = userData['1']; // Default user for simplicity
  
  // Update badges based on current progress
  const updatedBadges = user.badges.map(badge => ({
    name: badge.name,
    requirement: badge.requirement,
    earned: user.lifetimeWaterSaved >= badge.requirement
  }));
  
  // Update milestones based on current progress
  const updatedMilestones = user.milestones.map(milestone => {
    let achieved = milestone.achieved;
    
    if (milestone.id === 'week_warrior' || milestone.id === 'month_master') {
      achieved = user.currentStreak >= milestone.target;
    } else if (milestone.id === 'liter_legend') {
      achieved = user.lifetimeWaterSaved >= milestone.target;
    }
    
    return {
      name: milestone.name,
      description: milestone.description,
      achieved
    };
  });
  
  res.json({
    lifetimeWaterSaved: user.lifetimeWaterSaved,
    currentStreak: user.currentStreak,
    treesSponsored: user.treesSponsored,
    nextTreeAt: user.nextTreeAt,
    progressToNextTree: Math.min((user.lifetimeWaterSaved / user.nextTreeAt) * 100, 100),
    badges: updatedBadges,
    milestones: updatedMilestones,
    activities: user.activities.slice(0, 5).map((activity, index) => ({
      id: index + 1,
      amount: activity.liters,
      date: activity.date,
      type: activity.type
    }))
  });
});

// POST /api/sustainability/add-water - Simplified add water endpoint
router.post('/add-water', (req, res) => {
  const { amount } = req.body;
  const user = userData['1']; // Default user for simplicity
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  
  const newActivity = {
    date: new Date().toISOString(),
    liters: parseInt(amount),
    type: 'water_saving'
  };
  
  user.activities.unshift(newActivity);
  user.lifetimeWaterSaved += parseInt(amount);
  user.lastActivity = new Date().toISOString();
  
  // Update streak (simplified - just increment)
  user.currentStreak += 1;
  
  // Check if new tree should be sponsored
  while (user.lifetimeWaterSaved >= user.nextTreeAt) {
    user.treesSponsored += 1;
    user.nextTreeAt += 3000; // Next tree every 3000L
  }
  
  // Update milestone achievements
  user.milestones = user.milestones.map(milestone => {
    let achieved = milestone.achieved;
    
    if (milestone.id === 'week_warrior' && user.currentStreak >= 7) {
      achieved = true;
      milestone.achievedAt = new Date().toISOString();
    } else if (milestone.id === 'month_master' && user.currentStreak >= 30) {
      achieved = true;
      milestone.achievedAt = new Date().toISOString();
    } else if (milestone.id === 'liter_legend' && user.lifetimeWaterSaved >= 10000) {
      achieved = true;
      milestone.achievedAt = new Date().toISOString();
    }
    
    return { ...milestone, achieved };
  });
  
  // Update badge achievements
  user.badges = user.badges.map(badge => {
    if (user.lifetimeWaterSaved >= badge.requirement && !badge.earned) {
      return { ...badge, earned: true, earnedAt: new Date().toISOString() };
    }
    return badge;
  });
  
  res.json({
    success: true,
    newTotal: user.lifetimeWaterSaved,
    currentStreak: user.currentStreak,
    treesSponsored: user.treesSponsored,
    activity: newActivity
  });
});

// GET /api/sustainability/stats - Quick stats endpoint
router.get('/stats', (req, res) => {
  const user = userData['1'];
  res.json({
    lifetimeWaterSaved: user.lifetimeWaterSaved,
    currentStreak: user.currentStreak,
    treesSponsored: user.treesSponsored
  });
});

// POST /api/sustainability/reset - Reset data for testing
router.post('/reset', (req, res) => {
  userData['1'] = {
    lifetimeWaterSaved: 0,
    currentStreak: 0,
    lastActivity: new Date().toISOString(),
    activities: [],
    badges: [
      { id: 'eco_hero', name: '🌱 Eco Hero', earned: false, requirement: 1000 },
      { id: 'rain_saver', name: '💧 Rain Saver', earned: false, requirement: 5000 },
      { id: 'community_champion', name: '🏆 Community Champion', earned: false, requirement: 20000 },
      { id: 'water_warrior', name: '⚡ Water Warrior', earned: false, requirement: 15000 },
      { id: 'sustainability_star', name: '⭐ Sustainability Star', earned: false, requirement: 30000 }
    ],
    milestones: [
      { id: 'first_drop', name: 'First Drop', description: 'Save your first liter', target: 1, achieved: false },
      { id: 'week_warrior', name: '7-Day Warrior', description: '7 days of water saving', target: 7, achieved: false },
      { id: 'month_master', name: 'Month Master', description: '30 days of consistent saving', target: 30, achieved: false },
      { id: 'liter_legend', name: 'Liter Legend', description: 'Save 10,000 liters', target: 10000, achieved: false }
    ],
    treesSponsored: 0,
    nextTreeAt: 3000
  };
  
  res.json({ success: true, message: 'Data reset successfully' });
});

module.exports = router;
