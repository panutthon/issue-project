import React, { createContext, useReducer, useEffect } from "react";
import type { ReactNode } from "react";
import type {
  AppData,
  Meeting,
  Issue,
  QuickNote,
  DashboardStats,
} from "../app-types";
import {
  loadData,
  saveData,
  generateId,
  loadQuickNotes,
  saveQuickNotes,
} from "../utils/storage";

interface AppState {
  data: AppData;
  quickNotes: QuickNote[];
  selectedMeeting: Meeting | null;
  darkMode: boolean;
}

type AppAction =
  | { type: "SET_DATA"; payload: AppData }
  | { type: "ADD_MEETING"; payload: Meeting }
  | { type: "UPDATE_MEETING"; payload: Meeting }
  | { type: "DELETE_MEETING"; payload: string }
  | { type: "ADD_ISSUE"; payload: { meetingId: string; issue: Issue } }
  | { type: "UPDATE_ISSUE"; payload: { meetingId: string; issue: Issue } }
  | { type: "DELETE_ISSUE"; payload: { meetingId: string; issueId: string } }
  | { type: "SET_SELECTED_MEETING"; payload: Meeting | null }
  | { type: "TOGGLE_DARK_MODE" }
  | { type: "ADD_QUICK_NOTE"; payload: QuickNote }
  | { type: "UPDATE_QUICK_NOTE"; payload: QuickNote }
  | { type: "DELETE_QUICK_NOTE"; payload: string }
  | { type: "SET_QUICK_NOTES"; payload: QuickNote[] };

