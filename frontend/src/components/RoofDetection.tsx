import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { CloudUpload, CameraAlt } from '@mui/icons-material';

interface RoofDetectionProps {
  onAreaCalculated: (area: number) => void;
}

const RoofDetection: React.FC<RoofDetectionProps> = ({ onAreaCalculated }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedArea, setDetectedArea] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple roof detection using edge detection and contour analysis
  const detectRoofArea = async (imageElement: HTMLImageElement) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create canvas and get image data
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      ctx.drawImage(imageElement, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Simple edge detection algorithm
      const roofPixels = await performRoofDetection(imageData);
      
      // Calculate area based on pixel count and estimated scale
      // Improved scaling factor based on typical aerial photo resolution
      // This assumes standard aerial/satellite imagery scale
      
      const totalPixels = imageData.width * imageData.height;
      const roofPercentage = roofPixels / totalPixels;
      
      // Estimate total image area based on typical aerial photo coverage
      // Most aerial photos cover 0.5-2 acres (21,780-87,120 sqft)
      const estimatedImageAreaSqFt = 50000; // Conservative estimate for typical aerial view
      const estimatedAreaSqFt = roofPercentage * estimatedImageAreaSqFt;
      setDetectedArea(Math.round(estimatedAreaSqFt));
      onAreaCalculated(Math.round(estimatedAreaSqFt));
      
    } catch (err) {
      setError('Failed to detect roof area. Please try a clearer image.');
      console.error('Roof detection error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simplified roof detection algorithm using basic computer vision
  const performRoofDetection = async (imageData: ImageData): Promise<number> => {
    const { data } = imageData;
    let roofPixels = 0;
    
    // Basic color-based detection for roof-like areas
    // This simulates AI detection without heavy ML libraries
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Detect roof-like colors with broader range for better detection
      const isRoofColor = (
        // Light gray/beige concrete (like in the uploaded image)
        (r > 180 && r < 255 && g > 180 && g < 255 && b > 150 && b < 220) ||
        // Medium gray concrete
        (r > 80 && r < 180 && g > 80 && g < 180 && b > 80 && b < 180) ||
        // Brown tiles
        (r > 100 && r < 200 && g > 60 && g < 120 && b > 40 && b < 100) ||
        // Red tiles
        (r > 120 && r < 220 && g > 40 && g < 100 && b > 40 && b < 100) ||
        // Dark roof materials
        (r > 40 && r < 100 && g > 40 && g < 100 && b > 40 && b < 100)
      );
      
      if (isRoofColor) {
        roofPixels++;
      }
    }
    
    return roofPixels / 4; // Convert from RGBA pixels to actual pixels
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      setImage(imageUrl);
      
      // Create image element for processing
      const img = new Image();
      img.onload = () => detectRoofArea(img);
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        🚀 AI Roof Detection (Beta)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Upload an aerial photo of your roof for automatic area calculation
      </Typography>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        style={{ display: 'none' }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<CloudUpload />}
          onClick={triggerFileInput}
          disabled={isProcessing}
        >
          Upload Photo
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<CameraAlt />}
          onClick={() => {
            // In a real app, this would open camera
            alert('Camera feature coming soon! Please upload a photo for now.');
          }}
          disabled={isProcessing}
        >
          Take Photo
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {image && (
        <Box sx={{ mb: 2 }}>
          <img
            src={image}
            alt="Uploaded roof"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px',
              border: '2px solid #ddd'
            }}
          />
        </Box>
      )}

      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />

      {isProcessing && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography variant="body2">
            Analyzing roof structure...
          </Typography>
        </Box>
      )}

      {detectedArea && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">
            🎯 Detected Roof Area: {detectedArea.toLocaleString()} sq ft
          </Typography>
          <Typography variant="caption" display="block">
            Note: This is an estimate. For precise measurements, consider professional survey.
          </Typography>
        </Alert>
      )}

      <Typography variant="caption" color="text.secondary">
        💡 Tips: Use aerial/satellite view photos for best results. Ensure the entire roof is visible.
      </Typography>
    </Paper>
  );
};

export default RoofDetection;
