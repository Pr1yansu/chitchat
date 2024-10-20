import { SingleGrpResponse } from "@/store/api/chat/chat";
import { UserContactedUserResponse } from "@/store/api/users/user";
import { Skeleton } from "@/components/ui/skeleton";
import MainAvatar from "@/components/avatar";

const MessagingHeader = ({
  data,
  groupData,
}: {
  data?: UserContactedUserResponse;
  groupData?: SingleGrpResponse;
}) => {
  if (data) {
    return (
      <div className="border-b p-4 flex items-center gap-2">
        {data?.receiver ? (
          <MainAvatar
            src={data?.receiver?.avatar?.url}
            sn={`${data?.receiver?.firstName[0]}${data?.receiver?.lastName[0]}`}
          />
        ) : (
          <Skeleton className="w-14 h-14 rounded-full" />
        )}
        <div className="space-y-1">
          {data?.receiver ? (
            <h4 className="text-base font-bold line-clamp-1 capitalize">
              {data.receiver.firstName} {data.receiver.lastName}
            </h4>
          ) : (
            <Skeleton className="w-20 h-4" />
          )}
          <p className="text-xs text-primary/60 flex items-center gap-1 line-clamp-1">
            Last active{" "}
            <span className="text-primary font-bold">
              {new Date(data.receiver.lastActive).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
      </div>
    );
  }

  if (groupData) {
    return (
      <div className="border-b p-4 flex items-center gap-2">
        {groupData?.data ? (
          <MainAvatar
            src={groupData?.data?.avatar?.url}
            sn={`${groupData?.data?.name[0].toUpperCase()}${
              groupData?.data?.name[1]
            }`}
          />
        ) : (
          <Skeleton className="w-14 h-14 rounded-full" />
        )}

        <div className="space-y-1">
          {groupData?.data ? (
            <h4 className="text-base font-bold line-clamp-1 capitalize">
              {groupData.data.name}
            </h4>
          ) : (
            <Skeleton className="w-20 h-4" />
          )}
          <p className="text-xs text-primary/60 flex items-center gap-1 line-clamp-1">
            {groupData?.data?.members.length} members
          </p>
        </div>
      </div>
    );
  }
};

export default MessagingHeader;
