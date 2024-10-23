import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { openConfirm, closeConfirm } from "@/store/slices/confirm-slice";
import { RootState } from "@/store/store";
import {
  setConfirmResolve,
  getConfirmResolve,
  clearConfirmResolve,
} from "@/utils/confirm-handler";

export const useConfirm = (title: string, description: string) => {
  const dispatch = useDispatch();

  const confirm = () =>
    new Promise<boolean>((resolve) => {
      setConfirmResolve(resolve); // Store resolve function
      dispatch(openConfirm({ title, description })); // Dispatch action without resolve function
    });

  const isOpen = useSelector((state: RootState) => state.confirm.isOpen);

  useEffect(() => {
    if (!isOpen) {
      const resolve = getConfirmResolve();
      if (resolve) resolve(false);
      clearConfirmResolve();
      dispatch(closeConfirm());
    }
  }, [isOpen, dispatch]);

  return confirm;
};
