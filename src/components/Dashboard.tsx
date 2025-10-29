import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Paper,
  LinearProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  TrendingUp,
  Event,
  Assignment,
  CheckCircle,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useApp } from "../utils/hooks";

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}> = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              color: `${color}.main`,
              borderRadius: "50%",
              p: 1,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </motion.div>
);

const Dashboard: React.FC = () => {
  const { state, stats } = useApp();

  const recentMeetings = state.data.meetings
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalIssues = stats.totalIssues;
  const solvedPercentage =
    totalIssues > 0 ? (stats.solvedIssues / totalIssues) * 100 : 0;

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
          Dashboard
        </Typography>
        <Button
          component={Link}
          to="/meetings"
          variant="contained"
          startIcon={<AddIcon />}
        >
          New Meeting
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Meetings"
            value={stats.totalMeetings}
            icon={<Event />}
            color="primary"
            delay={0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Issues"
            value={stats.totalIssues}
            icon={<Assignment />}
            color="info"
            delay={0.1}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Pending Issues"
            value={stats.pendingIssues}
            icon={<TrendingUp />}
            color="warning"
            delay={0.2}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Solved Issues"
            value={stats.solvedIssues}
            icon={<CheckCircle />}
            color="success"
            delay={0.3}
          />
        </Grid>
      </Grid>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Issue Resolution Progress
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {stats.solvedIssues} of {stats.totalIssues} issues resolved (
                {solvedPercentage.toFixed(1)}%)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={solvedPercentage}
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <Chip
                label={`${stats.pendingIssues} Pending`}
                color="warning"
                size="small"
              />
              <Chip
                label={`${stats.inProgressIssues} In Progress`}
                color="info"
                size="small"
              />
              <Chip
                label={`${stats.solvedIssues} Solved`}
                color="success"
                size="small"
              />
              <Chip
                label={`${stats.archivedIssues} Archived`}
                color="default"
                size="small"
              />
            </Box>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Meetings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography variant="h6">Recent Meetings</Typography>
            <Button
              component={Link}
              to="/meetings"
              variant="outlined"
              size="small"
            >
              View All
            </Button>
          </Box>

          {recentMeetings.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No meetings yet. Create your first meeting to get started!
              </Typography>
              <Button
                component={Link}
                to="/meetings"
                variant="contained"
                sx={{ mt: 2 }}
                startIcon={<AddIcon />}
              >
                Create Meeting
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {recentMeetings.map((meeting) => (
                <Card key={meeting.id} variant="outlined">
                  <CardContent sx={{ py: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          component={Link}
                          to={`/meetings/${meeting.id}`}
                        >
                          {meeting.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {meeting.client} •{" "}
                          {new Date(meeting.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label={`${meeting.issues.length} issues`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`${
                            meeting.issues.filter((i) => i.status === "pending")
                              .length
                          } pending`}
                          size="small"
                          color="warning"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Dashboard;
