import { Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./components/protectedRoute";

import { WorkspaceProvider } from "./context/WorkspaceContext";
import { WebSocketProvider } from "./context/WebContextProvider";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import WorkspacePage from "./pages/WorkspacePage";
import DocumentPage from "./pages/DocumentPage";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route
        path="/login"
        element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <DashboardPage />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />

      {/* Workspace */}
      <Route
        path="/workspace/:workspaceId"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <WorkspacePage />
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />

      {/* Document Editor */}
      <Route
        path="/documents/:documentId"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <WebSocketProvider>
                <DocumentPage />
              </WebSocketProvider>
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route
        path="*"
        element={<Navigate to={token ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
