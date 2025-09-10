import { useTranslation } from 'react-i18next';
import { Button, Menu, MenuItem, Box, Typography, useTheme } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { useState } from 'react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('i18nextLng', lng);
    handleClose();
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' }
  ];

  return (
    <div>
      <Button
        id="language-button"
        aria-controls={open ? 'language-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<LanguageIcon />}
        sx={{
          color: 'inherit',
          border: `1px solid rgba(255, 255, 255, 0.5)`,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        {languages.find(lang => lang.code === i18n.language)?.name || 'Language'}
      </Button>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'language-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box px={2} py={1}>
          <Typography variant="subtitle2" color="text.secondary" fontWeight="medium">
            Select Language
          </Typography>
        </Box>
        {languages.map((language) => (
          <MenuItem 
            key={language.code}
            onClick={() => changeLanguage(language.code)}
            selected={i18n.language === language.code}
            sx={{
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.light}20`,
                '&:hover': {
                  backgroundColor: `${theme.palette.primary.light}30`,
                },
              },
            }}
          >
            {language.name}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
};

export default LanguageSelector;
