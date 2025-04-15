import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
} from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import EditNoteTwoToneIcon from '@mui/icons-material/EditNoteTwoTone';
import DeleteIcon from '@mui/icons-material/Delete';
import { DataGrid } from "@mui/x-data-grid";
import AddWorkshopDialog from "./AddWorkshopDialog";
import WorkshopDetailsDialog from "./WorkshopDetailsDialog";
import AttendeesDialog from "./AttendeesDialog";
import EditWorkshopDialog from "./EditWorkshopDialog";
import DeleteWorkshopDialog from "./DeleteWorkshopDialog";
 
const tabLabels = ["ongoing", "upcoming", "completed"];

export default function AdminDashboard() {
  const navigate = useNavigate();
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

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      navigate("/admin/login");
    }
  }, []);

  const handleTabChange = (e, newIndex) => {
    setTabIndex(newIndex);
    setActiveTab(tabLabels[newIndex]);
  };

  const fetchWorkshops = async (type) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await axios.get(
        `http://localhost:8080/workshop/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
      navigate("/admin/login");
    }
  };

  useEffect(() => {
    fetchWorkshops(activeTab);
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/admin/login");
  };

  const handleEdit = (workshop) => {
    setSelectedWorkshop(workshop);
    setOpenEditDialog(true);
  };

  const columns = [
    { field: "workshopId", headerName: "Workshop Id", width: 140 },
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
    { field: "workshopTutors", headerName: "Tutors", width: 250 },
    { field: "startDate", headerName: "Start", width: 200 },
    { field: "endDate", headerName: "End", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 400,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ pt: "10px" }} display="flex" gap={3}>
          {activeTab !== "completed" && (
            <IconButton
              size="small"
              variant="outlined"
              onClick={() => handleEdit(params.row)}
            >
              <EditNoteTwoToneIcon/>
            </IconButton>
          )}
          <IconButton
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              setWorkshopToDelete(params.row.workshopId);
              setConfirmDeleteOpen(true);
            }}
          >
            <DeleteIcon/>
          </IconButton>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => {
              setSelectedWorkshopId(params.row.workshopId);
              setAttendeesDialogOpen(true);
            }}
          >
            Attendees
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ width: "100vw", height: "100vh", bgcolor: "#f9f9f9" }}>
      <AppBar position="static" sx={{ px: 2 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Admin Dashboard</Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Button variant="contained" onClick={() => setOpenDialog(true)}>
              <b>Add Workshop</b>
            </Button>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon/>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        indicatorColor="secondary"
        textColor="primary"
        variant="fullWidth"
      >
        {tabLabels.map((label, i) => (
          <Tab key={i} label={label.toUpperCase()} />
        ))}
      </Tabs>

      <Box sx={{ p: 3 }}>
        <Paper sx={{ height: 423, width: "100%" }}>
          <DataGrid
            rows={workshops}
            columns={columns}
            pageSizeOptions={[6]}
            initialState={{
              pagination: { paginationModel: { pageSize: 6, page: 0 } },
            }}
          />
        </Paper>
      </Box>

      <AddWorkshopDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          fetchWorkshops(activeTab);
        }}
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
        onClose={() => {
          setOpenEditDialog(false);
          fetchWorkshops(activeTab);
        }}
        workshop={selectedWorkshop}
      />

      <DeleteWorkshopDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        workshopId={workshopToDelete}
        onDeleteSuccess={() => {
          fetchWorkshops(activeTab);
          setSuccessMessage("Workshop deleted successfully.");
        }}
      />
    </Box>
  );
}
