import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Switch } from '@/components/ui/switch';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Icon } from '@/components/ui/icon';
import { Check } from 'lucide-react-native';

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

const AttributeRelationship = ({ 
    collections = [],
    relatedTable, onRelatedTableChange,
    relationType, onRelationTypeChange,
    twoWay, onTwoWayChange,
    twoWayKey, onTwoWayKeyChange,
    onDelete, onOnDeleteChange
}) => {
    // Accordion states
    const [relatedTableAccordion, setRelatedTableAccordion] = useState('');
    const [relationTypeAccordion, setRelationTypeAccordion] = useState('');
    const [onDeleteAccordion, setOnDeleteAccordion] = useState('');

    return (
        <View className="gap-4">
            <View className="gap-2">
                <Label nativeID="rel-table">Related Table</Label>
                <Accordion 
                    type="single" 
                    collapsible 
                    value={relatedTableAccordion}
                    onValueChange={setRelatedTableAccordion}
                    className="w-full"
                >
                    <AccordionItem value="relatedTable" className="border rounded-md px-3 border-border bg-background">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <Text className="text-sm font-normal text-foreground">
                                {collections.find(c => c.$id === relatedTable)?.name || relatedTable || 'Select related table'}
                            </Text>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <View className="gap-1 mt-2">
                                {collections.map(c => (
                                    <TouchableOpacity 
                                        key={c.$id} 
                                        onPress={() => {
                                            onRelatedTableChange(c.$id);
                                            setRelatedTableAccordion('');
                                        }}
                                        className={`flex-row items-center justify-between p-2 rounded-sm ${relatedTable === c.$id ? 'bg-accent' : ''}`}
                                    >
                                        <Text className="text-sm text-foreground">{c.name}</Text>
                                        {relatedTable === c.$id && <Icon as={Check} size={16} color="#FD366E" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </View>

            <View className="gap-2">
                <Label nativeID="rel-type">Relation Type</Label>
                <Accordion 
                    type="single" 
                    collapsible 
                    value={relationTypeAccordion}
                    onValueChange={setRelationTypeAccordion}
                    className="w-full"
                >
                    <AccordionItem value="relationType" className="border rounded-md px-3 border-border bg-background">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <Text className="text-sm font-normal text-foreground">
                                {RELATIONSHIP_TYPES.find(t => t.value === relationType)?.label || 'Select relation type'}
                            </Text>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <View className="gap-1 mt-2">
                                {RELATIONSHIP_TYPES.map(t => (
                                    <TouchableOpacity 
                                        key={t.value} 
                                        onPress={() => {
                                            onRelationTypeChange(t.value);
                                            setRelationTypeAccordion('');
                                        }}
                                        className={`flex-row items-center justify-between p-2 rounded-sm ${relationType === t.value ? 'bg-accent' : ''}`}
                                    >
                                        <Text className="text-sm text-foreground">{t.label}</Text>
                                        {relationType === t.value && <Icon as={Check} size={16} color="#FD366E" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </View>

            <View className="flex-row items-center justify-between py-2">
                <View className="flex-1 mr-4">
                    <Text className="text-sm font-medium">Two-way relationship</Text>
                </View>
                <Switch checked={twoWay} onCheckedChange={onTwoWayChange} />
            </View>

            {twoWay && (
                <View className="gap-2">
                    <Label nativeID="rel-twoway-key">Two-way Attribute Key</Label>
                    <Input 
                        placeholder="e.g. inverse_relation"
                        value={twoWayKey}
                        onChangeText={onTwoWayKeyChange}
                    />
                </View>
            )}

            <View className="gap-2">
                <Label nativeID="rel-on-delete">On Delete</Label>
                <Accordion 
                    type="single" 
                    collapsible 
                    value={onDeleteAccordion}
                    onValueChange={setOnDeleteAccordion}
                    className="w-full"
                >
                    <AccordionItem value="onDelete" className="border rounded-md px-3 border-border bg-background">
                        <AccordionTrigger className="py-2 hover:no-underline">
                            <Text className="text-sm font-normal text-foreground">
                                {ON_DELETE_BEHAVIORS.find(b => b.value === onDelete)?.label || 'Select behavior'}
                            </Text>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <View className="gap-1 mt-2">
                                {ON_DELETE_BEHAVIORS.map(b => (
                                    <TouchableOpacity 
                                        key={b.value} 
                                        onPress={() => {
                                            onOnDeleteChange(b.value);
                                            setOnDeleteAccordion('');
                                        }}
                                        className={`flex-row items-center justify-between p-2 rounded-sm ${onDelete === b.value ? 'bg-accent' : ''}`}
                                    >
                                        <Text className="text-sm text-foreground">{b.label}</Text>
                                        {onDelete === b.value && <Icon as={Check} size={16} color="#FD366E" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </View>
        </View>
    );
};

export default AttributeRelationship;
