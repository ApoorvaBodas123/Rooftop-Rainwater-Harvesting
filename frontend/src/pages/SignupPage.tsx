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
import { Visibility, VisibilityOff, PersonOutline, EmailOutlined, LockOutlined } from '@mui/icons-material';
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

const SignupPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, isAuthenticated, loading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setSubmitError(t('auth.errors.required'));
      return;
    }

    if (formData.password.length < 6) {
      setSubmitError(t('auth.errors.passwordLength'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setSubmitError(t('auth.signup.passwordsDontMatch'));
      return;
    }

    try {
      await signup(formData.name, formData.email, formData.password);
      // Show success toast or message if needed
    } catch (err) {
      // Error is already handled by AuthContext, but we can add additional handling here if needed
      console.error('Signup failed:', err);
    }
  };


  return (
    <Box sx={authContainerStyle}>
      <Container component="main" maxWidth="sm">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%', maxWidth: '600px' }}>
            <Paper elevation={3} sx={authPaperStyle}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <LockOutlined sx={{ fontSize: 50, color: 'primary.main', mb: 1 }} />
                <Typography component="h1" variant="h4" sx={authTitleStyle}>
                  {t('auth.signup.title')}
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={authFormStyle}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label={t('auth.name')}
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={formData.name}
                  onChange={handleChange}
                  sx={authTextFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label={t('auth.email')}
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  sx={authTextFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined color="primary" />
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
                  value={formData.password}
                  onChange={handleChange}
                  sx={authTextFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label={t('auth.signup.confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  sx={authTextFieldStyle}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                          size="large"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
                  {loading ? t('auth.loading') : t('auth.signup.button')}
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 1 }}>
                  <Link component={RouterLink} to="/login" sx={authLinkStyle}>
                    {t('auth.signup.alreadyHaveAccount')}
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

export default SignupPage;
