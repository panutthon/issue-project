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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
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
  }, [issue]);

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
          />

          <TextField
            label="Notes"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional notes or comments..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
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

  const meeting = state.data.meetings.find((m) => m.id === id);

  if (!meeting) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Meeting not found
        </Typography>
        <Button
          component={RouterLink}
          to="/meetings"
          startIcon={<ArrowBackIcon />}
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
    if (window.confirm("Are you sure you want to delete this issue?")) {
      dispatch({
        type: "DELETE_ISSUE",
        payload: { meetingId: meeting.id, issueId },
      });
    }
  };

  const handleSaveIssue = (issueData: Omit<Issue, "id"> & { id?: string }) => {
    if (issueData.id) {
      // Edit existing issue
      dispatch({
        type: "UPDATE_ISSUE",
        payload: {
          meetingId: meeting.id,
          issue: { ...issueData, id: issueData.id } as Issue,
        },
      });
    } else {
      // Create new issue
      const newIssue: Issue = {
        id: `iss-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...issueData,
      };
      dispatch({
        type: "ADD_ISSUE",
        payload: { meetingId: meeting.id, issue: newIssue },
      });
    }
  };

  const columns: GridColDef[] = [
    {
      field: "topic",
      headerName: "Issue Topic",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={statusColors[params.value as IssueStatus]}
          size="small"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={priorityColors[params.value as IssuePriority]}
          size="small"
          variant="outlined"
          sx={{ textTransform: "capitalize" }}
        />
      ),
    },
    {
      field: "assignee",
      headerName: "Assignee",
      width: 150,
    },
    {
      field: "solution",
      headerName: "Solution",
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {params.value || "-"}
        </Box>
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditIssue(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteIssue(params.row.id)}
        />,
      ],
    },
  ];

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
              <Typography
                variant="subtitle1"
                color="text.secondary"
                gutterBottom
              >
                {meeting.client} • {new Date(meeting.date).toLocaleDateString()}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateIssue}
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
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={`${meeting.issues.length} Total`}
                  variant="outlined"
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
            </CardContent>
          </Card>
        </Box>

        {/* Issues DataGrid */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {meeting.issues.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
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
                >
                  Add First Issue
                </Button>
              </Box>
            ) : (
              <DataGrid
                rows={meeting.issues}
                columns={columns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid",
                    borderBottomColor: "divider",
                  },
                  "& .MuiDataGrid-columnHeaders": {
                    borderBottom: "2px solid",
                    borderBottomColor: "divider",
                    backgroundColor: "grey.50",
                  },
                }}
                autoHeight
              />
            )}
          </CardContent>
        </Card>

        <IssueDialog
          open={dialogOpen}
          issue={editingIssue}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveIssue}
        />
      </Box>
    </motion.div>
  );
};

export default MeetingDetail;
