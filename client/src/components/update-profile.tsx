import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import {
  useGetProfileQuery,
  useUpdateUserMutation,
} from "@/store/api/users/user";
import { useTransition } from "react";
import { toast } from "sonner";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name is too short" }),
  lastName: z.string().min(2, { message: "Last name is too short" }),
  email: z.string().email(),
});

const UpdateProfileForm = ({ user }: { user?: User }) => {
  const { refetch } = useGetProfileQuery();
  const [isPending, startTransition] = useTransition();
  const [updateUser] = useUpdateUserMutation();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(() => {
      updateUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
      })
        .then(async ({ data }) => {
          if (data) {
            toast.success("Profile updated successfully");
            await refetch();
          } else {
            toast.error("Failed to update profile");
          }
        })
        .catch(() => {
          toast.error("Failed to update profile");
        });
    });
  }
  if (!user) return null;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={
                    !!user.githubId ||
                    !!user.googleId ||
                    !!user.facebookId ||
                    isPending
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default UpdateProfileForm;
