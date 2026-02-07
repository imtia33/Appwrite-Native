import React from "react";
import { View, Text, ScrollView } from "react-native";

import Permissions from "./componants/Permissions";
import GeneralInfo from "./componants/generalInfo";
import DisplayName from "./componants/DisplayName";
import Security from "./componants/Security";
import DangerZone from "./componants/DangerZone";
import useDatabaseStore from "../../appwrite/data-services/databaseService";
import { Card } from "../ui/card";

const Settings = ({ databaseId, tableId, onDelete }) => {
  const { tables } = useDatabaseStore();
  const table = tables[databaseId]?.find((t) => t.$id === tableId);

  if (!table) {
    return (
      <View className="flex-1 bg-background p-4">
        <Card className="p-4 mb-4">
          <Text className="text-muted-foreground">Table no longer exists</Text>
        </Card>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-10">
        <GeneralInfo databaseId={databaseId} tableId={tableId} />
        <DisplayName databaseId={databaseId} tableId={tableId} />
        <Permissions databaseId={databaseId} tableId={tableId} />
        <Security databaseId={databaseId} tableId={tableId} />
        <DangerZone
          databaseId={databaseId}
          tableId={tableId}
          onDelete={onDelete}
        />
      </View>
    </ScrollView>
  );
};

export default Settings;
