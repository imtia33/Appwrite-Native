import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const AttributeCommon = ({ 
    required, onRequiredChange, 
    array, onArrayChange,
    defaultValue, onDefaultValueChange,
    showDefault = true,
    defaultType = 'text',
    keyboardType = 'default'
}) => {
    // Determine if we should show the Array switch
    // If onArrayChange is a no-op or we explicitly pass specific prop to hide it?
    // I'll check if onArrayChange is passed and is a function. 
    // Ideally we pass a separate prop 'showArray', default true.
    const showArray = onArrayChange && onArrayChange.name !== 'noop'; // naive check, better to use explicit prop.

    return (
        <View>
            {showDefault && (
                <View className="gap-2 mt-2">
                    <Label nativeID="attr-default">Default Value (Optional)</Label>
                    <Input 
                        placeholder="Enter default value"
                        value={defaultValue}
                        onChangeText={onDefaultValueChange}
                        keyboardType={keyboardType}
                    />
                </View>
            )}

            <View className="flex-row items-center justify-between py-2 mt-4">
                <View className="flex-1 mr-4">
                    <Text className="text-sm font-medium">Required</Text>
                    <Text className="text-xs text-muted-foreground">Is this attribute required?</Text>
                </View>
                <Switch checked={required} onCheckedChange={onRequiredChange} />
            </View>

            {onArrayChange && (
                 <View className="flex-row items-center justify-between py-2">
                    <View className="flex-1 mr-4">
                        <Text className="text-sm font-medium">Array</Text>
                        <Text className="text-xs text-muted-foreground">Is this attribute an array?</Text>
                    </View>
                    <Switch checked={array} onCheckedChange={onArrayChange} />
                </View>
            )}
        </View>
    );
};
