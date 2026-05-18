import { useState } from "react";

import { LogOut, User, ChevronDown } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function DashboardTopbar() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();

    window.location.href = "/login";
  };

  return (
    <div className="mb-8 flex items-center justify-between">
      {/* Left */}
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>

        <p className="mt-1 text-sm text-muted">
          Manage your collaborative workspaces.
        </p>
      </div>

      {/* Right */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-2 transition hover:border-primary/30"
        >
          {/* Avatar */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <User size={18} />
          </div>

          {/* User */}
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-text">{user?.name}</p>

            <p className="text-xs text-muted">{user?.email}</p>
          </div>

          <ChevronDown size={16} className="text-muted" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-16 z-50 w-56 rounded-2xl border border-border bg-surface p-2 shadow-2xl">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-danger transition hover:bg-background"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
