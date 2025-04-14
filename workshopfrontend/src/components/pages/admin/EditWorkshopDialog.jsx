import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

const EditWorkshopDialog = ({ open, onClose, workshop }) => {
  const [form, setForm] = useState({
    workshopTitle: "",
    workshopTopic: "",
    workshopObjective: "",
    workshopDescription: "",
    workshopInstructions: "",
    workshopTutors: "",
    startDate: new Date(),
    endDate: new Date(),
  });

  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dateHelperText, setDateHelperText] = useState({
    startDate: "",
    endDate: "",
  });

  const getWorkshopState = () => {
    if (!workshop) return { isOngoing: false, isUpcoming: false, isCompleted: false };
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(workshop.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(workshop.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    const isOngoing = (startDate <= currentDate) && (endDate >= currentDate);
    const isUpcoming = startDate > currentDate;
    const isCompleted = endDate < currentDate;
    
    console.log("Workshop state calculation:", {
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      currentDate: currentDate.toLocaleDateString(),
      isOngoing,
      isUpcoming,
      isCompleted
    });
    
    return { isOngoing, isUpcoming, isCompleted };
  };
  
  const { isOngoing, isUpcoming, isCompleted } = getWorkshopState();

  useEffect(() => {
    if (workshop) {
      try {
        const startDate = new Date(workshop.startDate);
        const endDate = new Date(workshop.endDate);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.error("Invalid date format in workshop data", { 
            startDate: workshop.startDate, 
            endDate: workshop.endDate 
          });
          setError("Workshop contains invalid date format");
          return;
        }
        
        setForm({
          workshopTitle: workshop.workshopTitle || "",
          workshopTopic: workshop.workshopTopic || "",
          workshopObjective: workshop.workshopObjective || "",
          workshopDescription: workshop.workshopDescription || "",
          workshopInstructions: workshop.workshopInstructions || "",
          workshopTutors: Array.isArray(workshop.workshopTutors) 
            ? workshop.workshopTutors.join(", ") 
            : workshop.workshopTutors || "",
          startDate,
          endDate,
        });
        setError("");
        
        if (isCompleted) {
          setDateHelperText({
            startDate: "Dates cannot be modified for completed workshops",
            endDate: "Dates cannot be modified for completed workshops",
          });
        } else if (isOngoing) {
          setDateHelperText({
            startDate: "Start date cannot be modified for ongoing workshops",
            endDate: "End date must be today or later for ongoing workshops",
          });
        } else if (isUpcoming) {
          setDateHelperText({
            startDate: "Start date must be today or later",
            endDate: "End date must be today or later",
          });
        } else {
          setDateHelperText({
            startDate: "",
            endDate: "",
          });
        }
      } catch (err) {
        console.error("Error setting up form data", err);
        setError("Error loading workshop data");
      }
    }
  }, [workshop, isOngoing, isUpcoming, isCompleted]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (key, value) => {
    if (isCompleted) {
      return;
    }
    
    if (key === "startDate" && isOngoing) {
      return;
    }
    
    if (value && !isNaN(new Date(value).getTime())) {
      setForm((prev) => ({ ...prev, [key]: value }));
    }
  };

  const formatDateForBackend = (date) => {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  const validateDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(form.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(form.endDate);
    endDate.setHours(0, 0, 0, 0);
    
    console.log("Validating dates:", {
      isOngoing,
      isUpcoming,
      isCompleted,
      startDate: startDate.toLocaleDateString(),
      endDate: endDate.toLocaleDateString(),
      today: today.toLocaleDateString()
    });
    
    if (isCompleted) {
      const originalStartDate = new Date(workshop.startDate);
      const originalEndDate = new Date(workshop.endDate);
      
      if (startDate.getTime() !== originalStartDate.getTime() ||
          endDate.getTime() !== originalEndDate.getTime()) {
        setError("Dates cannot be modified for completed workshops");
        return false;
      }
    }
    
    if (endDate <= startDate) {
      setError("End date must be after start date");
      return false;
    }
    
    if (isOngoing) {
      const originalStartDate = new Date(workshop.startDate);
      originalStartDate.setHours(0, 0, 0, 0);
      
      if (startDate.getTime() !== originalStartDate.getTime()) {
        setError("Start date cannot be modified for ongoing workshops");
        return false;
      }
      
      if (endDate < today) {
        setError("End date must be today or later for ongoing workshops");
        return false;
      }
    }
    
    if (isUpcoming) {
      if (startDate < today) {
        setError("Start date must be today or later for upcoming workshops");
        return false;
      }
      
      if (endDate < today) {
        setError("End date must be today or later for upcoming workshops");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    if (!form.workshopTitle || !form.workshopTopic) {
      setError("Title and Topic are required");
      setLoading(false);
      return;
    }
    
    if (!validateDates()) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError("You are not authenticated. Please log in again.");
        setLoading(false);
        return;
      }

      const formattedStartDate = formatDateForBackend(form.startDate);
      const formattedEndDate = formatDateForBackend(form.endDate);
      
      console.log("Formatted dates:", { 
        startDate: formattedStartDate, 
        endDate: formattedEndDate,
        originalStartDate: form.startDate.toLocaleDateString(),
        originalEndDate: form.endDate.toLocaleDateString()
      });

      const payload = {
        workshopId: workshop.workshopId,
        workshopTitle: form.workshopTitle,
        workshopTopic: form.workshopTopic,
        workshopObjective: form.workshopObjective,
        workshopDescription: form.workshopDescription,
        workshopInstructions: form.workshopInstructions,
        workshopTutors: form.workshopTutors
          .split(",")
          .map((tutor) => tutor.trim())
          .filter(Boolean),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };

      console.log("Sending payload:", payload);

      const response = await axios.patch(
        `http://localhost:8080/workshop/${workshop.workshopId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Edit response:", response.data);
      setShowSuccessAlert(true);

      setTimeout(() => {
        setShowSuccessAlert(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating workshop:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to edit workshops. Please log in again with admin credentials.");
        localStorage.removeItem("accessToken"); 
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("accessToken"); 
      } else {
        const errorMessage = err?.response?.data || "Failed to update workshop";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = () => {
    if (isCompleted) return "(Completed Workshop - Dates cannot be modified)";
    if (isOngoing) return "(Ongoing Workshop - Start date cannot be modified)";
    if (isUpcoming) return "(Upcoming Workshop)";
    return "";
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Edit Workshop 
        <Typography variant="caption" color="primary" display="block">
          {getStatusLabel()}
        </Typography>
      </DialogTitle>

      <DialogContent>
        {showSuccessAlert && (
          <Alert severity="success" variant="filled" sx={{ mb: 2 }}>
            Workshop updated successfully!
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Title"
              name="workshopTitle"
              value={form.workshopTitle}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Topic"
              name="workshopTopic"
              value={form.workshopTopic}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Objective"
              name="workshopObjective"
              value={form.workshopObjective}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              inputProps={{ maxLength: 1000 }}
              label="Description"
              name="workshopDescription"
              value={form.workshopDescription}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              inputProps={{ maxLength: 1000 }}
              label="Instructions"
              name="workshopInstructions"
              value={form.workshopInstructions}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tutors (comma-separated)"
              name="workshopTutors"
              value={form.workshopTutors}
              onChange={handleChange}
            />
          </Grid>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={form.startDate}
                onChange={(val) => handleDateChange("startDate", val)}
                disabled={isOngoing || isCompleted}
                minDate={isUpcoming ? new Date() : undefined}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    helperText: dateHelperText.startDate,
                    error: (isOngoing && form.startDate.getTime() !== new Date(workshop?.startDate).getTime()) || 
                           (isCompleted && form.startDate.getTime() !== new Date(workshop?.startDate).getTime())
                  } 
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={form.endDate}
                onChange={(val) => handleDateChange("endDate", val)}
                disabled={isCompleted}
                minDate={isOngoing || isUpcoming ? new Date() : undefined}
                slotProps={{ 
                  textField: { 
                    fullWidth: true,
                    helperText: dateHelperText.endDate,
                    error: (isCompleted && form.endDate.getTime() !== new Date(workshop?.endDate).getTime())
                  } 
                }}
              />
            </Grid>
          </LocalizationProvider>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWorkshopDialog;
