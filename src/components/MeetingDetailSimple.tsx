import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useApp } from "../utils/hooks";

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();

  const meeting = state.data.meetings.find((m) => m.id === id);

  if (!meeting) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Meeting not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Meeting ID: {id}
        </Typography>
        <Button
          component={RouterLink}
          to="/meetings"
          startIcon={<ArrowBackIcon />}
          variant="contained"
        >
          Back to Meetings
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Button
        component={RouterLink}
        to="/meetings"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 3 }}
      >
        Back to Meetings
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        {meeting.title}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Client: {meeting.client}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Date: {new Date(meeting.date).toLocaleDateString()}
      </Typography>

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        Issues ({meeting.issues.length})
      </Typography>

      {meeting.issues.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No issues found for this meeting.
        </Typography>
      ) : (
        <Box>
          {meeting.issues.map((issue, index) => (
            <Box
              key={issue.id}
              sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
            >
              <Typography variant="h6">{issue.topic}</Typography>
              <Typography variant="body2" color="text.secondary">
                Status: {issue.status} | Priority: {issue.priority}
              </Typography>
              {issue.assignee && (
                <Typography variant="body2" color="text.secondary">
                  Assignee: {issue.assignee}
                </Typography>
              )}
              {issue.solution && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Solution: {issue.solution}
                </Typography>
              )}
              {issue.note && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Note: {issue.note}
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MeetingDetail;
