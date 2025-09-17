import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
  InputAdornment,
  Button,
  Alert,
} from '@mui/material';
import { LocationOn, MyLocation } from '@mui/icons-material';
import { geocodingService, type GeocodingResult } from '../../services/geocodingService';

export interface LocationSearchProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
  label?: string;
  value?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  enableMyLocation?: boolean;
  className?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for a location...",
  label = "Location",
  value = "",
  error = false,
  helperText,
  disabled = false,
  enableMyLocation = true,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState(value);
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery && searchQuery.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        setErrorMessage(null);
        
        try {
          const results = await geocodingService.searchLocation(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setErrorMessage('Failed to search locations. Please try again.');
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 500); // 500ms delay
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleLocationSelect = (location: GeocodingResult) => {
    setSearchQuery(location.display_name);
    onLocationSelect({
      lat: location.lat,
      lng: location.lng,
      address: location.display_name,
    });
  };

  const handleMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage('Geolocation is not supported by this browser.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const locationDetails = await geocodingService.getLocationDetails(latitude, longitude);
          
          setSearchQuery(locationDetails.address);
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            address: locationDetails.address,
          });
        } catch (error) {
          console.error('Error getting location details:', error);
          setErrorMessage('Failed to get location details. Please try again.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMsg = 'Unable to get your location. ';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Please allow location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Location request timed out.';
            break;
          default:
            errorMsg += 'Please try again.';
            break;
        }
        
        setErrorMessage(errorMsg);
        setIsLocating(false);
      }
    );
  };

  return (
    <Box className={className}>
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      )}
      
      <Autocomplete
        freeSolo
        options={searchResults}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.display_name
        }
        value={searchQuery}
        onInputChange={(_, newValue) => {
          setSearchQuery(newValue);
        }}
        onChange={(_, newValue) => {
          if (newValue && typeof newValue === 'object') {
            handleLocationSelect(newValue);
          }
        }}
        loading={isSearching}
        disabled={disabled}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            error={error}
            helperText={helperText}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <LocationOn color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {isSearching && <CircularProgress size={20} />}
                  {params.InputProps.endAdornment}
                </Box>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  {option.display_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.type} • Importance: {option.importance.toFixed(2)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
        noOptionsText={
          searchQuery.length <= 2 
            ? "Type at least 3 characters to search"
            : "No locations found"
        }
      />
      
      {enableMyLocation && (
        <Button
          startIcon={<MyLocation />}
          onClick={handleMyLocation}
          disabled={isLocating || disabled}
          size="small"
          sx={{ mt: 1 }}
        >
          {isLocating ? 'Getting Location...' : 'Use My Location'}
        </Button>
      )}
    </Box>
  );
};

export default LocationSearch;
