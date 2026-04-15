type PresenceUser = {
  name: string;
  color: string;
};

type ActiveUsersProps = {
  users: PresenceUser[];
};

export default function ActiveUsers({ users }: ActiveUsersProps) {
  if (users.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {users.map((user, index) => (
        <div
          key={`${user.name}-${index}`}
          className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white shadow-sm"
          style={{ backgroundColor: user.color }}
        >
          {user.name}
        </div>
      ))}
    </div>
  );
}
