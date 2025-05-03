// Define interfaces for typing API responses
export interface ChatMessage {
  id?: string;
  role: "user" | "model";
  content: string;
  timestamp: Date | string; // API might return string dates
}

export interface ChatHistoryDocument {
  _id?: string;
  messages: ChatMessage[];
  timestamp: Date | string;
}

export interface AnalysisDocument {
  _id?: string;
  imageData: string;
  result: string;
  timestamp: Date | string;
}

// Define the base URL for your backend API
// Make sure this matches where your backend server is running
const API_BASE_URL = "http://localhost:3001/api"; // Adjust if needed

// All functions interacting with the MongoDB backend API have been removed.
// You can add other non-MongoDB related service functions here if needed.
