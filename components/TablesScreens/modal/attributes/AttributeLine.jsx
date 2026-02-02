import React from 'react';
import { View } from 'react-native';
import { AttributeCommon } from './AttributeCommon';

const AttributeLine = ({ 
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange 
}) => {
    return (
        <View className="gap-4">
            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={false} onArrayChange={() => {}} // No array for LineString
                showDefault={false}
                defaultValue={defaultValue} onDefaultValueChange={onDefaultValueChange}
            />
        </View>
    );
};

export default AttributeLine;
