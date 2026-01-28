import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

const TabSwitcher = ({ tabs, activeRoute, onTabPress }) => {
    return (
        <View style={{ height: 45 }} className=" px-1 py-1 max-w-[95%] self-center bg-secondary border border-0 border-border rounded-lg">
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerClassName=" gap-2"
            >
                {tabs.map(tab => {
                    const isActive = activeRoute === tab.route;

                    return (
                        <Pressable
                            key={tab.route}
                            onPress={() => onTabPress(tab.route)}
                            className={`p-2 rounded-md ${isActive
                                ? 'bg-card'
                                : 'bg-transparent'
                                }`}
                        >
                            <Text
                                style={{ fontSize: 16 }}
                                className={` ${isActive
                                    ? 'text-accent-foreground font-medium'
                                    : 'text-neutral-500 font-medium'
                                    }`}
                            >
                                {tab.label}
                            </Text>
                        </Pressable>
                    )
                })}
            </ScrollView>
        </View>
    );
};

export default TabSwitcher;
