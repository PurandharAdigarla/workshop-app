import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useState } from "react";

export default function DeleteWorkshopDialog({
  open,
  onClose,
  workshopId,
  onDeleteSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`http://localhost:8080/workshop/${workshopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setLoading(false);
      if (typeof onDeleteSuccess === 'function') {
        onDeleteSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Error deleting workshop:", err);
      setLoading(false);
      setErrorMsg("Failed to delete workshop.");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this workshop?
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            color="error"
            onClick={handleDelete}
            disabled={loading}
          >
            Delete
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
