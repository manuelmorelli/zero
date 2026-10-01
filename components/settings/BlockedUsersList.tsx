"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleBlock, type BlockedUserItem } from "@/lib/actions/block";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { NOTICE } from "@/components/ui/panel";

export function BlockedUsersList({ users }: { users: BlockedUserItem[] }) {
  const [list, setList] = useState(users);
  const [isPending, startTransition] = useTransition();
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);

  function handleUnblock(userId: string) {
    setPendingUserId(userId);
    startTransition(async () => {
      const result = await toggleBlock(userId);
      setPendingUserId(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      setList((current) => current.filter((user) => user.id !== userId));
      toast.success("User unblocked");
    });
  }

  if (list.length === 0) {
    return <p className={NOTICE}>You haven&apos;t blocked anyone.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border">
      {list.map((user) => (
        <li key={user.id} className="flex items-center justify-between gap-4 px-4 py-3.5">
          <span className="flex min-w-0 items-center gap-3">
            <Avatar name={user.name} avatarUrl={user.avatarUrl} size="sm" />
            <span className="truncate text-sm font-medium text-ink">{user.name}</span>
          </span>
          <Button
            variant="secondary"
            disabled={isPending && pendingUserId === user.id}
            onClick={() => handleUnblock(user.id)}
          >
            {pendingUserId === user.id ? "Unblocking…" : "Unblock"}
          </Button>
        </li>
      ))}
    </ul>
  );
}
