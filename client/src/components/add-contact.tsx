import {
  useAddContactMutation,
  useGetAllUsersQuery,
  useGetProfileQuery,
} from "@/store/api/users/user";
import { Skeleton } from "@/components/ui/skeleton";
import ReactSelect from "react-select";
import { useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { openModal } from "@/store/slices/add-group-modal";
import AddGroupModal from "@/components/modal/add-group-modal";
import CreateAGroup from "@/components/create-a-group";

interface DEFAULT_OPTION {
  value: string;
  label: string;
}

const AddContact = () => {
  const dispatch = useDispatch();
  const [selectedOption, setSelectedOption] = useState<DEFAULT_OPTION | null>(
    null
  );
  const { refetch } = useGetProfileQuery();
  const [addContact] = useAddContactMutation();
  const [pending, startTransition] = useTransition();
  const { data, isLoading, isFetching } = useGetAllUsersQuery();

  const options = useMemo(() => {
    if (data) {
      const users = data.users.filter((user) => user.type === "user");

      return users.map((user) => ({
        value: user.id,
        label: `${user.firstName} ${user.lastName}`,
      }));
    }
    return null;
  }, [data]);

  if (isLoading || isFetching) {
    return <Skeleton className="w-full h-10" />;
  }

  const handleAddContact = (contactId: string) => {
    if (!contactId) {
      toast.error("Please select a user.");
      return;
    }
    startTransition(() => {
      addContact({ contactId })
        .then(({ data, error }) => {
          if (data?.message) {
            toast.success(data.message);
            refetch();
          }
          if (error) {
            toast.error(error as string);
          }
        })
        .catch(() => {
          toast.error("Failed to add contact.");
        });
    });
  };

  return (
    <div>
      {options === null ? (
        <p className="text-primary text-center">No user found.</p>
      ) : (
        <ReactSelect
          options={options}
          value={selectedOption}
          onChange={setSelectedOption}
          styles={{
            indicatorSeparator: () => ({
              display: "none",
            }),
            control: (styles) => ({
              ...styles,
              backgroundColor: "#f3f4f6",
              borderColor: "#f3f4f6",
              minHeight: "2.5rem",
              fontSize: "0.75rem",
              cursor: "pointer",
            }),
          }}
        />
      )}

      <Button
        className="mt-4 w-full"
        disabled={options === null || pending}
        onClick={() => handleAddContact(selectedOption?.value as string)}
      >
        Start conversation 💬
      </Button>

      <h3 className="text-primary text-center text-xs mt-4">Or</h3>

      <Button
        className="mt-4 w-full"
        variant={"outline"}
        onClick={() => {
          dispatch(openModal());
        }}
      >
        Create Group 🚀
      </Button>

      <AddGroupModal
        title="Create Group"
        description="Create a new group to start a conversation with multiple users."
      >
        <CreateAGroup />
      </AddGroupModal>
    </div>
  );
};

export default AddContact;
