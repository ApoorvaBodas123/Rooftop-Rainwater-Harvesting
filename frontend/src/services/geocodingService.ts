// Geocoding service using open source APIs (Nominatim/OpenStreetMap)
// This is free and doesn't require API keys

export interface GeocodingResult {
  lat: number;
  lng: number;
  address: string;
  display_name: string;
  place_id: string;
  type: string;
  importance: number;
}

export interface ReverseGeocodingResult {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  district?: string;
  pincode?: string;
  confidence?: number;
}

class GeocodingService {
  private readonly NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
  private readonly USER_AGENT = 'RooftopRainwaterHarvesting/1.0';

  /**
   * Search for locations by address/place name
   */
  async searchLocation(query: string, limit: number = 5): Promise<GeocodingResult[]> {
    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: limit.toString(),
        addressdetails: '1',
        countrycodes: 'in', // Focus on India
        dedupe: '1',
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        display_name: item.display_name,
        place_id: item.place_id,
        type: item.type,
        importance: item.importance,
      }));
    } catch (error) {
      console.error('Error searching location:', error);
      return [];
    }
  }

  /**
   * Get address from coordinates (reverse geocoding)
   */
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResult | null> {
    try {
      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lng.toString(),
        format: 'json',
        addressdetails: '1',
        zoom: '18',
      });

      const response = await fetch(`${this.NOMINATIM_BASE_URL}/reverse?${params}`, {
        headers: {
          'User-Agent': this.USER_AGENT,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.address) {
        return null;
      }

      const address = data.address;
      
      return {
        lat: parseFloat(data.lat),
        lng: parseFloat(data.lon),
        address: data.display_name,
        city: address.city || address.town || address.village || address.hamlet,
        state: address.state,
        country: address.country,
        district: address.state_district || address.county,
        pincode: address.postcode,
        confidence: 0.8, // Nominatim doesn't provide confidence, so we set a default
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  /**
   * Get detailed location information with fallback to offline mapping
   */
  async getLocationDetails(lat: number, lng: number): Promise<ReverseGeocodingResult> {
    // Try online geocoding first
    const onlineResult = await this.reverseGeocode(lat, lng);
    
    if (onlineResult) {
      return onlineResult;
    }

    // Fallback to offline location mapping for Indian coordinates
    return this.getOfflineLocationDetails(lat, lng);
  }

  /**
   * Offline location mapping for major Indian cities and regions
   * (Same as backend service but for frontend use)
   */
  private getOfflineLocationDetails(lat: number, lng: number): ReverseGeocodingResult {
    const indianCities = [
      { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, range: 0.5 },
      { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, range: 0.5 },
      { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, range: 0.3 },
      { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, range: 0.3 },
      { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, range: 0.3 },
      { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, range: 0.3 },
      { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, range: 0.3 },
      { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, range: 0.3 },
      { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, range: 0.3 },
      { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, range: 0.2 },
      { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, range: 0.2 },
      { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, range: 0.2 },
      { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, range: 0.2 },
      { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, range: 0.2 },
      { name: 'Thane', state: 'Maharashtra', lat: 19.2183, lng: 72.9781, range: 0.2 },
      { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, range: 0.2 },
      { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, range: 0.2 },
      { name: 'Pimpri-Chinchwad', state: 'Maharashtra', lat: 18.6298, lng: 73.7997, range: 0.2 },
      { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, range: 0.2 },
      { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, range: 0.2 }
    ];

    // Find closest city
    let closestCity = null;
    let minDistance = Infinity;

    for (const city of indianCities) {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < city.range && distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    if (closestCity) {
      return {
        lat,
        lng,
        address: `Near ${closestCity.name}, ${closestCity.state}`,
        city: closestCity.name,
        state: closestCity.state,
        country: 'India',
        district: closestCity.state,
        confidence: 0.7
      };
    }

    // Fallback to state-level identification
    const stateInfo = this.getStateFromCoordinates(lat, lng);
    return {
      lat,
      lng,
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
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180);
  }

  /**
   * Get state from coordinates (simplified mapping)
   */
  private getStateFromCoordinates(lat: number, lng: number): { state: string } {
    const states = [
      { name: 'Jammu and Kashmir', bounds: { minLat: 32, maxLat: 37, minLng: 73, maxLng: 80 } },
      { name: 'Himachal Pradesh', bounds: { minLat: 30.5, maxLat: 33.5, minLng: 75.5, maxLng: 79 } },
      { name: 'Punjab', bounds: { minLat: 29.5, maxLat: 32.5, minLng: 73.5, maxLng: 76.5 } },
      { name: 'Uttarakhand', bounds: { minLat: 28.5, maxLat: 31.5, minLng: 77.5, maxLng: 81 } },
      { name: 'Haryana', bounds: { minLat: 27.5, maxLat: 30.5, minLng: 74.5, maxLng: 77.5 } },
      { name: 'Delhi', bounds: { minLat: 28.4, maxLat: 28.9, minLng: 76.8, maxLng: 77.3 } },
      { name: 'Rajasthan', bounds: { minLat: 23, maxLat: 30.5, minLng: 69.5, maxLng: 78.5 } },
      { name: 'Uttar Pradesh', bounds: { minLat: 23.5, maxLat: 30.5, minLng: 77, maxLng: 84.5 } },
      { name: 'Bihar', bounds: { minLat: 24, maxLat: 27.5, minLng: 83.5, maxLng: 88.5 } },
      { name: 'Sikkim', bounds: { minLat: 27, maxLat: 28.5, minLng: 88, maxLng: 89 } },
      { name: 'Arunachal Pradesh', bounds: { minLat: 26.5, maxLat: 29.5, minLng: 91.5, maxLng: 97.5 } },
      { name: 'Nagaland', bounds: { minLat: 25.2, maxLat: 27.5, minLng: 93.2, maxLng: 95.2 } },
      { name: 'Manipur', bounds: { minLat: 23.8, maxLat: 25.7, minLng: 93.0, maxLng: 94.8 } },
      { name: 'Mizoram', bounds: { minLat: 21.9, maxLat: 24.7, minLng: 92.2, maxLng: 93.7 } },
      { name: 'Tripura', bounds: { minLat: 22.9, maxLat: 24.5, minLng: 91.0, maxLng: 92.7 } },
      { name: 'Meghalaya', bounds: { minLat: 25.0, maxLat: 26.1, minLng: 89.7, maxLng: 92.8 } },
      { name: 'Assam', bounds: { minLat: 24.0, maxLat: 28.0, minLng: 89.5, maxLng: 96.0 } },
      { name: 'West Bengal', bounds: { minLat: 21.5, maxLat: 27.5, minLng: 85.5, maxLng: 89.5 } },
      { name: 'Jharkhand', bounds: { minLat: 21.5, maxLat: 25.5, minLng: 83.5, maxLng: 87.5 } },
      { name: 'Odisha', bounds: { minLat: 17.5, maxLat: 22.5, minLng: 81.5, maxLng: 87.5 } },
      { name: 'Chhattisgarh', bounds: { minLat: 17.5, maxLat: 24.5, minLng: 80.0, maxLng: 84.5 } },
      { name: 'Madhya Pradesh', bounds: { minLat: 21.0, maxLat: 26.5, minLng: 74.0, maxLng: 82.5 } },
      { name: 'Gujarat', bounds: { minLat: 20.0, maxLat: 24.5, minLng: 68.0, maxLng: 74.5 } },
      { name: 'Maharashtra', bounds: { minLat: 15.5, maxLat: 22.0, minLng: 72.5, maxLng: 80.5 } },
      { name: 'Andhra Pradesh', bounds: { minLat: 12.5, maxLat: 19.5, minLng: 77.0, maxLng: 84.5 } },
      { name: 'Telangana', bounds: { minLat: 15.8, maxLat: 19.9, minLng: 77.2, maxLng: 81.8 } },
      { name: 'Karnataka', bounds: { minLat: 11.5, maxLat: 18.5, minLng: 74.0, maxLng: 78.5 } },
      { name: 'Goa', bounds: { minLat: 14.9, maxLat: 15.8, minLng: 73.7, maxLng: 74.3 } },
      { name: 'Kerala', bounds: { minLat: 8.0, maxLat: 12.8, minLng: 74.8, maxLng: 77.4 } },
      { name: 'Tamil Nadu', bounds: { minLat: 8.0, maxLat: 13.5, minLng: 76.2, maxLng: 80.3 } }
    ];

    for (const state of states) {
      const bounds = state.bounds;
      if (lat >= bounds.minLat && lat <= bounds.maxLat && 
          lng >= bounds.minLng && lng <= bounds.maxLng) {
        return { state: state.name };
      }
    }

    return { state: 'Unknown State' };
  }
}

export const geocodingService = new GeocodingService();
