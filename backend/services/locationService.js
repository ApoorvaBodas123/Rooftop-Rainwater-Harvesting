const axios = require('axios');

class LocationService {
  constructor() {
    // Use OpenCage as primary, with fallback to offline mapping
    this.geocodingApiKey = process.env.OPENCAGE_API_KEY;
    this.nominatimBaseUrl = 'https://nominatim.openstreetmap.org';
  }

  /**
   * Get location details from coordinates
   */
  async getLocationDetails(lat, lon) {
    try {
      // Try OpenCage Geocoding API first (if API key is available)
      if (this.geocodingApiKey) {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
          params: {
            q: `${lat},${lon}`,
            key: this.geocodingApiKey,
            limit: 1
          }
        });

        if (response.data.results && response.data.results.length > 0) {
          const result = response.data.results[0];
          return {
            address: result.formatted,
            city: result.components.city || result.components.town || result.components.village,
            state: result.components.state,
            country: result.components.country,
            district: result.components.state_district,
            pincode: result.components.postcode,
            confidence: result.confidence
          };
        }
      }

      // Try Nominatim (OpenStreetMap) as free alternative
      try {
        const response = await axios.get(`${this.nominatimBaseUrl}/reverse`, {
          params: {
            lat: lat,
            lon: lon,
            format: 'json',
            addressdetails: 1,
            zoom: 18
          },
          headers: {
            'User-Agent': 'RooftopRainwaterHarvesting/1.0'
          }
        });

        if (response.data && response.data.address) {
          const address = response.data.address;
          return {
            address: response.data.display_name,
            city: address.city || address.town || address.village || address.hamlet,
            state: address.state,
            country: address.country,
            district: address.state_district || address.county,
            pincode: address.postcode,
            confidence: 0.8 // Nominatim doesn't provide confidence
          };
        }
      } catch (nominatimError) {
        console.warn('Nominatim geocoding failed:', nominatimError.message);
      }

