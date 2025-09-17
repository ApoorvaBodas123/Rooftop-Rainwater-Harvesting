import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button, Box } from '@mui/material';
import { MyLocation } from '@mui/icons-material';

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SimpleMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  onLocationSelect?: (lat: number, lng: number) => void;
  showMyLocationButton?: boolean;
}

const SimpleMap: React.FC<SimpleMapProps> = ({
  center = [20.5937, 78.9629],
  zoom = 5,
  height = '400px',
  onLocationSelect,
  showMyLocationButton = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!mapRef.current) return;

    // Create map
    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Add click handler
    if (onLocationSelect) {
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        onLocationSelect(lat, lng);
        
        // Add marker
        L.marker([lat, lng]).addTo(map)
          .bindPopup(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
          .openPopup();
      });
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [center, zoom, onLocationSelect]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }

    // Check if we have permission first
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'denied') {
          showLocationPermissionInstructions();
          return;
        }
        requestLocation();
      }).catch(() => {
        // Fallback if permissions API is not supported
        requestLocation();
      });
    } else {
      // Fallback if permissions API is not supported
      requestLocation();
    }
  };

  const showLocationPermissionInstructions = () => {
    const instructions = `
📍 Location Access Required

To use "My Location" feature, please:

1. Look for the location icon (📍) in your browser's address bar
2. Click on it and select "Allow" or "Always allow"
3. Refresh the page and try again

OR

• Click anywhere on the map to manually select your location
• Use the search box to find your area

This will work the same way for your rainwater harvesting assessment!
    `;
    alert(instructions);
  };

  const requestLocation = () => {
    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        if (mapInstanceRef.current) {
          // Move map to user's location
          mapInstanceRef.current.setView([latitude, longitude], 16);
          
          // Add marker for user's location
          L.marker([latitude, longitude])
            .addTo(mapInstanceRef.current)
            .bindPopup('Your Location')
            .openPopup();
          
          // Call the callback if provided
          if (onLocationSelect) {
            onLocationSelect(latitude, longitude);
          }
        }
        
        setIsLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMsg = '';
        let suggestions = '';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = 'Location access denied.';
            suggestions = 'Please allow location access in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = 'Location information unavailable.';
            suggestions = 'Try moving to an area with better GPS signal or check if location services are enabled on your device.';
            break;
          case error.TIMEOUT:
            errorMsg = 'Location request timed out.';
            suggestions = 'Please try again. Make sure you have a good internet connection.';
            break;
          default:
            errorMsg = 'Unable to get your location.';
            suggestions = 'Please try again or manually select a location on the map.';
            break;
        }
        
        const fullMessage = `${errorMsg}\n\n${suggestions}\n\nYou can also click anywhere on the map to select a location manually.`;
        alert(fullMessage);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          height, 
          width: '100%', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }} 
      />
      
      {showMyLocationButton && (
        <Button
          variant="contained"
          startIcon={<MyLocation />}
          onClick={getUserLocation}
          disabled={isLocating}
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000,
            bgcolor: 'white',
            color: 'primary.main',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'grey.100'
            },
            '&:disabled': {
              bgcolor: 'grey.200',
              color: 'grey.600'
            }
          }}
        >
          {isLocating ? 'Getting Location...' : '📍 My Location'}
        </Button>
      )}
    </Box>
  );
};

export default SimpleMap;
