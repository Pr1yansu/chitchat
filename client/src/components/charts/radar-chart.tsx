import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DashboardUsers } from "@/types";
import { format } from "date-fns";
import { useMemo } from "react";

const chartConfig = {
  rooms: {
    label: "Rooms",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const RadarCharts = ({ rooms = [] }: { rooms?: DashboardUsers[] }) => {
  const formattedRooms = useMemo(() => {
    return rooms.map((room) => ({
      ...room,
      day: format(
        new Date(room.day.replace(/(\d+)(st|nd|rd|th)/, "$1")),
        "dd MMM"
      ),
    }));
  }, [rooms]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rooms</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <RadarChart data={formattedRooms}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="day" />
            <PolarGrid />
            <Radar
              dataKey="count"
              fill={chartConfig.rooms.color}
              fillOpacity={0.6}
              dot={{
                r: 3,
                fillOpacity: 1,
              }}
              activeDot={{
                r: 5,
                fillOpacity: 1,
              }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
