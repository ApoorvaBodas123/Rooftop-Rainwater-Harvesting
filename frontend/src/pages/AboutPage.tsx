import { Container, Typography, Box, Paper } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Typography variant="h4" gutterBottom>
          About
        </Typography>
        <Box>
          <Typography paragraph>
            Rooftop Rainwater Harvesting Assessment helps you quickly estimate your roof's rainwater harvesting and recharge potential.
          </Typography>
          <Typography paragraph>
            Enter a few simple details about your location, roof area, and rainfall to generate an instant report with recommended structures, estimated cost, payback period, and environmental impact.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutPage;
