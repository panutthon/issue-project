import type { AppData, QuickNote } from "../app-types";

const STORAGE_KEY = "meeting-tracker-data";
const QUICK_NOTES_KEY = "meeting-tracker-quick-notes";

export const defaultData: AppData = {
  meetings: [],
};

// Load data from localStorage
export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading data from localStorage:", error);
  }
  return defaultData;
};

// Save data to localStorage
export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
};

// Generate unique ID
export const generateId = (prefix: string = "id"): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Export data as JSON file
export const exportToJSON = (
  data: AppData,
  filename: string = "meeting-tracker-data.json"
): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Import data from JSON file
export const importFromJSON = (file: File): Promise<AppData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
};

// Export to CSV format
export const exportToCSV = (
  data: AppData,
  filename: string = "meeting-tracker-data.csv"
): void => {
  const csvRows = [
    [
      "Meeting ID",
      "Meeting Title",
      "Date",
      "Client",
      "Issue ID",
      "Topic",
      "Status",
      "Priority",
      "Assignee",
      "Solution",
      "Note",
    ],
  ];

  data.meetings.forEach((meeting) => {
    if (meeting.issues.length === 0) {
      csvRows.push([
        meeting.id,
        meeting.title,
        meeting.date,
        meeting.client,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);
    } else {
      meeting.issues.forEach((issue) => {
        csvRows.push([
          meeting.id,
          meeting.title,
          meeting.date,
          meeting.client,
          issue.id,
          issue.topic,
          issue.status,
          issue.priority,
          issue.assignee,
          issue.solution,
          issue.note,
        ]);
      });
    }
  });

  const csvContent = csvRows
    .map((row) =>
      row.map((field) => `"${field.replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Quick Notes functions
export const loadQuickNotes = (): QuickNote[] => {
  try {
    const stored = localStorage.getItem(QUICK_NOTES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading quick notes from localStorage:", error);
  }
  return [];
};

export const saveQuickNotes = (notes: QuickNote[]): void => {
  try {
    localStorage.setItem(QUICK_NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error("Error saving quick notes to localStorage:", error);
  }
};
