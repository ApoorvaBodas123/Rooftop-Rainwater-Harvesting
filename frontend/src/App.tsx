import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import AssessmentPage from './pages/AssessmentPage';
import ResultsPage from './pages/ResultsPage';
import AboutPage from './pages/AboutPage';
import CommunityImpactDashboard from './pages/CommunityImpactDashboard';
import SustainabilityTracker from './pages/SustainabilityTracker';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
>>>>>>> d238aaabaf1545c94ddecbec855cca69ee325f5e

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1a73e8',
      light: '#63a4ff',
      dark: '#0045b5',
      contrastText: '#fff',
    },
    secondary: {
      main: '#0d47a1',
      light: '#5472d3',
      dark: '#002171',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f9ff',
      paper: '#ffffff',
    },
    text: {
      primary: '#1a237e',
      secondary: '#5c6bc0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#1a237e',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h2: {
      fontWeight: 600,
      color: '#1a237e',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h3: {
      fontWeight: 600,
      color: '#1a237e',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h4: {
      fontWeight: 600,
      color: '#1a237e',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h5: {
      fontWeight: 500,
      color: '#1a237e',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    h6: {
      fontWeight: 500,
      color: '#1a237e',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 24px',
        },
      },
    },
  },
});

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <CssBaseline />
          <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Router>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                
                {/* Public routes */}
                <Route path="/about" element={<AboutPage />} />

                
                {/** Wildcard route removed intentionally */}

                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/assessment" element={<AssessmentPage />} />
                  <Route path="/results" element={<ResultsPage />} />
                  <Route path="/community" element={<CommunityImpactDashboard />} />
                  <Route path="/tracker" element={<SustainabilityTracker />} />
                </Route>
                
                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Router>
          </Box>
          <ToastContainer />
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

export default App;
