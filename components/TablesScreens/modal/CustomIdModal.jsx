import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const CustomIdModal = ({ 
    isOpen, 
    onOpenChange, 
    onAdd, 
    roleType = 'user',
    initialValue = '' 
}) => {
    const [customValue, setCustomValue] = useState(initialValue);
    const title = roleType === 'user' ? 'Add User Permission' : 'Add Team Permission';
    const label = roleType === 'user' ? 'User ID' : 'Team ID';
    const placeholder = `Enter ${roleType} ID`;

    const handleAdd = () => {
        if (customValue.trim()) {
            onAdd(customValue.trim());
            setCustomValue('');
        }
    };

    const handleCancel = () => {
        setCustomValue(initialValue);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] max-w-[400px] min-w-[300px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>
                
                <View className="gap-6 py-6">
                    <View className="gap-3">
                        <Label className="text-base font-medium">{label}</Label>
                        <Input
                            placeholder={placeholder}
                            value={customValue}
                            onChangeText={setCustomValue}
                            onSubmitEditing={handleAdd}
                            className="h-10 text-base"
                        />
                    </View>
                </View>

                <DialogFooter className="gap-3 py-4">
                    <Button 
                        variant="outline" 
                        className="flex-1 h-10"
                        onPress={handleCancel}
                    >
                        <Text className="font-medium">Cancel</Text>
                    </Button>
                    <Button 
                        className="flex-1 h-10" 
                        onPress={handleAdd}
                        disabled={!customValue.trim()}
                    >
                        <Text className="text-white font-bold">Add</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CustomIdModal;