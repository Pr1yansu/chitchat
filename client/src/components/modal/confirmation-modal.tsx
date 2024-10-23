import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RootState } from "@/store/store";
import { closeConfirm } from "@/store/slices/confirm-slice";
import { Button } from "@/components/ui/button";
import {
  getConfirmResolve,
  clearConfirmResolve,
} from "@/utils/confirm-handler";

const ConfirmDialog = () => {
  const dispatch = useDispatch();
  const { isOpen, title, description } = useSelector(
    (state: RootState) => state.confirm
  );

  const handleConfirm = () => {
    const resolve = getConfirmResolve();
    if (resolve) resolve(true); // Resolve the promise with 'true'
    clearConfirmResolve(); // Clear the stored resolve function
    dispatch(closeConfirm()); // Close the dialog
  };

  const handleCancel = () => {
    const resolve = getConfirmResolve();
    if (resolve) resolve(false); // Resolve the promise with 'false'
    clearConfirmResolve(); // Clear the stored resolve function
    dispatch(closeConfirm()); // Close the dialog
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} variant="destructive">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
