import { useState } from "react";
import { login, register } from "../services/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div className="h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-80 space-y-4">
        <h2 className="text-xl font-semibold text-center">Auth</h2>

        <input
          className="w-full border rounded px-3 py-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Login"}
        </button>

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-gray-200 py-2 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Register
        </button>
      </div>
    </div>
  );
}