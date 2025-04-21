import React from 'react';
import { Alert as MuiAlert, Snackbar } from '@mui/material';

function Alert({ 
  open, 
  message, 
  severity = 'error', 
  onClose, 
  autoHideDuration = 4000,
  position = { vertical: 'bottom', horizontal: 'center' }
}) {
  if (!message && open) {
    return null;
  }
  
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={position}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        onClose={onClose}
        severity={severity}
      >
        {message}
      </MuiAlert>
    </Snackbar>
  );
}

export default Alert;