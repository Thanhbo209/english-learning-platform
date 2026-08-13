"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type WeeklyProgressPoint = {
  week: string;
  completed: number;
  inProgress: number;
};

const chartConfig = {
  completed: {
    label: "Completed",
    color: "var(--color-chart-1)",
  },
  inProgress: {
    label: "In progress",
    color: "var(--color-chart-2)",
  },
} satisfies ChartConfig;

export function ProgressChart({ data }: { data: WeeklyProgressPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[240px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="week" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="completed" fill="var(--color-completed)" radius={4} />
            <Bar dataKey="inProgress" fill="var(--color-inProgress)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
