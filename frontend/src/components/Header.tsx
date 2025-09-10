import { AppBar, Toolbar, Typography, Button, Box, Container, useMediaQuery, useTheme, IconButton, Menu, MenuItem } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

const Header = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: theme => `1px solid ${theme.palette.divider}` }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component={RouterLink} to="/" color="inherit" sx={{ textDecoration: 'none', fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.25rem' } }}>
            Rooftop Rainwater Harvesting
          </Typography>
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => handleNavigate('/')}>Home</MenuItem>
                <MenuItem onClick={() => handleNavigate('/about')}>About</MenuItem>
                <MenuItem onClick={() => handleNavigate('/tracker')}>Tracker</MenuItem>
                <MenuItem onClick={() => handleNavigate('/assessment')}>Start Assessment</MenuItem>
              </Menu>
            </>
          ) : (
            <Box>
              <Button component={RouterLink} to="/" color="inherit" sx={{ mr: 1 }}>
                Home
              </Button>
              <Button component={RouterLink} to="/about" color="inherit" sx={{ mr: 1 }}>
                About
              </Button>
              <Button component={RouterLink} to="/tracker" color="inherit" sx={{ mr: 1 }}>
                Tracker
              </Button>
              <Button variant="contained" color="primary" onClick={() => navigate('/assessment')}>
                Start Assessment
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
