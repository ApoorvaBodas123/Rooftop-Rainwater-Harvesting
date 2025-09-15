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
  useTheme
} from '@mui/material';
import { GoogleMap, Marker, Polygon, useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import RoofDetection from '../components/RoofDetection';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MyLocationIcon from '@mui/icons-material/MyLocation';
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

type MapCenter = {
  lat: number;
  lng: number;
};

// Google Maps configuration
const libraries: any = ['places'];
const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px',
  marginTop: '16px'
};

// Default center for the map (India)
const center: MapCenter = {
  lat: 20.5937,
  lng: 78.9629
};

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
  const theme = useTheme();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const [drawingMode, setDrawingMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Removed unused isLoading state as it's not being used
  const [error, setError] = useState<string | null>(null);
  
  const [polygonCoords, setPolygonCoords] = useState<google.maps.LatLngLiteral[]>([]);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  // Form submission handler
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries
  });

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

  // Handle place selection from autocomplete
  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.error('No details available for input: ' + place.name);
        return;
      }

      // Set form values
      setValue('location', {
        address: place.formatted_address || '',
        coordinates: [place.geometry.location.lng(), place.geometry.location.lat()]
      });

      // Move map to selected location
      if (map) {
        map.panTo(place.geometry.location);
        map.setZoom(16);
      }

      // Check if it's Chennai and set default rainfall
      if (place.address_components) {
        const city = place.address_components.find(comp => 
          comp.types.includes('locality')
        );
        
        if (city && city.long_name.toLowerCase().includes('chennai')) {
          setValue('averageRainfall', '1400');
        }
      }
    }
  };

  // Handle map load
  const onMapLoad = (map: google.maps.Map) => {
    setMap(map);
    
    // Add click listener for polygon drawing
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (drawingMode && e.latLng) {
        const newCoords = [...polygonCoords, { lat: e.latLng.lat(), lng: e.latLng.lng() }];
        setPolygonCoords(newCoords);
        
        // Calculate area if we have at least 3 points
        if (newCoords.length >= 3) {
          const area = google.maps.geometry.spherical.computeArea(
            newCoords.map(coord => new google.maps.LatLng(coord.lat, coord.lng))
          );
          // Convert from m² to ft² (1 m² = 10.764 ft²)
          const areaInSqFt = area * 10.764;
          setCalculatedArea(Math.round(areaInSqFt));
          setValue('roofArea', areaInSqFt.toString());
        }
      }
    });
  };

  // Toggle drawing mode
  const toggleDrawingMode = () => {
    if (drawingMode) {
      // Clear the current polygon
      setPolygonCoords([]);
      setCalculatedArea(null);
      setValue('roofArea', '');
    }
    setDrawingMode(!drawingMode);
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          setUserLocation(pos);
          
          // Update form with user's location
          setValue('location', {
            address: 'Current Location',
            coordinates: [pos.lng, pos.lat]
          });
          
          // Move map to user's location
          if (map) {
            map.panTo(pos);
            map.setZoom(16);
          }
          
          // Use geocoding to get address
          const geocoder = new window.google.maps.Geocoder();
          geocoder.geocode({ location: pos }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
              setValue('location', {
                address: results[0].formatted_address,
                coordinates: [pos.lng, pos.lat]
              });
              
              // Check if it's Chennai and set default rainfall
              const chennai = results[0].address_components.some(comp => 
                comp.long_name.toLowerCase().includes('chennai')
              );
              
              if (chennai) {
                setValue('averageRainfall', '1400');
              }
            }
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

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
                <Controller
                  name="location.address"
                  control={control}
                  render={({ field }) => (
                    <>
                      {isLoaded && (
                        <Autocomplete
                          onLoad={(autocomplete) => setAutocomplete(autocomplete)}
                          onPlaceChanged={onPlaceChanged}
                        >
                          <TextField
                            {...field}
                            fullWidth
                            variant="outlined"
                            placeholder={t('assessment.locationPlaceholder')}
                            error={!!errors.location?.address}
                            helperText={errors.location?.address?.message}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LocationOnIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Autocomplete>
                      )}
                      {!isLoaded && (
                        <TextField
                          {...field}
                          fullWidth
                          variant="outlined"
                          label="Location Address"
                          placeholder="Enter your address manually"
                          error={!!errors.location?.address}
                          helperText={errors.location?.address?.message}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon color="action" />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}
                    </>
                  )}
                />
                <Button
                  startIcon={<MyLocationIcon />}
                  onClick={getUserLocation}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  {t('assessment.useMyLocation')}
                </Button>
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
              {isLoaded && (
                <Box>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={userLocation || center}
                    zoom={5}
                    onLoad={onMapLoad}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                    }}
                  >
                    {location?.coordinates && location.coordinates[0] !== 0 && (
                      <Marker 
                        position={{ 
                          lat: location.coordinates[1], 
                          lng: location.coordinates[0] 
                        }} 
                      />
                    )}
                    
                    {polygonCoords.length > 0 && (
                      <Polygon
                        path={polygonCoords}
                        options={{
                          fillColor: theme.palette.primary.main + '80',
                          fillOpacity: 0.5,
                          strokeColor: theme.palette.primary.main,
                          strokeWeight: 2,
                          clickable: false,
                          draggable: false,
                          editable: false,
                          geodesic: false,
                          zIndex: 1
                        }}
                      />
                    )}
                  </GoogleMap>
                  
                  <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                    <Button
                      variant={drawingMode ? 'contained' : 'outlined'}
                      color={drawingMode ? 'primary' : 'inherit'}
                      onClick={toggleDrawingMode}
                      startIcon={<SquareFootIcon />}
                      size="small"
                    >
                      {drawingMode ? t('assessment.drawingActive') : t('assessment.drawRoof')}
                    </Button>
                    
                    {calculatedArea && (
                      <Typography variant="body2" color="text.secondary">
                        {t('assessment.calculatedArea')}: {calculatedArea.toLocaleString()} ft²
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
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
