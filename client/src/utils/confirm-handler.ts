let confirmResolve: ((value: boolean) => void) | null = null;

export const setConfirmResolve = (resolve: (value: boolean) => void) => {
  confirmResolve = resolve;
};

export const getConfirmResolve = () => confirmResolve;

export const clearConfirmResolve = () => {
  confirmResolve = null;
};
