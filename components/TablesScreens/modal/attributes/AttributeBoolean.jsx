import React from 'react';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AttributeCommon } from './AttributeCommon';

const AttributeBoolean = ({ 
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    return (
        <View className="gap-4">
            <View className="gap-2 mt-2">
                <Label nativeID="attr-default">Default Value (Optional)</Label>
                <View className="flex-row items-center gap-2">
                    <Switch 
                        checked={defaultValue === 'true'} 
                        onCheckedChange={(val) => onDefaultValueChange(val ? 'true' : 'false')}
                    />
                    <Text className="text-sm">{defaultValue === 'true' ? 'True' : 'False'}</Text>
                </View>
            </View>

            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={array} onArrayChange={onArrayChange}
                showDefault={false}
            />
        </View>
    );
};

export default AttributeBoolean;
