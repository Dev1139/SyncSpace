export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:3000";
export const WS_URL =
  import.meta.env.VITE_WS_URL || "ws://localhost:3000/ws";
export const DEFAULT_DOCUMENT_TITLE = "Untitled Document";
