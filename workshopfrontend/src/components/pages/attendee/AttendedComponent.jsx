import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { CircularProgress, Typography, Box } from '@mui/material';
import { workshopApi } from "../../../utils/api";

const AttendedComponent = forwardRef(({ attendeeId }, ref) => {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  // Expose the fetchAttendedWorkshops method to parent components
  useImperativeHandle(ref, () => ({
    refreshAttendedWorkshops: fetchAttendedWorkshops
  }));

  useEffect(() => {
    fetchAttendedWorkshops();
  }, [attendeeId]);

  const fetchAttendedWorkshops = async () => {
    const token = localStorage.getItem('accessToken');
    const currentAttendeeId = attendeeId || localStorage.getItem('attendeeId');
    
    if (!token || !currentAttendeeId) {
      console.error("No authentication token or attendee ID");
      setError("Authentication error. Please login again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const response = await workshopApi.getAttendedWorkshops(currentAttendeeId);
      
      // Format the workshops data
      const formattedWorkshops = response.data.map((workshop, index) => ({
        ...workshop,
        id: index + 1,
        startDate: new Date(workshop.startDate).toLocaleDateString(),
        endDate: new Date(workshop.endDate).toLocaleDateString(),
        workshopTutors: workshop.workshopTutors?.join(", ") || ""
      }));
      
      setWorkshops(formattedWorkshops);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attended workshops:", err);
      setError(err.userMessage || "Failed to fetch attended workshops");
      setLoading(false);
    }
  };

  const handlePaginationModelChange = (model) => {
    setPage(model.page);
    setPageSize(model.pageSize);
  };

  const columns = [
    { 
      field: 'workshopTitle', 
      headerName: 'Title', 
      width: 250,
      flex: 1
    },
    { 
      field: 'workshopTopic', 
      headerName: 'Topic', 
      width: 200,
    },
    { 
      field: 'workshopTutors', 
      headerName: 'Tutors', 
      width: 250,
      headerAlign: 'center',
      align: 'center',
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
    }
  ];

  if (loading) {
    return (
      <Paper sx={{ width: '100%', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 2 }} elevation={1}>
        <CircularProgress size={40} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ width: '100%', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 2 }} elevation={1}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (workshops.length === 0) {
    return (
      <Paper sx={{ width: '100%', p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: 2 }} elevation={1}>
        <Typography>You haven't attended any workshops yet.</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', borderRadius: 2, overflow: 'hidden' }} elevation={1}>
      <DataGrid
        rows={workshops}
        columns={columns}
        pageSizeOptions={[5, 10]}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={handlePaginationModelChange}
        disableRowSelectionOnClick
      />
    </Paper>
  );
});

export default AttendedComponent;

