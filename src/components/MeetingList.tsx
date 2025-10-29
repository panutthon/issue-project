import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Event as EventIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useApp } from "../utils/hooks";
import type { Meeting } from "../app-types";

const MeetingCard: React.FC<{
  meeting: Meeting;
  onEdit: (meeting: Meeting) => void;
  onDelete: (id: string) => void;
  index: number;
}> = ({ meeting, onEdit, onDelete, index }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(meeting);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(meeting.id);
    handleMenuClose();
  };

  const getStatusCounts = () => {
    const pending = meeting.issues.filter((i) => i.status === "pending").length;
    const inProgress = meeting.issues.filter(
      (i) => i.status === "in progress"
    ).length;
    const solved = meeting.issues.filter((i) => i.status === "solved").length;
    return { pending, inProgress, solved };
  };

  const statusCounts = getStatusCounts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card sx={{ height: "100%", position: "relative" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                component={Link}
                to={`/meetings/${meeting.id}`}
                sx={{
                  textDecoration: "none",
                  color: "inherit",
                  "&:hover": { color: "primary.main" },
                }}
              >
                {meeting.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {meeting.client}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
              >
                <EventIcon sx={{ fontSize: 16, mr: 0.5 }} />
                {new Date(meeting.date).toLocaleDateString()}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
            <Chip
              label={`${meeting.issues.length} issues`}
              size="small"
              variant="outlined"
            />
            {statusCounts.pending > 0 && (
              <Chip
                label={`${statusCounts.pending} pending`}
                size="small"
                color="warning"
              />
            )}
            {statusCounts.inProgress > 0 && (
              <Chip
                label={`${statusCounts.inProgress} in progress`}
                size="small"
                color="info"
              />
            )}
            {statusCounts.solved > 0 && (
              <Chip
                label={`${statusCounts.solved} solved`}
                size="small"
                color="success"
              />
            )}
          </Box>

          {meeting.issues.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Recent Issues:
              </Typography>
              {meeting.issues.slice(0, 2).map((issue) => (
                <Typography key={issue.id} variant="body2" sx={{ pl: 1 }}>
                  • {issue.topic}
                </Typography>
              ))}
              {meeting.issues.length > 2 && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ pl: 1 }}
                >
                  +{meeting.issues.length - 2} more...
                </Typography>
              )}
            </Box>
          )}
        </CardContent>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>
            <EditIcon sx={{ mr: 1 }} fontSize="small" />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
            <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
            Delete
          </MenuItem>
        </Menu>
      </Card>
    </motion.div>
  );
};

const MeetingDialog: React.FC<{
  open: boolean;
  meeting: Meeting | null;
  onClose: () => void;
  onSave: (meeting: Omit<Meeting, "id" | "issues"> & { id?: string }) => void;
}> = ({ open, meeting, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");

  React.useEffect(() => {
    if (meeting) {
      setTitle(meeting.title);
      setClient(meeting.client);
      setDate(meeting.date);
    } else {
      setTitle("");
      setClient("");
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [meeting]);

  const handleSave = () => {
    if (title.trim() && client.trim() && date) {
      onSave({
        id: meeting?.id,
        title: title.trim(),
        client: client.trim(),
        date,
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {meeting ? "Edit Meeting" : "Create New Meeting"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Meeting Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Client"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {meeting ? "Save Changes" : "Create Meeting"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MeetingList: React.FC = () => {
  const { state, dispatch, createMeeting } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleCreateMeeting = () => {
    setEditingMeeting(null);
    setDialogOpen(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setDialogOpen(true);
  };

  const handleDeleteMeeting = (id: string) => {
    const meeting = state.data.meetings.find((m) => m.id === id);
    const issueCount = meeting?.issues.length || 0;

    const confirmMessage =
      issueCount > 0
        ? `Are you sure you want to delete the meeting "${meeting?.title}"? This will also delete ${issueCount} issue(s). This action cannot be undone.`
        : `Are you sure you want to delete the meeting "${meeting?.title}"? This action cannot be undone.`;

    if (window.confirm(confirmMessage)) {
      try {
        dispatch({ type: "DELETE_MEETING", payload: id });
        setSnackbar({
          open: true,
          message: `Meeting "${meeting?.title}" deleted successfully`,
          severity: "success",
        });
        console.log(`Meeting ${id} deleted successfully`);
      } catch (error) {
        console.error("Error deleting meeting:", error);
        setSnackbar({
          open: true,
          message: "Error deleting meeting. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleSaveMeeting = (
    meetingData: Omit<Meeting, "id" | "issues"> & { id?: string }
  ) => {
    try {
      if (meetingData.id) {
        // Edit existing meeting
        const existingMeeting = state.data.meetings.find(
          (m) => m.id === meetingData.id
        );
        if (existingMeeting) {
          dispatch({
            type: "UPDATE_MEETING",
            payload: {
              ...existingMeeting,
              title: meetingData.title,
              client: meetingData.client,
              date: meetingData.date,
            },
          });
          setSnackbar({
            open: true,
            message: `Meeting "${meetingData.title}" updated successfully`,
            severity: "success",
          });
        }
      } else {
        // Create new meeting
        createMeeting(meetingData.title, meetingData.date, meetingData.client);
        setSnackbar({
          open: true,
          message: `Meeting "${meetingData.title}" created successfully`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error saving meeting:", error);
      setSnackbar({
        open: true,
        message: "Error saving meeting. Please try again.",
        severity: "error",
      });
    }
  };

  const sortedMeetings = [...state.data.meetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold">
          Meetings
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateMeeting}
        >
          New Meeting
        </Button>
      </Box>

      {sortedMeetings.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <EventIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No meetings yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first meeting to start tracking issues and discussions.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateMeeting}
          >
            Create First Meeting
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {sortedMeetings.map((meeting, index) => (
            <Grid key={meeting.id} size={{ xs: 12, md: 6, lg: 4 }}>
              <MeetingCard
                meeting={meeting}
                onEdit={handleEditMeeting}
                onDelete={handleDeleteMeeting}
                index={index}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add meeting"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={handleCreateMeeting}
      >
        <AddIcon />
      </Fab>

      <MeetingDialog
        open={dialogOpen}
        meeting={editingMeeting}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveMeeting}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeetingList;
