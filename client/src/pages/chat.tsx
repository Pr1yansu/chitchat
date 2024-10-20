import React, { useEffect, useMemo } from "react";
import Avatar from "@/components/avatar";
import AvatarBubble from "@/components/avatar-bubble";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ContactList from "@/components/contact-list";
import {
  useGetAllUsersQuery,
  useGetProfileQuery,
  useGetUserByIdsMutation,
} from "@/store/api/users/user";
import { Skeleton } from "@/components/ui/skeleton";
import { useDispatch } from "react-redux";
import { openModal } from "@/store/slices/add-contact-modal";
import AddContact from "@/components/add-contact";
import MessagingArea from "@/components/messaging-area";
import AddContactModal from "@/components/modal/add-contact-modal";
import { socket } from "@/services/socket";
import { User } from "@/types";
import { toast } from "sonner";

const Chat = () => {
  const dispatch = useDispatch();
  const [getUserByIds] = useGetUserByIdsMutation();
  const [onlineUserIds, setOnlineUserIds] = React.useState([]);
  const [onlineUsers, setOnlineUsers] = React.useState<User[] | []>([]);
  const { data, isLoading, isFetching } = useGetProfileQuery();
  const [showSearch, setShowSearch] = React.useState(false);

  const {
    data: allUsersData,
    isLoading: allUsersIsLoading,
    isFetching: allUsersIsFetching,
  } = useGetAllUsersQuery();

  useEffect(() => {
    socket.on("online-users", (users) => {
      setOnlineUserIds(users);
    });

    if (onlineUserIds.length > 0) {
      getUserByIds({ userIds: onlineUserIds })
        .then(({ data }) => {
          if (data) {
            setOnlineUsers(data.users);
          } else {
            toast.error("Failed to fetch online users");
          }
        })
        .catch(() => {
          toast.error("Failed to fetch online users");
        });
    }

    return () => {
      socket.off("onlineUsers");
    };
  }, [setOnlineUserIds, onlineUserIds, getUserByIds]);

  const firstFiveUsers = useMemo(() => {
    return onlineUsers.slice(0, 5);
  }, [onlineUsers]);

  const moreContactCount = useMemo(() => {
    return onlineUsers.length - 5;
  }, [onlineUsers]);

  return (
    <>
      <div className="bg-primary/5 flex flex-col relative">
        <div className="px-6 py-6 flex items-center gap-4">
          {data?.user ? (
            <Avatar
              src={data?.user?.avatar?.url}
              sn={`${data?.user?.firstName[0]}${data?.user?.lastName[0]}`}
            />
          ) : (
            <Skeleton className="w-14 h-14" />
          )}
          <div className="space-y-1">
            {data?.user ? (
              <h4 className="text-base font-bold line-clamp-1 capitalize">
                {data.user.firstName.toLowerCase()}{" "}
                {data.user.lastName.toLowerCase()}
              </h4>
            ) : (
              <Skeleton className="w-20 h-4" />
            )}
            <p className="text-xs text-primary/60 flex items-center gap-1 line-clamp-1">
              My Account
            </p>
          </div>
        </div>
        <Separator />
        {onlineUsers.length > 0 && (
          <div className="px-6 py-4 space-y-2">
            <h4 className="text-xl text-primary flex items-center gap-1 line-clamp-1 font-bold capitalize">
              Online now
            </h4>
            <div className="flex gap-3">
              {isFetching || isLoading ? (
                <>
                  <Skeleton className="w-10 h-10" />
                  <Skeleton className="w-10 h-10" />
                  <Skeleton className="w-10 h-10" />
                  <Skeleton className="w-10 h-10" />
                </>
              ) : (
                <>
                  {firstFiveUsers?.map((user) => (
                    <AvatarBubble
                      type="user"
                      key={user.id}
                      id={user.id}
                      name={`${user.firstName || "Unknown"} ${
                        user.lastName || "User"
                      }`}
                      image={user.avatar?.url}
                    />
                  ))}
                </>
              )}
              {moreContactCount > 0 && (
                <div className="bg-primary/10 text-primary flex justify-center items-center rounded-full size-10 text-xs font-semibold">
                  +{moreContactCount}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xl text-primary flex items-center gap-1 line-clamp-1 font-bold capitalize">
              Messages
            </h4>
            <div className="flex gap-2">
              <Button
                size={"icon"}
                variant={"ghost"}
                className="focus:outline-none focus:bg-primary/10 focus:text-primary rounded-full p-1 size-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => setShowSearch((prev) => !prev)}
              >
                <Search />
              </Button>
              <Button
                size={"icon"}
                variant={"ghost"}
                className="focus:outline-none focus:bg-primary/10 focus:text-primary rounded-full p-1 size-7 hover:bg-primary/10 hover:text-primary"
              >
                <Heart />
              </Button>
              <Button
                size={"icon"}
                variant={"ghost"}
                className="focus:outline-none focus:bg-primary/10 focus:text-primary rounded-full p-1 size-7 hover:bg-primary/10 hover:text-primary"
                onClick={() => dispatch(openModal())}
              >
                <Plus />
              </Button>
            </div>
          </div>
          {showSearch && <Input placeholder="Search messages" />}
        </div>
        {allUsersIsLoading || allUsersIsFetching ? (
          <div className="p-5 space-y-2">
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
            <Skeleton className="w-full h-16" />
          </div>
        ) : (
          <ContactList contacts={allUsersData?.users} />
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-300 to-transparent flex items-center h-10 z-10 w-full" />
        <AddContactModal
          title="Start a new conversation"
          description="Search for a user to start a conversation"
        >
          <AddContact />
        </AddContactModal>
      </div>
      <MessagingArea />
    </>
  );
};

export default Chat;
