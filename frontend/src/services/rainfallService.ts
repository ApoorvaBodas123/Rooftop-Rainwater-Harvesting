// Rainfall data service for location-specific annual rainfall
// Uses multiple data sources for accurate rainfall information

export interface RainfallData {
  location: string;
  annualRainfall: number; // in mm
  confidence: number; // 0-1 scale
  source: string;
  coordinates: [number, number];
}

class RainfallService {
  // Comprehensive rainfall database for Indian locations
  private rainfallDatabase = [
    // Major Cities - More Accurate Data
    { name: 'Mumbai', state: 'Maharashtra', lat: 19.0760, lng: 72.8777, rainfall: 2167, range: 0.3 },
    { name: 'Delhi', state: 'Delhi', lat: 28.7041, lng: 77.1025, rainfall: 797, range: 0.3 },
    { name: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, rainfall: 970, range: 0.3 },
    { name: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, rainfall: 1276, range: 0.3 },
    { name: 'Kolkata', state: 'West Bengal', lat: 22.5726, lng: 88.3639, rainfall: 1582, range: 0.3 },
    { name: 'Hyderabad', state: 'Telangana', lat: 17.3850, lng: 78.4867, rainfall: 812, range: 0.3 },
    { name: 'Pune', state: 'Maharashtra', lat: 18.5204, lng: 73.8567, rainfall: 722, range: 0.3 },
    { name: 'Ahmedabad', state: 'Gujarat', lat: 23.0225, lng: 72.5714, rainfall: 803, range: 0.3 },
    { name: 'Jaipur', state: 'Rajasthan', lat: 26.9124, lng: 75.7873, rainfall: 650, range: 0.3 },
    { name: 'Surat', state: 'Gujarat', lat: 21.1702, lng: 72.8311, rainfall: 1124, range: 0.2 },
    { name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.8467, lng: 80.9462, rainfall: 896, range: 0.2 },
    { name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.4499, lng: 80.3319, rainfall: 797, range: 0.2 },
    { name: 'Nagpur', state: 'Maharashtra', lat: 21.1458, lng: 79.0882, rainfall: 1205, range: 0.2 },
    { name: 'Indore', state: 'Madhya Pradesh', lat: 22.7196, lng: 75.8577, rainfall: 958, range: 0.2 },
    { name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.2599, lng: 77.4126, rainfall: 1146, range: 0.2 },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.6868, lng: 83.2185, rainfall: 1202, range: 0.2 },
    { name: 'Patna', state: 'Bihar', lat: 25.5941, lng: 85.1376, rainfall: 1067, range: 0.2 },
    { name: 'Vadodara', state: 'Gujarat', lat: 22.3072, lng: 73.1812, rainfall: 932, range: 0.2 },
    { name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.0168, lng: 76.9558, rainfall: 696, range: 0.2 },
    { name: 'Kochi', state: 'Kerala', lat: 9.9312, lng: 76.2673, rainfall: 2978, range: 0.2 },
    { name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.5241, lng: 76.9366, rainfall: 1827, range: 0.2 },
    { name: 'Guwahati', state: 'Assam', lat: 26.1445, lng: 91.7362, rainfall: 1818, range: 0.2 },
    { name: 'Chandigarh', state: 'Punjab', lat: 30.7333, lng: 76.7794, rainfall: 1110, range: 0.2 },
    { name: 'Mysore', state: 'Karnataka', lat: 12.2958, lng: 76.6394, rainfall: 785, range: 0.2 },
    { name: 'Mangalore', state: 'Karnataka', lat: 12.9141, lng: 74.8560, rainfall: 3240, range: 0.2 },
    { name: 'Madikeri', state: 'Karnataka', lat: 12.4244, lng: 75.7382, rainfall: 4000, range: 0.2 },
    { name: 'Chikmagalur', state: 'Karnataka', lat: 13.3161, lng: 75.7720, rainfall: 1925, range: 0.2 },
    { name: 'Hassan', state: 'Karnataka', lat: 13.0033, lng: 76.0965, rainfall: 1050, range: 0.2 },
    { name: 'Sakleshpur', state: 'Karnataka', lat: 12.9441, lng: 75.7847, rainfall: 3800, range: 0.15 },
    
    // Coastal Areas (Higher Rainfall)
    { name: 'Goa', state: 'Goa', lat: 15.2993, lng: 74.1240, rainfall: 2932, range: 0.4 },
    { name: 'Kozhikode', state: 'Kerala', lat: 11.2588, lng: 75.7804, rainfall: 2755, range: 0.2 },
    { name: 'Udupi', state: 'Karnataka', lat: 13.3409, lng: 74.7421, rainfall: 3456, range: 0.2 },
    { name: 'Karwar', state: 'Karnataka', lat: 14.8167, lng: 74.1333, rainfall: 3200, range: 0.2 },
    
    // Hill Stations (Variable Rainfall)
    { name: 'Shimla', state: 'Himachal Pradesh', lat: 31.1048, lng: 77.1734, rainfall: 1575, range: 0.2 },
    { name: 'Darjeeling', state: 'West Bengal', lat: 27.0360, lng: 88.2627, rainfall: 2500, range: 0.2 },
    { name: 'Ooty', state: 'Tamil Nadu', lat: 11.4064, lng: 76.6932, rainfall: 1200, range: 0.2 },
    
