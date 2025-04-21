import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RefreshIcon from '@mui/icons-material/Refresh';
import { workshopApi } from "../../../utils/api";
import AddAttendeeDialog from "./AddAttendeeDialog";

function AttendeesDialog({ open, onClose, workshopId }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addAttendeeDialogOpen, setAddAttendeeDialogOpen] = useState(false);

  const fetchAttendees = async () => {
    if (!workshopId) return;

    try {
      setLoading(true);

      const res = await workshopApi.getRegistrations(workshopId);

      const fetchedAttendees = Array.isArray(res.data.attendees)
        ? res.data.attendees
        : [];
      setAttendees(fetchedAttendees);
    } catch (err) {
      console.error("Failed to fetch attendees:", err);
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && workshopId) {
      fetchAttendees();
    }
  }, [open, workshopId]);

  const handleAddAttendee = () => {
    setAddAttendeeDialogOpen(true);
  };

  const handleAttendeeAdded = () => {
    fetchAttendees(); // Refresh the attendee list
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Workshop Attendees</Typography>
          <Box>
            <Tooltip title="Refresh list">
              <IconButton onClick={fetchAttendees} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Add new attendee">
              <IconButton onClick={handleAddAttendee} disabled={loading} color="primary">
                <PersonAddIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : attendees.length === 0 ? (
          <Typography>No attendees registered for this workshop.</Typography>
        ) : (
          <List>
            {attendees.map((attendee, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={attendee.attendeeName}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Email: {attendee.attendeeEmail}
                        </Typography>
                        <br />
                        <Typography component="span" variant="body2">
                          Phone: {attendee.attendeePhoneNumber}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {index < attendees.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
      
      {/* Add Attendee Dialog */}
      <AddAttendeeDialog
        open={addAttendeeDialogOpen}
        onClose={() => setAddAttendeeDialogOpen(false)}
        workshopId={workshopId}
        onAttendeeAdded={handleAttendeeAdded}
      />
    </Dialog>
  );
}

export default AttendeesDialog;
