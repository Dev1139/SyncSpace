import { useState } from "react";

import toast from "react-hot-toast";

import { Lock, LogOut, Save } from "lucide-react";

import Modal from "../ui/Modal";

import { updatePassword, updateProfile } from "../../services/authApi";

import { useAuth } from "../../context/AuthContext";

type Props = {
  open: boolean;

  onClose: () => void;
};

export default function ProfileModal({ open, onClose }: Props) {
  const { user, setUser, logout } = useAuth();

  const [name, setName] = useState(user?.name || "");

  const [oldPassword, setOldPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async () => {
    if (!name.trim()) {
      toast.error("Name is required");

      return;
    }

    try {
      setLoading(true);

      await updateProfile({
        name,
      });

      setUser((prev) =>
        prev
          ? {
              ...prev,
              name,
            }
          : prev,
      );

      toast.success("Profile updated");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("All password fields are required");

      return;
    }

    try {
      setLoading(true);

      await updatePassword({
        oldPassword,
        newPassword,
      });

      toast.success("Password updated");

      setOldPassword("");

      setNewPassword("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();

    window.location.href = "/login";
  };

  return (
    <Modal open={open} onClose={onClose} title="Profile Settings">
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
            {user?.name?.charAt(0)}
          </div>

          <p className="mt-4 text-lg font-semibold text-text">{user?.name}</p>

          <p className="text-sm text-muted">{user?.email}</p>
        </div>

        {/* Update Name */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-text">Display Name</label>

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="slate-input w-full"
            placeholder="Enter your name"
          />

          <button
            onClick={handleProfileUpdate}
            disabled={loading}
            className="slate-button-primary flex w-full items-center justify-center gap-2 rounded-xl py-3"
          >
            <Save size={16} />

            {loading ? "Saving..." : "Save Profile"}
          </button>
        </div>

        {/* Password */}
        <div className="space-y-3 border-t border-border pt-5">
          <div className="flex items-center gap-2">
            <Lock size={16} />

            <p className="text-sm font-medium text-text">Update Password</p>
          </div>

          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Current password"
            className="slate-input w-full"
          />

          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            className="slate-input w-full"
          />

          <button
            onClick={handlePasswordUpdate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium transition hover:bg-surface2"
          >
            <Lock size={16} />
            Update Password
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-[#2a1620] px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-[#341b27]"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </Modal>
  );
}
