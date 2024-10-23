import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SidebarClose, SidebarOpen } from "lucide-react";
import {
  useBanUserMutation,
  useGetAllUsersQuery,
} from "@/store/api/users/user";
import { useMemo, useTransition } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConfirm } from "@/hooks/use-confirm";
import ConfirmDialog from "@/components/modal/confirmation-modal";
import { toast } from "sonner";

interface BanUserProps {
  openBanUser: boolean;
  setOpenBanUser: (openBanUser: boolean) => void;
}

const BanUser = ({ openBanUser, setOpenBanUser }: BanUserProps) => {
  const [isPending, startTransition] = useTransition();
  const [banUser] = useBanUserMutation();
  const confirm = useConfirm(
    "Are you sure you want to ban this user?",
    "This action cannot be undone."
  );
  const {
    data: users,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useGetAllUsersQuery();

  const formattedUsers = useMemo(() => {
    if (!users) return [];
    return users.users.filter((user) => user.type === "user");
  }, [users]);

  if (isUserLoading || isUserFetching) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>January - June 2024</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
            <Skeleton className="h-52" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row justify-between">
        <div>
          <CardTitle>Ban User</CardTitle>
          <CardDescription>You can ban users from here</CardDescription>
        </div>
        <Button onClick={() => setOpenBanUser(!openBanUser)}>
          {openBanUser ? <SidebarOpen /> : <SidebarClose />}
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full h-full">
          {formattedUsers.map((user) => (
            <div
              key={user.id}
              className="flex flex-row items-center justify-between p-4 border-b border-gray-200"
            >
              <div className="flex flex-row items-center justify-start space-x-4">
                <Avatar>
                  <AvatarImage src={user.avatar?.url} alt={user.firstName} />
                  <AvatarFallback>
                    {user.firstName[0]} {user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col justify-center items-start">
                  <h3 className="text-base font-semibold leading-none tracking-tight w-40 text-ellipsis overflow-hidden">
                    {user.firstName} {user.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground w-40 text-ellipsis overflow-hidden">
                    {user.email}
                  </p>
                </div>
              </div>
              <Button
                variant="destructive"
                size={"sm"}
                disabled={openBanUser === false || isPending}
                onClick={async () => {
                  const isConfirmed = await confirm();
                  startTransition(() => {
                    if (isConfirmed) {
                      banUser({ id: user.id })
                        .then(({ data, error }) => {
                          if (data) {
                            toast.success("User has been banned successfully.");
                          }
                          if (error) {
                            toast.error(JSON.stringify(error));
                          }
                        })
                        .catch(() => {
                          toast.error(
                            "Something went wrong. Please try again later."
                          );
                        });
                    }
                  });
                }}
              >
                Ban
              </Button>
            </div>
          ))}
        </ScrollArea>
        <ConfirmDialog />
      </CardContent>
    </Card>
  );
};

export default BanUser;
