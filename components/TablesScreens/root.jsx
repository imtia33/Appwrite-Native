import { View, Text } from 'react-native'
import React, { useState } from 'react'
import Rows from './rows'
import Columns from './columns'
import Indexes from './indexes'
import Activities from './activities'
import Settings from './settings'
import TabSwitcher from '../blocks/TabSwitcher'

const TABS = [
  { route: 'Rows', label: 'Rows' },
  { route: 'Columns', label: 'Columns' },
  { route: 'Indexes', label: 'Indexes' },
  { route: 'Activities', label: 'Activities' },
  { route: 'Settings', label: 'Settings' },
];

const Root = ({ databaseId, collectionId }) => {
  const [activeTab, setActiveTab] = useState('Rows');

  const renderContent = () => {
    switch (activeTab) {
      case 'Rows': return <Rows databaseId={databaseId} collectionId={collectionId} />;
      case 'Columns': return <Columns databaseId={databaseId} collectionId={collectionId} />;
      case 'Indexes': return <Indexes databaseId={databaseId} collectionId={collectionId} />;
      case 'Activities': return <Activities databaseId={databaseId} collectionId={collectionId} />;
      case 'Settings': return <Settings databaseId={databaseId} collectionId={collectionId} />;
      default: return null;
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
      <View className="flex-1" key={collectionId}>
        {renderContent()}
      </View>
    </View>
  )
}

export default Root