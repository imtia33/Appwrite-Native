import React from 'react';
import { View } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AttributeCommon } from './AttributeCommon';

const AttributeString = ({ 
    size, onSizeChange, 
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    return (
        <View className="gap-4">
            <View className="gap-2">
                <Label nativeID="attr-size">Size (Max 21844)</Label>
                <Input 
                    keyboardType="numeric"
                    value={String(size)}
                    onChangeText={onSizeChange}
                />
            </View>

            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={array} onArrayChange={onArrayChange}
                defaultValue={defaultValue} onDefaultValueChange={onDefaultValueChange}
            />
        </View>
    );
};

export default AttributeString;
