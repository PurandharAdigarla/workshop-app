import { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';

export default function AttendedComponent() {
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("accessToken");
  const attendeeId = localStorage.getItem("attendeeId");

  useEffect(() => {
    fetchAttendedWorkshops();
  }, []);

  const fetchAttendedWorkshops = async () => {
    if (!token || !attendeeId) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8080/workshop/attended/${attendeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
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
      setError("Failed to fetch attended workshops");
      setLoading(false);
    }
  };

  const columns = [
    { 
      field: 'workshopTitle', 
      headerName: 'Title', 
      width: 200,
      flex: 1
    },
    { 
      field: 'workshopTopic', 
      headerName: 'Topic', 
      width: 150,
      flex: 1
    },
    { 
      field: 'workshopTutors', 
      headerName: 'Tutors', 
      width: 350,
      flex: 1
    },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      width: 200,
      flex: 1
    },
    { 
      field: 'endDate', 
      headerName: 'End Date', 
      width: 200,
      flex: 1
    }
  ];

  if (loading) {
    return (
      <Paper sx={{ height: 400, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>Loading...</div>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ height: 400, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>{error}</div>
      </Paper>
    );
  }

  if (workshops.length === 0) {
    return (
      <Paper sx={{ height: 400, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div>You haven't attended any workshops yet.</div>
      </Paper>
    );
  }

  return (
    <Paper sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={workshops}
        columns={columns}
        initialState={{
          pagination: { paginationModel: { pageSize: 5 } }
        }}
        pageSizeOptions={[5]}
        sx={{ border: 0 }}
        disableRowSelectionOnClick
      />
    </Paper>
  );
}

