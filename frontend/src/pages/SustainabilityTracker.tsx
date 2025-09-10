import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Chip, Stack } from '@mui/material';

const badgesSeed = [
  { label: '🌱 Eco Hero', unlockedAt: 1000 },
  { label: '💧 Rain Saver', unlockedAt: 5000 },
  { label: '🏆 Community Champion', unlockedAt: 20000 },
];

const SustainabilityTracker = () => {
  const [lifetimeSaved, setLifetimeSaved] = useState(0); // liters
  const [streakDays, setStreakDays] = useState(0);

  useEffect(() => {
    // Demo values; in real app, fetch from API or local storage
    setLifetimeSaved(6200);
    setStreakDays(7);
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sustainability Tracker
      </Typography>

      <Box display="flex" gap={2} flexWrap="wrap" mb={3}>
        <Paper sx={{ p: 3, flex: 1, minWidth: 260 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Lifetime Water Saved
          </Typography>
          <Typography variant="h4" color="primary">
            {lifetimeSaved.toLocaleString()} L
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1, minWidth: 260 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Saving Streak
          </Typography>
          <Typography variant="h4" color="success.main">
            {streakDays} days
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep it up! “7 days of saving water!”
          </Typography>
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Badges & Achievements
        </Typography>
        <Stack direction="row" gap={1} flexWrap="wrap">
          {badgesSeed.map((b) => (
            <Chip
              key={b.label}
              label={`${b.label} – ${b.unlockedAt.toLocaleString()} L`}
              color={lifetimeSaved >= b.unlockedAt ? 'success' : 'default'}
              variant={lifetimeSaved >= b.unlockedAt ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
          Reach milestones to unlock badges. Each milestone could even sponsor a tree planting!
        </Typography>
      </Paper>
    </Container>
  );
};

export default SustainabilityTracker;
