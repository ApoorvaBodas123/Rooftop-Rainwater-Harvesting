import { useState } from 'react';
import { Container, Typography, Box, Paper, Alert } from '@mui/material';
import SimpleMap from '../components/common/SimpleMap';
import LocationSearch from '../components/common/LocationSearch';

const MapDemoPage = () => {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [calculatedArea, setCalculatedArea] = useState<number | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([20.5937, 78.9629]); // India center

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setMapCenter([location.lat, location.lng]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    const location = {
      lat,
      lng,
      address: `Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    };
    handleLocationSelect(location);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          🗺️ Leaflet Map Integration Demo
        </Typography>
        <Typography color="text.secondary" paragraph>
          This page demonstrates the new Leaflet-based map integration with open source geocoding.
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Features:</strong> Free OpenStreetMap tiles, Nominatim geocoding, location search, 
            area drawing, and offline fallback for Indian locations.
          </Typography>
        </Alert>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 4 }}>
        {/* Left column - Controls */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Location Search
          </Typography>
          
          <LocationSearch
            onLocationSelect={handleLocationSelect}
            placeholder="Search for any location in India..."
            label="Search Location"
            enableMyLocation={true}
          />
          
          {selectedLocation && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Location:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedLocation.address}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
              </Typography>
            </Box>
          )}
          
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Map Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              • Click on the map to select a location<br/>
              • Use the drawing tool to measure roof area<br/>
              • Click "My Location" to get your current position<br/>
              • Search for locations using the search box
            </Typography>
          </Box>
          
          {calculatedArea && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="subtitle2">
                Calculated Area: {calculatedArea.toLocaleString()} sq ft
              </Typography>
            </Alert>
          )}
        </Paper>

        {/* Right column - Map */}
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Interactive Map
          </Typography>
          
              <SimpleMap
                center={mapCenter}
                zoom={selectedLocation ? 16 : 5}
                height="500px"
                onLocationSelect={handleMapClick}
              />
          
          <Box mt={2}>
            <Typography variant="caption" color="text.secondary">
              Map data © OpenStreetMap contributors, CC BY-SA
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Box mt={4}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            🚀 Benefits of Leaflet Integration
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                ✅ Open Source & Free
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No API keys required, no usage limits, completely free to use
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                ✅ Privacy Friendly
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No data sent to Google or other commercial services
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                ✅ Offline Fallback
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Works even without internet using offline location mapping
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                ✅ Lightweight
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Smaller bundle size compared to Google Maps
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default MapDemoPage;
