import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
} from '@mui/material';
import {
  DarkMode,
  LightMode,
  FileDownload,
  FileUpload,
} from '@mui/icons-material';
import { useApp } from '../utils/hooks';
import { exportToJSON, exportToCSV, importFromJSON } from '../utils/storage';

const Header: React.FC = () => {
  const { state, dispatch } = useApp();

  const handleDarkModeToggle = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };

  const handleExportJSON = () => {
    exportToJSON(state.data, `meeting-tracker-${new Date().toISOString().split('T')[0]}.json`);
  };

  const handleExportCSV = () => {
    exportToCSV(state.data, `meeting-tracker-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importFromJSON(file)
        .then((data) => {
          dispatch({ type: 'SET_DATA', payload: data });
          alert('Data imported successfully!');
        })
        .catch((error) => {
          console.error('Import error:', error);
          alert('Error importing data. Please check the file format.');
        });
    }
    // Reset input value to allow importing the same file again
    event.target.value = '';
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Meeting Issue Tracker
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<FileDownload />}
            onClick={handleExportJSON}
            size="small"
          >
            Export JSON
          </Button>
          
          <Button
            startIcon={<FileDownload />}
            onClick={handleExportCSV}
            size="small"
          >
            Export CSV
          </Button>
          
          <Button
            component="label"
            startIcon={<FileUpload />}
            size="small"
          >
            Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              style={{ display: 'none' }}
            />
          </Button>
          
          <IconButton
            onClick={handleDarkModeToggle}
            color="inherit"
          >
            {state.darkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;