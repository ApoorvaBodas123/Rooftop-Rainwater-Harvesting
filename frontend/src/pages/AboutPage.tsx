import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Button, 
  Card, 
  Fab, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  IconButton 
} from '@mui/material';
import { 
  WaterDrop, 
  TrendingDown, 
  CheckCircle, 
  LocationOn, 
  Calculate, 
  Build, 
  ChatBubble, 
  Close, 
  Send 
} from '@mui/icons-material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{text: string, isUser: boolean}[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();

  const presetQuestions = [
    {
      question: "What is a recharge pit?",
      answer: "A recharge pit is a structure that allows rainwater to percolate into the ground, helping to recharge groundwater aquifers. It's typically a pit filled with gravel and sand layers."
    },
    {
      question: "How accurate are these results?",
      answer: "Our calculations are based on standard engineering formulas and local rainfall data. Results are estimates with 85-90% accuracy for planning purposes."
    },
    {
      question: "What materials do I need?",
      answer: "Common materials include PVC pipes, gravel, sand, cement, and filtration mesh. Specific requirements depend on your chosen recharge structure type."
    }
  ];

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  const handleQuestionClick = (qa: any) => {
    setChatMessages(prev => [
      ...prev,
      { text: qa.question, isUser: true },
      { text: qa.answer, isUser: false }
    ]);
  };

  const generateAIResponse = async (question: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question,
          conversationHistory: chatMessages
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.response;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      // Fallback to simple response
      return `I'd be happy to help with your question: "${question}". I can provide information about rainwater harvesting systems, costs, installation, benefits, maintenance, or government schemes. Could you be more specific about what you'd like to know?`;
    }
  };

  const handleSendMessage = () => {
    if (currentQuestion.trim()) {
      const userMessage = currentQuestion.trim();
      setChatMessages(prev => [...prev, { text: userMessage, isUser: true }]);
      setCurrentQuestion('');
      setIsTyping(true);
      
      // Get AI response
      setTimeout(async () => {
        const response = await generateAIResponse(userMessage);
        setChatMessages(prev => [...prev, { text: response, isUser: false }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: '#4db6ac',
      py: 6
    }}>
      <Container maxWidth="md">
        {/* Short App Description */}
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: 4, textAlign: 'center', backgroundColor: '#f0f8ff'  }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Rooftop Rainwater Harvesting Assessment
        </Typography>
        <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
          Estimate rooftop rainwater harvesting potential, get recharge structure suggestions, and track your water-saving impact.
        </Typography>
      </Paper>

      {/* Why It Matters & 3-Step Process Side by Side */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
        {/* Why It Matters - Left Side */}
        <Box>
          <Paper sx={{ p: 3, height: '100%', backgroundColor: '#e0f7fa' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Why It Matters
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Card sx={{ textAlign: 'center', p: 1.5, backgroundColor: '#e0f7fa' }}>
                <WaterDrop sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  💧 India wastes 8.5 billion liters of rainwater yearly
                </Typography>
              </Card>
              <Card sx={{ textAlign: 'center', p: 1.5, backgroundColor: '#e0f7fa'  }}>
                <TrendingDown sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  📉 Groundwater levels falling by 0.3 m/year
                </Typography>
              </Card>
              <Card sx={{ textAlign: 'center', p: 1.5, backgroundColor: '#e0f7fa' }}>
                <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  ✅ Harvesting can meet 50–80% of water demand
                </Typography>
              </Card>
            </Box>
          </Paper>
        </Box>

        {/* Simple 3-Step Process - Right Side */}
        <Box>
          <Paper sx={{ p: 3, height: '100%', backgroundColor: '#e0f7fa' }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Simple 3-Step Process
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <LocationOn sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  1️⃣ Enter Location & Roof Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Provide location and roof specifications
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Calculate sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  2️⃣ Get Water Potential + Cost
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive detailed analysis and breakdown
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Build sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  3️⃣ Start Building & Save Water
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Implement solution and make impact
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Start Assessment Button */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontStyle: 'italic', color: 'black' }}>
          "Be the change — start saving water today!"
        </Typography>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleStartAssessment}
          sx={{ 
            px: 4, 
            py: 2, 
            fontSize: '1.2rem',
            borderRadius: 3,
            boxShadow: 3,
            backgroundColor: 'green',
            color: 'black',
            '&:hover': {
              backgroundColor: '#00796b',
              boxShadow: 6
            }
          }}
        >
          Start Assessment
        </Button>
      </Box>

      {/* Floating Chatbot */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          zIndex: 1000
        }}
        onClick={() => setChatOpen(true)}
      >
        <ChatBubble />
      </Fab>

      {/* Chatbot Dialog */}
      <Dialog 
        open={chatOpen} 
        onClose={() => setChatOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          🤖 Ask Me Anything
          <IconButton onClick={() => setChatOpen(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Chat Messages */}
          <Box sx={{ height: 300, overflowY: 'auto', mb: 2, border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}>
            {chatMessages.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body2" color="text.secondary">
                  👋 Hi! I can answer any questions about rainwater harvesting, water conservation, costs, installation, and more. Try asking me anything!
                </Typography>
              </Box>
            ) : (
              chatMessages.map((message, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: 'flex', 
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 1
                  }}
                >
                  <Paper 
                    sx={{ 
                      p: 1.5, 
                      maxWidth: '80%',
                      backgroundColor: message.isUser ? 'primary.main' : 'grey.100',
                      color: message.isUser ? 'primary.contrastText' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2">
                      {message.text}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            {isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Paper sx={{ p: 1.5, backgroundColor: 'grey.100' }}>
                  <Typography variant="body2" color="text.secondary">
                    🤖 Typing...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Quick Questions */}
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
            Quick questions to get started:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {presetQuestions.map((qa, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                onClick={() => handleQuestionClick(qa)}
                sx={{ fontSize: '0.75rem' }}
              >
                {qa.question}
              </Button>
            ))}
          </Box>

          {/* Input Area */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Ask me anything about rainwater harvesting..."
              value={currentQuestion}
              onChange={(e) => setCurrentQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
            />
            <IconButton 
              color="primary"
              onClick={handleSendMessage}
              disabled={isTyping || !currentQuestion.trim()}
            >
              <Send />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
      </Container>
    </Box>
  );
};

export default AboutPage;