    // Desert Areas (Low Rainfall)
    { name: 'Jodhpur', state: 'Rajasthan', lat: 26.2389, lng: 73.0243, rainfall: 362, range: 0.2 },
    { name: 'Bikaner', state: 'Rajasthan', lat: 28.0229, lng: 73.3119, rainfall: 284, range: 0.2 },
    { name: 'Jaisalmer', state: 'Rajasthan', lat: 26.9157, lng: 70.9083, rainfall: 210, range: 0.2 },
  ];

  // State-wise average rainfall (fallback data)
  private stateRainfallAverages = {
    'Andhra Pradesh': 940,
    'Arunachal Pradesh': 2782,
    'Assam': 2818,
    'Bihar': 1067,
    'Chhattisgarh': 1292,
    'Delhi': 797,
    'Goa': 2932,
    'Gujarat': 803,
    'Haryana': 617,
    'Himachal Pradesh': 1251,
    'Jharkhand': 1273,
    'Karnataka': 1139,
    'Kerala': 2755,
    'Madhya Pradesh': 1146,
    'Maharashtra': 1181,
    'Manipur': 1467,
    'Meghalaya': 2818,
    'Mizoram': 2274,
    'Nagaland': 1814,
    'Odisha': 1489,
    'Punjab': 617,
    'Rajasthan': 531,
    'Sikkim': 3564,
    'Tamil Nadu': 998,
    'Telangana': 812,
    'Tripura': 2200,
    'Uttar Pradesh': 896,
    'Uttarakhand': 1611,
    'West Bengal': 1582,
    'Jammu and Kashmir': 1011,
  };

  /**
   * Get rainfall data for specific coordinates
   */
  async getRainfallData(lat: number, lng: number, locationName?: string): Promise<RainfallData> {
    // Try to find exact city match first
    const cityMatch = this.findNearestCity(lat, lng);
    
    if (cityMatch) {
      return {
        location: `${cityMatch.name}, ${cityMatch.state}`,
        annualRainfall: cityMatch.rainfall,
        confidence: 0.9,
        source: 'City Database',
        coordinates: [lat, lng]
      };
    }

    // Try state-level data
    const stateData = this.getStateRainfall(lat, lng);
    if (stateData) {
      return {
        location: stateData.state,
        annualRainfall: stateData.rainfall,
        confidence: 0.7,
        source: 'State Average',
        coordinates: [lat, lng]
      };
    }

    // Fallback to regional estimation
    return this.getRegionalEstimate(lat, lng);
  }

  /**
   * Find nearest city with rainfall data
   */
  private findNearestCity(lat: number, lng: number) {
    let nearestCity = null;
    let minDistance = Infinity;

    for (const city of this.rainfallDatabase) {
      const distance = this.calculateDistance(lat, lng, city.lat, city.lng);
      if (distance <= city.range && distance < minDistance) {
        minDistance = distance;
        nearestCity = city;
      }
    }

    return nearestCity;
  }

  /**
   * Get state-level rainfall data
   */
  private getStateRainfall(lat: number, lng: number): { state: string; rainfall: number } | null {
    const state = this.getStateFromCoordinates(lat, lng);
    if (state && this.stateRainfallAverages[state]) {
      return {
        state,
        rainfall: this.stateRainfallAverages[state]
      };
    }
    return null;
  }

  /**
   * Regional rainfall estimation based on geographical patterns
   */
  private getRegionalEstimate(lat: number, lng: number): RainfallData {
    let rainfall = 800; // Default for India
    let region = 'Unknown Region';

    // Coastal areas (higher rainfall)
    if (this.isCoastalArea(lat, lng)) {
      rainfall = 2000;
      region = 'Coastal Region';
    }
    // Western Ghats (very high rainfall)
    else if (this.isWesternGhats(lat, lng)) {
      rainfall = 2500;
      region = 'Western Ghats';
    }
    // Desert regions (low rainfall)
    else if (this.isDesertRegion(lat, lng)) {
      rainfall = 300;
      region = 'Desert Region';
    }
    // Himalayan region (moderate to high)
    else if (this.isHimalayanRegion(lat, lng)) {
      rainfall = 1200;
      region = 'Himalayan Region';
    }
    // Gangetic plains
    else if (this.isGangeticPlains(lat, lng)) {
      rainfall = 1000;
      region = 'Gangetic Plains';
    }
    // Deccan plateau
    else if (this.isDeccanPlateau(lat, lng)) {
      rainfall = 700;
      region = 'Deccan Plateau';
    }

    return {
      location: region,
      annualRainfall: rainfall,
      confidence: 0.5,
      source: 'Regional Estimate',
      coordinates: [lat, lng]
    };
  }

  // Geographical region detection methods
  private isCoastalArea(lat: number, lng: number): boolean {
    // Within 50km of coast (simplified)
    return (lng < 73 && lat > 8 && lat < 22) || // West coast
           (lng > 80 && lat > 8 && lat < 20) || // East coast
           (lat < 12 && lng > 74 && lng < 78);  // South coast
  }

  private isWesternGhats(lat: number, lng: number): boolean {
    return lng > 73 && lng < 77 && lat > 8 && lat < 21;
  }

  private isDesertRegion(lat: number, lng: number): boolean {
    return lng > 69 && lng < 76 && lat > 24 && lat < 30; // Rajasthan desert
  }

  private isHimalayanRegion(lat: number, lng: number): boolean {
    return lat > 28 && lat < 37;
  }

  private isGangeticPlains(lat: number, lng: number): boolean {
    return lat > 24 && lat < 30 && lng > 77 && lng < 88;
  }

  private isDeccanPlateau(lat: number, lng: number): boolean {
    return lat > 12 && lat < 20 && lng > 74 && lng < 80;
  }

  /**
   * Calculate distance between two coordinates
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
  private getStateFromCoordinates(lat: number, lng: number): string | null {
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
        return state.name;
      }
    }

    return null;
  }
}

export const rainfallService = new RainfallService();
