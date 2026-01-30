import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { Plus, Trash2 } from 'lucide-react-native';

const INDEX_TYPES = [
    { label: 'Key', value: 'key' },
    { label: 'Unique', value: 'unique' },
    { label: 'Fulltext', value: 'fulltext' },
];

const ORDERS = [
    { label: 'ASC', value: 'ASC' },
    { label: 'DESC', value: 'DESC' },
];

const CreateIndexModal = ({ isOpen, onOpenChange, attributes = [], onCreate }) => {
    const [key, setKey] = useState('');
    const [type, setType] = useState('key');
    const [selectedAttributes, setSelectedAttributes] = useState([{ key: attributes[0]?.key || '', order: 'ASC' }]);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const attrKeys = selectedAttributes.map(a => a.key);
            const attrOrders = selectedAttributes.map(a => a.order);
            await onCreate({ key, type, attributes: attrKeys, orders: attrOrders });
            onOpenChange(false);
            setKey('');
            setSelectedAttributes([{ key: attributes[0]?.key || '', order: 'ASC' }]);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addAttribute = () => {
        setSelectedAttributes([...selectedAttributes, { key: attributes[0]?.key || '', order: 'ASC' }]);
    };

    const removeAttribute = (index) => {
        setSelectedAttributes(selectedAttributes.filter((_, i) => i !== index));
    };

    const updateAttribute = (index, field, value) => {
        const updated = [...selectedAttributes];
        updated[index][field] = value;
        setSelectedAttributes(updated);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[450px] w-[95%] p-0 overflow-hidden bg-background border-border max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">Create Index</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6 max-h-[60vh]">
                    <View className="gap-4">
                        <View className="gap-2">
                            <Label nativeID="index-key">Index Key</Label>
                            <Input 
                                placeholder="e.g. index_title"
                                value={key}
                                onChangeText={setKey}
                            />
                        </View>

                        <View className="gap-2">
                            <Label nativeID="index-type">Index Type</Label>
                            <Select 
                                value={{ value: type, label: INDEX_TYPES.find(t => t.value === type).label }} 
                                onValueChange={(val) => setType(val.value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {INDEX_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value} label={t.label}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </View>

                        <View className="mt-4">
                            <Label className="mb-2">Attributes</Label>
                            {selectedAttributes.map((attr, index) => (
                                <View key={index} className="flex-row gap-2 mb-3 items-center">
                                    <View className="flex-[1.5]">
                                        <Select 
                                            value={{ value: attr.key, label: attr.key }} 
                                            onValueChange={(val) => updateAttribute(index, 'key', val.value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Attribute" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {attributes.map(a => (
                                                    <SelectItem key={a.key} value={a.key} label={a.key}>{a.key}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </View>
                                    <View className="flex-1">
                                        <Select 
                                            value={{ value: attr.order, label: attr.order }} 
                                            onValueChange={(val) => updateAttribute(index, 'order', val.value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Order" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ORDERS.map(o => (
                                                    <SelectItem key={o.value} value={o.value} label={o.label}>{o.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </View>
                                    {selectedAttributes.length > 1 && (
                                        <TouchableOpacity onPress={() => removeAttribute(index)} className="p-2">
                                            <Icon as={Trash2} size={18} className="text-destructive" />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2 flex-row items-center justify-center gap-2 border-dashed h-10"
                                onPress={addAttribute}
                            >
                                <Icon as={Plus} size={16} className="text-primary" />
                                <Text className="text-primary text-xs font-medium">Add Attribute</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>

                <DialogFooter className="p-6 border-t border-border flex-row gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1">
                            <Text>Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button onPress={handleCreate} disabled={loading} className="flex-1">
                        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Create</Text>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default CreateIndexModal;
