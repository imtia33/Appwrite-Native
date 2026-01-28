import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '../../lib/theme-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '../ui/dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../ui/accordion';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Icon } from '../ui/icon';
import { Text } from '../ui/text';
import { X, ChevronDown, Check } from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { sdk } from '../../appwrite/appwrite';
import { Separator } from '../ui/separator';

const SCOPES_CONFIG = [
    {
        category: 'Auth',
        scopes: [
            { id: 'users.read', description: 'Access to read users' },
            { id: 'users.write', description: 'Access to create, update, and delete users' },
            { id: 'teams.read', description: 'Access to read teams' },
            { id: 'teams.write', description: 'Access to create, update, and delete teams' },
            { id: 'sessions.write', description: 'Access to create sessions' }
        ]
    },
    {
        category: 'Database',
        scopes: [
            { id: 'databases.read', description: 'Access to read databases' },
            { id: 'databases.write', description: 'Access to create, update, and delete databases' },
            { id: 'collections.read', description: 'Access to read collections' },
            { id: 'collections.write', description: 'Access to create, update, and delete collections' },
            { id: 'attributes.read', description: 'Access to read attributes' },
            { id: 'attributes.write', description: 'Access to create, update, and delete attributes' },
            { id: 'indexes.read', description: 'Access to read indexes' },
            { id: 'indexes.write', description: 'Access to create, update, and delete indexes' },
            { id: 'documents.read', description: 'Access to read documents' },
            { id: 'documents.write', description: 'Access to create, update, and delete documents' }
        ]
    },
    {
        category: 'Functions',
        scopes: [
            { id: 'functions.read', description: 'Access to read functions' },
            { id: 'functions.write', description: 'Access to create, update, and delete functions' },
            { id: 'executions.read', description: 'Access to read executions' },
            { id: 'executions.write', description: 'Access to create executions' }
        ]
    },
    {
        category: 'Storage',
        scopes: [
            { id: 'buckets.read', description: 'Access to read buckets' },
            { id: 'buckets.write', description: 'Access to create, update, and delete buckets' },
            { id: 'files.read', description: 'Access to read files' },
            { id: 'files.write', description: 'Access to create, update, and delete files' }
        ]
    },
    {
        category: 'Messaging',
        scopes: [
            { id: 'messages.read', description: 'Access to read messages' },
            { id: 'messages.write', description: 'Access to create, update, and delete messages' },
            { id: 'topics.read', description: 'Access to read topics' },
            { id: 'topics.write', description: 'Access to create, update, and delete topics' },
            { id: 'subscribers.read', description: 'Access to read subscribers' },
            { id: 'subscribers.write', description: 'Access to create, update, and delete subscribers' },
            { id: 'providers.read', description: 'Access to read providers' },
            { id: 'providers.write', description: 'Access to create, update, and delete providers' },
            { id: 'targets.read', description: 'Access to read targets' },
            { id: 'targets.write', description: 'Access to create, update, and delete targets' }
        ]
    },
    {
        category: 'Sites',
        scopes: [
            { id: 'sites.read', description: 'Access to read sites' },
            { id: 'sites.write', description: 'Access to create, update, and delete sites' }
        ]
    },
    {
        category: 'Other',
        scopes: [
            { id: 'health.read', description: 'Access to read health' },
            { id: 'stats.read', description: 'Access to read stats' },
            { id: 'project.read', description: 'Access to read project' },
            { id: 'project.write', description: 'Access to update project' },
            { id: 'locale.read', description: 'Access to read locale' },
            { id: 'avatars.read', description: 'Access to read avatars' },
            { id: 'rules.read', description: 'Access to read rules' },
            { id: 'rules.write', description: 'Access to create, update, and delete rules' }
        ]
    }
];

