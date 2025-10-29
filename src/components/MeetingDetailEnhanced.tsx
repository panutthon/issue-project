import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useApp } from "../utils/hooks";
import type { Issue, IssueStatus, IssuePriority } from "../app-types";

const statusColors = {
  pending: "warning",
  "in progress": "info",
  solved: "success",
  archived: "default",
} as const;

const priorityColors = {
  low: "default",
  medium: "warning",
  high: "error",
} as const;

const IssueDialog: React.FC<{
  open: boolean;
  issue: Issue | null;
  onClose: () => void;
  onSave: (issue: Omit<Issue, "id"> & { id?: string }) => void;
}> = ({ open, issue, onClose, onSave }) => {
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState<IssueStatus>("pending");
  const [priority, setPriority] = useState<IssuePriority>("medium");
  const [assignee, setAssignee] = useState("");
  const [solution, setSolution] = useState("");
  const [note, setNote] = useState("");

  React.useEffect(() => {
    if (issue) {
      setTopic(issue.topic);
      setStatus(issue.status);
      setPriority(issue.priority);
      setAssignee(issue.assignee);
      setSolution(issue.solution);
      setNote(issue.note);
    } else {
      setTopic("");
      setStatus("pending");
      setPriority("medium");
      setAssignee("");
      setSolution("");
      setNote("");
    }
  }, [issue, open]);

  const handleSave = () => {
    if (topic.trim()) {
      onSave({
        id: issue?.id,
        topic: topic.trim(),
        status,
        priority,
        assignee: assignee.trim(),
        solution: solution.trim(),
        note: note.trim(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{issue ? "Edit Issue" : "Create New Issue"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Issue Topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            fullWidth
            required
            multiline
            rows={2}
            helperText="Describe the issue or discussion point clearly"
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in progress">In Progress</MenuItem>
                <MenuItem value="solved">Solved</MenuItem>
                <MenuItem value="archived">Archived</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priority}
                label="Priority"
                onChange={(e) => setPriority(e.target.value as IssuePriority)}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              sx={{ flexGrow: 1 }}
              helperText="Who is responsible for this issue?"
            />
          </Box>

          <TextField
            label="Solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            fullWidth
            multiline
            rows={3}
            placeholder="Describe the solution or action taken..."
            helperText="What was done to address this issue?"
          />

          <TextField
            label="Notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional notes or comments..."
            helperText="Any additional context or follow-up needed"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!topic.trim()}
        >
          {issue ? "Save Changes" : "Create Issue"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const meeting = state.data.meetings.find((m) => m.id === id);

  if (!meeting) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <AssignmentIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Meeting not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          The meeting with ID "{id}" could not be found.
        </Typography>
        <Button
          component={RouterLink}
          to="/meetings"
          variant="contained"
          sx={{ mt: 2 }}
        >
          Back to Meetings
        </Button>
      </Box>
    );
  }

  const handleCreateIssue = () => {
    setEditingIssue(null);
    setDialogOpen(true);
  };

  const handleEditIssue = (issue: Issue) => {
    setEditingIssue(issue);
    setDialogOpen(true);
  };

  const handleDeleteIssue = (issueId: string) => {
    const issue = meeting.issues.find((i) => i.id === issueId);
    if (
      window.confirm(
        `Are you sure you want to delete the issue "${issue?.topic}"? This action cannot be undone.`
      )
    ) {
      try {
        dispatch({
          type: "DELETE_ISSUE",
          payload: { meetingId: meeting.id, issueId },
        });
        setSnackbar({
          open: true,
          message: "Issue deleted successfully",
          severity: "success",
        });
      } catch (error) {
        console.error("Error deleting issue:", error);
        setSnackbar({
          open: true,
          message: "Error deleting issue",
          severity: "error",
        });
      }
    }
  };

  const handleSaveIssue = (issueData: Omit<Issue, "id"> & { id?: string }) => {
    try {
      if (issueData.id) {
        // Update existing issue
        const updatedIssue: Issue = {
          id: issueData.id,
          topic: issueData.topic,
          status: issueData.status,
          priority: issueData.priority,
          assignee: issueData.assignee,
          solution: issueData.solution,
          note: issueData.note,
        };

        dispatch({
          type: "UPDATE_ISSUE",
          payload: {
            meetingId: meeting.id,
            issue: updatedIssue,
          },
        });

        setSnackbar({
          open: true,
          message: "Issue updated successfully",
          severity: "success",
        });
      } else {
        // Create new issue
        const newIssue: Issue = {
          id: `iss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          topic: issueData.topic,
          status: issueData.status,
          priority: issueData.priority,
          assignee: issueData.assignee,
          solution: issueData.solution,
          note: issueData.note,
        };

        dispatch({
          type: "ADD_ISSUE",
          payload: { meetingId: meeting.id, issue: newIssue },
        });

        setSnackbar({
          open: true,
          message: "Issue created successfully",
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error saving issue:", error);
      setSnackbar({
        open: true,
        message: "Error saving issue",
        severity: "error",
      });
    }
  };

  const getStatusCounts = () => {
    const pending = meeting.issues.filter((i) => i.status === "pending").length;
    const inProgress = meeting.issues.filter(
      (i) => i.status === "in progress"
    ).length;
    const solved = meeting.issues.filter((i) => i.status === "solved").length;
    const archived = meeting.issues.filter(
      (i) => i.status === "archived"
    ).length;
    return { pending, inProgress, solved, archived };
  };

  const statusCounts = getStatusCounts();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component={RouterLink}
            to="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link component={RouterLink} to="/meetings">
            Meetings
          </Link>
          <Typography color="text.primary">{meeting.title}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
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
                variant="h4"
                component="h1"
                fontWeight="bold"
                gutterBottom
              >
                {meeting.title}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 0.5, fontSize: 18 }} color="action" />
                  <Typography variant="subtitle1" color="text.secondary">
                    {meeting.client}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <ScheduleIcon sx={{ mr: 0.5, fontSize: 18 }} color="action" />
                  <Typography variant="subtitle1" color="text.secondary">
                    {new Date(meeting.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateIssue}
              size="large"
            >
              Add Issue
            </Button>
          </Box>

          {/* Status Summary */}
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issue Summary
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  label={`${meeting.issues.length} Total Issues`}
                  variant="outlined"
                  icon={<AssignmentIcon />}
                />
                {statusCounts.pending > 0 && (
                  <Chip
                    label={`${statusCounts.pending} Pending`}
                    color="warning"
                  />
                )}
                {statusCounts.inProgress > 0 && (
                  <Chip
                    label={`${statusCounts.inProgress} In Progress`}
                    color="info"
                  />
                )}
                {statusCounts.solved > 0 && (
                  <Chip
                    label={`${statusCounts.solved} Solved`}
                    color="success"
                  />
                )}
                {statusCounts.archived > 0 && (
                  <Chip
                    label={`${statusCounts.archived} Archived`}
                    color="default"
                  />
                )}
              </Box>

              {meeting.issues.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Progress:{" "}
                    {(
                      (statusCounts.solved / meeting.issues.length) *
                      100
                    ).toFixed(1)}
                    % completed
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Issues Section */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {meeting.issues.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <AssignmentIcon
                  sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No issues yet
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Add your first issue to start tracking discussion points and
                  action items.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateIssue}
                  size="large"
                >
                  Add First Issue
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "grey.50" }}>
                      <TableCell>
                        <strong>Issue Topic</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Status</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Priority</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Assignee</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Solution</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Actions</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {meeting.issues.map((issue, index) => (
                      <TableRow key={issue.id} hover>
                        <TableCell sx={{ maxWidth: 250 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {issue.topic}
                          </Typography>
                          {issue.note && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 0.5 }}
                            >
                              Note:{" "}
                              {issue.note.length > 50
                                ? `${issue.note.substring(0, 50)}...`
                                : issue.note}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={issue.status}
                            color={statusColors[issue.status]}
                            size="small"
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={issue.priority}
                            color={priorityColors[issue.priority]}
                            size="small"
                            variant="outlined"
                            sx={{ textTransform: "capitalize" }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {issue.assignee || (
                              <span
                                style={{ color: "#999", fontStyle: "italic" }}
                              >
                                Unassigned
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 200 }}>
                          {issue.solution ? (
                            <Tooltip title={issue.solution} arrow>
                              <Typography
                                variant="body2"
                                sx={{
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  cursor: "help",
                                }}
                              >
                                {issue.solution}
                              </Typography>
                            </Tooltip>
                          ) : (
                            <span
                              style={{ color: "#999", fontStyle: "italic" }}
                            >
                              No solution yet
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Issue" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleEditIssue(issue)}
                              sx={{ mr: 1 }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Issue" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteIssue(issue.id)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        <IssueDialog
          open={dialogOpen}
          issue={editingIssue}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveIssue}
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
    </motion.div>
  );
};

export default MeetingDetail;
