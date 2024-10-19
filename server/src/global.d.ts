import { IUser } from "./types/IUser";
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {};
