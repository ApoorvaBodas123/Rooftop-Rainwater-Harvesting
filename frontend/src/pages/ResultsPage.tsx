import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  useTheme,
  Button,
  IconButton,
  LinearProgress,
  CircularProgress,
  Container
} from '@mui/material';
import { 
  WaterDrop as WaterDropIcon, 
  ArrowBack as ArrowBackIcon, 
  Download as DownloadIcon,
  Home as HomeIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Water as WaterIcon
} from '@mui/icons-material';
// Animations and charts

// Types
interface LocationData {
  address: string;
  coordinates: [number, number];
}

interface FormData {
  location: LocationData;
  roofArea: string;
  roofType: string;
  averageRainfall: string;
  waterDemand: string;
}

interface EnvironmentalImpact {
  waterSaved: number;
  co2Reduction: number;
}

interface ResultData {
  annualHarvest: number;
  monthlyHarvest: number[];
  dailyHarvest: number;
  recommendedSystem: string;
  estimatedCost: number;
  paybackPeriod: number;
  environmentalImpact: EnvironmentalImpact;
  runoffCoefficient?: number;
  structure?: {
    type: string;
    dimensions: { length: number; breadth: number; depth: number; unit: string };
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF with autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
import { motion } from 'framer-motion';
import CountUp from 'react-countup';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

// (Removed duplicate interface declarations)

const ResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const theme = useTheme();
  const reportRef = useRef<HTMLDivElement>(null);
  
  // Initialize state with default values
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<ResultData>({
    annualHarvest: 0,
    monthlyHarvest: Array(12).fill(0),
    dailyHarvest: 0,
    recommendedSystem: 'Small',
    estimatedCost: 0,
    paybackPeriod: 0,
    environmentalImpact: {
      waterSaved: 0,
      co2Reduction: 0
    }
  });
  const [formData, setFormData] = useState<FormData>({
    location: {
      address: '',
      coordinates: [0, 0]
    },
    roofArea: '',
    roofType: '',
    averageRainfall: '',
    waterDemand: ''
  });
  // Initialize chart data with proper types
  const [chartData, setChartData] = useState<ChartData>({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [{
      label: 'Monthly Water Harvest (Liters)',
      data: Array(12).fill(0),
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    }]
  });
  const [waterLevel, setWaterLevel] = useState(0);
  const [tankFillProgress, setTankFillProgress] = useState(0);

  // Load data from location state (support both {formData} and {assessment})
  useEffect(() => {
    const incoming = (location as any).state;
    const incomingForm: FormData | undefined = incoming?.formData || incoming?.assessment?.formData || incoming?.assessment;
    if (incomingForm) {
      const formData = incomingForm;
      setFormData(formData);
      
      // Calculate results
      const results = calculateResults(formData);
      setResultData(results);
      
      // Update chart data with actual results
      setChartData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: results.monthlyHarvest
        }]
      }));
      
      // Calculate water level for visualization (0-100%) based on user's demand adequacy
      // If waterDemand present, compare annual harvest to annual demand; otherwise scale by 100,000L cap
      const annualDemand = (parseFloat(formData.waterDemand || '0') || 0) * 365;
      const level = annualDemand > 0
        ? Math.max(0, Math.min(100, Math.round((results.annualHarvest / annualDemand) * 100)))
        : Math.max(0, Math.min(100, Math.round((results.annualHarvest / 100000) * 100)));
      setWaterLevel(level);
      setTankFillProgress(level);
      setLoading(false);
    } else {
      // If no form data, redirect to home
      navigate('/');
    }
  }, [location, navigate]);

  // Calculate results based on form data and return them
  const calculateResults = (data: FormData): ResultData => {
    if (!data) {
      return {
        annualHarvest: 0,
        monthlyHarvest: Array(12).fill(0),
        dailyHarvest: 0,
        recommendedSystem: 'Small',
        estimatedCost: 0,
        paybackPeriod: 0,
        environmentalImpact: {
          waterSaved: 0,
          co2Reduction: 0
        }
      };
    }
    
    const roofArea = parseFloat(data.roofArea) || 0;
    const averageRainfall = parseFloat(data.averageRainfall) || 0;
    const waterDemand = parseFloat(data.waterDemand) || 0;
    
    // Convert roof area from sqft to square meters (1 sqft = 0.092903 sqm)
    const roofAreaSqM = roofArea * 0.092903;
    
    // Convert rainfall from mm to meters (1000mm = 1m)
    const rainfallM = averageRainfall / 1000;
    
    // Runoff coefficients based on roof type
    const runoffCoefficients: { [key: string]: number } = {
      'concrete': 0.8,
      'tile': 0.75,
      'metal': 0.9,
      'asphalt': 0.85,
      'other': 0.7
    };
    
    const coefficient = runoffCoefficients[data.roofType] || 0.7;
    
    // Correct formula: Area(m²) × Rainfall(m) × Coefficient × 1000(to get liters)
    const annualHarvest = roofAreaSqM * rainfallM * coefficient * 1000;
    
    // Generate monthly distribution (simple example - could be enhanced with real data)
    const monthlyHarvest = Array(12).fill(0).map((_, i) => {
      // Simple seasonal variation - adjust as needed
      const seasonalFactor = 1 + 0.5 * Math.sin((i - 3) * Math.PI / 6);
      return Math.round((annualHarvest / 12) * seasonalFactor);
    });
    
    // Recommended system mapping
    const recommendedSystem = annualHarvest > 50000 ? (annualHarvest > 100000 ? 'Large' : 'Medium') : 'Small';
    const estimatedCost = Math.round(annualHarvest * 2.5);
    const paybackPeriod = Math.max(1, Math.round((estimatedCost) / (Math.max(waterDemand, 1) * 0.5 * 365)));

    // Suggested structure and dimensions (simple heuristic)
    let structureType = 'Storage Tank';
    let dimensions = { length: 2, breadth: 2, depth: 2, unit: 'm' };
    if (recommendedSystem === 'Medium') {
      structureType = 'Recharge Pit';
      dimensions = { length: 3, breadth: 3, depth: 2.5, unit: 'm' } as any;
    } else if (recommendedSystem === 'Large') {
      structureType = 'Recharge Trench';
      dimensions = { length: 6, breadth: 1, depth: 2.5, unit: 'm' } as any;
    }

    return {
      annualHarvest: Math.round(annualHarvest),
      monthlyHarvest,
      dailyHarvest: Math.round(annualHarvest / 365),
      recommendedSystem,
      estimatedCost,
      paybackPeriod,
      environmentalImpact: {
        waterSaved: Math.round(annualHarvest),
        co2Reduction: Math.round(annualHarvest * 0.1)
      },
      // New fields
      // @ts-ignore - will extend interface below
      runoffCoefficient: coefficient,
      // @ts-ignore - will extend interface below
      structure: { type: structureType, dimensions }
    };
  };

  const generatePDF = (): void => {
    const doc = new jsPDF();
    const marginLeft = 14;
    let currentY = 18;

    doc.setFontSize(18);
    doc.text('Rainwater Harvesting Report', marginLeft, currentY);
    currentY += 10;

    doc.setFontSize(12);
    doc.text(`Harvestable Water (liters/year): ${resultData.annualHarvest.toLocaleString()}`, marginLeft, currentY);
    currentY += 8;
    if (typeof resultData.runoffCoefficient === 'number') {
      doc.text(`Runoff Coefficient used: ${resultData.runoffCoefficient.toFixed(2)}`, marginLeft, currentY);
      currentY += 8;
    }
    if (resultData.structure) {
      const d = resultData.structure.dimensions;
      doc.text(`Suggested Structure: ${resultData.structure.type}`, marginLeft, currentY);
      currentY += 8;
      doc.text(`Dimensions (L×B×D): ${d.length} × ${d.breadth} × ${d.depth} ${d.unit}`, marginLeft, currentY);
      currentY += 8;
    }
    doc.text(`Estimated Cost: ₹${resultData.estimatedCost.toLocaleString()}`, marginLeft, currentY);
    currentY += 8;
    doc.text(`Payback Period: ~${resultData.paybackPeriod} ${resultData.paybackPeriod === 1 ? 'year' : 'years'}`, marginLeft, currentY);
    currentY += 12;

    // Monthly harvest table
    const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const rows = monthLabels.map((m, i) => [m, (resultData.monthlyHarvest[i] || 0).toLocaleString() + ' L']);
    autoTable(doc, {
      head: [['Month', 'Harvest (L)']],
      body: rows,
      startY: currentY,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [25, 118, 210] },
    });

    doc.save('rainwater-harvesting-report.pdf');
  };

  // Handle download as PDF
  const handleDownloadPDF = () => {
    // Add a small delay to ensure the report content is ready
    setTimeout(() => {
      generatePDF();
    }, 500);
  };

  // Get system recommendation details
  const getSystemDetails = (system: string) => {
    switch (system) {
      case 'small':
        return {
          name: 'Small System',
          description: 'Ideal for residential properties with limited space',
          components: [
            'Underground storage tank (2,000-5,000 liters)',
            'Basic filtration system',
            'First-flush system',
            'Pump (if needed)'
          ]
        };
      case 'medium':
        return {
          name: 'Medium System',
          description: 'Suitable for larger homes or small commercial buildings',
          components: [
            'Larger storage tank (5,000-20,000 liters)',
            'Advanced filtration',
            'First-flush system',
            'Pump and pressure system',
            'Basic water treatment'
          ]
        };
      case 'large':
        return {
          name: 'Large System',
          description: 'For commercial buildings or large residential complexes',
          components: [
            'Large storage capacity (20,000+ liters)',
            'Advanced filtration and treatment',
            'Automated first-flush system',
            'High-capacity pump and pressure system',
            'Water quality monitoring',
            'Backup water supply integration'
          ]
        };
      default:
        return {
          name: 'Custom System',
          description: 'Tailored solution based on specific requirements',
          components: []
        };
    }
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Monthly Rainwater Harvest',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Liters',
        },
      },
    },
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#eeeeee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box textAlign="center">
          <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Calculating your rainwater harvesting potential...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!resultData || !formData) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#eeeeee' }}>
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error: No assessment data found
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
            startIcon={<HomeIcon />}
            sx={{ mt: 3 }}
          >
            Back to Home
          </Button>
        </Container>
      </Box>
    );
  }

  const systemDetails = getSystemDetails(resultData.recommendedSystem.toLowerCase());

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#eeeeee' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
      <div ref={reportRef}>
        {/* Header */}
        <Box mb={3} display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <IconButton onClick={() => navigate('/assessment')} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h5" component="h1">
              {t('results.title')}
            </Typography>
          </Box>
          {/* Top-right download removed; CTA kept at page bottom */}
        </Box>
        
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          {t('results.subtitle')}
        </Typography>
        
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 3,
          mt: 2,
          alignItems: 'start'
        }}>
          {/* Left column - Water tank visualization */}
          <Box component={Paper} elevation={3} sx={{ p: 2, borderRadius: 2, gridColumn: { md: '1 / span 1' }, alignSelf: 'start' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              {t('results.annualHarvest')}
            </Typography>
            
            <Box 
              position="relative" 
              height={300} 
              display="flex" 
              flexDirection="column"
              alignItems="center"
              justifyContent="flex-end"
              sx={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath fill=\'%23e0e0e0\' d=\'M0,0 L200,0 L200,200 L0,200 Z\' /%3E%3C/svg%3E")',
                backgroundSize: '100% 100%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center bottom',
              }}
            >
              {/* Water fill animation */}
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${waterLevel}%` }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{
                  width: '78%',
                  background: 'linear-gradient(to top, #1976d2, #64b5f6)',
                  borderRadius: '0 0 40px 40px',
                  position: 'absolute',
                  bottom: '10%',
                  left: '11%',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  animate={{
                    y: [0, 10, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'center',
                    color: 'white',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    paddingBottom: '8px',
                  }}
                >
                  <Typography variant="h5" fontWeight="bold">
                    <CountUp 
                      end={resultData.annualHarvest} 
                      duration={2.5} 
                      separator="," 
                    />
                  </Typography>
                  <Typography variant="body2">liters/year</Typography>
                </motion.div>
              </motion.div>
              
              {/* Water tank outline */}
              <Box
                position="relative"
                width="78%"
                height="78%"
                border="3px solid #1976d2"
                borderRadius="40px"
                sx={{
                  borderBottomLeftRadius: '40px',
                  borderBottomRightRadius: '40px',
                  overflow: 'hidden',
                }}
              >
                {/* Fill percentage indicator */}
                <Box 
                  position="absolute" 
                  top="10px" 
                  left="50%" 
                  sx={{ transform: 'translateX(-50%)' }}
                  bgcolor="rgba(255,255,255,0.8)"
                  px={2}
                  py={0.5}
                  borderRadius={2}
                  zIndex={2}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {Math.round(waterLevel)}% of potential
                  </Typography>
                </Box>
              </Box>
              
              {/* Progress bar */}
              <Box width="100%" mt={2} px={1.5}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption">0%</Typography>
                  <Typography variant="caption">100%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={tankFillProgress} 
                  sx={{
                    height: 10,
                    borderRadius: 5,
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #1976d2, #64b5f6)',
                    },
                  }}
                />
              </Box>
            </Box>
            
            {/* Caption removed to tighten card */}
          </Box>

          {/* Right column - Results and recommendations */}
          <Box sx={{ gridColumn: { md: '2 / span 1' } }}>
            {/* Key metrics */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 3 }}>
              <Card elevation={2} sx={{ height: '100%', borderLeft: `4px solid ${theme.palette.primary.main}`, borderRadius: '0 4px 4px 0' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('results.monthlyHarvest')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    <CountUp end={Math.round(resultData.annualHarvest / 12)} duration={2} separator="," />
                    <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                      liters
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2} sx={{ height: '100%', borderLeft: `4px solid ${theme.palette.success.main}`, borderRadius: '0 4px 4px 0' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <WaterIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('results.dailyHarvest')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    <CountUp end={resultData.dailyHarvest} duration={2} separator="," />
                    <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                      liters
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2} sx={{ height: '100%', borderLeft: `4px solid ${theme.palette.warning.main}`, borderRadius: '0 4px 4px 0' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <CheckCircleIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('results.recommendation')}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight="bold" textTransform="capitalize">
                    {resultData.recommendedSystem} System
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={2} sx={{ height: '100%', borderLeft: `4px solid ${theme.palette.info.main}`, borderRadius: '0 4px 4px 0' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      {t('results.paybackPeriod')}
                    </Typography>
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    ~{resultData.paybackPeriod} {resultData.paybackPeriod === 1 ? 'year' : 'years'}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            {/* Environmental impact - right column */}
            <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, gridColumn: { md: '2 / span 1' } }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" display="flex" alignItems="center">
                <WaterDropIcon color="success" sx={{ mr: 1 }} />
                {t('results.environmentalImpact')}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3 }}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <WaterDropIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t('results.waterSaved')}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="primary">
                      <CountUp end={resultData.environmentalImpact.waterSaved} duration={2.5} separator="," />
                      <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                        liters/year
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Equivalent to {Math.round(resultData.environmentalImpact.waterSaved / 1000)} cubic meters
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <WaterDropIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="caption" color="text.secondary">
                        {t('results.co2Reduction')}
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight="bold" color="success.main">
                      <CountUp end={resultData.environmentalImpact.co2Reduction} duration={2.5} separator="," />
                      <Typography component="span" variant="caption" color="text.secondary" ml={0.5}>
                        kg CO₂/year
                      </Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Equivalent to {Math.round(resultData.environmentalImpact.co2Reduction / 2)} tree seedlings grown for 10 years
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
          </Paper>

          {/* Monthly harvest chart - placed under the tank (left) */}
          </Box>
          <Paper elevation={3} sx={{ p: 2.5, borderRadius: 2, gridColumn: { md: '1 / span 1' }, alignSelf: 'start' }}>
            <Typography variant="subtitle1" gutterBottom fontWeight="bold">
              Monthly Rainwater Harvest
            </Typography>
            <Box height={300}>
              <Bar data={chartData} options={chartOptions} />
            </Box>
          </Paper>

          {/* Coefficient & Suggested Structure - span both columns */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 0, gridColumn: { md: '1 / -1' } }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Runoff Coefficient Used
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {typeof resultData.runoffCoefficient === 'number' ? resultData.runoffCoefficient.toFixed(2) : '—'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    e.g., RCC roof ≈ 0.8, Metal ≈ 0.9
                  </Typography>
                </CardContent>
              </Card>
              <Card elevation={1}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Suggested Structure
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {resultData.structure?.type || '—'}
                  </Typography>
                  {resultData.structure && (
                    <Typography variant="body2" color="text.secondary">
                      Dimensions (L×B×D): {resultData.structure.dimensions.length} × {resultData.structure.dimensions.breadth} × {resultData.structure.dimensions.depth} {resultData.structure.dimensions.unit}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Paper>

          {/* Recommended system - span both columns */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4, gridColumn: { md: '1 / -1' } }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              {systemDetails.name} - {systemDetails.description}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" mb={2}>
              Estimated Cost: <span style={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
                ₹{resultData.estimatedCost.toLocaleString()}
              </span>
            </Typography>
            <Typography variant="subtitle2" fontWeight="bold" mb={1}>
              Includes:
            </Typography>
            <ul style={{ marginTop: 0, paddingLeft: 20 }}>
              {systemDetails.components.map((item, index) => (
                <li key={index}>
                  <Typography variant="body2">{item}</Typography>
                </li>
              ))}
            </ul>
            <Typography variant="body2" color="text.secondary" mt={2} fontStyle="italic">
              Note: This is an estimate. Actual costs may vary based on location, materials, and installation requirements.
            </Typography>
          </Paper>

          {/* Call to action - span both columns */}
          <Box display="flex" justifyContent="space-between" mt={4} sx={{ gridColumn: { md: '1 / -1' } }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/assessment')}
            >
              {t('results.startNewAssessment')}
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownloadPDF}
              startIcon={<DownloadIcon />}
            >
              {t('results.downloadReport')}
            </Button>
          </Box>
        </Box>
      </div>
      </Container>
    </Box>
  );
};

export default ResultsPage;
