import React from "react";
import { View, Text, ScrollView } from "react-native";

import Permissions from "./componants/Permissions";
import GeneralInfo from "./componants/generalInfo";
import DisplayName from "./componants/DisplayName";
import Security from "./componants/Security";
import DangerZone from "./componants/DangerZone";

const Settings = ({ databaseId, tableId }) => {
  return (
    <ScrollView className="flex-1 bg-background p-4">
      <View className="mb-10">
        <GeneralInfo databaseId={databaseId} tableId={tableId} />
        <DisplayName databaseId={databaseId} tableId={tableId} />
        <Permissions databaseId={databaseId} tableId={tableId} />
        <Security databaseId={databaseId} tableId={tableId} />
        <DangerZone databaseId={databaseId} tableId={tableId} />
      </View>
    </ScrollView>
  );
};

export default Settings;
