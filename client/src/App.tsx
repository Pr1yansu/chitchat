import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Loader from "@/pages/loader";
import Layout from "@/components/Layout";
import { useGetProfileQuery } from "./store/api/users/user";

const Dashboard = lazy(() => import("./pages/dashboard"));
const Chat = lazy(() => import("./pages/chat"));
const Profile = lazy(() => import("./pages/profile"));
const Settings = lazy(() => import("./pages/settings"));
const Auth = lazy(() => import("./pages/auth/auth"));
const PasswordReset = lazy(() => import("./pages/auth/forgot-password"));
const NotFound = lazy(() => import("./pages/not-found"));

const App = () => {
  const { data, isLoading } = useGetProfileQuery();

  if (isLoading) {
    return <Loader />;
  }

  const user = data?.user;

  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Layout>
          <Routes>
            {user ? (
              <>
                <Route path="/auth" element={<Navigate to="/chat" replace />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
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
    </BrowserRouter>
  );
};

export default App;
