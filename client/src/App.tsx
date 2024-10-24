import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Loader from "@/pages/loader";
import Layout from "@/components/Layout";
import { useGetProfileQuery } from "./store/api/users/user";
import { socket } from "./services/socket";
import { useDispatch } from "react-redux";
import { setOnlineStatus } from "./store/slices/status";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Chat = lazy(() => import("./pages/chat"));
const Profile = lazy(() => import("./pages/profile"));
const Settings = lazy(() => import("./pages/settings"));
const Auth = lazy(() => import("./pages/auth/auth"));
const PasswordReset = lazy(() => import("./pages/auth/forgot-password"));
const NotFound = lazy(() => import("./pages/not-found"));
const Home = lazy(() => import("./pages/home"));
const Call = lazy(() => import("./pages/call"));

const INACTIVITY_TIMEOUT = 300000;

const App = () => {
  const dispatch = useDispatch();
  const { data, isLoading } = useGetProfileQuery();
  const navigate = useNavigate();

  useEffect(() => {
    if (!data?.user) {
      return;
    }

    let idleTimeout: NodeJS.Timeout;

    const handleUserActivity = () => {
      clearTimeout(idleTimeout);
      idleTimeout = setTimeout(() => {
        socket.emit("user_idle");
        dispatch(
          setOnlineStatus({
            userId: data?.user?.id || "",
            onlineStatus: "idle",
          })
        );
      }, INACTIVITY_TIMEOUT);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        socket.emit("user_active");
      } else {
        socket.emit("user_idle");
      }
    };

    socket.connect();

    socket.emit("user_online", { userId: data.user?.id });

    socket.on("online-users", (onlineUsers) => {
      onlineUsers.forEach((userId: string) => {
        dispatch(
          setOnlineStatus({
            onlineStatus: "online",
            userId,
          })
        );
      });
    });

    socket.on("user_connected", (user) => {
      dispatch(
        setOnlineStatus({
          onlineStatus: user.status,
          userId: user.userId,
        })
      );
    });

    socket.on("user_disconnected", (user) => {
      dispatch(
        setOnlineStatus({
          onlineStatus: user.status,
          userId: user.userId,
        })
      );
    });

    socket.on("user_idle", (user) => {
      dispatch(
        setOnlineStatus({
          onlineStatus: user.status,
          userId: user.userId,
        })
      );
    });

    socket.on("incoming-call", (data) => {
      navigate(`/call/${data.callerId}?status=incoming`);
    });

    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("keypress", handleUserActivity);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.disconnect();
      socket.off("user_connected");
      socket.off("user_disconnected");
      socket.off("user_idle");
      socket.off("incoming-call");
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keypress", handleUserActivity);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearTimeout(idleTimeout);
    };
  }, [data, dispatch, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  const user = data?.user;

  return (
    <Suspense fallback={<Loader />}>
      <Layout>
        <Routes>
          {user ? (
            <>
              <Route path="/auth" element={<Navigate to="/chat" replace />} />
              <Route path="/" element={<Home />} />
              {user.role && <Route path="/dashboard" element={<Dashboard />} />}
              <Route path="/chat" element={<Chat />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/call/:userId" element={<Call />} />
              <Route path="*" element={<NotFound />} />
            </>
          ) : (
            <>
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<PasswordReset />} />
              <Route path="*" element={<Navigate to="/auth" replace />} />
            </>
          )}
        </Routes>
      </Layout>
    </Suspense>
  );
};

export default App;
