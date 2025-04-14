import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Snackbar,
    Alert,
    CircularProgress,
  } from "@mui/material";
  import { useState } from "react";
  import DeRegisterWorkshop from "./DeRegisterWorkshop";
  
  export default function DeRegisterDialog({
    open,
    onClose,
    attendeeId,
    workshopId,
    onSuccess,
  }) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
  
    const handleDeregister = async () => {
      if (!attendeeId || !workshopId) {
        setErrorMsg("Missing workshop or attendee information");
        return;
      }
      
      setLoading(true);
      
      const result = await DeRegisterWorkshop(workshopId);
      
      if (result.success) {
        setLoading(false);
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        console.error("Deregistration failed:", result.error);
        setLoading(false);
        setErrorMsg(result.message || "Failed to deregister from workshop.");
      }
    };
  
    return (
        <>
          <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirm Deregistration</DialogTitle>
            <DialogContent>
              Are you sure you want to deregister from this workshop?
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                color="error"
                onClick={handleDeregister}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                Deregister
              </Button>
            </DialogActions>
          </Dialog>
    
          <Snackbar
            open={!!errorMsg}
            autoHideDuration={3000}
            onClose={() => setErrorMsg("")}
          >
            <Alert onClose={() => setErrorMsg("")} severity="error" sx={{ width: "100%" }}>
              {errorMsg}
            </Alert>
          </Snackbar>
        </>
    );
  }
  