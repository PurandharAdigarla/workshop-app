import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Box,
  Paper,
  Button,
  Divider,
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { DataGrid } from "@mui/x-data-grid";
import AccountCircle from "@mui/icons-material/AccountCircle";
import WorkshopDetailsDialog from "./WorkshopDetailsDialog";
import RegisterForWorkshop from "./RegisterForWorkshop";
import DeRegisterDialog from "./DeRegisterDialog";
import FeedbackDialog from "./FeedbackDialog"; // 💡 Import
import AttendedComponent from "./AttendedComponent";

const tabLabels = ["ongoing", "upcoming", "completed", "registered"];

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("ongoing");
  const [tabIndex, setTabIndex] = useState(0);
  const [workshops, setWorkshops] = useState([]);
  const [registeredIds, setRegisteredIds] = useState([]);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [deRegisterDialogOpen, setDeRegisterDialogOpen] = useState(false);
  const [workshopToDeregister, setWorkshopToDeregister] = useState(null);

  const [pendingFeedbacks, setPendingFeedbacks] = useState([]);
  const [feedbackIndex, setFeedbackIndex] = useState(0);

  const token = localStorage.getItem("accessToken");
  const attendeeId = localStorage.getItem("attendeeId");

  const handleTabChange = (e, newIndex) => {
    setTabIndex(newIndex);
    setActiveTab(tabLabels[newIndex]);
  };

  const fetchPendingFeedbacks = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/workshop/pending-feedbacks/${attendeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPendingFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending feedbacks", err);
    }
  };

  const fetchRegisteredIds = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/workshop/registered/${attendeeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const registered = res.data || [];
      const ids = registered.map((w) => Number(w.workshopId)).filter(Boolean);
      setRegisteredIds(ids);
    } catch (err) {
      console.error("Failed to fetch registered workshop IDs", err);
    }
  };

  const fetchWorkshops = async (type) => {
    if (!token || !attendeeId) {
      navigate("/attendee/login");
      return;
    }

    try {
      await fetchRegisteredIds();

      let response;
      if (type === "registered") {
        response = await axios.get(
          `http://localhost:8080/workshop/registered/${attendeeId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        response = await axios.get(
          `http://localhost:8080/workshop/${type}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      const formatted = (response.data || []).map((w, i) => ({
        id: i + 1,
        workshopId: Number(w.workshopId),
        workshopTitle: w.workshopTitle,
        workshopTopic: w.workshopTopic,
        workshopObjective: w.workshopObjective,
        workshopDescription: w.workshopDescription,
        workshopInstructions: w.workshopInstructions,
        startDate: new Date(w.startDate).toLocaleDateString(),
        endDate: new Date(w.endDate).toLocaleDateString(),
        workshopTutors: w.workshopTutors,
      }));

      setWorkshops(formatted);
    } catch (error) {
      console.error("Fetch failed:", error);
      localStorage.clear();
      navigate("/attendee/login");
    }
  };

  const handleRegister = async (workshopId) => {
    const res = await RegisterForWorkshop(workshopId);
    if (res.success) {
      await fetchWorkshops(activeTab);
    } else {
      alert(res.error?.response?.data || "Registration failed");
    }
  };

  useEffect(() => {
    fetchWorkshops(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchPendingFeedbacks(); 
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/attendee/login");
  };

  const handleDeregisterClick = (workshop) => {
    setWorkshopToDeregister(workshop);
    setDeRegisterDialogOpen(true);
  };

  const handleDeregisterSuccess = async () => {
    if (activeTab === "registered") {
      await fetchWorkshops("registered");
    } else {
      await fetchRegisteredIds();
      await fetchWorkshops(activeTab);
    }
    
    alert("Successfully deregistered from the workshop");
  };

  const columns = [
    {
      field: "workshopTitle",
      headerName: "Title",
      width: 400,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => {
            setSelectedWorkshop(params.row);
            setDetailsDialogOpen(true);
          }}
        >
          {params.value}
        </Button>
      ),
    },
    { field: "workshopTopic", headerName: "Topic", width: 350 },
    { field: "workshopTutors", headerName: "Tutors", width: 350 },
    { field: "startDate", headerName: "Start", width: 200 },
    { field: "endDate", headerName: "End", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      sortable: false,
      renderCell: (params) => {
        const isRegistered = registeredIds.includes(params.row.workshopId);

        if (activeTab === "completed") {
          return (
            <Button variant="contained" disabled>
              CLOSED
            </Button>
          );
        }

        if (activeTab === "registered") {
          return (
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeregisterClick(params.row)}
            >
              De-register
            </Button>
          );
        }

        return (
          <Button
            variant="outlined"
            color={isRegistered ? "inherit" : "primary"}
            disabled={isRegistered}
            onClick={() => handleRegister(params.row.workshopId)}
          >
            {isRegistered ? "Registered" : "Register"}
          </Button>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "100vw", minHeight: "100vh", bgcolor: "#f9f9f9", overflow: "auto", pb: 4 }}>
      <AppBar position="static" sx={{ px: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Attendee Dashboard</Typography>
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="primary"
        variant="fullWidth"
        disabled={pendingFeedbacks.length > 0}
      >
        {tabLabels.map((label, i) => (
          <Tab key={i} label={label.toUpperCase()} />
        ))}
      </Tabs>

      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="primary" gutterBottom sx={{ mb: 2 }}>
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workshops
        </Typography>
        <Paper elevation={0} sx={{ width: "100%" }}>
          <DataGrid
            rows={workshops}
            columns={columns}
            pageSizeOptions={[5]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            sx={{ 
              minHeight: 350,
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f5f5f5',
              }
            }}
          />
        </Paper>
      </Box>
      
      {/* Attended Workshops Section */}
      <Box sx={{ px: 3, pt: 0 }}>
        <Divider sx={{ my: 3 }} />
        <Typography variant="h5" color="primary" gutterBottom sx={{ mb: 2 }}>
          Attended Workshops
        </Typography>
        <AttendedComponent />
      </Box>

      <WorkshopDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        workshop={selectedWorkshop}
      />

      <DeRegisterDialog
        open={deRegisterDialogOpen}
        onClose={() => setDeRegisterDialogOpen(false)}
        attendeeId={attendeeId}
        workshopId={workshopToDeregister?.workshopId}
        onSuccess={handleDeregisterSuccess}
      />

      {pendingFeedbacks.length > 0 && (
        <FeedbackDialog
          open={true}
          workshop={pendingFeedbacks[feedbackIndex]}
          attendeeId={attendeeId}
          onSubmitted={() => {
            const next = feedbackIndex + 1;
            if (next < pendingFeedbacks.length) {
              setFeedbackIndex(next);
            } else {
              setPendingFeedbacks([]);
              fetchWorkshops(activeTab);
            }
          }}
        />
      )}
    </Box>
  );
}
