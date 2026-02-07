import { View, Text } from "react-native";
import React, { useState } from "react";
import Rows from "./rows";
import Columns from "./columns";
import Indexes from "./indexes";
import Activities from "./activities";
import Settings from "./settings";
import TabSwitcher from "../blocks/TabSwitcher";

const TABS = [
  { route: "Rows", label: "Rows" },
  { route: "Columns", label: "Columns" },
  { route: "Indexes", label: "Indexes" },
  { route: "Activities", label: "Activities" },
  { route: "Settings", label: "Settings" },
];

const Root = ({ databaseId, tableId, onDelete }) => {
  const [activeTab, setActiveTab] = useState("Rows");

  const renderContent = () => {
    switch (activeTab) {
      case "Rows":
        return <Rows databaseId={databaseId} tableId={tableId} />;
      case "Columns":
        return <Columns databaseId={databaseId} tableId={tableId} />;
      case "Indexes":
        return <Indexes databaseId={databaseId} tableId={tableId} />;
      case "Activities":
        return <Activities databaseId={databaseId} tableId={tableId} />;
      case "Settings":
        return (
          <Settings
            databaseId={databaseId}
            tableId={tableId}
            onDelete={onDelete}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <View className="py-2 border-b border-border">
        <TabSwitcher
          tabs={TABS}
          activeRoute={activeTab}
          onTabPress={(route) => setActiveTab(route)}
        />
      </View>
      <View className="flex-1" key={tableId}>
        {renderContent()}
      </View>
    </View>
  );
};

export default Root;
