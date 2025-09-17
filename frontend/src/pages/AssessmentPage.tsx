import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  InputAdornment,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import RoofDetection from '../components/RoofDetection';
import SimpleMap from '../components/common/SimpleMap';
import LocationSearch from '../components/common/LocationSearch';
import LocationPermissionHelper from '../components/common/LocationPermissionHelper';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Form data type
type FormValues = {
  location: {
    address: string;
    coordinates: [number, number];
  };
  roofArea: string;
  roofType: string;
  averageRainfall: string;
  waterDemand: string;
};

// Default center for the map (India)
const defaultCenter: [number, number] = [20.5937, 78.9629];

// Form validation schema
const createSchema = (t: (key: string) => string) => yup.object().shape({
  location: yup.object().shape({
    address: yup.string().required(t('validation.required')),
    coordinates: yup.array().of(yup.number().required()).length(2).required()
  }),
  roofArea: yup.string().required(t('validation.required')),
  roofType: yup.string().required(t('validation.required')),
  averageRainfall: yup.string().required(t('validation.required')),
  waterDemand: yup.string().required(t('validation.required'))
    .required(t('assessment.waterDemandRequired'))
    .min(1, t('assessment.waterDemandMin'))
});

const AssessmentPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: yupResolver(createSchema(t)) as any,
    defaultValues: {
      location: {
        address: '',
        coordinates: [0, 0] as [number, number]
      },
      roofArea: '',
      roofType: '',
      averageRainfall: '',
      waterDemand: ''
    }
  });

  // Watch location changes to update map center
  const location = watch('location');

  // Handle location selection from search or map
  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    
    // Update form values
    setValue('location', {
      address: location.address || '',
      coordinates: [location.lng, location.lat]
    });

    // Check if it's Chennai and set default rainfall
    if (location.address && location.address.toLowerCase().includes('chennai')) {
      setValue('averageRainfall', '1400');
    }
  };

  // Handle map click
  const handleMapClick = (lat: number, lng: number) => {
    const location = {
      lat,
      lng,
      address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    handleLocationSelect(location);
  };

  // Handle area calculation from map drawing
  const handleAreaCalculate = (area: number) => {
    setCalculatedArea(area);
    setValue('roofArea', area.toString());
  };

  // Handle form submission
  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Generate user info for community dashboard
      const userName = `User ${Math.floor(Math.random() * 1000)}`;
      const userEmail = `user${Math.floor(Math.random() * 1000)}@example.com`;
      
      // Store user info in localStorage for community dashboard
      localStorage.setItem('userId', userEmail);
      localStorage.setItem('userName', userName);
      
      // Generate neighborhood ID from location
      const neighborhoodId = data.location.address ? 
        data.location.address.split(',').slice(-2).join(',').trim().toLowerCase().replace(/\s+/g, '-') : 
        'default';
      localStorage.setItem('neighborhoodId', neighborhoodId);
      
      // Try to submit to backend for community dashboard data
      try {
        const response = await fetch('/api/assessments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            userName,
            userEmail
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('Assessment saved to backend:', result);
        } else {
          console.log('Backend not available, proceeding with frontend-only flow');
        }
      } catch (backendError) {
        console.log('Backend not available, proceeding with frontend-only flow:', backendError);
      }
      
      console.log('Form data submitted:', data);
      toast.success('Assessment submitted successfully!');
      
      // Navigate to results with form data
      navigate('/results', { state: { formData: data } });
      
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred while submitting the form';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          {t('navigation.back')}
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('assessment.title')}
        </Typography>
        <Typography color="text.secondary" paragraph>
          {t('assessment.subtitle')}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4, mt: 2 }}>
            {/* Left column - Form */}
            <Box component={Paper} elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                {t('assessment.location')}
              </Typography>
              <Box mb={3}>
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder={t('assessment.locationPlaceholder')}
                  label={t('assessment.location')}
                  value={location?.address || ''}
                  error={!!errors.location?.address}
                  helperText={errors.location?.address?.message}
                  enableMyLocation={false}
                />
                <LocationPermissionHelper />
              </Box>

              {/* AI Roof Detection */}
              <RoofDetection 
                onAreaCalculated={(area) => setValue('roofArea', area.toString())}
              />

              <Typography variant="h6" gutterBottom>
                {t('assessment.roofDetails')}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Controller
                  name="roofArea"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('assessment.roofArea')}
                      variant="outlined"
                      type="number"
                      error={!!errors.roofArea}
                      helperText={errors.roofArea?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <SquareFootIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  name="roofType"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.roofType}>
                      <InputLabel>{t('assessment.roofType')}</InputLabel>
                      <Select {...field} label={t('assessment.roofType')}>
                        <MenuItem value="concrete">{t('assessment.roofTypes.concrete')}</MenuItem>
                        <MenuItem value="metal">{t('assessment.roofTypes.metal')}</MenuItem>
                        <MenuItem value="tiled">{t('assessment.roofTypes.tiled')}</MenuItem>
                        <MenuItem value="other">{t('assessment.roofTypes.other')}</MenuItem>
                      </Select>
                      {errors.roofType && (
                        <FormHelperText>{errors.roofType.message}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                />
                <Controller
                  name="averageRainfall"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('assessment.rainfall')}
                      variant="outlined"
                      type="number"
                      error={!!errors.averageRainfall}
                      helperText={errors.averageRainfall?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <WaterDropIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
                <Controller
                  name="waterDemand"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label="Daily Water Demand (liters)"
                      variant="outlined"
                      type="number"
                      error={!!errors.waterDemand}
                      helperText={errors.waterDemand?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <WaterDropIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Box>
            </Box>

            {/* Right column - Map */}
            <Box component={Paper} elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom>
                Interactive Map
              </Typography>
              <SimpleMap
                center={mapCenter}
                zoom={selectedLocation ? 16 : 5}
                height="400px"
                onLocationSelect={handleMapClick}
              />
              
              {selectedLocation && (
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    Selected: {selectedLocation.address}
                  </Typography>
                </Box>
              )}
              
              <Box mt={2}>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  💡 <strong>Location Options:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Click "📍 My Location" button to get your current position
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Click anywhere on the map to manually select a location
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • Use the search box above to find your area
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                  If "My Location" doesn't work, check your browser's location permissions in the address bar
                </Typography>
              </Box>
            </Box>
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ mt: 4, gridColumn: { xs: '1', md: '1 / -1' } }}
          >
            {isSubmitting ? t('common.submitting') : t('assessment.submit')}
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default AssessmentPage;
