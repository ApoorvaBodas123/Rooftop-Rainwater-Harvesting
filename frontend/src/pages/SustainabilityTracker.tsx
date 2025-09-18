import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Grid, LinearProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, Paper,
  Fade, Grow, CircularProgress, IconButton, Tooltip, Avatar
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Add, Refresh, WaterDrop } from '@mui/icons-material';

// Types
interface Badge { name: string; requirement: number; earned: boolean; }
interface Milestone { name: string; description: string; achieved: boolean; }
interface Activity { id: number; amount: number; date: string; type: string; }
interface DashboardData {
  lifetimeWaterSaved: number; currentStreak: number; treesSponsored: number;
  nextTreeAt: number; progressToNextTree: number;
  badges: Badge[]; milestones: Milestone[]; activities: Activity[];
}

// Styled Components
const BackgroundContainer = styled(Box)({
  minHeight: '100vh',

  backgroundColor: '#eeeeee',
});

const StyledCard = styled(Card)<{ variant: 'water' | 'streak' | 'tree' }>(() => ({
  background: '#ffffff',
  borderRadius: 12,
  padding: '16px',
  position: 'relative',
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  transition: 'all 0.2s ease',
  '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
}));

const GlassCard = styled(Paper)({
  background: '#ffffff',
  borderRadius: 12,
  border: '1px solid rgba(0,0,0,0.08)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',

});

const AnimatedButton = styled(Button)({
  background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
  borderRadius: 8,
  padding: '8px 16px',
  fontSize: '0.9rem',
  fontWeight: 'bold',
  textTransform: 'none',
  boxShadow: '0 2px 8px rgba(33, 150, 243, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': { 
    background: 'linear-gradient(45deg, #1976d2, #0288d1)',
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(33, 150, 243, 0.4)' 
  }
});

const StatsAvatar = styled(Avatar)<{ variant?: string }>(({ variant }) => ({

  width: 48, height: 48, fontSize: '1.1rem', boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)',

  background: {
    water: 'linear-gradient(45deg, #2196f3, #03a9f4)',
    streak: 'linear-gradient(45deg, #4caf50, #66bb6a)',
    tree: 'linear-gradient(45deg, #9c27b0, #ab47bc)',
    badge: 'linear-gradient(45deg, #ff9800, #ffb74d)',
    milestone: 'linear-gradient(45deg, #f44336, #ff7043)'
  }[variant as string] || 'linear-gradient(45deg, #2196f3, #03a9f4)'
}));

