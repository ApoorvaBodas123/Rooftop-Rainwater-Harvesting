import { useEffect, useState } from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

type ImpactResponse = {
  months: string[];
  litersPerMonth: number[];
  collectiveLiters: number;
  score: number; // 0-100
};

const CommunityImpactDashboard = () => {
  const [impact, setImpact] = useState<ImpactResponse | null>(null);

  useEffect(() => {
    fetch('/api/community/impact')
      .then((r) => r.json())
      .then((data) => setImpact(data))
      .catch(() => setImpact({
        months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        litersPerMonth: [100,120,90,80,60,70,150,200,180,140,110,100],
        collectiveLiters: 1_500_000,
        score: 72,
      }));
  }, []);

  const chartData = {
    labels: impact?.months || [],
    datasets: [
      {
        label: 'Collective Recharge if 100 Homes Adopt (L/month)'
,
        data: impact?.litersPerMonth || [],
        backgroundColor: 'rgba(25, 118, 210, 0.5)',
        borderColor: 'rgba(25, 118, 210, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Community Impact' },
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Liters' } },
    },
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Community Impact Dashboard
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          If 100 homes adopt, potential recharge
        </Typography>
        <Box sx={{ height: 360 }}>
          <Bar data={chartData} options={chartOptions} />
        </Box>
      </Paper>

      <Box display="flex" gap={2}>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Collective Groundwater Savings (Year)
          </Typography>
          <Typography variant="h4" color="primary">
            {impact ? impact.collectiveLiters.toLocaleString() : '-'} L
          </Typography>
        </Paper>
        <Paper sx={{ p: 3, flex: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Water Sustainability Score
          </Typography>
          <Typography variant="h4" color="success.main">
            {impact ? impact.score : '-'} / 100
          </Typography>
        </Paper>
      </Box>

      <Box mt={3}>
        <Button variant="outlined" onClick={() => window.open('https://twitter.com/intent/tweet?text=Join%20me%20in%20rainwater%20harvesting!','_blank')}>
          Share on Social Media
        </Button>
      </Box>
    </Container>
  );
};

export default CommunityImpactDashboard;
