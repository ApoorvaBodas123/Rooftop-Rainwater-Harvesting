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
  background: `linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(3, 169, 244, 0.05) 100%), linear-gradient(45deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)`,
  position: 'relative',
  '&::before': {
    content: '""', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    background: `radial-gradient(circle at 20% 80%, rgba(33, 150, 243, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(3, 169, 244, 0.1) 0%, transparent 50%)`,
    pointerEvents: 'none'
  }
});

const StyledCard = styled(Card)<{ variant: 'water' | 'streak' | 'tree' }>(({ variant }) => {
  const styles = {
    water: { bg: 'linear-gradient(135deg, rgba(227, 242, 253, 0.95) 0%, rgba(187, 222, 251, 0.95) 100%)', border: 'rgba(33, 150, 243, 0.2)', shadow: 'rgba(33, 150, 243, 0.15)', topBar: 'linear-gradient(90deg, #2196f3, #03a9f4)' },
    streak: { bg: 'linear-gradient(135deg, rgba(232, 245, 232, 0.95) 0%, rgba(200, 230, 201, 0.95) 100%)', border: 'rgba(76, 175, 80, 0.2)', shadow: 'rgba(76, 175, 80, 0.15)', topBar: 'linear-gradient(90deg, #4caf50, #66bb6a)' },
    tree: { bg: 'linear-gradient(135deg, rgba(243, 229, 245, 0.95) 0%, rgba(225, 190, 231, 0.95) 100%)', border: 'rgba(156, 39, 176, 0.2)', shadow: 'rgba(156, 39, 176, 0.15)', topBar: 'linear-gradient(90deg, #9c27b0, #ab47bc)' }
  }[variant];
  
  return {
    background: styles.bg, backdropFilter: 'blur(10px)', borderRadius: 20, padding: '24px', position: 'relative',
    border: `1px solid ${styles.border}`, boxShadow: `0 8px 32px ${styles.shadow}`, transition: 'all 0.3s ease',
    '&:hover': { transform: 'translateY(-5px)', boxShadow: `0 12px 40px ${styles.shadow}` },
    '&::before': { content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: styles.topBar, borderRadius: '20px 20px 0 0' }
  };
});

const GlassCard = styled(Paper)({
  background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(15px)', borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease', '&:hover': { background: 'rgba(255, 255, 255, 0.15)', transform: 'translateY(-2px)' }
});

const AnimatedButton = styled(Button)({
  background: 'linear-gradient(45deg, #2196f3, #21cbf3)', borderRadius: 25, padding: '12px 30px',
  fontSize: '1.1rem', fontWeight: 'bold', textTransform: 'none', boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)',
  transition: 'all 0.3s ease', '&:hover': { background: 'linear-gradient(45deg, #1976d2, #0288d1)', transform: 'translateY(-2px)', boxShadow: '0 6px 25px rgba(33, 150, 243, 0.4)' }
});