export const CreateApiKeyModal = ({ isOpen, onOpenChange, projectId, onCreated }) => {
    const { isDark } = useTheme();
    const [name, setName] = useState('');
    const [expire, setExpire] = useState('never');
    const [selectedScopes, setSelectedScopes] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const toggleScope = (scopeId) => {
        const newSelected = new Set(selectedScopes);
        if (newSelected.has(scopeId)) {
            newSelected.delete(scopeId);
        } else {
            newSelected.add(scopeId);
        }
        setSelectedScopes(newSelected);
    };

    const toggleCategory = (categoryScopes, checked) => {
        const newSelected = new Set(selectedScopes);
        categoryScopes.forEach(s => {
            if (checked) {
                newSelected.add(s.id);
            } else {
                newSelected.delete(s.id);
            }
        });
        setSelectedScopes(newSelected);
    };

    const selectAll = () => {
        const all = new Set();
        SCOPES_CONFIG.forEach(cat => cat.scopes.forEach(s => all.add(s.id)));
        setSelectedScopes(all);
    };

    const deselectAll = () => {
        setSelectedScopes(new Set());
    };

    const handleCreate = async () => {
        if (!name) {
            setError('Please enter a name for the API key');
            return;
        }
        if (selectedScopes.size === 0) {
            setError('Please select at least one scope');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await sdk.forConsole.projects.createKey({
                projectId,
                name,
                scopes: Array.from(selectedScopes),
                expire: expire === 'never' ? undefined : expire
            });
            onCreated?.();
            onOpenChange(false);
            // Reset form
            setName('');
            setExpire('never');
            setSelectedScopes(new Set());
        } catch (err) {
            setError(err.message || 'Failed to create API key');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[350px] w-[95%] p-0 overflow-hidden bg-background border-border flex-1 max-h-[90vh]">
                <DialogHeader className="p-6 pb-0 border-b-0">
                    <DialogTitle className="text-xl font-bold flex-row items-center gap-2">
                        Create API key
                    </DialogTitle>
                </DialogHeader>

                <ScrollView scrollEnabled={true} className=" max-h-[70vh] flex-1 p-6">
                    <View className="gap-6">
                        <View className="gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
                            <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Configuration</Text>
                            
                            <View className="gap-2">
                                <Label nativeID="key-name">Name</Label>
                                <Input
                                    placeholder="Enter key name"
                                    value={name}
                                    onChangeText={setName}
                                    className="bg-background"
                                />
                            </View>

                            <View className="gap-2">
                                <Label nativeID="expiration">Expiration date</Label>
                                <Select value={{ value: expire, label: expire === 'never' ? 'Never' : expire }} onValueChange={(val) => setExpire(val.value)}>
                                    <SelectTrigger className="bg-background">
                                        <SelectValue placeholder="Select expiration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never" label="Never">Never</SelectItem>
                                        <SelectItem value="30d" label="30 Days">30 Days</SelectItem>
                                        <SelectItem value="90d" label="90 Days">90 Days</SelectItem>
                                        <SelectItem value="365d" label="365 Days">365 Days</SelectItem>
                                    </SelectContent>
                                </Select>
                            </View>
                        </View>

                        {/* Scopes */}
                        <View className="gap-4">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Scopes</Text>
                                
                            </View>
                            
                            <Text className="text-muted-foreground text-xs leading-relaxed">
                                Choose which permission scopes to grant your application. It is best practice to allow only the permissions you need to meet your project goals.
                            </Text>
                            <View className="flex-row gap-4">
                                    <TouchableOpacity onPress={selectAll}>
                                        <Text className="text-muted-foreground text-[15px] font-semibold">Select all</Text>
                                    </TouchableOpacity>
                                    <Separator orientation="vertical" className="h-4" />
                                    <TouchableOpacity onPress={deselectAll}>
                                        <Text className="text-muted-foreground text-[15px] font-semibold">Deselect all</Text>
                                    </TouchableOpacity>
                            </View>

                            <Accordion type="multiple" className="border border-border rounded-2xl overflow-hidden mb-10">
                                {SCOPES_CONFIG.map((cat, idx) => {
                                    const catActiveCount = cat.scopes.filter(s => selectedScopes.has(s.id)).length;
                                    const allChecked = catActiveCount === cat.scopes.length;
                                    const isLast = idx === SCOPES_CONFIG.length - 1;

                                    return (
                                        <AccordionItem key={cat.category} value={cat.category} className={cn(!isLast && "border-b border-border")}>
                                            <View className="flex-row items-center px-4">
                                                <Checkbox 
                                                    checked={allChecked} 
                                                    onCheckedChange={(checked) => toggleCategory(cat.scopes, checked)}
                                                />
                                                <AccordionTrigger className="flex-1 ml-3 hover:no-underline py-4">
                                                    <View className="flex-row items-center gap-2">
                                                        <Text className="text-foreground font-semibold">{cat.category}</Text>
                                                        <Badge variant="secondary" className="px-1.5 py-0.5">
                                                            <Text className="text-foreground text-[10px] font-bold">{catActiveCount} Scopes</Text>
                                                        </Badge>
                                                    </View>
                                                </AccordionTrigger>
                                            </View>
                                            <AccordionContent className="bg-muted/5 px-4 pb-4 ml-4">
                                                <View className="gap-3 mt-2">
                                                    {cat.scopes.map(scope => (
                                                        <TouchableOpacity 
                                                            key={scope.id}
                                                            onPress={() => toggleScope(scope.id)}
                                                            className="flex-row items-start gap-3"
                                                        >
                                                            <Checkbox 
                                                                checked={selectedScopes.has(scope.id)}
                                                                onCheckedChange={() => toggleScope(scope.id)}
                                                            />
                                                            <View className="flex-1 -mt-0.5">
                                                                <Text className="text-foreground text-sm font-medium">{scope.id}</Text>
                                                                <Text className="text-muted-foreground text-[10px]">{scope.description}</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    ))}
                                                </View>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>
                        </View>

                        {error && (
                            <View className="bg-destructive/10 p-3 rounded-lg border border-destructive">
                                <Text className="text-destructive text-xs text-center">{error}</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>

                <DialogFooter style={{borderTopWidth: 1}} className="p-6  border-border flex-row gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1 ">
                            <Text className="text-foreground ">Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button 
                        onPress={handleCreate} 
                        disabled={loading}
                        className="flex-1 bg-primary"
                    >
                        {loading ? <ActivityIndicator size="small" color="white" /> : <Text className="font-semibold text-white">Create</Text>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
