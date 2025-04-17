import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Rating,
  Divider,
  Box,
  List,
  ListItem,
  Paper
} from '@mui/material';

export default function FeedbackDetailsDialog({ open, onClose, feedback }) {
  if (!feedback) return null;

  const feedbackList = feedback.feedbacks || [];
  const averageRating = feedback.averageRating || 0;
  const totalFeedbacks = feedback.totalFeedbacks || 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">
          Feedback for {feedback.workshopTitle}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Workshop ended on: {feedback.endDate}
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ mr: 2 }}>
            Overall Rating:
          </Typography>
          <Rating value={averageRating} precision={0.1} readOnly />
          <Typography variant="body1" sx={{ ml: 1 }}>
            ({averageRating.toFixed(1)})
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Based on {totalFeedbacks} feedbacks
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>
          Individual Feedbacks
        </Typography>
        
        <List>
          {feedbackList.map((item, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1">
                    {item.attendeeName || 'Anonymous'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating value={item.rating || 0} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({item.rating || 0}/5)
                    </Typography>
                  </Box>
                </Box>
                
                <Typography variant="body2" color="text.secondary">
                  {item.comment || 'No comment provided.'}
                </Typography>
              </Paper>
            </ListItem>
          ))}
          
          {feedbackList.length === 0 && (
            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', my: 3 }}>
              No detailed feedback available.
            </Typography>
          )}
        </List>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
} 