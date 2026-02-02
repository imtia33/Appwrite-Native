import React from 'react';
import { View } from 'react-native';
import { AttributeCommon } from './AttributeCommon';

// Shared component for Email, Url, Ip, Datetime as they share the same structure
export const AttributeGeneric = ({ 
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    return (
        <View className="gap-4">
            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={array} onArrayChange={onArrayChange}
                defaultValue={defaultValue} onDefaultValueChange={onDefaultValueChange}
            />
        </View>
    );
};
