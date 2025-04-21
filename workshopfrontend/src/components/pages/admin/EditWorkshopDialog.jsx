import React, { useState } from "react";
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
import { workshopApi } from "../../../utils/api";
import useWorkshopForm, { ERROR_MESSAGES } from "../../../hooks/useWorkshopForm";

/**
 * Dialog component for editing workshop details
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Object} props.workshop - Workshop data to edit
 * @param {Function} props.onSuccess - Function to call on successful edit
 */
const EditWorkshopDialog = ({ open, onClose, workshop, onSuccess }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [loading, setLoading] = useState(false);

  // Use our custom hook for form state and validation
  const {
    form,
    error,
    setError,
    dateHelperText,
    workshopState,
    handleChange,
    handleDateChange,
    validateForm,
    getFormData
  } = useWorkshopForm(workshop);

  const { isOngoing, isUpcoming, isCompleted } = workshopState;

  /**
   * Gets a label describing the workshop's status
   * @returns {string} The status label
   */
  const getStatusLabel = () => {
    if (isCompleted) return "(Completed Workshop - Dates cannot be modified)";
    if (isOngoing) return "(Ongoing Workshop - Start date cannot be modified)";
    if (isUpcoming) return "(Upcoming Workshop)";
    return "";
  };

  /**
   * Handles form submission
   */
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    // Validate form
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        setError(ERROR_MESSAGES.NOT_AUTHENTICATED);
        setLoading(false);
        return;
      }

      // Get form data ready for submission
      // All form fields are trimmed to remove leading and trailing whitespace
      const payload = getFormData();
      console.log("Sending payload:", payload);

      // Submit form data
      const response = await workshopApi.editWorkshop(workshop.workshopId, payload);
      console.log("Edit response:", response.data);
      
      // Show success message
      setShowSuccessAlert(true);

      // Call success callback
      if (typeof onSuccess === 'function') {
        onSuccess("Workshop updated successfully");
      }

      // Close dialog after a delay
      setTimeout(() => {
        setShowSuccessAlert(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error updating workshop:", err);
      
      // Handle different error types
      if (err.response?.status === 403) {
        setError("Access denied. You don't have permission to edit workshops. Please log in again with admin credentials.");
        localStorage.removeItem("accessToken"); 
      } else if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        localStorage.removeItem("accessToken"); 
      } else {
        const errorMessage = err.userMessage || err.response?.data || "Failed to update workshop";
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
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
              required
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
                    error: Boolean(dateHelperText.startDate && (isOngoing || isCompleted))
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
                    error: Boolean(dateHelperText.endDate && isCompleted)
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
          color="primary" 
          disabled={loading || isCompleted}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? "Updating..." : "Update Workshop"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditWorkshopDialog;
