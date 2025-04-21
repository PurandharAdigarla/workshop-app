import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useState } from "react";
import { workshopApi } from "../../../utils/api";
import Alert from "../../common/Alert";
import LoadingButton from "../../common/LoadingButton";

export default function DeleteWorkshopDialog({
  open,
  onClose,
  workshopId,
  onDeleteSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await workshopApi.deleteWorkshop(workshopId);
      setLoading(false);
      if (typeof onDeleteSuccess === 'function') {
        onDeleteSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Error deleting workshop:", err);
      setLoading(false);
      setErrorMsg(err.userMessage || "Failed to delete workshop.");
      setAlertOpen(true);
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
          <LoadingButton
            color="error"
            onClick={handleDelete}
            loading={loading}
            variant="contained"
          >
            Delete
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Alert
        open={alertOpen}
        message={errorMsg}
        severity="error"
        onClose={() => setAlertOpen(false)}
      />
    </>
  );
}
