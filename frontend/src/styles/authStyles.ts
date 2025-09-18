
export const authPaperStyle = {
  p: 4,
  borderRadius: 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  background: 'rgba(255, 255, 255, 0.9)',
};

export const authContainerStyle = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  background: '#eeeeee',
};

export const authFormStyle = {
  mt: 3,
  width: '100%',
};

export const authButtonStyle = {
  mt: 3,
  mb: 2,
  py: 1.5,
  borderRadius: 2,
  fontSize: '1rem',
  fontWeight: 600,
  textTransform: 'none',
  background: 'linear-gradient(45deg, #1a73e8 30%, #0d47a1 90%)',
  '&:hover': {
    boxShadow: '0 4px 20px 0 rgba(0,0,0,0.2)',
  },
};

export const authLinkStyle = {
  color: '#0d47a1',
  fontWeight: 500,
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
};

export const authInputStyle = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#bdbdbd', // Default border color
      borderRadius: 2,
    },
    '&:hover fieldset': {
      borderColor: '#1976d2', // Hover border color
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2', // Focused border color
      borderWidth: '1px',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#5f6368', // Label color
    '&.Mui-focused': {
      color: '#1976d2', // Focused label color
    },
  },
  '& .MuiOutlinedInput-input': {
    backgroundColor: '#ffffff',
    borderRadius: 2,
    '&:focus': {
      backgroundColor: '#ffffff',
    },
  },
  mb: 2,
};

export const authTitleStyle = {
  mb: 3,
  color: '#0d47a1',
  fontWeight: 700,
  textAlign: 'center',
};

export const authTextFieldStyle = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#ffffff',
    borderRadius: 2,
    color: '#212121', // Dark text color for input
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#1976d2',
      borderWidth: '1px',
    },
    '& fieldset': {
      borderColor: '#bdbdbd',
    },
    '&:hover fieldset': {
      borderColor: '#0d47a1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#0d47a1',
    },
    '& .MuiOutlinedInput-input': {
      color: '#212121', // Ensure input text is dark
      '&::placeholder': {
        color: '#757575', // Slightly lighter color for placeholder
        opacity: 1, // Ensure full opacity
      },
    },
  },
  '& .MuiInputLabel-root': {
    color: '#5c6bc0',
    '&.Mui-focused': {
      color: '#0d47a1',
    },
    '&.MuiInputLabel-shrink': {
      color: '#5c6bc0',
    },
  },
};
