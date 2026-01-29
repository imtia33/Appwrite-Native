import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import useFunctionStore from '../../../appwrite/data-services/functionService';
import { Icon } from '../../ui/icon';
import { Search, Filter, Github, Code, ExternalLink, ChevronRight, Check, Boxes } from 'lucide-react-native';
import { getIconFromRuntime, darkIcons, lightIcons } from '../../../constants/icons';
import { useTheme } from '../../../lib/theme-context';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Checkbox } from '../../ui/checkbox';
import { Label } from '../../ui/label';

const FunctionTemplates = () => {
    const { theme, isDark } = useTheme();
    const icons = isDark ? darkIcons : lightIcons;
    const { currentProject } = useProjectStore();
    const { fetchTemplates, templates, loading, error } = useFunctionStore();

    const [search, setSearch] = useState('');
    const [selectedUseCases, setSelectedUseCases] = useState([]);
    const [selectedRuntimes, setSelectedRuntimes] = useState([]);

    useEffect(() => {
        if (currentProject?.$id) {
            fetchTemplates(currentProject.$id, currentProject.region || 'fra');
        }
    }, [currentProject?.$id]);

    const useCases = useMemo(() => {
        const set = new Set();
        templates.forEach(t => t.useCases?.forEach(u => set.add(u)));
        return Array.from(set).sort();
    }, [templates]);

    const runtimes = useMemo(() => {
        const set = new Set();
        templates.forEach(t => t.runtimes?.forEach(r => set.add(r.name)));
        return Array.from(set).sort();
    }, [templates]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                                 t.tagline?.toLowerCase().includes(search.toLowerCase());
            
            const matchesUseCase = selectedUseCases.length === 0 || 
                                  t.useCases?.some(u => selectedUseCases.includes(u));
            
            const matchesRuntime = selectedRuntimes.length === 0 || 
                                  t.runtimes?.some(r => selectedRuntimes.includes(r.name));
            
            return matchesSearch && matchesUseCase && matchesRuntime;
        });
    }, [templates, search, selectedUseCases, selectedRuntimes]);

    const toggleUseCase = (useCase) => {
        setSelectedUseCases(prev => 
            prev.includes(useCase) ? prev.filter(u => u !== useCase) : [...prev, useCase]
        );
    };

    const toggleRuntime = (runtime) => {
        setSelectedRuntimes(prev => 
            prev.includes(runtime) ? prev.filter(r => r !== runtime) : [...prev, runtime]
        );
    };

    if (loading && templates.length === 0) {
        return (
            <View className="flex-1 items-center justify-center p-8">
                <ActivityIndicator size="large" color="#ef4444" />
                <Text className="text-muted-foreground mt-4">Loading templates...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-background">
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                    <Text className="text-2xl font-bold text-foreground">Templates</Text>
                    <Text className="text-muted-foreground text-sm">Jumpstart development with pre-built functions</Text>
                </View>

                {/* Filters Section */}
                <View className="flex-row gap-4 mb-6">
                    <View className="flex-1 relative">
                        <View className="absolute left-3 top-3.5 z-10">
                            <Icon as={Search} size={16} color="gray" />
                        </View>
                        <TextInput
                            placeholder="Search templates..."
                            value={search}
                            onChangeText={setSearch}
                            className="bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-foreground"
                            placeholderTextColor="gray"
                        />
                    </View>
                </View>

                <View className="lg:flex-row gap-6">
                    {/* Collapsible Filters */}
                    <View className="w-full lg:w-64 gap-4">
                        <Accordion type="multiple" className="w-full">
                            <AccordionItem value="use-case">
                                <AccordionTrigger>
                                    <View className="flex-row items-center gap-2">
                                        <Icon as={Filter} size={16} color="gray" />
                                        <Text className="font-semibold text-foreground">Use case</Text>
                                    </View>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <View className="gap-3 pt-2">
                                        {useCases.map(u => (
                                            <TouchableOpacity 
                                                key={u} 
                                                onPress={() => toggleUseCase(u)}
                                                className="flex-row items-center gap-3"
                                            >
                                                <Checkbox checked={selectedUseCases.includes(u)} onCheckedChange={() => toggleUseCase(u)} />
                                                <Label className="capitalize text-sm">{u}</Label>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </AccordionContent>
                            </AccordionItem>

                            <AccordionItem value="runtime">
                                <AccordionTrigger>
                                    <View className="flex-row items-center gap-2">
                                        <Icon as={Code} size={16} color="gray" />
                                        <Text className="font-semibold text-foreground">Runtime</Text>
                                    </View>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <View className="gap-3 pt-2">
                                        {runtimes.map(r => (
                                            <TouchableOpacity 
                                                key={r} 
                                                onPress={() => toggleRuntime(r)}
                                                className="flex-row items-center gap-3"
                                            >
                                                <Checkbox checked={selectedRuntimes.includes(r)} onCheckedChange={() => toggleRuntime(r)} />
                                                <Label className="text-sm">{r}</Label>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        <Card className="p-4 bg-primary/5 border-primary/10">
                            <View className="gap-2">
                                <Text className="font-bold text-foreground">Contribute</Text>
                                <Text className="text-xs text-muted-foreground leading-5">
                                    Got a function template idea? View the contribution guidelines.
                                </Text>
                                <TouchableOpacity className="flex-row items-center gap-1 mt-1">
                                    <Icon as={Github} size={14} color="#ef4444" />
                                    <Text className="text-xs font-bold text-primary">GitHub</Text>
                                    <Icon as={ExternalLink} size={10} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </Card>
                    </View>

                    {/* Templates Grid */}
                    <View className="flex-1 gap-4 mt-6 lg:mt-0">
                        {filteredTemplates.length === 0 ? (
                            <View className="items-center justify-center p-12 bg-card rounded-2xl border border-dashed border-border">
                                <Icon as={Search} size={48} color="gray" opacity={0.5} />
                                <Text className="text-foreground font-bold mt-4">No templates found</Text>
                                <Text className="text-muted-foreground text-center text-sm mt-1">
                                    Try adjusting your search or filters to find what you're looking for.
                                </Text>
                                <Button 
                                    variant="outline" 
                                    className="mt-6"
                                    onPress={() => {
                                        setSearch('');
                                        setSelectedUseCases([]);
                                        setSelectedRuntimes([]);
                                    }}
                                >
                                    <Text>Clear all filters</Text>
                                </Button>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {filteredTemplates.map((template, index) => (
                                    <Card key={`${template.$id || template.id}-${index}`} className="p-4 border-border overflow-hidden">
                                        <View className="flex-row justify-between items-start mb-3">
                                            <View className="flex-1">
                                                <Text className="text-lg font-bold text-foreground mb-1">{template.name}</Text>
                                                <Text className="text-sm text-muted-foreground" numberOfLines={2}>
                                                    {template.tagline}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="flex-row flex-wrap gap-2 mb-4">
                                            {template.useCases?.map((u, index) => (
                                                <Badge key={`${template.id}-usecase-${index}`} variant="secondary" className="px-2 py-0.5">
                                                    <Text className="text-[10px] capitalize">{u}</Text>
                                                </Badge>
                                            ))}
                                        </View>

                                        <View className="flex-row items-center justify-between pt-3 border-t border-border/50">
                                            <View className="flex-row items-center gap-1">
                                                {template.runtimes?.slice(0, 3).map((r, i) => {
                                                    const iconName = getIconFromRuntime(r.name);
                                                    const iconAsset = iconName ? icons[iconName] : null;
                                                    const RuntimeIcon = iconAsset?.default || iconAsset;
                                                    
                                                    return (
                                                        <View key={`${template.id}-runtime-${r.name}-${i}`} className="w-8 h-8 rounded-full bg-muted items-center justify-center -ml-2 border-2 border-card overflow-hidden" style={{ zIndex: 10 - i }}>
                                                            {typeof RuntimeIcon === 'function' ? (
                                                                <RuntimeIcon width={14} height={14} />
                                                            ) : (
                                                                <Icon as={Boxes} size={12} color="gray" />
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                                {template.runtimes?.length > 3 && (
                                                    <Text className="text-[10px] text-muted-foreground ml-1">
                                                        +{template.runtimes.length - 3} more
                                                    </Text>
                                                )}
                                            </View>

                                            <View className="flex-row gap-2">
                                                <Button variant="ghost" className="h-9 px-3">
                                                    <Text className="text-xs">Details</Text>
                                                </Button>
                                                <Button size="sm" className="h-9 px-4">
                                                    <Text className="text-xs text-white font-bold">Create</Text>
                                                </Button>
                                            </View>
                                        </View>
                                    </Card>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
                <View className="h-20" />
            </ScrollView>
        </View>
    );
};

export default FunctionTemplates;
