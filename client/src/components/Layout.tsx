import SideBar from "@/components/sidebar/side-bar";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-center h-screen p-0 lg:p-6 bg-slate-200 overflow-hidden">
      <div className="flex h-full max-w-screen-2xl w-full border bg-white rounded-md shadow-2xl">
        <SideBar />
        {children}
        <Toaster />
      </div>
    </div>
  );
};

export default Layout;
