import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polygon } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, Button, IconButton, Tooltip } from '@mui/material';
import { MyLocation, SquareFoot, Clear } from '@mui/icons-material';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

export interface MapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (location: MapLocation) => void;
  onAreaCalculate?: (area: number) => void;
  selectedLocation?: MapLocation | null;
  enableDrawing?: boolean;
  enableLocationSelection?: boolean;
  className?: string;
}

// Component to handle map events
const MapEventHandler: React.FC<{
  onLocationSelect?: (location: MapLocation) => void;
  onAreaCalculate?: (area: number) => void;
  enableDrawing?: boolean;
  enableLocationSelection?: boolean;
}> = ({ onLocationSelect, onAreaCalculate, enableDrawing, enableLocationSelection }) => {
  const [polygonPoints, setPolygonPoints] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      
      if (enableLocationSelection && onLocationSelect) {
        onLocationSelect({ lat, lng });
      }
      
      if (enableDrawing && isDrawing) {
        const newPoint: [number, number] = [lat, lng];
        setPolygonPoints(prev => [...prev, newPoint]);
      }
    },
  });

  // Calculate area when polygon is complete
  useEffect(() => {
    if (polygonPoints.length >= 3 && onAreaCalculate) {
      const area = calculatePolygonArea(polygonPoints);
      onAreaCalculate(area);
    }
  }, [polygonPoints, onAreaCalculate]);

  const calculatePolygonArea = (points: [number, number][]): number => {
    if (points.length < 3) return 0;
    
    // Use the shoelace formula to calculate area
    let area = 0;
    const n = points.length;
    
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i][1] * points[j][0];
      area -= points[j][1] * points[i][0];
    }
    
    area = Math.abs(area) / 2;
    
    // Convert from square degrees to square meters (approximate)
    // This is a rough conversion - for precise measurements, use proper projection
    const latToMeters = 111320; // meters per degree latitude
    const lngToMeters = 111320 * Math.cos((points[0][0] * Math.PI) / 180); // meters per degree longitude at this latitude
    
    const areaInSquareMeters = area * latToMeters * lngToMeters;
    
    // Convert to square feet (1 m² = 10.764 ft²)
    return areaInSquareMeters * 10.764;
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
    setIsDrawing(false);
  };

  const toggleDrawing = () => {
    if (isDrawing) {
      clearPolygon();
    } else {
      setIsDrawing(true);
    }
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {enableLocationSelection && (
        <Tooltip title="Click on map to select location">
          <IconButton
            color="primary"
            sx={{ bgcolor: 'white', boxShadow: 2 }}
            onClick={() => {
              // This will be handled by the map click event
            }}
          >
            <MyLocation />
          </IconButton>
        </Tooltip>
      )}
      
      {enableDrawing && (
        <>
          <Tooltip title={isDrawing ? "Stop drawing" : "Draw roof area"}>
            <IconButton
              color={isDrawing ? "error" : "primary"}
              sx={{ bgcolor: 'white', boxShadow: 2 }}
              onClick={toggleDrawing}
            >
              <SquareFoot />
            </IconButton>
          </Tooltip>
          
          {polygonPoints.length > 0 && (
            <Tooltip title="Clear polygon">
              <IconButton
                color="error"
                sx={{ bgcolor: 'white', boxShadow: 2 }}
                onClick={clearPolygon}
              >
                <Clear />
              </IconButton>
            </Tooltip>
          )}
        </>
      )}
      
      {polygonPoints.length > 0 && (
        <Polygon
          positions={polygonPoints}
          pathOptions={{
            color: '#1976d2',
            fillColor: '#1976d2',
            fillOpacity: 0.3,
            weight: 2,
          }}
        />
      )}
    </Box>
  );
};

// Component to handle map center updates
const MapCenterUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
};

// Component to handle user location
const UserLocationHandler: React.FC<{
  onLocationFound: (location: MapLocation) => void;
}> = ({ onLocationFound }) => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = { lat: latitude, lng: longitude };
        
        map.setView([latitude, longitude], 16);
        onLocationFound(location);
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('Unable to get your location. Please try again.');
        setIsLocating(false);
      }
    );
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
      }}
    >
      <Button
        variant="contained"
        startIcon={<MyLocation />}
        onClick={getUserLocation}
        disabled={isLocating}
        sx={{ bgcolor: 'white', color: 'primary.main', boxShadow: 2 }}
      >
        {isLocating ? 'Locating...' : 'My Location'}
      </Button>
    </Box>
  );
};

const LeafletMap: React.FC<MapProps> = ({
  center = [20.5937, 78.9629], // Default to India center
  zoom = 5,
  height = '400px',
  onLocationSelect,
  onAreaCalculate,
  selectedLocation,
  enableDrawing = false,
  enableLocationSelection = true,
  className,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [userLocation, setUserLocation] = useState<MapLocation | null>(null);

  // Update map center when prop changes
  useEffect(() => {
    setMapCenter(center);
  }, [center]);

  const handleLocationFound = (location: MapLocation) => {
    setUserLocation(location);
    if (onLocationSelect) {
      onLocationSelect(location);
    }
  };

  return (
    <Box className={className} sx={{ position: 'relative', height, width: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapCenterUpdater center={mapCenter} />
        
        <UserLocationHandler onLocationFound={handleLocationFound} />
        
        <MapEventHandler
          onLocationSelect={onLocationSelect}
          onAreaCalculate={onAreaCalculate}
          enableDrawing={enableDrawing}
          enableLocationSelection={enableLocationSelection}
        />
        
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
            <Popup>
              <Typography variant="body2">
                {selectedLocation.address || 'Selected Location'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
              </Typography>
            </Popup>
          </Marker>
        )}
        
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]}>
            <Popup>
              <Typography variant="body2">Your Location</Typography>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </Box>
  );
};

export default LeafletMap;