// Components
const StatCard: React.FC<{
  variant: 'water' | 'streak' | 'tree'; icon: string; title: string; value: string | number;
  subtitle: string; description: string; progress?: number; timeout: number; animateCards: boolean;
}> = ({ variant, icon, title, value, subtitle, description, progress, timeout, animateCards }) => {
  const color = { water: 'primary', streak: 'success', tree: 'secondary' }[variant];
  return (
    <Grow in={animateCards} timeout={timeout}>
      <StyledCard variant={variant} elevation={0}>

        <CardContent sx={{ textAlign: 'center' }}>
          <StatsAvatar variant={variant} sx={{ margin: '0 auto', mb: 1 }}>{''}</StatsAvatar>
          <Typography variant="caption" color="text.secondary" gutterBottom>{title}</Typography>
          <Typography variant="h4" color="text.primary" fontWeight="bold" sx={{ mb: 0.5 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary">{subtitle}</Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>{description}</Typography>

          {progress !== undefined && (
            <LinearProgress variant="determinate" value={progress} sx={{ 
              mt: 1, borderRadius: 4, height: 6, backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': { backgroundColor: 'currentColor', borderRadius: 4 }
            }} />
          )}
        </CardContent>
      </StyledCard>
    </Grow>
  );
};

const SustainabilityTracker: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [addWaterOpen, setAddWaterOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState('');
  const [animateCards, setAnimateCards] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/sustainability/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        // Ensure all required properties exist with defaults
        const safeData: DashboardData = {
          lifetimeWaterSaved: dashboardData.lifetimeWaterSaved || 0,
          currentStreak: dashboardData.currentStreak || 0,
          treesSponsored: dashboardData.treesSponsored || 0,
          nextTreeAt: dashboardData.nextTreeAt || 3000,
          progressToNextTree: dashboardData.progressToNextTree || 0,
          badges: Array.isArray(dashboardData.badges) ? dashboardData.badges : [],
          milestones: Array.isArray(dashboardData.milestones) ? dashboardData.milestones : [],
          activities: Array.isArray(dashboardData.activities) ? dashboardData.activities : []
        };
        setData(safeData);
        setTimeout(() => setAnimateCards(true), 300);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWater = async (): Promise<void> => {
    const amount = parseInt(waterAmount);
    if (!amount || amount <= 0) return;
    try {
      setSubmitting(true);
      const response = await fetch('/api/sustainability/add-water', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount })
      });
      if (response.ok) {
        setWaterAmount(''); setAddWaterOpen(false); await fetchDashboardData();
      }
    } catch (error) {
      console.error('Failed to add water:', error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  if (loading) return (
    <BackgroundContainer>

      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <StatsAvatar sx={{ margin: '0 auto', mb: 2 }}><WaterDrop /></StatsAvatar>
        <Typography variant="h5" gutterBottom sx={{ color: 'text.primary', fontWeight: 'bold' }}>Water Sustainability Tracker</Typography>
        <CircularProgress sx={{ mt: 2 }} size={60} thickness={4} />
        <Typography variant="body2" sx={{ mt: 2, color: '#666' }}>Loading your water conservation journey...</Typography>

      </Container>
    </BackgroundContainer>
  );

  if (!data) return (
    <BackgroundContainer>

      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <Typography variant="h5" gutterBottom color="text.primary">Failed to load tracker data</Typography>

        <AnimatedButton onClick={fetchDashboardData} startIcon={<Refresh />}>Retry Loading</AnimatedButton>
      </Container>
    </BackgroundContainer>
  );

  return (
    <BackgroundContainer>

      <Container maxWidth="lg" sx={{ py: 3, position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <StatsAvatar><WaterDrop /></StatsAvatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Water Sustainability Tracker</Typography>
              <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>Track your impact, save our planet</Typography>

            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchDashboardData} size="small" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)', '&:hover': { backgroundColor: 'rgba(33, 150, 243, 0.2)' } }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <AnimatedButton onClick={() => setAddWaterOpen(true)} startIcon={<Add />} size="small">Add Water Saved</AnimatedButton>
          </Box>
        </Box>

        {/* Stats */}

        <Grid container spacing={3} mb={4}>

          <Grid item xs={12} md={4}>
            <StatCard variant="water" icon="" title="Lifetime Water Saved" value={data.lifetimeWaterSaved} subtitle="Liters" description="Every drop counts!" timeout={500} animateCards={animateCards} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard variant="streak" icon="" title="Current Streak" value={data.currentStreak} subtitle="Days" description={data.currentStreak >= 7 ? "Amazing streak!" : "Keep going!"} timeout={700} animateCards={animateCards} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard variant="tree" icon="" title="Trees Sponsored" value={data.treesSponsored} subtitle="" description={`Next tree at ${data.nextTreeAt.toLocaleString()}L`} progress={data.progressToNextTree} timeout={900} animateCards={animateCards} />
          </Grid>
        </Grid>

        {/* Badges */}
        <Fade in={animateCards} timeout={1100}>

          <GlassCard sx={{ p: 3, mb: 3 }} elevation={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StatsAvatar variant="badge"><WaterDrop /></StatsAvatar>
              <Typography variant="h5" fontWeight="bold" color="text.primary">Badges & Achievements</Typography>

            </Box>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {data.badges.map((badge, index) => (
                <Grow key={badge.name} in={animateCards} timeout={1200 + index * 100}>

                  <Chip label={`${badge.name} - ${badge.requirement.toLocaleString()}L`} variant="outlined"
                    sx={{ fontSize: '0.9rem', height: 40, px: 2 }} />

                </Grow>
              ))}
            </Box>
          </GlassCard>
        </Fade>

        {/* Milestones */}
        <Fade in={animateCards} timeout={1300}>

          <GlassCard sx={{ p: 3, mb: 3 }} elevation={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StatsAvatar variant="milestone"><WaterDrop /></StatsAvatar>
              <Typography variant="h5" fontWeight="bold" color="text.primary">Milestones & Challenges</Typography>

            </Box>
            <Grid container spacing={2}>
              {data.milestones.map((milestone, index) => (
                <Grid item xs={12} sm={6} md={4} key={milestone.name}>
                  <Grow in={animateCards} timeout={1400 + index * 100}>
                    <Card sx={{ 

                      borderRadius: 3, background: '#ffffff', border: '1px solid rgba(0,0,0,0.08)',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="subtitle1" fontWeight="bold" color="text.primary">{milestone.name}</Typography>
                          {milestone.achieved && <Chip label="Achieved" size="small" variant="outlined" />}
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={2}>{milestone.description}</Typography>
                        <LinearProgress variant="determinate" value={milestone.achieved ? 100 : 0} sx={{ 
                          borderRadius: 10, height: 6

                        }} />
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </GlassCard>
        </Fade>

        {/* Tree Rewards */}
        <Fade in={animateCards} timeout={1500}>

          <GlassCard sx={{ p: 3 }} elevation={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StatsAvatar variant="tree"><WaterDrop /></StatsAvatar>
              <Typography variant="h5" fontWeight="bold" color="text.primary">Tree Planting Rewards</Typography>
            </Box>
            <Typography variant="subtitle1" color="text.primary" sx={{ lineHeight: 1.7 }}>
              Each milestone you achieve sponsors a tree planting! You've already sponsored{' '}
              <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>

                {data.treesSponsored} trees
              </Box>
              <br />
              Every 3,000 liters saved = 1 tree planted. Keep saving water to grow our forest!
            </Typography>
          </GlassCard>
        </Fade>

        {/* Dialog */}
        <Dialog open={addWaterOpen} onClose={() => setAddWaterOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 3, backgroundColor: 'rgba(255, 255, 255, 0.95)' } }}>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>

            <StatsAvatar sx={{ margin: '0 auto', mb: 2 }}><WaterDrop /></StatsAvatar>

            <Typography variant="h6" fontWeight="bold">Add Water Saved Today</Typography>
          </DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Liters Saved" type="number" fullWidth variant="outlined" value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)} helperText="Enter the amount of water you saved today" disabled={submitting}
              size="small"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, '&:hover fieldset': { borderColor: '#2196f3' } } }} />
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button onClick={() => setAddWaterOpen(false)} disabled={submitting} size="small" sx={{ borderRadius: 2 }}>Cancel</Button>
            <AnimatedButton onClick={handleAddWater} disabled={!waterAmount || submitting} startIcon={submitting ? <CircularProgress size={16} /> : <Add />} size="small">
              {submitting ? 'Adding...' : 'Add Water'}
            </AnimatedButton>
          </DialogActions>
        </Dialog>
        
      </Container>
    </BackgroundContainer>
  );
};

export default SustainabilityTracker;