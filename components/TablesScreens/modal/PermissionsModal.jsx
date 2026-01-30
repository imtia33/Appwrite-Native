import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Plus, Trash2, Globe, Users, User, ShieldCheck } from 'lucide-react-native';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ACTIONS = [
    { label: 'Read', value: 'read' },
    { label: 'Create', value: 'create' },
    { label: 'Update', value: 'update' },
    { label: 'Delete', value: 'delete' }
];

const ROLES = [
    { label: 'Any', value: 'any', icon: Globe },
    { label: 'Users', value: 'users', icon: Users },
    { label: 'User', value: 'user', icon: User },
    { label: 'Team', value: 'team', icon: ShieldCheck },
];

const PermissionsModal = ({ isOpen, onOpenChange, permissions = [], onSave, title = "Permissions" }) => {
    const [localPermissions, setLocalPermissions] = useState([]);

    useEffect(() => {
        // Parse permissions strings like "read("any")" into { action: "read", role: "any", id: "" }
        if (permissions) {
            const parsed = permissions.map(p => {
                const match = p.match(/^(\w+)\("([^"]+)"\)$/);
                if (match) {
                    const action = match[1];
                    let role = match[2];
                    let id = "";
                    if (role.includes(":")) {
                        const parts = role.split(":");
                        role = parts[0];
                        id = parts[1];
                    }
                    return { action, role, id, original: p };
                }
                return null;
            }).filter(Boolean);
            setLocalPermissions(parsed);
        }
    }, [permissions, isOpen]);

    const addPermission = () => {
        setLocalPermissions([...localPermissions, { action: 'read', role: 'any', id: '' }]);
    };

    const removePermission = (index) => {
        setLocalPermissions(localPermissions.filter((_, i) => i !== index));
    };

    const updatePermission = (index, field, value) => {
        const updated = [...localPermissions];
        updated[index][field] = value;
        setLocalPermissions(updated);
    };

    const handleSave = () => {
        const formatted = localPermissions.map(p => {
            const roleStr = p.id ? `${p.role}:${p.id}` : p.role;
            return `${p.action}("${roleStr}")`;
        });
        onSave(formatted);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[450px] w-[95%] p-0 overflow-hidden bg-background border-border max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6 max-h-[60vh]">
                    <View className="gap-4">
                        <Text className="text-sm text-muted-foreground mb-4">
                            Define who can access this resource. Permissions are granted per role and action.
                        </Text>

                        {localPermissions.map((perm, index) => (
                            <View key={index} className="gap-3 p-4 bg-muted/20 rounded-xl border border-border mb-2">
                                <View className="flex-row items-center justify-between mb-2">
                                    <View className="flex-1 mr-2">
                                        <Label className="text-[10px] uppercase mb-1">Action</Label>
                                        <Select 
                                            value={{ value: perm.action, label: ACTIONS.find(a => a.value === perm.action)?.label }} 
                                            onValueChange={(val) => updatePermission(index, 'action', val.value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Action" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ACTIONS.map(action => (
                                                    <SelectItem key={action.value} value={action.value} label={action.label}>{action.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </View>
                                    <TouchableOpacity 
                                        onPress={() => removePermission(index)}
                                        className="mt-4 p-2"
                                    >
                                        <Icon as={Trash2} size={18} className="text-destructive" />
                                    </TouchableOpacity>
                                </View>

                                <View className="flex-row gap-2">
                                    <View className="flex-1">
                                        <Label className="text-[10px] uppercase mb-1">Role</Label>
                                        <Select 
                                            value={{ value: perm.role, label: ROLES.find(r => r.value === perm.role)?.label }} 
                                            onValueChange={(val) => updatePermission(index, 'role', val.value)}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ROLES.map(role => (
                                                    <SelectItem key={role.value} value={role.value} label={role.label}>{role.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </View>
                                    {(perm.role === 'user' || perm.role === 'team') && (
                                        <View className="flex-[1.5]">
                                            <Label className="text-[10px] uppercase mb-1">{perm.role === 'user' ? 'User ID' : 'Team ID'}</Label>
                                            <Input 
                                                className="h-9"
                                                placeholder={`Enter ${perm.role} ID`}
                                                value={perm.id}
                                                onChangeText={(val) => updatePermission(index, 'id', val)}
                                            />
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}

                        <Button 
                            variant="outline" 
                            className="flex-row items-center justify-center gap-2 border-dashed h-12"
                            onPress={addPermission}
                        >
                            <Icon as={Plus} size={18} className="text-primary" />
                            <Text className="text-primary font-medium">Add Permission</Text>
                        </Button>
                    </View>
                </ScrollView>

                <DialogFooter className="p-6 border-t border-border flex-row gap-3">
                    <DialogClose asChild>
                        <Button variant="outline" className="flex-1">
                            <Text>Cancel</Text>
                        </Button>
                    </DialogClose>
                    <Button onPress={handleSave} className="flex-1">
                        <Text className="text-white font-bold">Save</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PermissionsModal;
