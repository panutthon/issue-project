import React from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  Box,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  Note as NoteIcon,
  BugReport as BugReportIcon,
} from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";
import { useApp } from "../utils/hooks";

const DRAWER_WIDTH = 280;

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { stats } = useApp();

  const menuItems = [
    {
      text: "Dashboard",
      icon: <DashboardIcon />,
      path: "/",
      badge: null,
    },
    {
      text: "Meetings",
      icon: <EventIcon />,
      path: "/meetings",
      badge: stats.totalMeetings > 0 ? stats.totalMeetings : null,
    },
    {
      text: "Quick Notes",
      icon: <NoteIcon />,
      path: "/quick-notes",
      badge: null,
    },
    {
      text: "Debug",
      icon: <BugReportIcon />,
      path: "/debug",
      badge: null,
    },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          📝 Issue Tracker
        </Typography>
      </Box>

      <Divider />

      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
              {item.badge && (
                <Box
                  sx={{
                    backgroundColor: "error.main",
                    color: "error.contrastText",
                    borderRadius: "50%",
                    minWidth: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                  }}
                >
                  {item.badge}
                </Box>
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider sx={{ mt: 2 }} />

      <Box sx={{ p: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Issue Summary
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">Pending:</Typography>
            <Typography variant="body2" color="warning.main" fontWeight="bold">
              {stats.pendingIssues}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">In Progress:</Typography>
            <Typography variant="body2" color="info.main" fontWeight="bold">
              {stats.inProgressIssues}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2">Solved:</Typography>
            <Typography variant="body2" color="success.main" fontWeight="bold">
              {stats.solvedIssues}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
