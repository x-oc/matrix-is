import { useState, useEffect } from "react";
import { Alert, AlertTitle, Snackbar, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface Notification {
    id: string;
    type: "warning" | "error" | "info";
    title: string;
    message: string;
    timestamp: Date;
}

interface NotificationSystemProps {
    notifications: Notification[];
    onClose: (id: string) => void;
}

export default function NotificationSystem({ notifications, onClose }: NotificationSystemProps) {
    const [open, setOpen] = useState(false);
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            setCurrentNotification(latest);
            setOpen(true);
        }
    }, [notifications]);

    const handleClose = () => {
        setOpen(false);
        if (currentNotification) {
            onClose(currentNotification.id);
        }
    };

    if (!currentNotification) return null;

    return (
        <Snackbar
            open={open}
            autoHideDuration={8000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                severity={currentNotification.type}
                variant="filled"
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                sx={{ minWidth: 400 }}
            >
                <AlertTitle>{currentNotification.title}</AlertTitle>
                {currentNotification.message}
            </Alert>
        </Snackbar>
    );
}
