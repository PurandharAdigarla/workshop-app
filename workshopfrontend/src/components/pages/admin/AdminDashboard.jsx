import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { workshopApi } from "../../../utils/api";
import { hasRole, logout } from "../../../utils/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  Box,
  Paper,
  Divider,
  Container,
  Alert,
  Snackbar,
  useTheme,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import SyncIcon from "@mui/icons-material/Sync";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid } from "@mui/x-data-grid";
import AddWorkshopDialog from "./AddWorkshopDialog";
import WorkshopDetailsDialog from "./WorkshopDetailsDialog";
import AttendeesDialog from "./AttendeesDialog";
import EditWorkshopDialog from "./EditWorkshopDialog";
import DeleteWorkshopDialog from "./DeleteWorkshopDialog";
import FeedbacksTable from "./FeedbacksTable";

const tabLabels = ["ongoing", "upcoming", "completed"];

export default function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("ongoing");
  const [tabIndex, setTabIndex] = useState(0);
  const [workshops, setWorkshops] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [attendeesDialogOpen, setAttendeesDialogOpen] = useState(false);
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [workshopToDelete, setWorkshopToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [updateWorkshopState, setUpdateWorkshopState] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if ((!token || !hasRole("ADMIN")) && location.pathname !== "/login") {
      navigate("/login");
      return;
    }

    window.history.pushState(null, "", location.pathname);
    const preventNavigation = (e) => {
      window.history.pushState(null, "", location.pathname);
    };

    window.addEventListener("popstate", preventNavigation);

    return () => {
      window.removeEventListener("popstate", preventNavigation);
    };
  }, [navigate, location.pathname]);

  const handleTabChange = (e, newIndex) => {
    setTabIndex(newIndex);
    setActiveTab(tabLabels[newIndex]);
  };

  const fetchWorkshops = async (type) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      let response;

      if (type === "upcoming") {
        response = await workshopApi.getUpcomingWorkshops();
      } else if (type === "ongoing") {
        response = await workshopApi.getOngoingWorkshops();
      } else if (type === "completed") {
        response = await workshopApi.getCompletedWorkshops();
      }

      const formatted = response.data.map((w, i) => ({
        id: i + 1,
        workshopId: w.workshopId,
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
      localStorage.removeItem("accessToken");
      if (location.pathname !== "/login") {
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    fetchWorkshops(activeTab);
  }, [activeTab, updateWorkshopState]);

  const handleLogout = () => {
    logout(navigate);
  };

  const handleUpdateWorkshopState = async () => {
    const response = await workshopApi.updateworkshopState();
    setUpdateWorkshopState(!updateWorkshopState);
  };

  const handleEdit = (workshop) => {
    setSelectedWorkshop(workshop);
    setOpenEditDialog(true);
  };

  const handleActionSuccess = (message) => {
    setSuccessMessage(message);
    setSnackbarOpen(true);
    fetchWorkshops(activeTab);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    setSuccessMessage("");
  };

  const columns = [
    {
      field: "workshopId",
      headerName: "ID",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "workshopTitle",
      headerName: "Title",
      width: 300,
      renderCell: (params) => (
        <Button
          variant="text"
          onClick={() => {
            setSelectedWorkshop(params.row);
            setDetailsDialogOpen(true);
          }}
          sx={{
            justifyContent: "flex-start",
            textAlign: "left",
            width: "100%",
          }}
        >
          {params.value}
        </Button>
      ),
    },
    {
      field: "workshopTopic",
      headerName: "Topic",
      width: 200,
    },
    {
      field: "workshopTutors",
      headerName: "Tutors",
      width: 200,
      headerAlign: "center",
      align: "center",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      width: 200,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "endDate",
      headerName: "End Date",
      width: 200,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 300,
      sortable: false,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            width: "100%",
            pt: 1,
          }}
        >
          {activeTab !== "completed" && (
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleEdit(params.row)}
              sx={{ borderRadius: 1 }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            color="error"
            onClick={() => {
              setWorkshopToDelete(params.row.workshopId);
              setConfirmDeleteOpen(true);
            }}
            sx={{ borderRadius: 1 }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => {
              setSelectedWorkshopId(params.row.workshopId);
              setAttendeesDialogOpen(true);
            }}
            sx={{ ml: 1, borderRadius: 1 }}
          >
            Attendees
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppBar position="static">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Admin Dashboard</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Tooltip title="Update workshop status">
              <IconButton
                color="inherit"
                onClick={handleUpdateWorkshopState}
                size="large"
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Workshop
            </Button>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} size="large">
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
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
          sx={{ mb: 3, pl: 1 }}
        >
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Workshops
        </Typography>

        <Paper
          elevation={1}
          sx={{
            width: "100%",
            borderRadius: 2,
            overflow: "hidden",
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
          />
        </Paper>

        {/* Feedbacks Section */}
        <Box sx={{ mt: 6 }}>
          <Divider sx={{ mb: 4 }} />
          <Typography
            variant="h5"
            color="primary"
            gutterBottom
            sx={{ mb: 3, pl: 1 }}
          >
            Workshop Feedbacks
          </Typography>
          <FeedbacksTable />
        </Box>
      </Container>

      <AddWorkshopDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          fetchWorkshops(activeTab);
        }}
        onSuccess={() => handleActionSuccess("Workshop added successfully")}
      />

      <WorkshopDetailsDialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        workshop={selectedWorkshop}
      />

      <AttendeesDialog
        open={attendeesDialogOpen}
        onClose={() => setAttendeesDialogOpen(false)}
        workshopId={selectedWorkshopId}
      />

      <EditWorkshopDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        workshop={selectedWorkshop}
        onSuccess={handleActionSuccess}
      />

      <DeleteWorkshopDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        workshopId={workshopToDelete}
        onDeleteSuccess={() =>
          handleActionSuccess("Workshop deleted successfully")
        }
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
