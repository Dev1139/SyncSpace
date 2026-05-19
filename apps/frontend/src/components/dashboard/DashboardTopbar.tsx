import { Moon, Sun } from "lucide-react";

import { useTheme } from "../../context/ThemeContext";

export default function DashboardTopbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-1 items-start justify-between gap-4">
      {/* Left */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-muted">
          Manage your collaborative workspaces.
        </p>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-surface text-muted transition hover:bg-surface2 hover:text-text"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </div>
  );
}
