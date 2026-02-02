import React from 'react';
import { View } from 'react-native';
import { AttributeCommon } from './AttributeCommon';

const AttributePoint = ({ 
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    return (
        <View className="gap-4">
            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange} // Point has required
                array={false} onArrayChange={() => {}} // Spatial types usually don't support arrays in Appwrite Console UI effectively or at all
                showDefault={false}
                defaultValue={defaultValue} onDefaultValueChange={onDefaultValueChange}
            />
        </View>
    );
};

export default AttributePoint;