      // Fallback to offline location mapping for Indian coordinates
      return this.getOfflineLocationDetails(lat, lon);
    } catch (error) {
      console.error('Error getting location details:', error);
      return this.getOfflineLocationDetails(lat, lon);
    }
  }

  /**
   * Search for locations by address/place name
   */
  async searchLocation(query, limit = 5) {
    try {
      // Try Nominatim (OpenStreetMap) first - it's free
      const response = await axios.get(`${this.nominatimBaseUrl}/search`, {
        params: {
          q: query,
          format: 'json',
          limit: limit,
          addressdetails: 1,
          countrycodes: 'in', // Focus on India
          dedupe: 1
        },
        headers: {
          'User-Agent': 'RooftopRainwaterHarvesting/1.0'
        }
      });

      if (response.data && Array.isArray(response.data)) {
        return response.data.map(item => ({
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          address: item.display_name,
          display_name: item.display_name,
          place_id: item.place_id,
          type: item.type,
          importance: item.importance
        }));
      }

      return [];
    } catch (error) {
      console.error('Error searching location:', error);
      return [];
    }
  }

  /**
   * Offline location mapping for major Indian cities and regions
   */
  getOfflineLocationDetails(lat, lon) {
    const indianCities = [
      { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lon: 72.8777, range: 0.5 },
      { name: 'Delhi', state: 'Delhi', lat: 28.7041, lon: 77.1025, range: 0.5 },
      { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lon: 77.5946, range: 0.3 },
      { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lon: 80.2707, range: 0.3 },
      { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lon: 88.3639, range: 0.3 },
      { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lon: 78.4867, range: 0.3 },
      { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lon: 73.8567, range: 0.3 },
      { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lon: 72.5714, range: 0.3 },
      { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lon: 75.7873, range: 0.3 },
      { name: 'Surat', state: 'Gujarat', lat: 21.1702, lon: 72.8311, range: 0.2 },
      { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lon: 80.9462, range: 0.2 },
      { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lon: 80.3319, range: 0.2 },
      { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lon: 79.0882, range: 0.2 },
      { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lon: 75.8577, range: 0.2 },
      { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lon: 72.9781, range: 0.2 },
      { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lon: 77.4126, range: 0.2 },
      { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lon: 83.2185, range: 0.2 },
      { name: 'Pimpri-Chinchwad', state: 'Maharashtra', lat: 18.6298, lon: 73.7997, range: 0.2 },
      { name: 'Patna', state: 'Bihar', lat: 25.5941, lon: 85.1376, range: 0.2 },
      { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lon: 73.1812, range: 0.2 }
    ];

    // Find closest city
    let closestCity = null;
    let minDistance = Infinity;

    for (const city of indianCities) {
      const distance = this.calculateDistance(lat, lon, city.lat, city.lon);
      if (distance < city.range && distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    if (closestCity) {
      return {
        address: `Near ${closestCity.name}, ${closestCity.state}`,
        city: closestCity.name,
        state: closestCity.state,
        country: 'India',
        district: closestCity.state,
        confidence: 0.7
      };
    }

    // Fallback to state-level identification
    const stateInfo = this.getStateFromCoordinates(lat, lon);
    return {
      address: `${stateInfo.state}, India`,
      city: 'Unknown',
      state: stateInfo.state,
      country: 'India',
      district: stateInfo.state,
      confidence: 0.5
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRadians(degrees) {
    return degrees * (Math.PI/180);
  }

  /**
   * Get state from coordinates (simplified mapping)
   */
  getStateFromCoordinates(lat, lon) {
    const states = [
      { name: 'Jammu and Kashmir', bounds: { minLat: 32, maxLat: 37, minLon: 73, maxLon: 80 } },
      { name: 'Himachal Pradesh', bounds: { minLat: 30.5, maxLat: 33.5, minLon: 75.5, maxLon: 79 } },
      { name: 'Punjab', bounds: { minLat: 29.5, maxLat: 32.5, minLon: 73.5, maxLon: 76.5 } },
      { name: 'Uttarakhand', bounds: { minLat: 28.5, maxLat: 31.5, minLon: 77.5, maxLon: 81 } },
      { name: 'Haryana', bounds: { minLat: 27.5, maxLat: 30.5, minLon: 74.5, maxLon: 77.5 } },
      { name: 'Delhi', bounds: { minLat: 28.4, maxLat: 28.9, minLon: 76.8, maxLon: 77.3 } },
      { name: 'Rajasthan', bounds: { minLat: 23, maxLat: 30.5, minLon: 69.5, maxLon: 78.5 } },
      { name: 'Uttar Pradesh', bounds: { minLat: 23.5, maxLat: 30.5, minLon: 77, maxLon: 84.5 } },
      { name: 'Bihar', bounds: { minLat: 24, maxLat: 27.5, minLon: 83.5, maxLon: 88.5 } },
      { name: 'Sikkim', bounds: { minLat: 27, maxLat: 28.5, minLon: 88, maxLon: 89 } },
      { name: 'Arunachal Pradesh', bounds: { minLat: 26.5, maxLat: 29.5, minLon: 91.5, maxLon: 97.5 } },
      { name: 'Nagaland', bounds: { minLat: 25.2, maxLat: 27.5, minLon: 93.2, maxLon: 95.2 } },
      { name: 'Manipur', bounds: { minLat: 23.8, maxLat: 25.7, minLon: 93.0, maxLon: 94.8 } },
      { name: 'Mizoram', bounds: { minLat: 21.9, maxLat: 24.7, minLon: 92.2, maxLon: 93.7 } },
      { name: 'Tripura', bounds: { minLat: 22.9, maxLat: 24.5, minLon: 91.0, maxLon: 92.7 } },
      { name: 'Meghalaya', bounds: { minLat: 25.0, maxLat: 26.1, minLon: 89.7, maxLon: 92.8 } },
      { name: 'Assam', bounds: { minLat: 24.0, maxLat: 28.0, minLon: 89.5, maxLon: 96.0 } },
      { name: 'West Bengal', bounds: { minLat: 21.5, maxLat: 27.5, minLon: 85.5, maxLon: 89.5 } },
      { name: 'Jharkhand', bounds: { minLat: 21.5, maxLat: 25.5, minLon: 83.5, maxLon: 87.5 } },
      { name: 'Odisha', bounds: { minLat: 17.5, maxLat: 22.5, minLon: 81.5, maxLon: 87.5 } },
      { name: 'Chhattisgarh', bounds: { minLat: 17.5, maxLat: 24.5, minLon: 80.0, maxLon: 84.5 } },
      { name: 'Madhya Pradesh', bounds: { minLat: 21.0, maxLat: 26.5, minLon: 74.0, maxLon: 82.5 } },
      { name: 'Gujarat', bounds: { minLat: 20.0, maxLat: 24.5, minLon: 68.0, maxLon: 74.5 } },
      { name: 'Maharashtra', bounds: { minLat: 15.5, maxLat: 22.0, minLon: 72.5, maxLon: 80.5 } },
      { name: 'Andhra Pradesh', bounds: { minLat: 12.5, maxLat: 19.5, minLon: 77.0, maxLon: 84.5 } },
      { name: 'Telangana', bounds: { minLat: 15.8, maxLat: 19.9, minLon: 77.2, maxLon: 81.8 } },
      { name: 'Karnataka', bounds: { minLat: 11.5, maxLat: 18.5, minLon: 74.0, maxLon: 78.5 } },
      { name: 'Goa', bounds: { minLat: 14.9, maxLat: 15.8, minLon: 73.7, maxLon: 74.3 } },
      { name: 'Kerala', bounds: { minLat: 8.0, maxLat: 12.8, minLon: 74.8, maxLon: 77.4 } },
      { name: 'Tamil Nadu', bounds: { minLat: 8.0, maxLat: 13.5, minLon: 76.2, maxLon: 80.3 } }
    ];

    for (const state of states) {
      const bounds = state.bounds;
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lon >= bounds.minLon && lon <= bounds.maxLon) {
        return { state: state.name };
      }
    }

    return { state: 'Unknown State' };
  }
}

module.exports = new LocationService();
