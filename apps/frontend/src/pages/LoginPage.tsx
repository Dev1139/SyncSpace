import { useState } from "react";

import {
  FileText,
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  Sparkles,
  Users,
  Layers,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { login, register } from "../services/authApi";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();

  const { login: setAuth } = useAuth();

  const [isRegister, setIsRegister] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const validateForm = () => {
    if (isRegister && !name.trim()) {
      return "Name is required";
    }

    if (!email.trim()) {
      return "Email is required";
    }

    if (!password.trim()) {
      return "Password is required";
    }

    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isRegister) {
        const res: any = await register({
          name,
          email,
          password,
        });

        const token = res?.data?.access_token;

        const user = res?.data?.user;

        if (!token || !user) {
          throw new Error("Invalid response");
        }

        setAuth(token, user);
      } else {
        const res: any = await login({
          email,
          password,
        });

        const token = res?.data?.access_token;

        const user = res?.data?.user;

        if (!token || !user) {
          throw new Error("Invalid response");
        }

        setAuth(token, user);
      }

      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-surface to-background text-text">
      {/* Left Section */}
      <div className="hidden flex-1 flex-col justify-between border-r border-border/50 p-10 lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <FileText size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">SyncSpace</h1>

              <p className="text-sm text-muted">
                Realtime collaborative workspace
              </p>
            </div>
          </div>

          <div className="mt-16 max-w-md">
            <h2 className="text-4xl font-bold leading-tight">
              Collaborate on ideas, documents, and projects in realtime.
            </h2>

            <p className="mt-5 text-base leading-7 text-muted">
              Build a shared workspace for teams with realtime editing,
              organized documents, and seamless collaboration.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4">
          <div className="slate-panel flex items-start gap-4 rounded-2xl p-4">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Sparkles size={18} />
            </div>

            <div>
              <h3 className="font-semibold">Realtime Editing</h3>

              <p className="mt-1 text-sm text-muted">
                Collaborate instantly with synchronized editing.
              </p>
            </div>
          </div>

          <div className="slate-panel flex items-start gap-4 rounded-2xl p-4">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Users size={18} />
            </div>

            <div>
              <h3 className="font-semibold">Team Workspaces</h3>

              <p className="mt-1 text-sm text-muted">
                Organize projects with role based access control.
              </p>
            </div>
          </div>

          <div className="slate-panel flex items-start gap-4 rounded-2xl p-4">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <Layers size={18} />
            </div>

            <div>
              <h3 className="font-semibold">Structured Documents</h3>

              <p className="mt-1 text-sm text-muted">
                Keep documents searchable, organized, and collaborative.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex w-full items-center justify-center px-6 py-10 lg:w-[520px]">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <FileText size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold">SyncSpace</h1>

              <p className="text-sm text-muted">Collaborative workspace</p>
            </div>
          </div>

          {/* Card */}
          <div className="slate-panel rounded-3xl p-7 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold">
                {isRegister ? "Create account" : "Welcome back"}
              </h2>

              <p className="mt-2 text-sm text-muted">
                {isRegister
                  ? "Start collaborating with your team."
                  : "Login to continue to your workspace."}
              </p>
            </div>

            {/* Toggle */}
            <div className="mb-6 flex rounded-xl bg-surface p-1">
              <button
                onClick={() => {
                  setIsRegister(false);

                  setError("");
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  !isRegister
                    ? "bg-primary text-white shadow"
                    : "text-muted hover:text-text"
                }`}
              >
                Login
              </button>

              <button
                onClick={() => {
                  setIsRegister(true);

                  setError("");
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isRegister
                    ? "bg-primary text-white shadow"
                    : "text-muted hover:text-text"
                }`}
              >
                Register
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              {isRegister && (
                <div>
                  <label className="mb-2 block text-sm font-medium">Name</label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="slate-input w-full"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="slate-input w-full"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="slate-input w-full pr-12"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-text"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="mt-4 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="slate-button-primary mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3"
            >
              {isRegister ? <UserPlus size={18} /> : <LogIn size={18} />}

              {loading
                ? "Please wait..."
                : isRegister
                  ? "Create Account"
                  : "Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
  