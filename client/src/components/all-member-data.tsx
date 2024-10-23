import {
  useChangeAdminMutation,
  useGetMembersByIdsQuery,
  useRemoveMemberMutation,
} from "@/store/api/chat/chat";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  useEffect,
  useTransition,
  useCallback,
  useMemo,
  useState,
} from "react";
import { Loader2, UserMinus2 } from "lucide-react";
import { useGetProfileQuery } from "@/store/api/users/user";
import { useConfirm } from "@/hooks/use-confirm";
import ConfirmDialog from "@/components/modal/confirmation-modal";
import { useDispatch } from "react-redux";
import { closeContactModal } from "@/store/slices/open-contact-modal";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface AllMemberDataProps {
  members: string[];
  admins: string[];
  owner: string;
  roomId: string;
}

const AllMemberData = ({
  members,
  admins,
  owner,
  roomId,
}: AllMemberDataProps) => {
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [changeAdmin] = useChangeAdminMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [profileHovering, setProfileHovering] = useState("");

  const {
    data: membersData,
    isLoading: isMembersLoading,
    refetch: refetchMembers,
  } = useGetMembersByIdsQuery({ members });

  const { data: profileData, isLoading: isProfileLoading } =
    useGetProfileQuery();

  const confirm = useConfirm(
    "Change Admin Status",
    "Are you sure you want to change this member to admin?"
  );

  const removeConfirm = useConfirm(
    "Remove Member",
    "Are you sure you want to remove this member?"
  );

  useEffect(() => {
    refetchMembers();
  }, [members, refetchMembers]);

  const handleAdminChange = useCallback(
    async (member: User) => {
      const currentUserId = profileData?.user?.id;
      if (!currentUserId || currentUserId === member.id || owner === member.id)
        return;

      if (!admins.includes(currentUserId) && owner !== currentUserId) return;

      const isConfirmed = await confirm();
      if (isConfirmed) {
        startTransition(() => {
          changeAdmin({ userId: member.id, roomId })
            .unwrap()
            .then(async (response) => {
              if (response?.success) {
                await refetchMembers();
                dispatch(closeContactModal());
              }
            })
            .catch((error) => {
              console.error("Error changing admin:", error);
            });
        });
      }
    },
    [
      admins,
      owner,
      profileData,
      roomId,
      confirm,
      refetchMembers,
      dispatch,
      changeAdmin,
    ]
  );

  const handleRemoveMember = useCallback(
    async (memberId: string) => {
      const currentUserId = profileData?.user?.id;
      if (owner === memberId) {
        toast.error("Cannot remove owner from group.");
        return;
      }

      if (!currentUserId || currentUserId === memberId || owner === memberId)
        return;

      if (!admins.includes(currentUserId) && owner !== currentUserId) return;

      const isConfirmed = await removeConfirm();
      if (isConfirmed) {
        startTransition(() => {
          removeMember({ userId: memberId, roomId })
            .unwrap()
            .then(async (response) => {
              if (response?.success) {
                await refetchMembers();
                dispatch(closeContactModal());
              }
            })
            .catch((error) => {
              console.error("Error removing member:", error);
            });
        });
      }
    },
    [
      admins,
      owner,
      profileData,
      roomId,
      removeConfirm,
      refetchMembers,
      dispatch,
      removeMember,
    ]
  );

  const membersWithRoles = useMemo(
    () =>
      membersData?.data?.map((member: User) => ({
        ...member,
        isAdmin: admins.includes(member.id),
        isOwner: owner === member.id,
      })),
    [membersData, admins, owner]
  );

  if (isMembersLoading || isProfileLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {membersWithRoles?.map((member) => (
        <div
          key={member.id}
          className="flex items-center space-x-3 p-2 rounded-md hover:bg-accent hover:cursor-pointer relative"
          onMouseEnter={() => setProfileHovering(member.id)}
          onMouseLeave={() => setProfileHovering("")}
        >
          {profileHovering === member.id && (
            <motion.div
              className="absolute inset-0 bg-red-500 rounded-md z-10 flex items-center gap-2 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleRemoveMember(member.id)}
            >
              <UserMinus2 className="w-6 h-6 text-white" />
              <span className="text-white">Remove Member</span>
            </motion.div>
          )}
          <Avatar className="w-10 h-10">
            <AvatarImage src={member.avatar?.url} />
            <AvatarFallback>
              {member.firstName[0] + member.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm font-medium w-32 text-ellipsis text-nowrap overflow-hidden">
                {`${member.firstName} ${member.lastName}`}
              </p>
              <p className="text-xs text-muted-foreground w-20 text-ellipsis text-nowrap overflow-hidden">
                {member.email}
              </p>
            </div>
            {member.isOwner ? (
              <Badge variant="primary">Owner</Badge>
            ) : member.isAdmin ? (
              <Badge variant="destructive">Admin</Badge>
            ) : (
              <Badge
                variant="secondary"
                onClick={() => handleAdminChange(member)}
              >
                {isPending ? <Loader2 className="animate-spin" /> : "Member"}
              </Badge>
            )}
          </div>
        </div>
      ))}
      <ConfirmDialog />
    </div>
  );
};

export default AllMemberData;
