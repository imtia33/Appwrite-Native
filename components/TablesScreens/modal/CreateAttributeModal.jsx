import React, { useState } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Icon } from '@/components/ui/icon';
import { ChevronDown } from 'lucide-react-native';

const ATTRIBUTE_TYPES = [
    { label: 'String', value: 'string' },
    { label: 'Integer', value: 'integer' },
    { label: 'Double', value: 'double' },
    { label: 'Boolean', value: 'boolean' },
    { label: 'Datetime', value: 'datetime' },
    { label: 'Email', value: 'email' },
    { label: 'URL', value: 'url' },
    { label: 'IP', value: 'ip' },
    { label: 'Enum', value: 'enum' },
    { label: 'Relationship', value: 'relationship' },
];

const RELATIONSHIP_TYPES = [
    { label: 'One-to-one', value: 'oneToOne' },
    { label: 'One-to-many', value: 'oneToMany' },
    { label: 'Many-to-one', value: 'manyToOne' },
    { label: 'Many-to-many', value: 'manyToMany' },
];

const ON_DELETE_BEHAVIORS = [
    { label: 'Set Null', value: 'setNull' },
    { label: 'Cascade', value: 'cascade' },
    { label: 'Restrict', value: 'restrict' },
];

const CreateAttributeModal = ({ isOpen, onOpenChange, onCreate, collections = [] }) => {
    const [key, setKey] = useState('');
    const [type, setType] = useState('string');
    const [size, setSize] = useState('255');
    const [required, setRequired] = useState(false);
    const [array, setArray] = useState(false);
    const [defaultValue, setDefaultValue] = useState('');
    
    // Enum states
    const [elements, setElements] = useState('');
    
    // Relationship states
    const [relatedTable, setRelatedTable] = useState('');
    const [relationType, setRelationType] = useState('oneToOne');
    const [twoWay, setTwoWay] = useState(false);
    const [twoWayKey, setTwoWayKey] = useState('');
    const [onDelete, setOnDelete] = useState('setNull');

    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            let data = { key, required, array };
            
            if (type === 'string') data.size = Number(size);
            if (type === 'enum') data.elements = elements.split(',').map(e => e.trim()).filter(e => e);
            if (type === 'relationship') {
                data = {
                    ...data,
                    relatedTableId: relatedTable,
                    type: relationType,
                    twoWay,
                    twoWayKey: twoWay ? twoWayKey : undefined,
                    onDelete
                };
            }
            if (type !== 'relationship' && defaultValue) {
                data.xdefault = defaultValue;
            }

            await onCreate({ type, data });
            onOpenChange(false);
            resetForm();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setKey('');
        setType('string');
        setSize('255');
        setRequired(false);
        setArray(false);
        setDefaultValue('');
        setElements('');
        setRelatedTable('');
        setRelationType('oneToOne');
        setTwoWay(false);
        setTwoWayKey('');
        setOnDelete('setNull');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[400px] w-[95%] p-0 overflow-hidden bg-background border-border">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">Create Attribute</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6 max-h-[60vh]">
                    <View className="gap-4">
                        <View className="gap-2">
                            <Label nativeID="attr-key">Attribute Key</Label>
                            <Input 
                                placeholder="e.g. title, user_id"
                                value={key}
                                onChangeText={setKey}
                            />
                        </View>

                        <View className="gap-2">
                            <Label nativeID="attr-type">Type</Label>
                            <Select 
                                value={{ value: type, label: ATTRIBUTE_TYPES.find(t => t.value === type).label }} 
                                onValueChange={(val) => setType(val.value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ATTRIBUTE_TYPES.map(t => (
                                        <SelectItem key={t.value} value={t.value} label={t.label}>{t.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </View>

                        {type === 'string' && (
                            <View className="gap-2">
                                <Label nativeID="attr-size">Size (Max 21844)</Label>
                                <Input 
                                    keyboardType="numeric"
                                    value={size}
                                    onChangeText={setSize}
                                />
                            </View>
                        )}

                        {type === 'enum' && (
                            <View className="gap-2">
                                <Label nativeID="attr-elements">Elements (Comma separated)</Label>
                                <Input 
                                    placeholder="e.g. active, inactive, pending"
                                    value={elements}
                                    onChangeText={setElements}
                                />
                            </View>
                        )}

                        {type === 'relationship' && (
                            <>
                                <View className="gap-2">
                                    <Label nativeID="rel-table">Related Table</Label>
                                    <Select 
                                        value={{ value: relatedTable, label: collections.find(c => c.$id === relatedTable)?.name || relatedTable }} 
                                        onValueChange={(val) => setRelatedTable(val.value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select related table" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {collections.map(c => (
                                                <SelectItem key={c.$id} value={c.$id} label={c.name}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </View>

                                <View className="gap-2">
                                    <Label nativeID="rel-type">Relation Type</Label>
                                    <Select 
                                        value={{ value: relationType, label: RELATIONSHIP_TYPES.find(t => t.value === relationType).label }} 
                                        onValueChange={(val) => setRelationType(val.value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relation type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RELATIONSHIP_TYPES.map(t => (
                                                <SelectItem key={t.value} value={t.value} label={t.label}>{t.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </View>

                                <View className="flex-row items-center justify-between py-2">
                                    <View className="flex-1 mr-4">
                                        <Text className="text-sm font-medium">Two-way relationship</Text>
                                    </View>
                                    <Switch checked={twoWay} onCheckedChange={setTwoWay} />
                                </View>

                                {twoWay && (
                                    <View className="gap-2">
                                        <Label nativeID="rel-twoway-key">Two-way Attribute Key</Label>
                                        <Input 
                                            placeholder="e.g. inverse_relation"
                                            value={twoWayKey}
                                            onChangeText={setTwoWayKey}
                                        />
                                    </View>
                                )}

                                <View className="gap-2">
                                    <Label nativeID="rel-on-delete">On Delete</Label>
                                    <Select 
                                        value={{ value: onDelete, label: ON_DELETE_BEHAVIORS.find(b => b.value === onDelete).label }} 
                                        onValueChange={(val) => setOnDelete(val.value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select behavior" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ON_DELETE_BEHAVIORS.map(b => (
                                                <SelectItem key={b.value} value={b.value} label={b.label}>{b.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </View>
                            </>
                        )}

                        {type !== 'relationship' && (
                            <View className="gap-2 mt-2">
                                <Label nativeID="attr-default">Default Value (Optional)</Label>
                                {type === 'boolean' ? (
                                    <View className="flex-row items-center gap-2">
                                        <Switch 
                                            checked={defaultValue === 'true'} 
                                            onCheckedChange={(val) => setDefaultValue(val ? 'true' : 'false')}
                                        />
                                        <Text className="text-sm">{defaultValue === 'true' ? 'True' : 'False'}</Text>
                                    </View>
                                ) : (
                                    <Input 
                                        placeholder="Enter default value"
                                        value={defaultValue}
                                        onChangeText={setDefaultValue}
                                        keyboardType={type === 'integer' || type === 'double' ? 'numeric' : 'default'}
                                    />
                                )}
                            </View>
                        )}

                        <View className="flex-row items-center justify-between py-2 mt-4">
                            <View className="flex-1 mr-4">
                                <Text className="text-sm font-medium">Required</Text>
                                <Text className="text-xs text-muted-foreground">Is this attribute required?</Text>
                            </View>
                            <Switch checked={required} onCheckedChange={setRequired} />
                        </View>

                        <View className="flex-row items-center justify-between py-2">
                            <View className="flex-1 mr-4">
                                <Text className="text-sm font-medium">Array</Text>
                                <Text className="text-xs text-muted-foreground">Is this attribute an array?</Text>
                            </View>
                            <Switch checked={array} onCheckedChange={setArray} />
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

export default CreateAttributeModal;
