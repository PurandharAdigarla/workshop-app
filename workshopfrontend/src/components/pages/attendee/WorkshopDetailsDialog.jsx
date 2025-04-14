import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";

const WorkshopDetailsDialog = ({ open, onClose, workshop }) => {
  if (!workshop) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Workshop Details</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1}>
          <Typography>
            <strong>Title:</strong> {workshop.workshopTitle}
          </Typography>
          <Typography>
            <strong>Topic:</strong> {workshop.workshopTopic}
          </Typography>
          <Typography>
            <strong>Objective:</strong> {workshop.workshopObjective}
          </Typography>
          <Typography>
            <strong>Tutors:</strong>{" "}
            {workshop.workshopTutors?.length
              ? workshop.workshopTutors.join(", ")
              : "—"}
          </Typography> 
          <Typography>
  <strong>Start:</strong> {workshop.startDate}
</Typography>
<Typography>
  <strong>End:</strong> {workshop.endDate}
</Typography>

          <Typography>
            <strong>Description:</strong> {workshop.workshopDescription || "—"}
          </Typography>
          <Typography>
            <strong>Instructions:</strong>{" "}
            {workshop.workshopInstructions || "—"}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WorkshopDetailsDialog;
