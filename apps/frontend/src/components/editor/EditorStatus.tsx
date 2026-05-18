type Props = {
  connected: boolean;
  saving: boolean;
};

export default function EditorStatus({ connected, saving }: Props) {
  return (
    <div className="flex items-center gap-3 text-sm">
      {/* Connection */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            connected ? "bg-emerald-500" : "bg-yellow-500"
          }`}
        />

        <span className="text-muted">
          {connected ? "Connected" : "Reconnecting"}
        </span>
      </div>

      {/* Save */}
      <div className="text-muted">{saving ? "Saving..." : "Saved"}</div>
    </div>
  );
}
