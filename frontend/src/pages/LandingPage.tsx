import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  styled,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import type { Theme } from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import NatureIcon from '@mui/icons-material/Nature';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Colors
const secondaryColor = '#000000ff';

// Page background wrapper
const PageWrapper = styled(Box)(() => ({
  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f5f5f5',
}));

// Overlay wrapper (used for BOTH hero + features for seamless blend)
const OverlayWrapper = styled(Box)(() => ({
  width: '100%',
}));

// HeroBox
const HeroBox = styled(Box)(() => ({
  position: 'relative',
  minHeight: 'auto',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  textAlign: 'center',
  paddingTop: 12,
  paddingBottom: 10,
}));

const FeatureCard = styled(Card)(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 12,
  boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
  transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
  background: '#f5f5f5',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.12)',
  },
  animation: 'fadeInUp 1s ease-out forwards',
  opacity: 0,
  '@keyframes fadeInUp': {
    '0%': { opacity: 0, transform: 'translateY(20px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const AnimatedButton = styled(Button)(() => ({
  borderRadius: '40px',
  padding: '14px 36px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  background: secondaryColor,
  margin: '0 10px',
  '&:hover': {
    background: secondaryColor,
    transform: 'scale(1.05)',
    boxShadow: '0 12px 32px rgba(26, 32, 27, 0.5)',
  },
  transition: 'all 0.4s ease',
}));

const Navbar = styled(AppBar)(({ theme }: { theme: Theme }) => ({
  background: '#000000',
  boxShadow: 'none',
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: '#ffffff',
}));

