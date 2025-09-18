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
import { useState, useEffect } from 'react';

// Colors
const secondaryColor = '#000000ff';
const accentColor = '#FFFFFF';

// Page background wrapper
const PageWrapper = styled(Box)(() => ({
  backgroundImage: 'url("https://static.vecteezy.com/system/resources/previews/041/731/486/large_2x/ai-generated-water-drop-close-up-with-yellow-light-background-free-photo.jpeg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',
  minHeight: '100vh',
  width: '100%',
}));

// Overlay wrapper (used for BOTH hero + features for seamless blend)
const OverlayWrapper = styled(Box)(() => ({
  background: 'linear-gradient(rgba(0, 77, 64, 0.7), rgba(0, 121, 107, 0.7))',
  width: '100%',
  color: '#ffffff',
}));

// HeroBox
const HeroBox = styled(Box)(() => ({
  position: 'relative',
  minHeight: '100vh',
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
}));

const FeatureCard = styled(Card)(() => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 20,
  boxShadow: '0 12px 48px rgba(0,0,0,0.08)',
  transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(5px)',
  '&:hover': {
    transform: 'translateY(-15px) rotate(1deg)',
    boxShadow: '0 20px 60px rgba(76, 175, 80, 0.25)',
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
  background: '#004B49', 
  backdropFilter: 'blur(10px)',
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
  const { isAuthenticated, user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);

  const [wastedWater, setWastedWater] = useState(400); // Initial value set to 400 billion

  useEffect(() => {
    // Increment the counter every 100 milliseconds
    const timer = setInterval(() => {
      setWastedWater(prevWastedWater => prevWastedWater + 1);
    }, 100);

    // Clean up the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const features = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 70, color: '#ffffff' }} />,
      title: t('landing.features.items.0.title'),
      description: t('landing.features.items.0.description')
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 70, color: '#ffffff' }} />,
      title: t('landing.features.items.1.title'),
      description: t('landing.features.items.1.description')
    },
    {
      icon: <NatureIcon sx={{ fontSize: 70, color: '#ffffff' }} />,
      title: t('landing.features.items.2.title'),
      description: t('landing.features.items.2.description')
    }
  ];

  const commonNavItems = [
    { label: 'Community', path: '/community' },
    { label: 'Help', path: '/about' },
    { label: 'Tracker', path: '/tracker' },
<<<<<<< HEAD
    { label: 'Start Assessment', path: '/assessment' }
=======
    { label: 'Start Assessment', path: '/assessment' },
>>>>>>> d238aaabaf1545c94ddecbec855cca69ee325f5e
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
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
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
                    color: '#000000', 
                }
              }}
            >
              <WaterDropIcon sx={{ fontSize: 40, mr: 1 }} />
              Rooftop Rainwater Harvesting
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
                        color: '#000000',
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
                  fontSize: 120, 
                  mb: 4, 
                  filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.4))', 
                  animation: 'float 4s ease-in-out infinite' 
                }} 
              />

              <AnimatedTypography
                variant="h1"
                gutterBottom
                fontWeight="bold"
                sx={{ 
                  fontSize: { xs: '2.5rem', md: '4.5rem' }, 
                  letterSpacing: '-2px', 
                  textShadow: '0 4px 8px rgba(0,0,0,0.3)', 
                  animationDelay: '0.2s',
                  color: '#ffffff' // Explicitly set text color to white
                }}
              >
                {t('landing.heroTitle')}
              </AnimatedTypography>

              <AnimatedTypography
                variant="h4"
                paragraph
                sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.8rem' }, 
                  opacity: 0.95, 
                  mb: 6, 
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)', 
                  animationDelay: '0.4s',
                  color: '#ffffff' // Explicitly set text color to white
                }}
              >
                {t('landing.heroSubtitle')}
              </AnimatedTypography>

              {/* Live counter for wasted water */}
              <Typography
                variant="h6"
                sx={{ 
                  fontSize: { xs: '1rem', md: '1.3rem' }, 
                  mb: 6, 
                  fontWeight: 600,
                  color: '#ffffff' // Explicitly set text color to white
                }}
              >
                India wastes <span style={{ fontWeight: 'bold' }}>{wastedWater.toLocaleString()}</span> billion liters of rainwater each year — let's change that!
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                <AnimatedButton
                  variant="contained"
                  onClick={() => window.location.href = '/assessment'}
                  startIcon={<NatureIcon />}
                >
                  Try Our Simulator
                </AnimatedButton>
              </Box>
            </Box>
          </Container>
        </HeroBox>

        {/* Features Section (no background break) */}
        <Box sx={{ py: { xs: 8, md: 12 } }}>
          <Container maxWidth="lg">
            <AnimatedTypography
              variant="h3"
              textAlign="center"
              mb={8}
              sx={{ 
                fontSize: { xs: '2rem', md: '3rem' }, 
                fontWeight: 800, 
                color: '#ffffff', 
                textShadow: '0 2px 4px rgba(0,0,0,0.3)', 
                animationDelay: '0.6s' 
              }}
            >
              {t('landing.features.title')}
            </AnimatedTypography>
            
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: { xs: 4, md: 6 },
                justifyContent: 'center',
              }}
            >
              {features.map((feature, index) => (
                <FeatureCard key={index} sx={{ animationDelay: `${index * 0.3 + 0.8}s` }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 4, md: 5 }, color: '#ffffff' }}>
                    <Box mb={4}>{feature.icon}</Box>
                    <AnimatedTypography
                      variant="h4"
                      gutterBottom
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' } }}
                    >
                      {feature.title}
                    </AnimatedTypography>
                    <AnimatedTypography
                      sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: accentColor }}
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