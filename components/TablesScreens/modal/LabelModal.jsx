import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const LabelModal = ({ isOpen, onOpenChange, onAdd, initialValue = '' }) => {
    const [labelValue, setLabelValue] = useState(initialValue);

    const handleAdd = () => {
        if (labelValue.trim()) {
            onAdd(labelValue.trim());
            setLabelValue('');
        }
    };

    const handleCancel = () => {
        setLabelValue(initialValue);
        onOpenChange(false);
    };

    const handleKeyPress = (e) => {
        if (e.nativeEvent.key === 'Enter') {
            handleAdd();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] max-w-[400px] min-w-[300px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Add Label Permission</DialogTitle>
                </DialogHeader>
                
                <View className="gap-6 py-6">
                    <View className="gap-3">
                        <Label className="text-base font-medium">Label Name</Label>
                        <Input
                            placeholder="Enter label name"
                            value={labelValue}
                            onChangeText={setLabelValue}
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
                        disabled={!labelValue.trim()}
                    >
                        <Text className="text-white font-bold">Add</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LabelModal;