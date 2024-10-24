import { useDispatch, useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { closeContactModal } from "@/store/slices/open-contact-modal";
import { RootState } from "@/store/store";
import {
  useGetProfileQuery,
  useGetUserContactedUserByIdQuery,
} from "@/store/api/users/user";
import {
  useAddMemberMutation,
  useGetRoomByIdQuery,
} from "@/store/api/chat/chat";
import { MessageCircle, PhoneCall, UserRoundPlus, X } from "lucide-react";
import { Room, User } from "@/types";
import AllMemberData from "@/components/all-member-data";
import { useEffect, useState, useTransition } from "react";
import GroupMembersSelector from "../group-member-selector";
import { toast } from "sonner";

interface ModalProps {
  title?: string;
  description?: string;
}

export default function FullContactModal({ title, description }: ModalProps) {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const groupId = searchParams.get("group") || "";
  const chatId = searchParams.get("chat") || "";

  const { isOpen, type } = useSelector(
    (state: RootState) => state.detailsModal
  );

  const {
    data: contactedUser,
    isLoading: isContactedUserLoading,
    isFetching: isContactedUserFetching,
  } = useGetUserContactedUserByIdQuery({ userId: chatId }, { skip: !chatId });

  const {
    data: groupData,
    isFetching: isGroupFetching,
    isLoading: isGroupLoading,
    refetch: refetchGroup,
  } = useGetRoomByIdQuery(
    {
      roomId: groupId,
    },
    {
      skip: !groupId,
    }
  );

  useEffect(() => {
    if (type === "group" && groupId && isOpen) {
      refetchGroup();
    }
  }, [groupData, type, groupId, refetchGroup, isOpen]);

  const isLoading =
    (type === "contact" &&
      (isContactedUserLoading || isContactedUserFetching)) ||
    (type === "group" && (isGroupLoading || isGroupFetching));

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dispatch(closeContactModal());
        }
      }}
    >
      <DialogContent className="w-96 max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {isLoading ? (
            type === "contact" ? (
              <ContactSkeleton />
            ) : (
              <GroupSkeleton />
            )
          ) : (
            <div>
              {type === "contact" && contactedUser && (
                <ContactInfo user={contactedUser.receiver} />
              )}
              {type === "group" && groupData && (
                <GroupInfo group={groupData.data} />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactInfo({ user }: { user: User }) {
  const dispatch = useDispatch();
  return (
    <div className="space-y-6" key={user.id}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={user.avatar?.url} />
          <AvatarFallback>
            {user.firstName[0] + user.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-xl font-semibold">{`${user.firstName} ${user.lastName}`}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <div className="space-y-2 text-center">
        <p className="text-sm text-muted-foreground">Account created on</p>
        <p className="text-sm font-medium">
          {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center justify-center space-x-4">
        <Button size="icon" variant="outline">
          <MessageCircle
            className="h-5 w-5"
            onClick={() => {
              dispatch(closeContactModal());
            }}
          />
        </Button>
        <Link to={`/call/${user.id}`}>
          <Button size="icon" variant="outline">
            <PhoneCall className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function GroupInfo({ group }: { group: Room }) {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [addMember] = useAddMemberMutation();
  const [openAddMember, setOpenAddMember] = useState(false);
  const [memberIds, setMemberIds] = useState<string | string[] | undefined>([]);

  const { data: profileData, isLoading: isProfileLoading } =
    useGetProfileQuery();

  const members = group.members as unknown as string[];
  const admins = group.admins as unknown as string[];
  const owner = group.owner as unknown as string;

  const handleAddMembers = () => {
    startTransition(() => {
      addMember({
        roomId: group.id,
        userIds: memberIds as string[],
      }).then(({ data, error }) => {
        console.log(data);

        if (error) {
          toast.error("Failed to add members to the group");
          return;
        } else {
          toast.success("Members added to the group successfully");
          dispatch(closeContactModal());
          return;
        }
      });
    });
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <div className="flex justify-center space-x-4">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" key={group.id}>
      <div className="flex flex-col items-center justify-center space-y-4">
        <Avatar className="w-24 h-24">
          <AvatarImage src={group.avatar?.url} />
          <AvatarFallback>{group.name[0]}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-xl font-semibold">{group.name}</h3>
          <p className="text-sm text-muted-foreground">
            {group.members.length} members
          </p>
        </div>
      </div>
      {openAddMember && (
        <div>
          <GroupMembersSelector
            onChange={(ids) => {
              setMemberIds(ids);
            }}
            value={memberIds}
            allReadyMembers={members}
          />
          <Button
            className="mt-4 w-full"
            disabled={isPending}
            onClick={handleAddMembers}
          >
            Add Members
          </Button>
        </div>
      )}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold">Members</h4>
          {admins.includes(profileData?.user?.id as string) ||
          owner === profileData?.user?.id ? (
            <>
              {openAddMember ? (
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={() => {
                    setOpenAddMember(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size={"icon"}
                  variant={"ghost"}
                  onClick={() => {
                    setOpenAddMember(true);
                  }}
                >
                  <UserRoundPlus className="h-4 w-4" />
                </Button>
              )}
            </>
          ) : null}
        </div>
        <AllMemberData
          members={members}
          admins={admins}
          owner={owner}
          roomId={group.id}
        />
      </div>
    </div>
  );
}

function ContactSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
    </div>
  );
}

function GroupSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex justify-center space-x-4">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="w-10 h-10 rounded-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-24" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
