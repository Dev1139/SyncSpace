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
    <div className="flex flex-wrap justify-end -space-x-2">
      {users.map((user, index) => (
        <div
          key={`${user.name}-${index}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface2 text-xs font-bold text-white shadow-float"
          style={{ backgroundColor: user.color }}
          title={user.name}
        >
          {user.name.slice(0, 1).toUpperCase()}
        </div>
      ))}
    </div>
  );
}
