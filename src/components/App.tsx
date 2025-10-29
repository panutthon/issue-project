import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "../contexts/AppContext";
import { useApp } from "../utils/hooks";

// Components
import { Dashboard, MeetingList, QuickNotes, Sidebar, Header } from "./index";
import MeetingDetailEnhanced from "./MeetingDetailEnhanced";
import DebugPanel from "./DebugPanel";

const ThemedApp: React.FC = () => {
  const { state } = useApp();

  const theme = createTheme({
    palette: {
      mode: state.darkMode ? "dark" : "light",
      primary: {
        main: "#1976d2",
      },
      secondary: {
        main: "#dc004e",
      },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
            <Header />
            <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto" }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/meetings" element={<MeetingList />} />
                <Route
                  path="/meetings/:id"
                  element={<MeetingDetailEnhanced />}
                />
                <Route path="/quick-notes" element={<QuickNotes />} />
                <Route path="/debug" element={<DebugPanel />} />
              </Routes>
            </Box>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <ThemedApp />
    </AppProvider>
  );
};

export default App;
