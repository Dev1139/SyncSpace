import { useEffect, useRef, useState } from "react";

import { ChevronDown, LogOut, User } from "lucide-react";

import { useAuth } from "../../context/AuthContext";

export default function ProfileDropdown() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();

    window.location.href = "/login";
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-12 items-center gap-3 rounded-2xl border border-border bg-surface px-3 transition hover:border-primary/30 hover:bg-surface2"
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
          <User size={18} />
        </div>

        {/* User */}
        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-[120px] truncate text-sm font-medium text-text">
            {user?.name}
          </p>

          <p className="max-w-[160px] truncate text-xs text-muted">
            {user?.email}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`text-muted transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-14 z-50 w-60 rounded-2xl border border-border bg-surface p-2 shadow-2xl">
          {/* User Info */}
          <div className="border-b border-border px-3 py-3">
            <p className="truncate text-sm font-medium text-text">
              {user?.name}
            </p>

            <p className="mt-1 truncate text-xs text-muted">{user?.email}</p>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-danger transition hover:bg-background"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
