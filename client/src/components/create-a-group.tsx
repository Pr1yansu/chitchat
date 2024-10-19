import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import UploadWidget from "@/components/upload-widget";
import GroupMembersSelector from "./group-member-selector";

const formSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().min(1, "Group description is required"),
  isGroup: z.boolean(),
  members: z.array(z.string()).optional(),
  avatar: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface StepProps {
  form: ReturnType<typeof useForm<FormValues>>;
}

const GroupDetailsStep = ({ form }: StepProps) => (
  <FormField
    control={form.control}
    name="name"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Group Name <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Input placeholder="Enter a group name" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const GroupDescriptionStep = ({ form }: StepProps) => (
  <FormField
    control={form.control}
    name="description"
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          Group Description <span className="text-red-500">*</span>
        </FormLabel>
        <FormControl>
          <Textarea placeholder="Enter group description" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const GroupAvatarStep = ({ form }: StepProps) => (
  <FormField
    control={form.control}
    name="avatar"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Group Avatar</FormLabel>
        <UploadWidget value={field.value} onChange={field.onChange} />
        <FormMessage />
      </FormItem>
    )}
  />
);

const GroupMembersStep = ({ form }: StepProps) => (
  <FormField
    control={form.control}
    name="members"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Group Members</FormLabel>
        <FormControl>
          <GroupMembersSelector value={field.value} onChange={field.onChange} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default function CreateAGroup() {
  const [step, setStep] = useState(0);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isGroup: true,
      name: "",
      description: "",
      members: [],
      avatar: "",
    },
  });

  const steps = [
    {
      title: "Group Details",
      name: "name",
      component: <GroupDetailsStep form={form} />,
    },
    {
      title: "Group Description",
      name: "description",
      component: <GroupDescriptionStep form={form} />,
    },
    {
      title: "Group Avatar",
      name: "avatar",
      component: <GroupAvatarStep form={form} />,
    },
    {
      title: "Group Members",
      name: "members",
      component: <GroupMembersStep form={form} />,
    },
  ];

  async function onSubmit(values: FormValues) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{steps[step].title}</h2>
          <p className="text-sm text-gray-500">
            Step {step + 1} of {steps.length}
          </p>
        </div>

        {steps[step].component}

        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              setStep((prev) => Math.max(0, prev - 1));
            }}
            disabled={step === 0}
          >
            Previous
          </Button>

          {step < steps.length - 1 ? (
            <Button
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                const currentField = steps[step].name;
                const isValid = await form.trigger(
                  currentField as keyof FormValues
                );

                console.log(currentField, isValid);

                if (isValid) {
                  setStep((prev) => Math.min(steps.length - 1, prev + 1));
                }
              }}
            >
              Next
            </Button>
          ) : (
            <Button type="submit">Create Group</Button>
          )}
        </div>
      </form>
    </Form>
  );
}
