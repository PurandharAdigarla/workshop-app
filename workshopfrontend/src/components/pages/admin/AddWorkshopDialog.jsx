import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import axios from "axios";

function AddWorkshopDialog({ open, onClose }) {
  const initialFormState = {
    workshopTitle: "",
    workshopTopic: "",
    workshopObjective: "",
    workshopDescription: "",
    workshopInstructions: "",
    workshopTutors: "",
    startDate: new Date(),
    endDate: new Date(),
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    if (open) {
      setForm(initialFormState);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
  
    const startDate = new Date(form.startDate);
    startDate.setHours(0, 0, 0, 0);
  
    const endDate = new Date(form.endDate);
    endDate.setHours(0, 0, 0, 0); 
  
    if (startDate < today) {
      alert("Start date must be today or later.");
      return;
    }
  
    if (endDate <= startDate) {
      alert("End date must be after start date.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");

      const payload = {
        ...form,
        workshopTutors: form.workshopTutors
          .split(",")
          .map((tutor) => tutor.trim()),
      };

      await axios.post("http://localhost:8080/workshop", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Successfully added new workshop!");
      onClose();
    } catch (err) {
      console.error("Error creating workshop:", err);
      alert("Failed to create workshop");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Add New Workshop</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} mt={1}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Title"
              name="workshopTitle"
              value={form.workshopTitle}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Topic"
              name="workshopTopic"
              value={form.workshopTopic}
              onChange={handleChange}
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
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={form.endDate}
                onChange={(val) => handleDateChange("endDate", val)}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
          </LocalizationProvider>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddWorkshopDialog;
