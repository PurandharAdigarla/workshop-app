import { createTheme } from '@mui/material/styles';
import { green, grey, red, blue } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      main: green[700],
      light: green[500],
      dark: green[900],
    },
    secondary: {
      main: grey[100],
      light: grey[50],
      dark: grey[300],
    },
    error: {
      main: red[700],
      light: red[500],
      dark: red[900],
    },
    info: {
      main: blue[600],
      light: blue[400],
      dark: blue[800],
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: grey[100],
            borderBottom: `1px solid ${grey[300]}`,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${grey[100]}`,
          },
        },
      },
    },
  },
});

export default theme; 