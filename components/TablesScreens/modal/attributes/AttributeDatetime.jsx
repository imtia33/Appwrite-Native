import React, { useState } from 'react';
import { View, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Label } from '@/components/ui/label';
import { AttributeCommon } from './AttributeCommon';

const AttributeDatetime = ({ 
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    const [showPicker, setShowPicker] = useState(false); // Only used for iOS
    
    // Parse defaultValue (string) to Date object, default to now if empty
    const dateValue = defaultValue ? new Date(defaultValue) : new Date();

    const handleIOSChange = (event, selectedDate) => {
        if (selectedDate) {
            onDefaultValueChange(selectedDate.toISOString());
        }
    };

    const showAndroidDatePicker = () => {
        DateTimePickerAndroid.open({
            value: dateValue,
            onChange: (event, date) => {
                if (event.type === 'set' && date) {
                    // Keep the time from the current value if possible, or just use the date.
                    // For a fresh pick, user picks date then time.
                    // Let's pass the picked date to the time picker.
                    showAndroidTimePicker(date);
                }
            },
            mode: 'date',
        });
    };

    const showAndroidTimePicker = (selectedDate) => {
        
        
        DateTimePickerAndroid.open({
            value: selectedDate, // Use the date we just picked
            onChange: (event, time) => {
                if (event.type === 'set' && time) {
                    // Construct final date with Date from `selectedDate` and Time from `time`.
                    const finalDate = new Date(selectedDate);
                    finalDate.setHours(time.getHours());
                    finalDate.setMinutes(time.getMinutes());
                    finalDate.setSeconds(0); // Optional: zero out seconds/ms for cleaner default
                    finalDate.setMilliseconds(0);
                    
                    onDefaultValueChange(finalDate.toISOString());
                }
            },
            mode: 'time',
            is24Hour: true,
        });
    };

    const togglePicker = () => {
        if (Platform.OS === 'android') {
            showAndroidDatePicker();
        } else {
            setShowPicker(!showPicker);
        }
    };

    return (
        <View className="gap-4">
            <View className="gap-2 mt-2">
                <Label nativeID="attr-default">Default Value (Optional)</Label>
                
                <View className="flex-row items-center gap-2">
                    <View className="flex-1 p-2 border border-border rounded-md bg-background">
                        <Text className={defaultValue ? "text-foreground" : "text-muted-foreground"}>
                            {defaultValue ? new Date(defaultValue).toLocaleString() : 'mm/dd/yyyy'}
                        </Text>
                    </View>
                    
                    <Button style={{borderWidth: 1, borderColor: '#3e3e3eff'}} variant="outline" onPress={togglePicker} size="sm">
                        <Text>Select Date</Text>
                    </Button>
                    
                    {defaultValue ? (
                        <Button style={{borderWidth: 1, borderColor: '#3e3e3eff'}} variant="outline" onPress={() => onDefaultValueChange('')} size="sm">
                            <Text className="text-destructive">Clear</Text>
                        </Button>
                    ) : null}
                </View>

                {Platform.OS === 'ios' && showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={dateValue}
                        mode="datetime"
                        is24Hour={true}
                        display="default"
                        onChange={handleIOSChange}
                    />
                )}
            </View>

            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={array} onArrayChange={onArrayChange}
                showDefault={false} // We handle default value input above
            />
        </View>
    );
};

export default AttributeDatetime;
