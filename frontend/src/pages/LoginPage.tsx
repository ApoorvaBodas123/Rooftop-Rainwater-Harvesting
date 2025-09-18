import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Link,
  InputAdornment,
  IconButton,
  Alert,
  AlertTitle,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, LockOutlined, EmailOutlined } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  authPaperStyle,
  authContainerStyle,
  authFormStyle,
  authButtonStyle,
  authLinkStyle,
  authTitleStyle,
  authTextFieldStyle
} from '../styles/authStyles';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to the page the user was trying to access, or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle error state
  useEffect(() => {
    if (error) {
      setSubmitError(error);
    }
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setSubmitError(t('auth.errors.required'));
      return;
    }

    try {
      await login(formData.email, formData.password);
      // After successful login, redirect to home or previous page
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      // Error is already handled by AuthContext, but we can add additional handling here if needed
      console.error('Login failed:', err);
      setSubmitError(err instanceof Error ? err.message : 'An error occurred during login');
    }
  };


  return (
    <Box sx={authContainerStyle}>
      <Container component="main" maxWidth="sm">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <Paper elevation={3} sx={authPaperStyle}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <LockOutlined sx={{ fontSize: 50, color: '#000000', mb: 1 }} />
                <Typography component="h1" variant="h4" sx={{ ...authTitleStyle, color: '#000000' }}>
                  {t('auth.login.title')}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={authFormStyle}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label={t('auth.email')}
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    ...authTextFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      '&:hover fieldset': {
                        borderColor: '#0d47a1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0d47a1',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#000000',
                      '&.Mui-focused': {
                        color: '#000000',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#000000',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label={t('auth.password')}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  sx={{
                    ...authTextFieldStyle,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#ffffff',
                      '&:hover fieldset': {
                        borderColor: '#0d47a1',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#0d47a1',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: '#000000',
                      '&.Mui-focused': {
                        color: '#000000',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: '#000000',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: '#000000' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="large"
                          sx={{
                            color: '#000000',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {submitError && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                    <AlertTitle>{t('auth.error')}</AlertTitle>
                    {submitError}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={authButtonStyle}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {loading ? t('auth.loading') : t('auth.login.button')}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
                  <Link component={RouterLink} to="/signup" sx={{ ...authLinkStyle, color: '#000000' }}>
                    Don't have an account? <span style={{ color: '#000000' }}>Sign Up</span>
                  </Link>
                </Box>

              </Box>
            </Paper>
          </div>
        </div>
      </Container>
    </Box>
  );
};

export default LoginPage;
