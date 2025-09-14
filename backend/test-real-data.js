// Quick test script to verify real data integration
const calculationService = require('./services/calculationService');

async function testRealData() {
  console.log('🧪 Testing Real Data Integration...\n');

  // Test different Indian locations
  const testLocations = [
    {
      name: 'Mumbai (Western Ghats)',
      location: { coordinates: [72.8777, 19.0760] },
      roofArea: 100,
      roofType: 'concrete',
      waterDemand: 400
    },
    {
      name: 'Bangalore (Deccan Plateau)', 
      location: { coordinates: [77.5946, 12.9716] },
      roofArea: 150,
      roofType: 'tiled',
      waterDemand: 500
    },
    {
      name: 'Jaipur (Desert Region)',
      location: { coordinates: [75.7873, 26.9124] },
      roofArea: 120,
      roofType: 'concrete',
      waterDemand: 350
    }
  ];

  for (const test of testLocations) {
    try {
      console.log(`📍 Testing: ${test.name}`);
      console.log(`   Coordinates: [${test.location.coordinates.join(', ')}]`);
      
      const result = await calculationService.calculateHarvestingPotential(test);
      
      console.log(`   ✅ Climate Zone: ${result.location.climateZone}`);
      console.log(`   ✅ Soil Type: ${result.location.soilType}`);
      console.log(`   ✅ Annual Rainfall: ${result.rainfall.annual}mm`);
      console.log(`   ✅ Annual Harvest: ${result.harvest.annual.toLocaleString()} liters`);
      console.log(`   ✅ System Size: ${result.system.size}`);
      console.log(`   ✅ Total Cost: ₹${result.costs.total.toLocaleString()}`);
      console.log(`   ✅ Payback Period: ${result.costs.paybackYears} years`);
      console.log(`   ✅ Data Confidence: ${(result.confidence * 100)}%\n`);
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
  
  console.log('🎉 Real Data Integration Test Complete!');
}

// Run the test
testRealData().catch(console.error);
