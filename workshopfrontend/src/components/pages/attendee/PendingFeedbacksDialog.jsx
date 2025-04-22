import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box
} from '@mui/material';
import FeedbackIcon from '@mui/icons-material/Feedback';

export default function PendingFeedbacksDialog({ open, onClose, workshops, onSelectWorkshop }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Pending Feedbacks
      </DialogTitle>
      <DialogContent dividers>
        {workshops.length > 0 ? (
          <List sx={{ py: 0 }}>
            {workshops.map((workshop, index) => (
              <ListItem key={index} disablePadding divider={index < workshops.length - 1}>
                <ListItemButton 
                  onClick={() => onSelectWorkshop(index)}
                  sx={{ py: 2 }}
                >
                  <FeedbackIcon sx={{ mr: 2, color: 'primary.main' }} />
                  <ListItemText 
                    primary={workshop.workshopTitle} 
                    secondary={`${workshop.workshopTopic} (${workshop.startDate} - ${workshop.endDate})`}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No pending feedbacks
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
} 