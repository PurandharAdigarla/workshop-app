import React from 'react';
import { Button, CircularProgress } from '@mui/material';

function LoadingButton({
  loading = false,
  children,
  disabled = false,
  startIcon,
  size = 'medium',
  ...props
}) {
  const loaderSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
  
  return (
    <Button
      disabled={loading || disabled}
      startIcon={loading ? <CircularProgress size={loaderSize} color="inherit" /> : startIcon}
      {...props}
    >
      {children}
    </Button>
  );
}

export default LoadingButton;