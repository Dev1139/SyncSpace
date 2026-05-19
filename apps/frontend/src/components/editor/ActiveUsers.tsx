type PresenceUser = {
  id?: string;
  clientId?: number;
  name: string;
  color: string;
};

type ActiveUsersProps = {
  users: PresenceUser[];
};

export default function ActiveUsers({ users }: ActiveUsersProps) {
  const uniqueUsers = Array.from(
    users
      .reduce((map, user) => {
        map.set(user.id || String(user.clientId ?? user.name), user);
        return map;
      }, new Map<string, PresenceUser>())
      .values(),
  );

  if (uniqueUsers.length === 0) return null;

  const visibleUsers = uniqueUsers.slice(0, 3);

  const remainingUsers = uniqueUsers.length - visibleUsers.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id || String(user.clientId ?? index)}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface2 text-xs font-bold text-white shadow-float"
            style={{
              backgroundColor: user.color,
            }}
            title={user.name}
          >
            {user.name.slice(0, 1).toUpperCase()}
          </div>
        ))}

        {remainingUsers > 0 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface2 bg-surface3 text-[11px] font-semibold text-text">
            +{remainingUsers}
          </div>
        )}
      </div>
    </div>
  );
}
