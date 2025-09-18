import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import OpacityIcon from '@mui/icons-material/Opacity';
import PublicIcon from '@mui/icons-material/Public';
import SecurityIcon from '@mui/icons-material/Security';

// Colors – refreshed palette (teal focus) with blue accents for droplets/icons
const brandColor = '#0d9488'; // teal-600
const brandAccent = '#2dd4bf'; // teal-400
const accentBlue = '#2563eb'; // blue-600 for droplets/icons
const darkText = '#0f172a';   // slate-900
const subtleText = '#334155'; // slate-700
const cardBg = 'rgba(255,255,255,0.94)';


// Page background wrapper (bring back subtle rain ripples image with soft overlay)
const PageWrapper = styled(Box)(() => ({

  backgroundImage: `linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.9)), url('https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=2000&q=60')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundAttachment: 'fixed',

  minHeight: '100vh',
  width: '100%',
  backgroundColor: '#f5f5f5',
}));

// Overlay wrapper (used for BOTH hero + features for seamless blend)
const OverlayWrapper = styled(Box)(() => ({

  background: 'transparent',
  width: '100%',
  color: darkText,

}));

// HeroBox
const HeroBox = styled(Box)(() => ({
  position: 'relative',

  minHeight: '75vh',

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

  borderRadius: 16,
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  transition: 'transform 0.35s ease, box-shadow 0.35s ease',
  background: cardBg,
  '&:hover': {
    transform: 'translateY(-8px) scale(1.01)',
    boxShadow: '0 22px 50px rgba(37, 99, 235, 0.18)',

  },
  animation: 'fadeInUp 0.9s ease-out forwards',
  opacity: 0,
  '@keyframes fadeInUp': {
    '0%': { opacity: 0, transform: 'translateY(16px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
}));

const AnimatedButton = styled(Button)(() => ({
  borderRadius: 999,
  padding: '12px 28px',
  fontSize: '1rem',
  fontWeight: 600,
  background: brandColor,
  color: '#ffffff',
  margin: '0 10px',
  '&:hover': {
    background: '#0b6b81',
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 24px rgba(14, 116, 144, 0.35)',
  },
  transition: 'all 0.3s ease',
}));

const Navbar = styled(AppBar)(({ theme }: { theme: Theme }) => ({

  background: 'linear-gradient(90deg, #ffffff 0%, #f0f9ff 100%)',
  backdropFilter: 'saturate(180%) blur(10px)',
  boxShadow: '0 2px 12px rgba(37, 99, 235, 0.06)',

  borderBottom: `1px solid ${theme.palette.divider}`,
  color: darkText,
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

      icon: <LocationOnIcon sx={{ fontSize: 30, color: '#ffffff' }} />,
      title: 'Locate your rooftop',
      description: 'Pin your home on the map in seconds to begin your harvesting journey.',
      to: '/assessment'
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 30, color: '#ffffff' }} />,
      title: 'Smart rainfall calculator',
      description: 'We estimate harvestable rain using local rainfall data and your roof size.',
      to: '/assessment'
    },
    {
      icon: <NatureIcon sx={{ fontSize: 30, color: '#ffffff' }} />,
      title: 'Impact you can see',
      description: 'Discover how much water you can save and the emissions you avoid each year.',
      to: '/community'

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
      <Navbar position="sticky" color="transparent">
        <Container maxWidth="lg">

          <Toolbar variant="dense" disableGutters sx={{ display: 'flex', justifyContent: 'space-between', minHeight: { xs: 48, md: 54 } }}>

            <Typography 
              variant="h6" 
              component={RouterLink} 
              to="/" 
              color="inherit" 
              sx={{ 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                fontSize: { xs: '0.95rem', md: '1.1rem' },
                display: 'flex',
                alignItems: 'center',
                '&:hover': {

                    color: accentBlue, 
                }
              }}
            >
              <WaterDropIcon sx={{ fontSize: 28, mr: 1, color: accentBlue }} />
              AmritDhara

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

                        color: accentBlue,
                        borderRadius: 2,

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

                  fontSize: 88, 
                  mb: 2, 
                  color: accentBlue,
                  filter: 'drop-shadow(0 6px 12px rgba(37, 99, 235, 0.25))', 

                  animation: 'float 4s ease-in-out infinite' 
                }} 
              />

              <AnimatedTypography

                variant="h4"
                paragraph
                sx={{ 
                  fontSize: { xs: '1.2rem', md: '1.7rem' }, 
                  opacity: 0.9, 
                  mb: 3, 
                  animationDelay: '0.4s',
                  color: subtleText

                }}
              >
                Catch every drop. Secure every tomorrow.
              </AnimatedTypography>

              {/* Live counter for wasted water */}
              <Typography
                variant="h6"

                sx={{ 
                  fontSize: { xs: '1rem', md: '1.3rem' }, 
                  mb: 3, 
                  fontWeight: 600,
                  color: darkText
                }}

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

        <Box sx={{ py: { xs: 3, md: 5 } }}>

          <Container maxWidth="lg">
            <AnimatedTypography
              variant="h3"
              textAlign="center"

              mb={4}
              sx={{ 
                fontSize: { xs: '1.6rem', md: '2.2rem' }, 
                fontWeight: 800, 
                color: darkText, 

                animationDelay: '0.6s' 
              }}
            >
              What you can do with AmritDhara
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

                <FeatureCard key={index} sx={{ animationDelay: `${index * 0.2 + 0.6}s` }}>
                  <CardContent sx={{ textAlign: 'center', p: { xs: 4, md: 5 } }}>
                    <Box mb={3} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Box sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${brandColor}, ${brandAccent})`,
                        boxShadow: '0 8px 20px rgba(13,148,136,0.25)',
                        display: 'grid',
                        placeItems: 'center',
                      }}>
                        {feature.icon}
                      </Box>
                    </Box>

                    <AnimatedTypography
                      variant="h4"
                      gutterBottom
                      fontWeight="bold"

                      sx={{ fontSize: { xs: '1.2rem', md: '1.4rem' }, color: darkText }}

                    >
                      {feature.title}
                    </AnimatedTypography>
                    <AnimatedTypography

                      sx={{ fontSize: { xs: '0.95rem', md: '1.0rem' }, color: subtleText }}

                    >
                      {feature.description}
                    </AnimatedTypography>
                    <Box sx={{ mt: 3 }}>
                      <Button
                        size="small"
                        variant="text"
                        component={RouterLink}
                        to={feature.to}
                        sx={{ color: brandColor, fontWeight: 600, '&:hover': { textDecoration: 'underline' } }}
                      >
                        Explore →
                      </Button>
                    </Box>
                  </CardContent>
                </FeatureCard>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Story & Importance Section (richer, more visual) */}
        <Box sx={{ py: { xs: 8, md: 10 }, background: 'rgba(255,255,255,0.9)' }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: { xs: 6, md: 8 },
                alignItems: 'center'
              }}
            >
              <Box>
                <Typography variant="h4" sx={{ mb: 2, color: darkText, fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                  What does “AmritDhara” mean?
                </Typography>
                <Typography sx={{ color: subtleText, lineHeight: 1.8, mb: 2, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                  <strong>Amrit</strong> means nectar — pure and life-giving. <strong>Dhara</strong> means a steady flow.
                  Together, <em>AmritDhara</em> celebrates the life-giving flow of water and our responsibility to protect it.
                </Typography>
                <Box sx={{ mt: 2, pl: 2, borderLeft: `4px solid ${brandColor}` }}>
                  <Typography sx={{ fontStyle: 'italic', color: darkText, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                    “Every roof can be a source. Every drop, a promise.”
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography variant="h4" sx={{ mb: 2, color: darkText, fontWeight: 800, fontSize: { xs: '1.3rem', md: '1.5rem' } }}>
                  Why rainwater harvesting matters
                </Typography>
                <Typography sx={{ color: subtleText, lineHeight: 1.8, fontSize: { xs: '0.95rem', md: '1rem' } }}>
                  Smarter homes, safer neighborhoods, stronger cities — harvesting rain creates impact where it matters most.
                </Typography>
                <Box sx={{ mt: 3, display: 'grid', gap: 1.25 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '999px', background: brandColor, display: 'grid', placeItems: 'center' }}>
                      <OpacityIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                    </Box>
                    <Typography sx={{ color: darkText, fontWeight: 700, fontSize: { xs: '0.95rem', md: '1rem' } }}>Lower bills</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '999px', background: brandColor, display: 'grid', placeItems: 'center' }}>
                      <SecurityIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                    </Box>
                    <Typography sx={{ color: darkText, fontWeight: 700, fontSize: { xs: '0.95rem', md: '1rem' } }}>Resilient homes</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box sx={{ width: 28, height: 28, borderRadius: '999px', background: brandColor, display: 'grid', placeItems: 'center' }}>
                      <PublicIcon sx={{ fontSize: 16, color: '#ffffff' }} />
                    </Box>
                    <Typography sx={{ color: darkText, fontWeight: 700, fontSize: { xs: '0.95rem', md: '1rem' } }}>Greener cities</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Extra Content: Quick Stats + CTA band */}
        <Box sx={{ py: { xs: 8, md: 10 } }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: { xs: 3, md: 4 },
              }}
            >
              {[
                { value: '50,000+ L', label: 'Annual savings possible for a typical home' },
                { value: '30–40%', label: 'Reduction in dependence on external supply' },
                { value: '2–3 yrs', label: 'Typical payback period for a basic system' },
              ].map((stat, idx) => (
                <Card key={idx} sx={{ borderRadius: 14, p: 2, textAlign: 'center', boxShadow: '0 10px 30px rgba(15,23,42,0.06)' }}>
                  <CardContent>
                    <Typography sx={{ fontSize: { xs: '1.4rem', md: '1.8rem' }, fontWeight: 800, color: brandColor }}>
                      {stat.value}
                    </Typography>
                    <Typography sx={{ color: subtleText, mt: 1 }}>{stat.label}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>

            <Box sx={{
              mt: 8,
              p: { xs: 3, md: 5 },
              borderRadius: 16,
              background: `linear-gradient(135deg, ${brandColor}, ${brandAccent})`,
              color: '#ffffff',
              textAlign: 'center',
              boxShadow: '0 18px 50px rgba(13,148,136,0.25)'
            }}>
              <Typography sx={{ fontSize: { xs: '1.2rem', md: '1.6rem' }, fontWeight: 700, mb: 1 }}>
                Ready to turn your roof into a reservoir?
              </Typography>
              <Typography sx={{ opacity: 0.95, mb: 3 }}>
                Check your potential, plan your system, and start harvesting in minutes.
              </Typography>
              <AnimatedButton
                variant="contained"
                onClick={() => window.location.href = '/assessment'}
                startIcon={<CalculateIcon />}
              >
                Start your assessment
              </AnimatedButton>
            </Box>
          </Container>
        </Box>

        {/* Footer: minimal, polished with brand blue icons */}
        <Box component="footer" sx={{ borderTop: '1px solid #e2e8f0', background: '#ffffff' }}>
          <Container maxWidth="lg">
            <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
              <WaterDropIcon sx={{ color: brandColor, mb: 1 }} />
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                {[{Icon: TwitterIcon, label: 'Twitter'}, {Icon: InstagramIcon, label: 'Instagram'}, {Icon: LinkedInIcon, label: 'LinkedIn'}, {Icon: GitHubIcon, label: 'GitHub'}].map(({Icon, label}, idx) => (
                  <IconButton
                    key={idx}
                    aria-label={label}
                    href="#"
                    target="_blank"
                    rel="noopener"
                    sx={{
                      color: brandColor,
                      border: `1px solid ${brandColor}`,
                      borderRadius: '999px',
                      width: 40,
                      height: 40,
                      transition: 'all 0.2s ease',
                      '&:hover': { backgroundColor: brandColor, color: '#ffffff' }
                    }}
                  >
                    <Icon />
                  </IconButton>
                ))}
              </Box>
              <Typography sx={{ color: '#64748b', fontSize: 14, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                © {new Date().getFullYear()} AmritDhara
              </Typography>
            </Box>
          </Container>
        </Box>
      </OverlayWrapper>
    </PageWrapper>
  );
};

export default LandingPage;