import { useGetAllUsersQuery } from "@/store/api/users/user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Minus, Plus, SearchX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface GroupMembersSelectorProps {
  value: string | string[] | undefined;
  onChange: (value: string | string[] | undefined) => void;
  allReadyMembers?: string[];
}

const GroupMembersSelector = ({
  onChange,
  allReadyMembers,
}: GroupMembersSelectorProps) => {
  const [userIds, setUserIds] = useState<string[]>([]);
  const { data, isLoading, isFetching } = useGetAllUsersQuery();

  const otherMembers = data?.users.filter((user) => {
    if (user.type === "group") return null;
    if (allReadyMembers?.includes(user.id)) return null;
    return user;
  });

  return (
    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
      {isLoading || isFetching ? (
        <>
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              className="flex items-center justify-between w-full mb-2"
              key={idx}
            >
              <div className="flex">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex flex-col justify-center ml-2 space-y-1">
                  <Skeleton className="w-20 h-4" />
                  <Skeleton className="w-10 h-4" />
                </div>
              </div>
              <Button size={"icon"} variant={"ghost"} disabled>
                <Plus className="h-5 w-5 animate-pulse" />
              </Button>
            </div>
          ))}
        </>
      ) : (
        <>
          {otherMembers && otherMembers.length ? (
            otherMembers.map((user) => {
              return (
                <div
                  className="flex items-center justify-between w-full mb-2"
                  key={user.id}
                >
                  <div className="flex">
                    <Avatar>
                      <AvatarImage
                        src={user.avatar?.url}
                        alt={user.firstName + "" + user.lastName}
                      />
                      <AvatarFallback>
                        {user?.firstName[0]?.toUpperCase() +
                          user?.lastName[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center ml-2 space-y-1">
                      <div className="font-semibold">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <Button
                    size={"icon"}
                    variant={"ghost"}
                    type="button"
                    onClick={() => {
                      const updatedUserIds = userIds.includes(user.id)
                        ? userIds.filter((id) => id !== user.id)
                        : [...userIds, user.id];

                      setUserIds(updatedUserIds);

                      if (userIds.includes(user.id)) {
                        toast.error(
                          `${user.firstName} will not be added to the group`
                        );
                      } else {
                        toast.success(
                          `${user.firstName} will be added to the group`
                        );
                      }

                      onChange(updatedUserIds);
                    }}
                  >
                    {userIds.includes(user.id) ? (
                      <Minus className="h-5 w-5 text-red-500" />
                    ) : (
                      <Plus className="h-5 w-5 text-emerald-500" />
                    )}
                  </Button>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center w-full h-full flex-col gap-4">
              <SearchX className="h-12 w-12 text-gray-500" />
              <h4 className="text-gray-500 text-center">
                No members available to add to the group.
              </h4>
            </div>
          )}
        </>
      )}
    </ScrollArea>
  );
};

export default GroupMembersSelector;
