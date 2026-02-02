import React, { useState, useEffect, useMemo } from 'react';
import { View, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Icon } from '@/components/ui/icon';
import { Plus, Trash2, Check, X } from 'lucide-react-native';
import { Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const INDEX_TYPES = [
    { label: 'Key', value: 'key' },
    { label: 'Unique', value: 'unique' },
    { label: 'Fulltext', value: 'fulltext' },
    { label: 'Spatial', value: 'spatial' },
];

const ORDER_OPTIONS = [
    { label: 'ASC', value: 'ASC' },
    { label: 'DESC', value: 'DESC' },
];

const SPATIAL_ORDER_OPTIONS = [
    { label: 'ASC', value: 'ASC' },
    { label: 'DESC', value: 'DESC' },
    { label: 'NONE', value: null },
];

function getIconByType(type, format) {
  if (type === "string") {
    switch (format) {
      case "email":
        return <MaterialCommunityIcons name="email-outline" size={18} color="gray" />
      case "ip":
        return <Entypo name="location-pin" size={18} color="gray" />
      case "url":
        return <MaterialCommunityIcons name="link-variant" size={18} color="gray" />
      case "enum":
        return <MaterialCommunityIcons name="format-list-bulleted" size={18} color="gray" />
      default:
        return <MaterialCommunityIcons name="format-text" size={18} color="gray" />
    }
  }

  switch (type) {
    case "integer":
      return <FontAwesome5 name="hashtag" size={18} color="gray" />
    case "double":
      return <FontAwesome5 name="hashtag" size={18} color="gray" />
    case "boolean":
      return <FontAwesome name="toggle-on" size={18} color="gray" />
    case "datetime":
      return <Ionicons name="calendar-clear-sharp" size={18} color="gray" />
    case "point":
      return <MaterialCommunityIcons name="dots-triangle" size={18} color="gray" />
    case "linestring":
      return <Entypo name="flow-line" size={18} color="gray" />
    case "polygon":
      return <FontAwesome5 name="draw-polygon" size={18} color="gray" />
    case "relationship":
      return <FontAwesome5 name="arrow-right" size={18} color="gray" />
    default:
      return null
  }
}

const CreateIndexModal = ({ isOpen, onOpenChange, attributes = [], indexes = [], onCreate }) => {
    const [key, setKey] = useState('');
    const [type, setType] = useState('key');
    // Each attribute: { key: string, order: string|null, length: string|null }
    const [selectedAttributes, setSelectedAttributes] = useState([{ key: '', order: 'ASC', length: '' }]);
    const [loading, setLoading] = useState(false);
    
    const [activeAccordion, setActiveAccordion] = useState('');

    const isSpatialType = (attr) => ['point', 'linestring', 'polygon'].includes(attr?.type);
    const isRelationship = (attr) => attr?.type === 'relationship';

    // Filter available attributes based on selected index type
    const availableAttributes = useMemo(() => {
        if (type === 'spatial') {
            return attributes.filter(isSpatialType);
        }
        return attributes.filter(a => !isRelationship(a) && !isSpatialType(a));
    }, [attributes, type]);

    const orderOptions = type === 'spatial' ? SPATIAL_ORDER_OPTIONS : ORDER_OPTIONS;

    // Generate auto key
    useEffect(() => {
        if (isOpen) {
            const indexKeys = indexes.map(i => i.key);
            let maxIndex = 0;
            if (indexKeys.length > 0) {
                 maxIndex = indexKeys.reduce((max, k) => {
                    const match = k.match(/^index_(\d+)$/);
                    return match ? Math.max(max, parseInt(match[1], 10)) : max;
                }, 0);
            } else {
                maxIndex = 0;
            }
            
            const nextIndex = maxIndex + 1;
            setKey(`index_${nextIndex}`);
            setType('key');
            
            setSelectedAttributes([{ key: '', order: type === 'spatial' ? null : 'ASC', length: '' }]);
        }
    }, [isOpen]); // Only run on open

    // Handle Type Change logic
    const handleTypeChange = (newType) => {
        setType(newType);
        setActiveAccordion('');
        
        const firstAttr = selectedAttributes[0];
        
        if (newType === 'spatial') {
           const attrObj = attributes.find(a => a.key === firstAttr.key);
           if (!attrObj || !isSpatialType(attrObj)) {
               setSelectedAttributes([{ key: '', order: null, length: '' }]);
           } else {
                setSelectedAttributes([{ ...firstAttr, order: null }]);
           }
        } else {
             const attrObj = attributes.find(a => a.key === firstAttr.key);
             if (attrObj && isSpatialType(attrObj)) {
                  setSelectedAttributes([{ key: '', order: 'ASC', length: '' }]);
             } else {
                 if (!firstAttr.order) {
                     setSelectedAttributes([{ ...firstAttr, order: 'ASC' }]);
                 }
             }
        }
    };

    const handleCreate = async () => {
        // Validation
        if (!key || selectedAttributes.some(a => !a.key)) {
            return;
        }

        setLoading(true);
        try {
            const attrKeys = selectedAttributes.map(a => a.key);
            const attrOrders = selectedAttributes.map(a => a.order).filter(o => o !== null);
            const attrLengths = selectedAttributes.map(a => a.length ? parseInt(a.length) : null);

            await onCreate({ 
                key, 
                type, 
                attributes: attrKeys, 
                orders: attrOrders,
                lengths: type === 'fulltext' || type === 'key' ? attrLengths : undefined
            });

            onOpenChange(false);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const addAttribute = () => {
        setSelectedAttributes([...selectedAttributes, { key: '', order: 'ASC', length: '' }]);
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
            <DialogContent className="min-w-[350px] w-[95%] p-0 overflow-hidden bg-background border-border max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">Create Index</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6 max-h-[60vh]" nestedScrollEnabled={true}>
                    <View className="gap-4">
                        <View className="gap-2">
                            <Label nativeID="index-key">Index Key</Label>
                            <Input 
                                placeholder="index_title"
                                value={key}
                                onChangeText={setKey}
                            />
                        </View>

                        <View className="gap-2">
                            <Label nativeID="index-type">Index Type</Label>
                            <Accordion 
                                type="single" 
                                collapsible 
                                value={activeAccordion}
                                onValueChange={setActiveAccordion}
                                className="w-full"
                            >
                                <AccordionItem value="index-type" className="border rounded-md px-3 border-border bg-background">
                                    <AccordionTrigger className="py-2 hover:no-underline">
                                        <Text className="text-sm font-normal text-foreground">
                                            {INDEX_TYPES.find(t => t.value === type)?.label || 'Select type'}
                                        </Text>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-2">
                                        <View className="gap-1 mt-2">
                                            {INDEX_TYPES.map(t => (
                                                <TouchableOpacity 
                                                    key={t.value} 
                                                    onPress={() => handleTypeChange(t.value)}
                                                    className={`flex-row items-center justify-between p-2 rounded-sm ${type === t.value ? 'bg-accent' : ''}`}
                                                >
                                                    <Text className="text-sm text-foreground">{t.label}</Text>
                                                    {type === t.value && <Icon as={Check} size={16} color="#FD366E" />}
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </View>

                        <View className="mt-4 gap-4">
                            {selectedAttributes.map((attr, index) => (
                                <View key={index} className="w-full gap-3 p-3 border border-border rounded-md bg-muted/20">
                                    <View className="flex-row items-center justify-between">
                                          <Text className="text-xs font-bold text-muted-foreground uppercase">Attribute {index + 1}</Text>
                                          {selectedAttributes.length > 1 && (
                                              <TouchableOpacity onPress={() => removeAttribute(index)}>
                                                  <Icon as={X} size={16} className="text-muted-foreground hover:text-destructive" />
                                              </TouchableOpacity>
                                          )}
                                    </View>

                                    <View className="gap-2">
                                        <Label>Column</Label>
                                        <Accordion 
                                            type="single" 
                                            collapsible 
                                            value={activeAccordion}
                                            onValueChange={setActiveAccordion}
                                            className="w-full"
                                        >
                                            <AccordionItem value={`attr-key-${index}`} className="border rounded-md px-3 border-border bg-background">
                                                <AccordionTrigger className="py-2 hover:no-underline">
                                                    <Text className="text-sm font-normal text-foreground" numberOfLines={1}>
                                                        {attr.key || 'Select column'}
                                                    </Text>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-2">
                                                    <ScrollView 
                                                        className="max-h-40" 
                                                        nestedScrollEnabled={true}
                                                        showsVerticalScrollIndicator={true}
                                                    >
                                                        <View className="gap-1 mt-2">
                                                            {availableAttributes.map(a => {
                                                                return (
                                                                    <TouchableOpacity 
                                                                        key={a.key} 
                                                                        onPress={() => {
                                                                            updateAttribute(index, 'key', a.key);
                                                                            setActiveAccordion('');
                                                                        }}
                                                                        className={`flex-row items-center gap-2 p-2 rounded-sm ${attr.key === a.key ? 'bg-accent' : ''}`}
                                                                    >
                                                                        {getIconByType(a.type, a.format)}
                                                                        <Text className="text-sm text-foreground flex-1">{a.key}</Text>
                                                                        {attr.key === a.key && <Icon as={Check} size={16} color="#FD366E" />}
                                                                    </TouchableOpacity>
                                                                );
                                                            })}
                                                        </View>
                                                    </ScrollView>
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </View>

                                    <View className="flex-row gap-3">
                                        <View className="flex-1 gap-2">
                                            <Label>Order</Label>
                                            <Accordion 
                                                type="single" 
                                                collapsible 
                                                value={activeAccordion}
                                                onValueChange={setActiveAccordion}
                                                className="w-full"
                                            >
                                                <AccordionItem value={`attr-order-${index}`} className="border rounded-md px-3 border-border bg-background">
                                                    <AccordionTrigger className="py-2 hover:no-underline">
                                                        <Text className="text-sm font-normal text-foreground">
                                                            {orderOptions.find(o => o.value === attr.order)?.label || 'None'}
                                                        </Text>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="pb-2">
                                                        <View className="gap-1 mt-2">
                                                            {orderOptions.map(o => (
                                                                <TouchableOpacity 
                                                                    key={o.label} 
                                                                    onPress={() => {
                                                                        updateAttribute(index, 'order', o.value);
                                                                        setActiveAccordion('');
                                                                    }}
                                                                    className={`flex-row items-center justify-between p-2 rounded-sm ${attr.order === o.value ? 'bg-accent' : ''}`}
                                                                >
                                                                    <Text className="text-sm text-foreground">{o.label}</Text>
                                                                    {attr.order === o.value && <Icon as={Check} size={16} color="#FD366E" />}
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </View>

                                        {type === 'key' && (
                                            <View className="flex-1 gap-2">
                                                <Label>Length (Optional)</Label>
                                                <Input 
                                                    placeholder="e.g. 256"
                                                    value={attr.length}
                                                    onChangeText={(val) => updateAttribute(index, 'length', val)}
                                                    keyboardType="numeric"
                                                />
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ))}
                            
                            <Button 
                                variant="outline" 
                                size="sm" 
                                style={{borderColor: '#3e3e3eff'}}
                                className="mt-2 flex-row items-center justify-center gap-2 border-dashed h-10"
                                onPress={addAttribute}
                                disabled={type === 'spatial' || (selectedAttributes.length > 0 && !selectedAttributes[selectedAttributes.length - 1].key)} 
                            >
                                <Icon as={Plus} size={16} />
                                <Text className="text-primary text-xs font-medium">Add Column</Text>
                            </Button>
                        </View>
                        
                        {/* Final spacing */}
                        <View className="h-40" /> 
                    </View>
                </ScrollView>

                <DialogFooter className="p-6 border-t border-border flex-row gap-3">
                    <DialogClose asChild>
                        <Button style={{borderColor: '#3e3e3eff'}} variant="outline" className="flex-1">
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
