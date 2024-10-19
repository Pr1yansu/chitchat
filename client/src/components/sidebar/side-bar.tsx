import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { includedRoutes } from "@/routes";
import {
  LucideLayoutDashboard,
  MessageCircle,
  User,
  Settings,
  CircleArrowOutUpRight,
} from "lucide-react";
import { useLogoutMutation } from "@/store/api/users/user";
import { useEffect } from "react";
import { toast } from "sonner";

const routes = [
  {
    label: "Dashboard",
    icon: LucideLayoutDashboard,
    href: "/",
  },
  {
    label: "Chat",
    icon: MessageCircle,
    href: "/chat",
  },
  {
    label: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

const SideBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [logout, { isLoading: isLoggingOut, error: logoutError }] =
    useLogoutMutation();

  useEffect(() => {
    if (logoutError) {
      toast.error("Failed to logout");
    }
  }, [logoutError]);

  if (includedRoutes.includes(pathname))
    return (
      <div className="px-3 py-8 shadow-right-sm flex flex-col relative">
        <Link className="pb-8" to="/">
          <Logo
            imageClassname="size-10"
            textClassname="text-2xl mt-0"
            className="flex-row flex items-center"
          />
        </Link>
        <div className="flex flex-col space-y-8 flex-1 items-center pt-12">
          {routes.map((route, index) => (
            <TooltipProvider key={index}>
              <Tooltip delayDuration={1}>
                <TooltipTrigger>
                  <NavLink
                    to={route.href}
                    className={cn(
                      "flex items-center justify-center size-10 rounded-lg focus:outline-none focus:bg-primary focus:text-primary-foreground transition",
                      pathname === route.href
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-primary/50 hover:text-primary-foreground"
                    )}
                  >
                    {route.icon && <route.icon className="size-5" />}
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="text-xs">{route.label}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        <div>
          <TooltipProvider>
            <Tooltip delayDuration={1}>
              <TooltipTrigger asChild>
                <Button
                  size={"icon"}
                  variant={"destructive"}
                  disabled={isLoggingOut}
                  onClick={() => {
                    logout()
                      .then((data) => {
                        if (data) {
                          navigate(0);
                          toast.success("Logged out successfully");
                        }
                      })
                      .catch(() => {
                        toast.error("Failed to logout");
                      });
                  }}
                >
                  <CircleArrowOutUpRight className="size-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <span className="text-xs">Logout</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );

  return null;
};

export default SideBar;
