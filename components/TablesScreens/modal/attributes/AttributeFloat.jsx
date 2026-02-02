import React from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttributeCommon } from './AttributeCommon';

const AttributeFloat = ({ 
    min, onMinChange,
    max, onMaxChange,
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    return (
        <View className="gap-4">
             <View className="flex-row gap-4">
                <View className="flex-1 gap-2">
                    <Label nativeID="attr-min">Min Value</Label>
                    <Input 
                        keyboardType="numeric"
                        value={min}
                        onChangeText={onMinChange}
                        placeholder="Min"
                    />
                </View>
                <View className="flex-1 gap-2">
                    <Label nativeID="attr-max">Max Value</Label>
                    <Input 
                        keyboardType="numeric"
                        value={max}
                        onChangeText={onMaxChange}
                        placeholder="Max"
                    />
                </View>
            </View>

            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={array} onArrayChange={onArrayChange}
                defaultValue={defaultValue} onDefaultValueChange={onDefaultValueChange}
                keyboardType="numeric"
            />
        </View>
    );
};

export default AttributeFloat;
