import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useOrganizationStore, roles } from '../../appwrite/store/organizationStore';

const MemberInviteModal = ({ open, onOpenChange }) => {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState({ value: 'developer', label: 'Developer' });
    const { createMembership, loading } = useOrganizationStore();

    const handleSubmit = async () => {
        try {
            await createMembership(email, [role.value], name);
            onOpenChange(false);
            setEmail('');
            setName('');
            setRole({ value: 'developer', label: 'Developer' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent style={{ width: 300 }} className="">
                <DialogHeader>
                    <DialogTitle>Invite Member</DialogTitle>
                </DialogHeader>
                <View className="gap-4 py-4">
                    <View className="gap-2">
                        <Label nativeID='email'>Email</Label>
                        <Input
                            placeholder="Enter email"
                            value={email}
                            onChangeText={setEmail}
                            aria-labelledby='email'
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <View className="gap-2">
                        <Label nativeID='name'>Name (Optional)</Label>
                        <Input
                            placeholder="Enter name"
                            value={name}
                            onChangeText={setName}
                            aria-labelledby='name'
                        />
                    </View>
                    <View className="gap-2">
                        <Label nativeID='role'>Role</Label>
                        <Select
                            value={role}
                            onValueChange={setRole}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {roles.map((r) => (
                                        <SelectItem key={r.value} label={r.label} value={r.value}>
                                            <Text>{r.label}</Text>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </View>
                </View>
                <DialogFooter>
                    <Button onPress={handleSubmit} disabled={loading || !email}>
                        <Text>{loading ? 'Inviting...' : 'Send Invite'}</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MemberInviteModal;
