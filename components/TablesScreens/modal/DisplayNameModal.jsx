import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Check, Columns } from 'lucide-react-native';
import { Checkbox } from '@/components/ui/checkbox';

const DisplayNameModal = ({ isOpen, onOpenChange, attributes = [], selectedItems = [], onSave }) => {
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        setLocalSelected(selectedItems);
    }, [selectedItems, isOpen]);

    const toggleItem = (key) => {
        if (localSelected.includes(key)) {
            setLocalSelected(localSelected.filter(i => i !== key));
        } else {
            if (localSelected.length < 5) {
                setLocalSelected([...localSelected, key]);
            }
        }
    };

    const handleSave = () => {
        onSave(localSelected);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] w-[95%] p-0 overflow-hidden bg-background border-border max-h-[80vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">Display Name</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6">
                    <Text className="text-sm text-muted-foreground mb-4">
                        Select up to 5 string columns to display as row names. These help identify rows in places like relationships.
                    </Text>

                    <View className="gap-2">
                        {attributes.filter(a => a.type === 'string').map((attr) => (
                            <TouchableOpacity 
                                key={attr.key}
                                onPress={() => toggleItem(attr.key)}
                                className={`flex-row items-center p-3 rounded-xl border ${localSelected.includes(attr.key) ? 'border-primary bg-primary/5' : 'border-border'}`}
                            >
                                <Checkbox 
                                    checked={localSelected.includes(attr.key)}
                                    onCheckedChange={() => toggleItem(attr.key)}
                                />
                                <View className="ml-3 flex-1">
                                    <Text className={`text-sm font-medium ${localSelected.includes(attr.key) ? 'text-primary' : 'text-foreground'}`}>
                                        {attr.key}
                                    </Text>
                                    <Text className="text-[10px] text-muted-foreground uppercase">{attr.format || attr.type}</Text>
                                </View>
                                {localSelected.includes(attr.key) && (
                                    <Icon as={Check} size={16} className="text-primary" />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <DialogFooter className="p-6 border-t border-border flex-row gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1">
                            <Text>Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button onPress={handleSave} className="flex-1">
                        <Text className="text-white font-bold">Save ({localSelected.length}/5)</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DisplayNameModal;