const StatsAvatar = styled(Avatar)<{ variant?: string }>(({ variant }) => ({
  width: 60, height: 60, fontSize: '1.5rem', boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
  background: {
    water: 'linear-gradient(45deg, #2196f3, #03a9f4)', streak: 'linear-gradient(45deg, #4caf50, #66bb6a)',
    tree: 'linear-gradient(45deg, #9c27b0, #ab47bc)', badge: 'linear-gradient(45deg, #ff9800, #ffb74d)',
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
          <StatsAvatar variant={variant} sx={{ margin: '0 auto', mb: 2 }}>{icon}</StatsAvatar>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
          <Typography variant="h2" color={`${color}.main`} fontWeight="bold" sx={{ mb: 1 }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          <Typography variant="h6" color={`${color}.main`}>{subtitle}</Typography>
          <Typography variant="body2" color="text.secondary" mt={2}>{description}</Typography>
          {progress !== undefined && (
            <LinearProgress variant="determinate" value={progress} sx={{ 
              mt: 2, borderRadius: 10, height: 10, background: `rgba(${variant === 'tree' ? '156, 39, 176' : '0, 0, 0'}, 0.1)`,
              '& .MuiLinearProgress-bar': { background: variant === 'tree' ? 'linear-gradient(90deg, #9c27b0, #ab47bc)' : 'currentColor', borderRadius: 10 }
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
        <StatsAvatar sx={{ margin: '0 auto', mb: 3 }}><WaterDrop /></StatsAvatar>
        <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>💧 Water Sustainability Tracker</Typography>
        <CircularProgress sx={{ mt: 2 }} size={60} thickness={4} />
        <Typography variant="body1" sx={{ mt: 2, color: '#666' }}>Loading your water conservation journey...</Typography>
      </Container>
    </BackgroundContainer>
  );

  if (!data) return (
    <BackgroundContainer>
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <Typography variant="h4" color="error" gutterBottom>Failed to load tracker data</Typography>
        <AnimatedButton onClick={fetchDashboardData} startIcon={<Refresh />}>Retry Loading</AnimatedButton>
      </Container>
    </BackgroundContainer>
  );

  return (
    <BackgroundContainer>
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 2 }}>
        
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
          <Box display="flex" alignItems="center" gap={2}>
            <StatsAvatar><WaterDrop /></StatsAvatar>
            <Box>
              <Typography variant="h3" sx={{ 
                fontWeight: 'bold', background: 'linear-gradient(45deg, #2196f3, #21cbf3)',
                backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>💧 Water Sustainability Tracker</Typography>
              <Typography variant="subtitle1" sx={{ color: '#666', mt: 1 }}>Track your impact, save our planet 🌍</Typography>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchDashboardData} sx={{ background: 'rgba(33, 150, 243, 0.1)', '&:hover': { background: 'rgba(33, 150, 243, 0.2)' } }}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <AnimatedButton onClick={() => setAddWaterOpen(true)} startIcon={<Add />}>Add Water Saved</AnimatedButton>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={4} mb={6}>
          <Grid item xs={12} md={4}>
            <StatCard variant="water" icon="💧" title="Lifetime Water Saved" value={data.lifetimeWaterSaved} subtitle="Liters" description="Every drop counts! 🌍" timeout={500} animateCards={animateCards} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard variant="streak" icon="🔥" title="Current Streak" value={data.currentStreak} subtitle="Days" description={data.currentStreak >= 7 ? "Amazing streak! 🎉" : "Keep going! 💪"} timeout={700} animateCards={animateCards} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard variant="tree" icon="🌳" title="Trees Sponsored" value={data.treesSponsored} subtitle="" description={`Next tree at ${data.nextTreeAt.toLocaleString()}L 🌱`} progress={data.progressToNextTree} timeout={900} animateCards={animateCards} />
          </Grid>
        </Grid>

        {/* Badges */}
        <Fade in={animateCards} timeout={1100}>
          <GlassCard sx={{ p: 4, mb: 4 }} elevation={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StatsAvatar variant="badge">🏆</StatsAvatar>
              <Typography variant="h4" fontWeight="bold">Badges & Achievements</Typography>
            </Box>
            <Box display="flex" flexWrap="wrap" gap={2}>
              {data.badges.map((badge, index) => (
                <Grow key={badge.name} in={animateCards} timeout={1200 + index * 100}>
                  <Chip label={`${badge.name} - ${badge.requirement.toLocaleString()}L`} color={badge.earned ? 'success' : 'default'} variant={badge.earned ? 'filled' : 'outlined'}
                    sx={{ fontSize: '1rem', height: 50, px: 2, background: badge.earned ? 'linear-gradient(45deg, #4caf50, #66bb6a)' : 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)', border: badge.earned ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                      '&:hover': { transform: 'scale(1.05)', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }, transition: 'all 0.3s ease' }} />
                </Grow>
              ))}
            </Box>
          </GlassCard>
        </Fade>

        {/* Milestones */}
        <Fade in={animateCards} timeout={1300}>
          <GlassCard sx={{ p: 4, mb: 4 }} elevation={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StatsAvatar variant="milestone">🎯</StatsAvatar>
              <Typography variant="h4" fontWeight="bold">Milestones & Challenges</Typography>
            </Box>
            <Grid container spacing={3}>
              {data.milestones.map((milestone, index) => (
                <Grid item xs={12} sm={6} md={4} key={milestone.name}>
                  <Grow in={animateCards} timeout={1400 + index * 100}>
                    <Card sx={{ 
                      borderRadius: 4, backdropFilter: 'blur(10px)', transition: 'all 0.3s ease',
                      background: milestone.achieved ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(102, 187, 106, 0.1) 100%)' : 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 235, 59, 0.1) 100%)',
                      border: milestone.achieved ? '2px solid #4caf50' : '2px solid #ffc107',
                      '&:hover': { transform: 'translateY(-5px) scale(1.02)', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }
                    }}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Typography variant="h6" fontWeight="bold">{milestone.name}</Typography>
                          {milestone.achieved && <Typography variant="h5">✅</Typography>}
                        </Box>
                        <Typography variant="body2" color="text.secondary" mb={3}>{milestone.description}</Typography>
                        <LinearProgress variant="determinate" value={milestone.achieved ? 100 : 0} sx={{ 
                          borderRadius: 10, height: 8, background: 'rgba(0,0,0,0.1)',
                          '& .MuiLinearProgress-bar': { background: milestone.achieved ? 'linear-gradient(90deg, #4caf50, #66bb6a)' : 'linear-gradient(90deg, #ffc107, #ffeb3b)', borderRadius: 10 }
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
          <GlassCard sx={{ p: 4, background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)', border: '2px solid rgba(76, 175, 80, 0.3)' }} elevation={0}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <StatsAvatar variant="tree">🌳</StatsAvatar>
              <Typography variant="h4" fontWeight="bold">Tree Planting Rewards</Typography>
            </Box>
            <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1.8 }}>
              Each milestone you achieve sponsors a tree planting! You've already sponsored{' '}
              <Box component="span" sx={{ background: 'linear-gradient(45deg, #4caf50, #66bb6a)', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 'bold', fontSize: '1.2em' }}>
                {data.treesSponsored} trees
              </Box> 🌱<br />
              Every 3,000 liters saved = 1 tree planted. Keep saving water to grow our forest! 🌲
            </Typography>
          </GlassCard>
        </Fade>

        {/* Dialog */}
        <Dialog open={addWaterOpen} onClose={() => setAddWaterOpen(false)} maxWidth="sm" fullWidth
          PaperProps={{ sx: { borderRadius: 4, background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' } }}>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <StatsAvatar sx={{ margin: '0 auto', mb: 2 }}>💧</StatsAvatar>
            <Typography variant="h5" fontWeight="bold">Add Water Saved Today</Typography>
          </DialogTitle>
          <DialogContent>
            <TextField autoFocus margin="dense" label="Liters Saved" type="number" fullWidth variant="outlined" value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)} helperText="Enter the amount of water you saved today" disabled={submitting}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3, '&:hover fieldset': { borderColor: '#2196f3' } } }} />
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button onClick={() => setAddWaterOpen(false)} disabled={submitting} sx={{ borderRadius: 3 }}>Cancel</Button>
            <AnimatedButton onClick={handleAddWater} disabled={!waterAmount || submitting} startIcon={submitting ? <CircularProgress size={20} /> : <Add />}>
              {submitting ? 'Adding...' : 'Add Water'}
            </AnimatedButton>
          </DialogActions>
        </Dialog>
        
      </Container>
    </BackgroundContainer>
  );
};

export default SustainabilityTracker;