import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
} from "@mui/material";
import { useState } from "react";
import DeRegisterWorkshop from "./DeRegisterWorkshop";
import Alert from "../../../components/common/Alert";
import LoadingButton from "../../../components/common/LoadingButton";

export default function DeRegisterDialog({
    open,
    onClose,
    attendeeId,
    workshopId,
    onSuccess,
    workshopTitle,
}) {
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [alertOpen, setAlertOpen] = useState(false);

    const handleDeregister = async () => {
        if (!attendeeId || !workshopId) {
            setErrorMsg("Missing workshop or attendee information");
            setAlertOpen(true);
            return;
        }
        
        setLoading(true);
        setErrorMsg("");
        
        try {
            const result = await DeRegisterWorkshop(workshopId);
            
            if (result.success) {
                if (onSuccess) {
                    onSuccess();
                }
                setLoading(false);
                onClose();
            } else {
                console.error("Deregistration failed:", result.error);
                setLoading(false);
                setErrorMsg(result.message || "Failed to deregister from workshop.");
                setAlertOpen(true);
            }
        } catch (err) {
            console.error("Unexpected error during deregistration:", err);
            setLoading(false);
            setErrorMsg("An unexpected error occurred. Please try again.");
            setAlertOpen(true);
        }
    };

    return (
        <>
            <Dialog 
                open={open} 
                onClose={!loading ? onClose : undefined} 
                maxWidth="sm" 
                fullWidth
                disableEscapeKeyDown={loading}
            >
                <DialogTitle>Confirm Deregistration</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        Are you sure you want to deregister from {workshopTitle ? `"${workshopTitle}"` : "this workshop"}?
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        You will need to re-register if you want to attend this workshop in the future.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 1 }}>
                        <Button onClick={onClose} disabled={loading} color="inherit">
                            Cancel
                        </Button>
                        <LoadingButton
                            color="error"
                            onClick={handleDeregister}
                            loading={loading}
                            variant="contained"
                        >
                            Deregister
                        </LoadingButton>
                    </Box>
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
  