import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  Fab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Note as NoteIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useApp } from "../utils/hooks";
import type { QuickNote } from "../app-types";

const QuickNoteCard: React.FC<{
  note: QuickNote;
  onEdit: (note: QuickNote) => void;
  onDelete: (id: string) => void;
  index: number;
}> = ({ note, onEdit, onDelete, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card sx={{ height: "100%" }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              {note.title && (
                <Typography variant="h6" gutterBottom>
                  {note.title}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {new Date(note.createdAt).toLocaleString()}
              </Typography>
            </Box>
            <Box>
              <IconButton size="small" onClick={() => onEdit(note)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => onDelete(note.id)}
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Typography
            variant="body2"
            sx={{
              whiteSpace: "pre-wrap",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
            }}
          >
            {note.content}
          </Typography>

          {note.content.length > 200 && (
            <Button size="small" onClick={() => onEdit(note)} sx={{ mt: 1 }}>
              Read more
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const QuickNoteDialog: React.FC<{
  open: boolean;
  note: QuickNote | null;
  onClose: () => void;
  onSave: (
    note: Omit<QuickNote, "id" | "createdAt"> & {
      id?: string;
      createdAt?: string;
    }
  ) => void;
}> = ({ open, note, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  React.useEffect(() => {
    if (note) {
      setTitle(note.title || "");
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note]);

  const handleSave = () => {
    if (content.trim()) {
      onSave({
        id: note?.id,
        createdAt: note?.createdAt,
        title: title.trim() || undefined,
        content: content.trim(),
      });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{note ? "Edit Note" : "Create Quick Note"}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            label="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            placeholder="Give your note a title..."
          />
          <TextField
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            required
            multiline
            rows={12}
            placeholder="Start writing your note here..."
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
        >
          {note ? "Save Changes" : "Save Note"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const QuickNotesComponent: React.FC = () => {
  const { state, dispatch } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<QuickNote | null>(null);

  const handleCreateNote = () => {
    setEditingNote(null);
    setDialogOpen(true);
  };

  const handleEditNote = (note: QuickNote) => {
    setEditingNote(note);
    setDialogOpen(true);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      dispatch({ type: "DELETE_QUICK_NOTE", payload: id });
    }
  };

  const handleSaveNote = (
    noteData: Omit<QuickNote, "id" | "createdAt"> & {
      id?: string;
      createdAt?: string;
    }
  ) => {
    if (noteData.id) {
      // Edit existing note
      dispatch({
        type: "UPDATE_QUICK_NOTE",
        payload: {
          ...noteData,
          id: noteData.id,
          createdAt: noteData.createdAt!,
        } as QuickNote,
      });
    } else {
      // Create new note
      const newNote: QuickNote = {
        id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        title: noteData.title,
        content: noteData.content,
      };
      dispatch({ type: "ADD_QUICK_NOTE", payload: newNote });
    }
  };

  const sortedNotes = [...state.quickNotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
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
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            gutterBottom
          >
            Quick Notes
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Capture quick thoughts, meeting notes, or ideas on the fly
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNote}
        >
          New Note
        </Button>
      </Box>

      {sortedNotes.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <NoteIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No notes yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Create your first quick note to start capturing ideas and thoughts.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateNote}
          >
            Create First Note
          </Button>
        </Box>
      ) : (
        <>
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label={`${sortedNotes.length} notes`} variant="outlined" />
            <Typography variant="body2" color="text.secondary">
              Latest notes shown first
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {sortedNotes.map((note, index) => (
              <Grid key={note.id} size={{ xs: 12, md: 6, lg: 4 }}>
                <QuickNoteCard
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  index={index}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add note"
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
          display: { xs: "flex", sm: "none" },
        }}
        onClick={handleCreateNote}
      >
        <AddIcon />
      </Fab>

      <QuickNoteDialog
        open={dialogOpen}
        note={editingNote}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveNote}
      />
    </Box>
  );
};

export default QuickNotesComponent;
