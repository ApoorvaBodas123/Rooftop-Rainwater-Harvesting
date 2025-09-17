import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Collapse, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  LocationOn, 
  ExpandMore, 
  Web,
  Computer,
  Language
} from '@mui/icons-material';

const LocationPermissionHelper: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const browserInstructions = [
    {
      name: 'Chrome',
      icon: <Web />,
      steps: [
        'Look for the location icon (📍) in the address bar',
        'Click on it and select "Allow"',
        'Refresh the page and try "My Location" again'
      ]
    },
    {
      name: 'Firefox',
      icon: <Computer />,
      steps: [
        'Look for the shield icon in the address bar',
        'Click on it and select "Allow" for location',
        'Refresh the page and try "My Location" again'
      ]
    },
    {
      name: 'Safari',
      icon: <Language />,
      steps: [
        'Go to Safari menu > Preferences > Websites',
        'Select "Location" and set to "Allow"',
        'Refresh the page and try "My Location" again'
      ]
    }
  ];

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity="info" sx={{ mb: 1 }}>
        <Typography variant="body2">
          <strong>Need help with location access?</strong> Click below for browser-specific instructions.
        </Typography>
      </Alert>
      
      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn color="primary" />
            <Typography variant="subtitle2">
              How to enable location access in your browser
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {browserInstructions.map((browser, index) => (
              <Box key={index} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  {browser.icon}
                  <Typography variant="subtitle2" fontWeight="bold">
                    {browser.name}
                  </Typography>
                </Box>
                <Box component="ol" sx={{ pl: 2, m: 0 }}>
                  {browser.steps.map((step, stepIndex) => (
                    <Typography key={stepIndex} variant="body2" component="li" sx={{ mb: 0.5 }}>
                      {step}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
            
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Alternative:</strong> You can also click anywhere on the map to manually select your location. 
                This works just as well for the rainwater harvesting assessment!
              </Typography>
            </Alert>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default LocationPermissionHelper;
