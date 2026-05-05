import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute from "./components/protectedRoute";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./context/AuthContext";
import { WebSocketProvider } from "./context/WebContextProvider";
import { WorkspaceProvider } from "./context/WorkspaceContext";

function App() {
  const { token } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={token ? <Navigate to="/app" replace /> : <LoginPage />}
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <WorkspaceProvider>
              <WebSocketProvider>
                <AppLayout />
              </WebSocketProvider>
            </WorkspaceProvider>
          </ProtectedRoute>
        }
      />

      {/* default redirect */}
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}

export default App;
