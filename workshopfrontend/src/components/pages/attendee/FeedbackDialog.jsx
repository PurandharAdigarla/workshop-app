import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    MenuItem,
    Snackbar,
    Alert,
    Box
  } from "@mui/material";
  import { useState } from "react";
  import { workshopApi } from "../../../utils/api";
  
  export default function FeedbackDialog({ open, onClose, workshop, attendeeId, onSubmitted }) {
    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
  
    const handleSubmit = async () => {
      if (rating === "") {
        setError("Please provide a rating");
        return;
      }
  
      try {
        await workshopApi.submitFeedback({
          attendeeId: Number(attendeeId),
          workshopId: Number(workshop.workshopId),
          rating: Number(rating),
          comment
        });
  
        setRating("");
        setComment("");
        onSubmitted(); 
      } catch (err) {
        setError(err.userMessage || err.response?.data || "Failed to submit feedback");
      }
    };
  
    const handleClose = () => {
      if (onClose) {
        onClose();
      }
    };
  
    return (
      <>
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Feedback for "{workshop?.workshopTitle}"</DialogTitle>
          <DialogContent>
            <Typography>Rate this workshop (0 - 5):</Typography>
            <TextField
              fullWidth
              select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              sx={{ mt: 1 }}
            >
              {[0, 1, 2, 3, 4, 5].map((val) => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
  
            <TextField
              label="Suggestions / Comments (optional)"
              multiline
              fullWidth
              minRows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 1 }}>
              <Button onClick={handleClose} color="inherit">Close</Button>
              <Button variant="contained" color="primary" onClick={handleSubmit}>Submit</Button>
            </Box>
          </DialogActions>
        </Dialog>
  
        <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError("")}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
      </>
    );
  }
  