const initialState: AppState = {
  data: { meetings: [] },
  quickNotes: [],
  selectedMeeting: null,
  darkMode: false,
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, data: action.payload };

    case "ADD_MEETING": {
      const newData = {
        ...state.data,
        meetings: [...state.data.meetings, action.payload],
      };
      saveData(newData);
      return { ...state, data: newData };
    }

    case "UPDATE_MEETING": {
      const updatedMeetings = state.data.meetings.map((meeting) =>
        meeting.id === action.payload.id ? action.payload : meeting
      );
      const updatedData = { ...state.data, meetings: updatedMeetings };
      saveData(updatedData);
      return { ...state, data: updatedData };
    }

    case "DELETE_MEETING": {
      const filteredMeetings = state.data.meetings.filter(
        (meeting) => meeting.id !== action.payload
      );
      const filteredData = { ...state.data, meetings: filteredMeetings };
      saveData(filteredData);
      return { ...state, data: filteredData };
    }

    case "ADD_ISSUE": {
      const meetingsWithNewIssue = state.data.meetings.map((meeting) =>
        meeting.id === action.payload.meetingId
          ? { ...meeting, issues: [...meeting.issues, action.payload.issue] }
          : meeting
      );
      const dataWithNewIssue = {
        ...state.data,
        meetings: meetingsWithNewIssue,
      };
      saveData(dataWithNewIssue);
      return { ...state, data: dataWithNewIssue };
    }

    case "UPDATE_ISSUE": {
      const meetingsWithUpdatedIssue = state.data.meetings.map((meeting) => {
        if (meeting.id === action.payload.meetingId) {
          const updatedIssues = meeting.issues.map((issue) =>
            issue.id === action.payload.issue.id ? action.payload.issue : issue
          );
          return { ...meeting, issues: updatedIssues };
        }
        return meeting;
      });

      const dataWithUpdatedIssue = {
        ...state.data,
        meetings: meetingsWithUpdatedIssue,
      };
      saveData(dataWithUpdatedIssue);
      return { ...state, data: dataWithUpdatedIssue };
    }

    case "DELETE_ISSUE": {
      const meetingsWithDeletedIssue = state.data.meetings.map((meeting) => {
        if (meeting.id === action.payload.meetingId) {
          const filteredIssues = meeting.issues.filter(
            (issue) => issue.id !== action.payload.issueId
          );
          return { ...meeting, issues: filteredIssues };
        }
        return meeting;
      });

      const dataWithDeletedIssue = {
        ...state.data,
        meetings: meetingsWithDeletedIssue,
      };
      saveData(dataWithDeletedIssue);
      return { ...state, data: dataWithDeletedIssue };
    }

    case "SET_SELECTED_MEETING":
      return { ...state, selectedMeeting: action.payload };

    case "TOGGLE_DARK_MODE": {
      const newDarkMode = !state.darkMode;
      try {
        localStorage.setItem(
          "meeting-tracker-dark-mode",
          JSON.stringify(newDarkMode)
        );
      } catch (error) {
        console.error("Error saving dark mode preference:", error);
      }
      return { ...state, darkMode: newDarkMode };
    }

    case "ADD_QUICK_NOTE": {
      const newQuickNotes = [...state.quickNotes, action.payload];
      saveQuickNotes(newQuickNotes);
      return { ...state, quickNotes: newQuickNotes };
    }

    case "UPDATE_QUICK_NOTE": {
      const updatedQuickNotes = state.quickNotes.map((note) =>
        note.id === action.payload.id ? action.payload : note
      );
      saveQuickNotes(updatedQuickNotes);
      return { ...state, quickNotes: updatedQuickNotes };
    }

    case "DELETE_QUICK_NOTE": {
      const filteredQuickNotes = state.quickNotes.filter(
        (note) => note.id !== action.payload
      );
      saveQuickNotes(filteredQuickNotes);
      return { ...state, quickNotes: filteredQuickNotes };
    }

    case "SET_QUICK_NOTES":
      return { ...state, quickNotes: action.payload };

    default:
      return state;
  }
};

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  stats: DashboardStats;
  createMeeting: (title: string, date: string, client: string) => void;
  createIssue: (
    meetingId: string,
    topic: string,
    priority?: string,
    assignee?: string
  ) => void;
  getDashboardStats: () => DashboardStats;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load data on mount
  useEffect(() => {
    const data = loadData();
    const quickNotes = loadQuickNotes();

    let darkMode = false;
    try {
      const storedDarkMode = localStorage.getItem("meeting-tracker-dark-mode");
      darkMode = storedDarkMode ? JSON.parse(storedDarkMode) : false;
    } catch (error) {
      console.error("Error loading dark mode preference:", error);
    }

    dispatch({ type: "SET_DATA", payload: data });
    dispatch({ type: "SET_QUICK_NOTES", payload: quickNotes });
    if (darkMode) {
      dispatch({ type: "TOGGLE_DARK_MODE" });
    }
  }, []);

  const createMeeting = (title: string, date: string, client: string) => {
    const newMeeting: Meeting = {
      id: generateId("mtg"),
      title,
      date,
      client,
      issues: [],
    };
    dispatch({ type: "ADD_MEETING", payload: newMeeting });
  };

  const createIssue = (
    meetingId: string,
    topic: string,
    priority: string = "medium",
    assignee: string = ""
  ) => {
    const newIssue: Issue = {
      id: generateId("iss"),
      topic,
      status: "pending",
      solution: "",
      priority: priority as "low" | "medium" | "high",
      assignee,
      note: "",
    };
    dispatch({ type: "ADD_ISSUE", payload: { meetingId, issue: newIssue } });
  };

  const getDashboardStats = (): DashboardStats => {
    const totalMeetings = state.data.meetings.length;
    const allIssues = state.data.meetings.flatMap((meeting) => meeting.issues);
    const totalIssues = allIssues.length;

    return {
      totalMeetings,
      totalIssues,
      pendingIssues: allIssues.filter((issue) => issue.status === "pending")
        .length,
      inProgressIssues: allIssues.filter(
        (issue) => issue.status === "in progress"
      ).length,
      solvedIssues: allIssues.filter((issue) => issue.status === "solved")
        .length,
      archivedIssues: allIssues.filter((issue) => issue.status === "archived")
        .length,
    };
  };

  const stats = getDashboardStats();

  const value: AppContextType = {
    state,
    dispatch,
    stats,
    createMeeting,
    createIssue,
    getDashboardStats,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
