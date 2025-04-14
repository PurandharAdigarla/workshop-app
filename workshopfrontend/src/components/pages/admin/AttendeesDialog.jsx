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
} from "@mui/material";
import axios from "axios";

function AttendeesDialog({ open, onClose, workshopId }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAttendees = async () => {
    if (!workshopId) return;

    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken"); // Get token from storage
      const res = await axios.get(
        `http://localhost:8080/workshop/${workshopId}/registrations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Registered Attendees</DialogTitle>
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
        <Button variant="contained">Add New Attendee</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AttendeesDialog;
