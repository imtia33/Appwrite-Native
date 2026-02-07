import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useTheme } from "../../../lib/theme-context";
import { useUsageStore } from "../../../appwrite/store/usageStore";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import SmoothLineChart from "../../ui/SmoothLineChart";
import { Card } from "../../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { Icon } from "../../ui/icon";
import { ChevronDown } from "lucide-react-native";
import { cn } from "../../../lib/utils";

const RANGES = [
  { value: "billing", label: "Current billing period" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const ChartCard = ({
  title,
  data,
  totalValue,
  unit,
  formatter,
  range,
  onRangeChange,
  isLoading,
}) => {
  const { isDark } = useTheme();

  return (
    <Card className="p-4 border-none shadow-none bg-secondary/15 mb-4">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-lg font-semibold text-foreground">{title}</Text>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex-row items-center gap-1 px-2 h-8"
            >
              <Text className="text-xs text-muted-foreground font-medium">
                {RANGES.find((r) => r.value === range)?.label}
              </Text>
              <Icon as={ChevronDown} size={12} color="gray" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[180px]">
            {RANGES.map((r) => (
              <DropdownMenuItem
                key={r.value}
                onPress={() => onRangeChange(r.value)}
              >
                <Text className="text-muted-foreground">{r.label}</Text>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </View>

      {isLoading ? (
        <View className="h-[150px] items-center justify-center">
          <ActivityIndicator color="#FD366E" />
        </View>
      ) : (
        <SmoothLineChart
          data={data}
          Title={title}
          totalValue={totalValue}
          unit={unit}
          formatter={formatter}
          height={150}
        />
      )}
    </Card>
  );
};

const OverviewUsage = () => {
  const { currentProject } = useProjectStore();
  const { usageData, loading, fetchUsage } = useUsageStore();

  const [bandwidthRange, setBandwidthRange] = useState("30d");
  const [requestsRange, setRequestsRange] = useState("30d");

  const projectId = currentProject?.$id;
  const category = "overview";

  useEffect(() => {
    if (projectId) {
      fetchUsage(projectId, category, bandwidthRange);
    }
  }, [projectId, bandwidthRange]);

  useEffect(() => {
    if (projectId && requestsRange !== bandwidthRange) {
      fetchUsage(projectId, category, requestsRange);
    }
  }, [projectId, requestsRange]);

  // Data selector helper
  const getChartData = (rng, type) => {
    const data = usageData[`${category}-${rng}`];
    if (!data?.[type]) return [];
    return data[type].map((item) => ({
      label: new Date(item.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
      }),
      y: item.value,
    }));
  };

  const getChartTotal = (rng, type) => {
    const data = usageData[`${category}-${rng}`];
    if (!data?.[type]) return 0;
    return data[type].reduce((acc, item) => acc + item.value, 0);
  };

  const bwData = useMemo(
    () => getChartData(bandwidthRange, "network"),
    [usageData, bandwidthRange],
  );
  const rqData = useMemo(
    () => getChartData(requestsRange, "requests"),
    [usageData, requestsRange],
  );

  const bwTotal = useMemo(
    () => getChartTotal(bandwidthRange, "network"),
    [usageData, bandwidthRange],
  );
  const rqTotal = useMemo(
    () => getChartTotal(requestsRange, "requests"),
    [usageData, requestsRange],
  );

  const bwFormatted = humanFileSize(bwTotal);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16 }}
    >
      <Text className="text-xl font-bold text-foreground mb-4">
        Project Usage
      </Text>

      <ChartCard
        title="Bandwidth"
        data={bwData}
        totalValue={bwTotal}
        unit={bwFormatted.unit}
        formatter={(val) => humanFileSize(val).value}
        range={bandwidthRange}
        onRangeChange={setBandwidthRange}
        isLoading={loading[`${category}-${bandwidthRange}`]}
      />

      <ChartCard
        title="Requests"
        data={rqData}
        totalValue={rqTotal}
        formatter={formatNum}
        range={requestsRange}
        onRangeChange={setRequestsRange}
        isLoading={loading[`${category}-${requestsRange}`]}
      />
    </ScrollView>
  );
};

export default OverviewUsage;
