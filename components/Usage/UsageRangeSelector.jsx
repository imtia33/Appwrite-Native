import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../lib/theme-context';

export const RANGE_OPTIONS = {
    BILLING: 'billing',
    '30D': '30d',
    '90D': '90d'
};

const UsageRangeSelector = ({ selectedRange, onRangeChange }) => {
    const { isDark } = useTheme();

    const options = [
        { label: 'Billing Period', value: RANGE_OPTIONS.BILLING },
        { label: '30 Days', value: RANGE_OPTIONS['30D'] },
        { label: '90 Days', value: RANGE_OPTIONS['90D'] },
    ];

    return (
        <View className="flex-row items-center justify-between px-5 py-3">
            <View className="flex-row gap-2">
                {options.map((opt) => {
                    const isActive = selectedRange === opt.value;
                    return (
                        <TouchableOpacity
                            key={opt.value}
                            onPress={() => onRangeChange(opt.value)}
                            style={{
                                backgroundColor: isActive 
                                    ? (isDark ? 'rgba(253, 54, 110, 0.15)' : 'rgba(253, 54, 110, 0.1)')
                                    : 'transparent',
                                borderColor: isActive ? '#FD366E' : 'transparent',
                                borderWidth: 1,
                            }}
                            className="px-3 py-1.5 rounded-full"
                        >
                            <Text 
                                style={{ color: isActive ? '#FD366E' : (isDark ? '#999' : '#71717a') }}
                                className="text-[10px] font-bold uppercase tracking-wider"
                            >
                                {opt.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

export default UsageRangeSelector;
