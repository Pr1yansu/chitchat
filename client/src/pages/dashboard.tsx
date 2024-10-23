import { AreaCharts } from "@/components/charts/area-chart";
import BanUser from "@/components/charts/ban-users";
import { BarCharts } from "@/components/charts/bar-charts";
import { RadarCharts } from "@/components/charts/radar-chart";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetDashboardChatsQuery,
  useGetDashboardRoomsQuery,
  useGetDashboardUsersQuery,
} from "@/store/api/dashboard/dashboard";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const Dashboard = () => {
  const [openBanUser, setOpenBanUser] = useState(false);
  const {
    data: dashboardUsers,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useGetDashboardUsersQuery({
    start: "",
    end: "",
  });

  const {
    data: dashboardChats,
    isLoading: isChatLoading,
    isFetching: isChatFetching,
  } = useGetDashboardChatsQuery({
    start: "",
    end: "",
  });

  const {
    data: dashboardRooms,
    isLoading: isRoomLoading,
    isFetching: isRoomFetching,
  } = useGetDashboardRoomsQuery({
    start: "",
    end: "",
  });

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <ScrollArea className="w-full h-full">
      <div className="w-full p-5 flex justify-center items-center h-full">
        <motion.div
          className="grid grid-cols-2 gap-2 max-w-screen-md w-full"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {!openBanUser && (
              <>
                <motion.div
                  key="barChart"
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  {isUserFetching || isUserLoading ? (
                    <Skeleton className="h-full" />
                  ) : (
                    <BarCharts users={dashboardUsers} />
                  )}
                </motion.div>
                <motion.div
                  key="areaChart"
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {isChatFetching || isChatLoading ? (
                    <Skeleton className="h-full" />
                  ) : (
                    <AreaCharts chats={dashboardChats} />
                  )}
                </motion.div>
                <motion.div
                  key="radarChart"
                  variants={chartVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {isRoomFetching || isRoomLoading ? (
                    <Skeleton className="h-full" />
                  ) : (
                    <RadarCharts rooms={dashboardRooms} />
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <motion.div
            className="w-full h-full"
            layout
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              gridColumn: openBanUser ? "1 / span 2" : "auto",
              gridRow: openBanUser ? "1 / span 2" : "auto",
            }}
            transition={{ duration: 0.5 }}
          >
            <BanUser
              openBanUser={openBanUser}
              setOpenBanUser={setOpenBanUser}
            />
          </motion.div>
        </motion.div>
      </div>
    </ScrollArea>
  );
};

export default Dashboard;
