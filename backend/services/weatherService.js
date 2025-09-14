const axios = require('axios');

class WeatherService {
  constructor() {
    // OpenWeatherMap API (free tier available)
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.openWeatherBaseUrl = 'https://api.openweathermap.org/data/2.5';
    
    // India Meteorological Department (IMD) data endpoints
    this.imdBaseUrl = 'https://mausam.imd.gov.in/backend';
  }

  /**
   * Get real rainfall data for a location
   * @param {number} lat - Latitude
   * @param {number} lon - Longitude
   * @returns {Object} Rainfall data
   */
  async getRainfallData(lat, lon) {
    try {
      // Try OpenWeatherMap first (more reliable API)
      const currentWeather = await this.getCurrentWeather(lat, lon);
      const historicalData = await this.getHistoricalRainfall(lat, lon);
      
      return {
        current: currentWeather,
        historical: historicalData,
        source: 'openweathermap'
      };
    } catch (error) {
      console.error('Error fetching rainfall data:', error);
      // Fallback to regional averages based on coordinates
      return this.getFallbackRainfallData(lat, lon);
    }
  }

  async getCurrentWeather(lat, lon) {
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    const response = await axios.get(`${this.openWeatherBaseUrl}/weather`, {
      params: {
        lat,
        lon,
        appid: this.openWeatherApiKey,
        units: 'metric'
      }
    });

    return {
      temperature: response.data.main.temp,
      humidity: response.data.main.humidity,
      precipitation: response.data.rain ? response.data.rain['1h'] || 0 : 0,
      description: response.data.weather[0].description
    };
  }

  async getHistoricalRainfall(lat, lon) {
    // This would typically require a paid API or historical data service
    // For now, we'll use regional patterns based on location
    return this.getRegionalRainfallPattern(lat, lon);
  }

  /**
   * Get regional rainfall patterns based on Indian climate zones
   */
  getRegionalRainfallPattern(lat, lon) {
    // Indian climate zones and their typical rainfall patterns
    const climateZones = {
      // Western Ghats (High rainfall)
      westernGhats: {
        condition: (lat, lon) => (lat >= 8 && lat <= 21) && (lon >= 72 && lon <= 77),
        annualRainfall: 2500,
        monthlyPattern: [20, 15, 25, 45, 120, 180, 220, 200, 150, 80, 30, 25] // mm
      },
      // Northeast India (Very high rainfall)
      northeast: {
        condition: (lat, lon) => lat >= 24 && lon >= 88,
        annualRainfall: 3000,
        monthlyPattern: [25, 30, 80, 150, 200, 280, 320, 300, 220, 100, 40, 30]
      },
      // Rajasthan/Desert (Low rainfall)
      desert: {
        condition: (lat, lon) => (lat >= 24 && lat <= 30) && (lon >= 69 && lon <= 78),
        annualRainfall: 300,
        monthlyPattern: [2, 3, 5, 8, 15, 25, 45, 40, 25, 10, 5, 3]
      },
      // Gangetic Plains (Moderate rainfall)
      gangeticPlains: {
        condition: (lat, lon) => (lat >= 24 && lat <= 30) && (lon >= 77 && lon <= 88),
        annualRainfall: 1000,
        monthlyPattern: [15, 20, 25, 35, 60, 120, 180, 160, 100, 40, 20, 15]
      },
      // Deccan Plateau (Moderate rainfall)
      deccan: {
        condition: (lat, lon) => (lat >= 12 && lat <= 24) && (lon >= 74 && lon <= 80),
        annualRainfall: 800,
        monthlyPattern: [10, 15, 20, 30, 50, 100, 140, 120, 80, 35, 15, 10]
      },
      // Coastal areas (High rainfall)
      coastal: {
        condition: (lat, lon) => this.isCoastal(lat, lon),
        annualRainfall: 1500,
        monthlyPattern: [25, 20, 30, 50, 100, 150, 200, 180, 120, 60, 30, 25]
      }
    };

    // Find matching climate zone
    for (const [zoneName, zone] of Object.entries(climateZones)) {
      if (zone.condition(lat, lon)) {
        return {
          zone: zoneName,
          annualRainfall: zone.annualRainfall,
          monthlyRainfall: zone.monthlyPattern,
          confidence: 0.8
        };
      }
    }

    // Default pattern for other areas
    return {
      zone: 'general',
      annualRainfall: 900,
      monthlyRainfall: [12, 18, 22, 28, 45, 85, 130, 115, 75, 35, 18, 12],
      confidence: 0.6
    };
  }

  isCoastal(lat, lon) {
    // Simplified coastal detection for India
    const coastalRegions = [
      // West coast
      { latRange: [8, 23], lonRange: [68, 73] },
      // East coast
      { latRange: [8, 22], lonRange: [79, 87] },
      // Gujarat coast
      { latRange: [20, 24], lonRange: [68, 72] }
    ];

    return coastalRegions.some(region => 
      lat >= region.latRange[0] && lat <= region.latRange[1] &&
      lon >= region.lonRange[0] && lon <= region.lonRange[1]
    );
  }

  getFallbackRainfallData(lat, lon) {
    const pattern = this.getRegionalRainfallPattern(lat, lon);
    return {
      current: {
        temperature: 25,
        humidity: 65,
        precipitation: 0,
        description: 'Regional average data'
      },
      historical: pattern,
      source: 'regional_patterns'
    };
  }

  /**
   * Get soil percolation data based on location
   */
  getSoilData(lat, lon) {
    // Simplified soil type mapping for India
    const soilTypes = {
      alluvial: { percolationRate: 0.8, regions: 'Gangetic plains' },
      black: { percolationRate: 0.4, regions: 'Deccan plateau' },
      red: { percolationRate: 0.6, regions: 'South India' },
      laterite: { percolationRate: 0.7, regions: 'Western Ghats' },
      desert: { percolationRate: 0.9, regions: 'Rajasthan' }
    };

    // Determine soil type based on location (simplified)
    let soilType = 'alluvial'; // default
    if (lat >= 12 && lat <= 24 && lon >= 74 && lon <= 80) soilType = 'black';
    else if (lat >= 8 && lat <= 16) soilType = 'red';
    else if (lat >= 24 && lon <= 75) soilType = 'desert';

    return {
      type: soilType,
      percolationRate: soilTypes[soilType].percolationRate,
      description: soilTypes[soilType].regions
    };
  }
}

module.exports = new WeatherService();
