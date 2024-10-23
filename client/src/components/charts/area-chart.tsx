import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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

const chartConfig = {
  chats: {
    label: "Chats",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export const AreaCharts = ({ chats = [] }: { chats?: DashboardUsers[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Chats</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chats}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <defs>
              <linearGradient x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={chartConfig.chats.color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={chartConfig.chats.color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Area
              dataKey="count"
              fill={chartConfig.chats.color}
              fillOpacity={0.2}
              stroke={chartConfig.chats.color}
              stackId={"a"}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
