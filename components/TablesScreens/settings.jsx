import React from 'react';
import { View, Text, ScrollView } from 'react-native';

import Permissions from './componants/Permissions';
import GeneralInfo from './componants/generalInfo';
import DisplayName from './componants/DisplayName';
import Security from './componants/Security';
import DangerZone from './componants/DangerZone';

const Settings = ({ databaseId, collectionId }) => {
    return (
        <ScrollView className="flex-1 bg-background p-4">
            <View className="mb-10">
                
                <GeneralInfo databaseId={databaseId} collectionId={collectionId} />
                <DisplayName databaseId={databaseId} collectionId={collectionId} />
                <Permissions databaseId={databaseId} collectionId={collectionId} />
                <Security databaseId={databaseId} collectionId={collectionId} />
                <DangerZone databaseId={databaseId} collectionId={collectionId} />
            </View>
        </ScrollView>
    );
};

export default Settings;
