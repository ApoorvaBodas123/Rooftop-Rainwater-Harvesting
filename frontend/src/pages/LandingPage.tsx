import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  useTheme
} from '@mui/material';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalculateIcon from '@mui/icons-material/Calculate';
import NatureIcon from '@mui/icons-material/Nature'; // Replacing EcoIcon
// Language selector component is currently not available

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [wastedWater, setWastedWater] = useState(0);

  // Animate the wasted water counter
  useEffect(() => {
    const target = 400; // 400 billion liters
    const duration = 3000; // 3 seconds
    const increment = target / (duration / 30);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setWastedWater(Math.floor(current));
    }, 30);

    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      icon: <LocationOnIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: t('landing.features.items.0.title'),
      description: t('landing.features.items.0.description')
    },
    {
      icon: <CalculateIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: t('landing.features.items.1.title'),
      description: t('landing.features.items.1.description')
    },
    {
      icon: <NatureIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: t('landing.features.items.2.title'),
      description: t('landing.features.items.2.description')
    }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: 10,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '100px',
            background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 1200 120\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512,54.57,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' fill=\'%23f5f5f5\' fill-opacity=\'0.1\'/%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,141.56,74.5V0Z\' fill=\'%23f5f5f5\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            transform: 'scaleX(-1)'
          }
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" maxWidth={800} mx="auto" position="relative" zIndex={1} pt={4}>
            <WaterDropIcon sx={{ fontSize: 80, mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              {t('landing.heroTitle')}
            </Typography>
            <Typography variant="h5" paragraph>
              {t('landing.heroSubtitle')}
            </Typography>
            <Typography variant="h6" mb={4}>
              {t('landing.wastedWater', { amount: wastedWater.toLocaleString() })}
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/assessment')}
              startIcon={<WaterDropIcon />}
              sx={{
                borderRadius: '50px',
                padding: '12px 36px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 25px rgba(0,0,0,0.25)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              {t('landing.startButton')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" mb={6}>
          {t('landing.features.title')}
        </Typography>
        
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
            justifyContent: 'center',
          }}
        >
          {features.map((feature, index) => (
            <Card 
              key={index}
              sx={{ 
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2,
                boxShadow: 3,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 4 }}>
                <Box mb={2}>
                  {feature.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>

      {/* Water Droplet Animation Background */}
      <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1, opacity: 0.1, pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: theme.palette.primary.main,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: 'ripple 4s infinite',
              animationDelay: `${Math.random() * 4}s`,
              '@keyframes ripple': {
                '0%': {
                  transform: 'scale(0.5)',
                  opacity: 0.8,
                },
                '100%': {
                  transform: 'scale(10)',
                  opacity: 0,
                },
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default LandingPage;
