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
import { geocodingService } from '../services/geocodingService';
import { rainfallService } from '../services/rainfallService';
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
    city?: string;
    state?: string;
    district?: string;
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
        coordinates: [0, 0] as [number, number],
        city: '',
        state: '',
        district: ''
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
  const handleLocationSelect = async (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
    
    try {
      // Get detailed location information using reverse geocoding
      const locationDetails = await geocodingService.getLocationDetails(location.lat, location.lng);
      
      // Update form values with detailed location info
      setValue('location', {
        address: locationDetails.address || location.address || '',
        coordinates: [location.lng, location.lat],
        city: locationDetails.city || '',
        state: locationDetails.state || '',
        district: locationDetails.district || ''
      });

      // Auto-set rainfall based on precise location data
      const rainfallData = await rainfallService.getRainfallData(location.lat, location.lng, locationDetails.address);
      setValue('averageRainfall', rainfallData.annualRainfall.toString());
    } catch (error) {
      console.error('Error getting location details:', error);
      // Fallback to basic location info
      setValue('location', {
        address: location.address || '',
        coordinates: [location.lng, location.lat],
        city: '',
        state: '',
        district: ''
      });
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
      
      // For now, skip API call and go directly to results with form data
      // This allows the assessment to work without backend running
      console.log('Form data submitted:', data);
      
      // Simulate successful submission
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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#eeeeee' }}>
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
            color="inherit"
            size="large"
            fullWidth
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ 
              mt: 4, 
              gridColumn: { xs: '1', md: '1 / -1' },
              backgroundColor: 'black',
              color: 'white',
              '&:hover': { backgroundColor: '#333' }
            }}
          >
            {isSubmitting ? t('common.submitting') : t('Submit')}
          </Button>
        </form>
      </Paper>
      </Container>
    </Box>
  );
};

export default AssessmentPage;
