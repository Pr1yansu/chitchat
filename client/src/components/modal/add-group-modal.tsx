import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { closeModal } from "@/store/slices/add-group-modal";
import { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";

interface ModalProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
}

const AddGroupModal = ({ title, description, children }: ModalProps) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.groupModal.isOpen);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          dispatch(closeModal());
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default AddGroupModal;
