import React, { useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { X, Plus, Check } from 'lucide-react-native';
import { AttributeCommon } from './AttributeCommon';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const AttributeEnum = ({ 
    elements = '', onElementsChange,
    defaultValue, onDefaultValueChange, 
    required, onRequiredChange, 
    array, onArrayChange 
}) => {
    const [inputValue, setInputValue] = useState('');
    const [accordionValue, setAccordionValue] = useState('');

    const tags = useMemo(() => {
        return elements.split(',').map(e => e.trim()).filter(e => e);
    }, [elements]);

    const addTag = () => {
        if (!inputValue.trim()) return;
        const newTag = inputValue.trim();
        if (tags.includes(newTag)) return;
        
        const newTags = [...tags, newTag];
        onElementsChange(newTags.join(', '));
        setInputValue('');
    };

    const removeTag = (tagToRemove) => {
        const newTags = tags.filter(tag => tag !== tagToRemove);
        onElementsChange(newTags.join(', '));
        
        if (defaultValue === tagToRemove) {
            onDefaultValueChange('');
        }
    };

    const options = useMemo(() => {
        const opts = tags.map(tag => ({ label: tag, value: tag }));
        if (!required && !array) {
            opts.push({ label: 'NULL', value: '' });
        }
        return opts;
    }, [tags, required, array]);

    return (
        <View className="gap-4">
            <View className="gap-2">
                <Label nativeID="attr-elements">Elements</Label>
                <View className="flex-row gap-2">
                    <Input 
                        placeholder="Add element and press enter"
                        value={inputValue}
                        onChangeText={setInputValue}
                        onSubmitEditing={addTag}
                        className="flex-1"
                    />
                    <Button style={{borderWidth: 1, borderColor: '#3e3e3eff'}} size="icon" variant="outline" onPress={addTag}>
                        <Icon as={Plus} size={20} color='gray' />
                    </Button>
                </View>
                
                {tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2 mt-2">
                        {tags.map((tag, index) => (
                            <View key={index} className="flex-row items-center bg-secondary px-2 py-1 rounded-md">
                                <Text className="mr-1 text-sm">{tag}</Text>
                                <TouchableOpacity onPress={() => removeTag(tag)}>
                                    <Icon as={X} size={14} color='gray' />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
                <Text className="text-xs text-muted-foreground">
                    Enum elements have a maximum length of 255 characters.
                </Text>
            </View>

            <View className="gap-2">
                <Label nativeID="attr-default">Default Value</Label>
                 <Accordion 
                    type="single" 
                    collapsible 
                    value={accordionValue}
                    onValueChange={setAccordionValue}
                    className="w-full "
                >
                    <AccordionItem value="defaultValue" className="border rounded-md px-3 border-border bg-background">
                        <AccordionTrigger 
                            className="py-2 hover:no-underline "
                            disabled={required || array}
                        >
                            <Text className="text-sm font-normal text-foreground">
                                {defaultValue || (required || array ? 'Not available' : 'Select a value')}
                            </Text>
                        </AccordionTrigger>
                        <AccordionContent className="pb-2">
                            <View className="gap-1 mt-2">
                                {options.map((opt) => (
                                    <TouchableOpacity 
                                        key={opt.value + '_opt'} 
                                        onPress={() => {
                                            onDefaultValueChange(opt.value);
                                            setAccordionValue('');
                                        }}
                                        className={`flex-row items-center justify-between p-2 rounded-sm ${defaultValue === opt.value ? 'bg-accent' : ''}`}
                                    >
                                        <Text className="text-sm text-foreground">{opt.label}</Text>
                                        {defaultValue === opt.value && <Icon as={Check} size={16} color="#FD366E" />}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </View>

            <AttributeCommon 
                required={required} onRequiredChange={onRequiredChange}
                array={array} onArrayChange={onArrayChange}
                showDefault={false}
            />
        </View>
    );
};

export default AttributeEnum;