// Animated text
const AnimatedTypography = styled(Typography)(() => ({
  opacity: 0,
  transform: 'translateY(20px)',
  animation: 'fadeSlideUp 1s ease forwards',
  '@keyframes fadeSlideUp': {
    '0%': { opacity: 0, transform: 'translateY(20px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const features = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 40, color: '#616161' }} />,
      title: t('landing.features.items.0.title'),
      description: t('landing.features.items.0.description')
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 40, color: '#616161' }} />,
      title: t('landing.features.items.1.title'),
      description: t('landing.features.items.1.description')
    },
    {
      icon: <NatureIcon sx={{ fontSize: 40, color: '#616161' }} />,
      title: t('landing.features.items.2.title'),
      description: t('landing.features.items.2.description')
    }
  ];

  const commonNavItems = [
    { label: 'Community', path: '/community' },
    { label: 'Help', path: '/about' },
    { label: 'Tracker', path: '/tracker' },
    { label: 'Start Assessment', path: '/assessment' }
  ];

  const authNavItems = isAuthenticated
    ? []
    : [
        { label: 'Login', path: '/login' },
        { label: 'Sign Up', path: '/signup' }
      ];

  const navItems = [...commonNavItems, ...authNavItems];

  return (
    <PageWrapper>
      {/* Navbar */}
      <Navbar position="static" color="transparent">
        <Container maxWidth="lg">
          <Toolbar variant="dense" disableGutters sx={{ display: 'flex', justifyContent: 'space-between', minHeight: 48 }}>
            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/" 
              color="inherit" 
              sx={{ 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                fontSize: { xs: '1rem', md: '1.25rem' },
                display: 'flex',
                alignItems: 'center',
                '&:hover': {
                    color: '#e3f2fd', 
                }
              }}
            >
              <WaterDropIcon sx={{ fontSize: 40, mr: 1 }} />
              Harvest Hub
            </Typography>
            {isMobile ? (
              <>
                <IconButton
                  size="large"
                  edge="end"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleMenu}
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {navItems.map((item) => (
                    <MenuItem 
                      key={item.label} 
                      component={RouterLink} 
                      to={item.path}
                      onClick={handleClose}
                    >
                      {item.label}
                    </MenuItem>
                  ))}
                  {isAuthenticated && (
                    <MenuItem 
                      onClick={() => {
                        logout();
                        handleClose();
                      }}
                    >
                      Sign Out
                    </MenuItem>
                  )}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navItems.map((item) => (
                  <Button 
                    key={item.label} 
                    component={RouterLink} 
                    to={item.path} 
                    color="inherit" 
                    sx={{ 
                      mr: 1,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#e3f2fd',
                        '@media (hover: hover)': {
                          backgroundColor: 'transparent',
                        },
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
                {isAuthenticated ? (
                  <>
                    <IconButton
                      onClick={(e) => setProfileAnchorEl(e.currentTarget)}
                      sx={{ p: 0, ml: 1 }}
                    >
                      <Avatar 
                        alt={user?.name || 'User'} 
                        src="/static/images/avatar/2.jpg"
                        sx={{ width: 32, height: 32 }}
                      />
                    </IconButton>
                    <Menu
                      anchorEl={profileAnchorEl}
                      open={Boolean(profileAnchorEl)}
                      onClose={() => setProfileAnchorEl(null)}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                    >
                      <MenuItem 
                        onClick={() => {
                          logout();
                          setProfileAnchorEl(null);
                        }}
                      >
                        Sign Out
                      </MenuItem>
                    </Menu>
                  </>
                ) : null}
              </Box>
            )}
          </Toolbar>
        </Container>
      </Navbar>

      {/* Overlay container (Hero + Features) */}
      <OverlayWrapper>
        {/* Hero Section */}
        <HeroBox>
          <Container maxWidth="lg">
            <Box maxWidth={1000} mx="auto">
              <WaterDropIcon 
                sx={{ 
                  fontSize: 72, 
                  mb: 0.75, 
                  color: '#616161',
                  animation: 'float 4s ease-in-out infinite' 
                }} 
              />

              <AnimatedTypography
                variant="h1"
                gutterBottom
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '1.2rem', md: '2.25rem' }, 
                  letterSpacing: '-2px', 

                  animationDelay: '0.2s',
                  mb: 1

                }}
              >
                Harvest Today,Secure Tomorrow!
              </AnimatedTypography>

              <AnimatedTypography
                variant="h4"
                paragraph
                sx={{ 

                  fontSize: { xs: '0.95rem', md: '1.1rem' }, 
                  mb: 2, 
                  animationDelay: '0.4s' 

                }}
              >
                {t('landing.heroSubtitle')}
              </AnimatedTypography>

              {/* Live counter for wasted water */}
              <Typography
                variant="h6"

                sx={{ fontSize: { xs: '0.9rem', md: '1rem' }, mb: 2, fontWeight: 600 }}

              >
                India wastes 38-40 billion liters of rainwater each year — let's change that!
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                {isAuthenticated ? (
                  <AnimatedButton
                    variant="contained"
                    onClick={() => navigate('/assessment')}
                    startIcon={<NatureIcon />}
                  >
                    Go to Simulator
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    variant="contained"
                    onClick={() => navigate('/login', { state: { from: '/assessment' } })}
                    startIcon={<NatureIcon />}
                  >
                    Try Our Simulator
                  </AnimatedButton>
                )}
              </Box>
            </Box>
          </Container>
        </HeroBox>

        {/* Features Section (no background break) */}
        <Box sx={{ py: { xs: 3, md: 4 } }}>
          <Container maxWidth="lg">
            <AnimatedTypography
              variant="h3"
              textAlign="center"
              mb={3.5}
              sx={{ 
                fontSize: { xs: '1.25rem', md: '2rem' }, 
                fontWeight: 800, 
                animationDelay: '0.6s' 
              }}
            >
              {t('landing.features.title')}
            </AnimatedTypography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: { xs: 1, md: 2 },
                justifyContent: 'center',
              }}
            >
              {features.map((feature, index) => (
                <FeatureCard key={index} sx={{ animationDelay: `${index * 0.3 + 0.8}s`, maxWidth: 300, mx: 'auto' }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 2, md: 2 }, color: '#000000' }}>
                    <Box mb={2}>{feature.icon}</Box>
                    <AnimatedTypography
                      variant="h4"
                      gutterBottom
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1rem', md: '1.2rem' } }}
                    >
                      {feature.title}
                    </AnimatedTypography>
                    <AnimatedTypography
                      sx={{ fontSize: { xs: '0.9rem', md: '0.95rem' }, color: 'text.secondary' }}
                    >
                      {feature.description}
                    </AnimatedTypography>
                  </CardContent>
                </FeatureCard>
              ))}
            </Box>
          </Container>
        </Box>
      </OverlayWrapper>
    </PageWrapper>
  );
};

export default LandingPage;