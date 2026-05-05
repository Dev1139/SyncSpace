import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./Pages/LoginPage";
import ProtectedRoute from "./components/protectedRoute";
import AppLayout from "./components/AppLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />

      {/* default redirect */}
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}

export default App;