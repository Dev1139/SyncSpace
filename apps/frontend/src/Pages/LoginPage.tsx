import { useState } from "react";
import { login, register } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileText, LogIn, UserPlus } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await login(email);

      const token = res?.data?.access_token;
      const user = res?.data?.user;

      if (!token) throw new Error("Invalid response");

      setAuth(token, user);

      navigate("/app");
    } catch (err: any) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await register(email);

      const token = res?.data?.access_token;

      if (!token) throw new Error("Invalid response");

      // no user returned in register → fine
      setAuth(token);

      navigate("/app");
    } catch (err: any) {
      setError(err?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background px-4 text-text">
      <div className="w-full max-w-md">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded bg-primary/20 text-primary ring-1 ring-primary/30">
            <FileText size={24} />
          </div>
          <h1 className="text-3xl font-semibold">Log in to SyncSpace</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email to access your collaborative workspace.
          </p>
        </div>

        <div className="slate-panel rounded-lg p-6">
          <label className="mb-2 block text-sm font-semibold text-text">Email</label>

          <input
            className="slate-input w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />

          {error && (
            <p className="mt-3 rounded border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <div className="mt-5 space-y-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="slate-button-primary flex w-full items-center justify-center gap-2"
            >
              <LogIn size={16} />
              {loading ? "Loading..." : "Login"}
            </button>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="slate-button-secondary flex w-full items-center justify-center gap-2"
            >
              <UserPlus size={16} />
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
