import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { workshopApi } from "../../../utils/api";
import { hasRole, logout } from "../../../utils/auth";
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
  Container,
  Alert,
  Snackbar,
  useTheme,
  Chip,
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { DataGrid } from "@mui/x-data-grid";
import HowToRegIcon from '@mui/icons-material/HowToReg';
import EventNoteIcon from '@mui/icons-material/EventNote';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import WorkshopDetailsDialog from "./WorkshopDetailsDialog";
import RegisterForWorkshop from "./RegisterForWorkshop";
import DeRegisterDialog from "./DeRegisterDialog";
import FeedbackDialog from "./FeedbackDialog";
import AttendedComponent from "./AttendedComponent";

const tabLabels = ["ongoing", "upcoming", "completed", "registered"];

export default function AttendeeDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  
  const attendedComponentRef = useRef(null);

  const token = localStorage.getItem("accessToken");
  const attendeeId = localStorage.getItem("attendeeId");

  const handleTabChange = (e, newIndex) => {
    setTabIndex(newIndex);
    setActiveTab(tabLabels[newIndex]);
  };

  const fetchPendingFeedbacks = async () => {
    try {
      const res = await workshopApi.getPendingFeedbacks(attendeeId);
      setPendingFeedbacks(res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending feedbacks", err);
    }
  };

  const fetchRegisteredIds = async () => {
    try {
      const res = await workshopApi.getRegisteredWorkshops(attendeeId);
      const registered = res.data || [];
      const ids = registered.map((w) => Number(w.workshopId)).filter(Boolean);
      setRegisteredIds(ids);
    } catch (err) {
      console.error("Failed to fetch registered workshop IDs", err);
    }
  };

  const fetchWorkshops = async (type) => {
    if (!token || !attendeeId) {
      // Don't navigate if we're already on the login page
      if (location.pathname !== "/login") {
        navigate("/login");
      }
      return;
    }

    try {
      await fetchRegisteredIds();

      let response;
      if (type === "registered") {
        response = await workshopApi.getRegisteredWorkshops(attendeeId);
      } else if (type === "upcoming") {
        response = await workshopApi.getUpcomingWorkshops();
      } else if (type === "ongoing") {
        response = await workshopApi.getOngoingWorkshops();
      } else if (type === "completed") {
        response = await workshopApi.getCompletedWorkshops();
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
      // Don't navigate if we're already on the login page
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  };

  const handleRegister = async (workshopId) => {
    try {
      const res = await RegisterForWorkshop(workshopId);
      if (res.success) {
        await fetchWorkshops(activeTab);
        setSuccessMessage("Successfully registered for the workshop!");
        setSnackbarOpen(true);
      } else {
        setSuccessMessage(res.error?.response?.data || "Registration failed");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSuccessMessage("An error occurred during registration");
      setSnackbarOpen(true);
    }
  };

  useEffect(() => {
    // Check if user is logged in and has ATTENDEE role
    const accessToken = localStorage.getItem('accessToken');
    // Only redirect if we're not already on the login page
    // This prevents redirect loops
    if ((!accessToken || !hasRole("ATTENDEE")) && location.pathname !== "/login") {
      navigate('/login');
      return;
    }

    // Prevent back navigation to login page
    window.history.pushState(null, '', location.pathname);
    const handlePopState = () => {
      window.history.pushState(null, '', location.pathname);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate, location.pathname]);

  useEffect(() => {
    fetchWorkshops(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchPendingFeedbacks(); 
  }, []);

  const handleLogout = () => {
    logout(navigate);
  };

  const handleDeregisterClick = (workshop) => {
    setWorkshopToDeregister(workshop);
    setDeRegisterDialogOpen(true);
  };

  const handleDeregisterSuccess = async () => {
    try {
      // First refresh the registered IDs
      await fetchRegisteredIds();
      
      // Then refresh the current tab's data
      await fetchWorkshops(activeTab);
      
      // Show success message
      setSuccessMessage("Successfully deregistered from the workshop");
      setSnackbarOpen(true);
      
      // If we have the attended component ref, refresh it too
      if (attendedComponentRef.current) {
        attendedComponentRef.current.refreshAttendedWorkshops();
      }
    } catch (error) {
      console.error("Error refreshing workshops after deregistration:", error);
      setSuccessMessage("Deregistered successfully, but encountered an error refreshing the page. Please refresh manually.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const columns = [
    {
      field: "workshopTitle",
      headerName: "Title",
      width: 350,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => {
            setSelectedWorkshop(params.row);
            setDetailsDialogOpen(true);
          }}
          sx={{ 
            justifyContent: 'flex-start', 
            textAlign: 'left',
            width: '100%',
          }}
        >
          {params.value}
        </Button>
      ),
    },
    { 
      field: "workshopTopic", 
      headerName: "Topic", 
      width: 300,
    },
    { 
      field: "workshopTutors", 
      headerName: "Tutors", 
      width: 200,
      headerAlign: 'center',
      align: 'center',
    },
    { 
      field: "startDate", 
      headerName: "Start Date", 
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    { 
      field: "endDate", 
      headerName: "End Date", 
      width: 180,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 230,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const isRegistered = registeredIds.includes(params.row.workshopId);

        return (
          <Box sx={{ 
            display: "flex", 
            justifyContent: 'center', 
            width: '100%', 
            pt: 1
          }}>
            {activeTab === "completed" && (
              <Chip 
                label="Closed" 
                color="default" 
                size="small"
                icon={<DoNotDisturbIcon />}
              />
            )}

            {activeTab === "registered" && (
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => handleDeregisterClick(params.row)}
                startIcon={<DoNotDisturbIcon />}
                sx={{ borderRadius: 1 }}
              >
                Deregister
              </Button>
            )}

            {activeTab !== "completed" && activeTab !== "registered" && isRegistered && (
              <Chip 
                label="Registered" 
                color="success" 
                size="small"
                icon={<HowToRegIcon />}
              />
            )}

            {activeTab !== "completed" && activeTab !== "registered" && !isRegistered && (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                onClick={() => handleRegister(params.row.workshopId)}
                startIcon={<EventNoteIcon />}
                sx={{ borderRadius: 1 }}
              >
                Register
              </Button>
            )}
          </Box>
        );
      },
    },
  ];

  // Handler for when feedback is submitted
  const handleFeedbackSubmitted = () => {
    const next = feedbackIndex + 1;
    if (next < pendingFeedbacks.length) {
      setFeedbackIndex(next);
    } else {
      setPendingFeedbacks([]);
      fetchWorkshops(activeTab);
      
      // Refresh the attended workshops component
      if (attendedComponentRef.current) {
        attendedComponentRef.current.refreshAttendedWorkshops();
      }
    }
  };

  return (
    <Box sx={{ 
      minHeight: "100vh",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Attendee Dashboard</Typography>
          <IconButton color="inherit" onClick={handleLogout} size="large">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Box sx={{ bgcolor: theme.palette.background.paper }}>
        <Container maxWidth="xl">
          <Tabs
            value={tabIndex}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            disabled={pendingFeedbacks.length > 0}
            sx={{ mt: 1 }}
          >
            {tabLabels.map((label, i) => (
              <Tab 
                key={i} 
                label={label.charAt(0).toUpperCase() + label.slice(1)} 
              />
            ))}
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ flex: 1, mt: 4, mb: 6 }}>
        <Typography 
          variant="h5" 
          color="primary" 
          gutterBottom 
          sx={{ mb: 3, pl: 1}}
        >
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workshops
        </Typography>
        
        <Paper 
          elevation={1} 
          sx={{ 
            width: "100%", 
            borderRadius: 2,
            overflow: 'hidden',
            mb: 4
          }}
        >
          <DataGrid
            rows={workshops}
            columns={columns}
            autoHeight
            disableRowSelectionOnClick
            pageSizeOptions={[5, 10]}
            initialState={{
              pagination: { paginationModel: { pageSize: 5, page: 0 } },
            }}
            // sx={{ minHeight: 350 }}
          />
        </Paper>
      
        {/* Attended Workshops Section */}
        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 4 }} />
          <Typography 
            variant="h5" 
            color="primary" 
            gutterBottom 
            sx={{ mb: 3, pl: 1}}
          >
            Attended Workshops
          </Typography>
          <AttendedComponent ref={attendedComponentRef} attendeeId={attendeeId} />
        </Box>
      </Container>

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
        workshopTitle={workshopToDeregister?.workshopTitle}
        onSuccess={handleDeregisterSuccess}
      />

      {pendingFeedbacks.length > 0 && (
        <FeedbackDialog
          open={true}
          workshop={pendingFeedbacks[feedbackIndex]}
          attendeeId={attendeeId}
          onSubmitted={handleFeedbackSubmitted}
        />
      )}

      <Snackbar 
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
