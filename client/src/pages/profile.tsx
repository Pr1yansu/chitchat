import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetProfileQuery } from "@/store/api/users/user";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Contact from "@/components/contact";
import { ScrollArea } from "@/components/ui/scroll-area";
import UpdateProfileForm from "@/components/update-profile";

const Profile = () => {
  const { data, isLoading, isFetching } = useGetProfileQuery();

  if (isLoading || isFetching) {
    return <Skeleton />;
  }

  const user = data?.user;

  if (user?.type === "group") return;

  const fullName = `${user?.firstName} ${user?.lastName}`;

  return (
    <div className="flex justify-start items-start p-5 w-full">
      <div className="p-5">
        <Card>
          <CardHeader>
            <CardTitle className="capitalize text-center">
              {fullName.toLowerCase()}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user?.avatar?.url} />
              <AvatarFallback>
                {fullName
                  .split(" ")
                  .map((name) => name[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold text-center my-4">
              {user?.email}
            </p>
            <p className="text-sm text-start self-start text-muted-foreground">
              Contacts
            </p>
            <ScrollArea className="h-40">
              {user?.contacts?.map((contact) => (
                <div
                  className="pointer-events-non bg-slate-100 my-2"
                  key={contact.id}
                >
                  <Contact
                    id={contact.id}
                    name={`${contact.firstName} ${contact.lastName}`}
                    type={contact.type as "user" | "group"}
                    image={contact.avatar?.url}
                  />
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      <div className="p-5 w-full">
        <Card>
          <CardHeader>
            <CardTitle>Update Profile</CardTitle>
          </CardHeader>
          <CardContent className="w-full">
            <UpdateProfileForm user={user} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
