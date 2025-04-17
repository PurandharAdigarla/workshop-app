import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper,
  Box,
  Typography,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import FeedbackDetailsDialog from './FeedbackDetailsDialog';

export default function FeedbacksTable() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://localhost:8080/workshop/feedback', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Feedback response:', response.data);
      
      if (!Array.isArray(response.data)) {
        throw new Error('Unexpected response format');
      }
      
      const formattedData = response.data.map((item, index) => ({
        id: index + 1,
        workshopId: item.workshopId,
        workshopTitle: item.workshopTitle,
        startDate: new Date(item.startDate).toLocaleDateString(),
        endDate: new Date(item.endDate).toLocaleDateString(),
        averageRating: item.averageRating || 0,
        totalFeedbacks: item.totalFeedbacks || 0,
        feedbacks: item.feedbacks || []
      }));
      
      setFeedbacks(formattedData);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      setError('Failed to load feedbacks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setDetailsDialogOpen(true);
  };
  
  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const columns = [
    {
      field: 'workshopId',
      headerName: 'ID',
      width: 80,
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: 'workshopTitle', 
      headerName: 'Title', 
      width: 300,
      flex: 1 
    },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      width: 200,
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: 'endDate', 
      headerName: 'End Date', 
      width: 200,
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: 'totalFeedbacks', 
      headerName: 'Total Feedbacks', 
      width: 200,
      headerAlign: 'center',
      align: 'center'
    },
    { 
      field: 'averageRating', 
      headerName: 'Average Rating', 
      width: 200,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            cursor: 'pointer',
            pt: 1,
            '&:hover': {
              '& .MuiRating-root': {
                opacity: 0.8
              },
              '& .MuiTypography-root': {
                fontWeight: 'bold'
              }
            }
          }}
          onClick={() => handleViewFeedback(params.row)}
        >
          <Rating 
            value={params.value} 
            precision={0.1} 
            readOnly 
          />
          <Typography variant="body2" sx={{ ml: 1 }}>
            ({params.value.toFixed(1)})
          </Typography>
        </Box>
      )
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="250px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (feedbacks.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography>No workshop feedbacks available yet.</Typography>
      </Paper>
    );
  }

  return (
    <>
      <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }} elevation={1}>
        <DataGrid
          rows={feedbacks}
          columns={columns}
          pageSizeOptions={[5, 10]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={handlePaginationModelChange}
          disableRowSelectionOnClick
        />
      </Paper>

      <FeedbackDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        feedback={selectedFeedback}
      />
    </>
  );
} 