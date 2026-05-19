type PresenceUser = {
  name: string;
  color: string;
};

type ActiveUsersProps = {
  users: PresenceUser[];
};

export default function ActiveUsers({ users }: ActiveUsersProps) {
  if (users.length === 0) return null;

  const visibleUsers = users.slice(0, 4);

  const remainingUsers = users.length - 4;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visibleUsers.map((user, index) => (
          <div
            key={`${user.name}-${index}`}
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
