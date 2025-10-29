import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
} from "@mui/material";
import { useApp } from "../utils/hooks";
import { exportToJSON, loadData } from "../utils/storage";

const DebugPanel: React.FC = () => {
  const { state } = useApp();

  const handleExportDebug = () => {
    const debugData = {
      ...state.data,
      _debug: {
        timestamp: new Date().toISOString(),
        totalMeetings: state.data.meetings.length,
        totalIssues: state.data.meetings.reduce(
          (sum, m) => sum + m.issues.length,
          0
        ),
        localStorage: loadData(),
      },
    };
    exportToJSON(debugData, `debug-data-${Date.now()}.json`);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear ALL data? This cannot be undone!"
      )
    ) {
      localStorage.removeItem("meeting-tracker-data");
      localStorage.removeItem("meeting-tracker-quick-notes");
      window.location.reload();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Debug Panel
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        This panel shows debug information about the application state.
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Application State
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Total Meetings:</strong> {state.data.meetings.length}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Total Issues:</strong>{" "}
            {state.data.meetings.reduce((sum, m) => sum + m.issues.length, 0)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Quick Notes:</strong> {state.quickNotes.length}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Dark Mode:</strong>{" "}
            {state.darkMode ? "Enabled" : "Disabled"}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Raw Data (JSON)
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: "grey.100",
              p: 2,
              borderRadius: 1,
              overflow: "auto",
              maxHeight: 300,
              fontSize: "0.75rem",
            }}
          >
            {JSON.stringify(state.data, null, 2)}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "flex", gap: 2 }}>
        <Button variant="outlined" onClick={handleExportDebug}>
          Export Debug Data
        </Button>
        <Button variant="outlined" color="error" onClick={handleClearData}>
          Clear All Data
        </Button>
      </Box>
    </Box>
  );
};

export default DebugPanel;
