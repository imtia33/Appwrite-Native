import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Clock, Calendar, Check } from 'lucide-react-native';
import { useTheme } from '../../../../../lib/theme-context';
import { cn } from '../../../../../lib/utils';

const Scheduler = ({ scheduledAt, onScheduleChange }) => {
    const { isDark } = useTheme();
    const [when, setWhen] = useState(scheduledAt ? 'later' : 'now');
    
    // Simple state for manual entry if we don't have a picker
    const [date, setDate] = useState(''); // YYYY-MM-DD
    const [time, setTime] = useState(''); // HH:mm

    const handleNow = () => {
        setWhen('now');
        onScheduleChange(null);
    };

    const handleLater = () => {
        setWhen('later');
    };

    const applySchedule = () => {
        if (date && time) {
            try {
                const combined = new Date(`${date}T${time}`);
                if (!isNaN(combined.getTime())) {
                    onScheduleChange(combined.toISOString());
                } else {
                    alert("Invalid Date/Time format");
                }
            } catch (e) {
                alert("Please use YYYY-MM-DD and HH:mm");
            }
        }
    };

    return (
        <View className="gap-6">
            <View>
                <Text className="text-sm font-bold text-foreground mb-4">Delivery Schedule</Text>
                
                <View className="flex-row gap-3">
                    <TouchableOpacity 
                        onPress={handleNow}
                        className={cn(
                            "flex-1 p-4 rounded-2xl border flex-row items-center",
                            when === 'now' ? "bg-primary/10 border-primary" : "bg-card border-border"
                        )}
                    >
                        <Clock size={20} color={when === 'now' ? "#ef4444" : "gray"} />
                        <View className="ml-3">
                            <Text className={cn("text-sm font-bold", when === 'now' ? "text-primary" : "text-foreground")}>Send Now</Text>
                            <Text className="text-[10px] text-muted-foreground">Deliver immediately</Text>
                        </View>
                        {when === 'now' && <View className="ml-auto bg-primary rounded-full p-0.5"><Check size={12} color="white" /></View>}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleLater}
                        className={cn(
                            "flex-1 p-4 rounded-2xl border flex-row items-center",
                            when === 'later' ? "bg-primary/10 border-primary" : "bg-card border-border"
                        )}
                    >
                        <Calendar size={20} color={when === 'later' ? "#ef4444" : "gray"} />
                        <View className="ml-3">
                            <Text className={cn("text-sm font-bold", when === 'later' ? "text-primary" : "text-foreground")}>Schedule</Text>
                            <Text className="text-[10px] text-muted-foreground">Future delivery</Text>
                        </View>
                        {when === 'later' && <View className="ml-auto bg-primary rounded-full p-0.5"><Check size={12} color="white" /></View>}
                    </TouchableOpacity>
                </View>

                {when === 'later' && (
                    <View className="mt-6 bg-muted/20 p-4 rounded-2xl border border-border">
                        <Text className="text-[10px] font-bold text-muted-foreground uppercase mb-3">Set Date & Time</Text>
                        <View className="flex-row gap-3 mb-4">
                            <View className="flex-1">
                                <Text className="text-xs text-foreground mb-1">Date (YYYY-MM-DD)</Text>
                                <TextInput
                                    className="bg-input text-foreground px-3 py-2 rounded-xl border border-border"
                                    placeholder="2024-12-31"
                                    placeholderTextColor="gray"
                                    value={date}
                                    onChangeText={setDate}
                                />
                            </View>
                            <View className="flex-[0.7]">
                                <Text className="text-xs text-foreground mb-1">Time (HH:mm)</Text>
                                <TextInput
                                    className="bg-input text-foreground px-3 py-2 rounded-xl border border-border"
                                    placeholder="14:30"
                                    placeholderTextColor="gray"
                                    value={time}
                                    onChangeText={setTime}
                                />
                            </View>
                        </View>
                        <TouchableOpacity 
                            onPress={applySchedule}
                            disabled={!date || !time}
                            className={cn("bg-secondary py-3 rounded-xl items-center", (!date || !time) && "opacity-50")}
                        >
                            <Text className="text-foreground font-bold">Apply Schedule</Text>
                        </TouchableOpacity>
                        
                        {scheduledAt && (
                            <View className="mt-3 flex-row items-center justify-center bg-primary/5 py-2 rounded-lg">
                                <Clock size={12} color="#ef4444" />
                                <Text className="text-[10px] text-primary font-bold ml-2">Scheduled for: {new Date(scheduledAt).toLocaleString()}</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        </View>
    );
};

export default Scheduler;
