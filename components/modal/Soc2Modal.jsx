import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useGlobalContext } from '../../context/appwriteContext';

const Soc2Modal = ({ open, onOpenChange, locale, countryList }) => {
    const { user, currentOrganization } = useGlobalContext();
    const [email, setEmail] = useState('');
    const [employees, setEmployees] = useState('');
    const [country, setCountry] = useState('');
    const [role, setRole] = useState('');
    const [website, setWebsite] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) setEmail(user.email);
    }, [user]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://growth.appwrite.io/v1/support', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: 'SOC-2 Request',
                    email: email,
                    firstName: (user?.name ?? '').slice(0, 40),
                    message: `SOC-2 request for ${currentOrganization?.name ?? ''} (${currentOrganization?.$id ?? ''})`,
                    tags: ['cloud'],
                    customFields: [
                        { id: '41612', value: 'SOC-2' },
                        { id: '48493', value: user?.name ?? '' },
                        { id: '48492', value: currentOrganization?.$id ?? '' },
                        { id: '48490', value: user?.$id ?? '' }
                    ],
                    metaFields: {
                        employees: employees,
                        country: country,
                        role: role,
                        website: website
                    }
                })
            });

            if (response.ok) {
                onOpenChange(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request SOC-2</DialogTitle>
                </DialogHeader>
                <ScrollView className="max-h-[400px] pr-2">
                    <View className="gap-4 py-4">
                        <View className="gap-2">
                            <Label nativeID='email'>Email</Label>
                            <Input
                                placeholder="Enter email"
                                value={email}
                                onChangeText={setEmail}
                                aria-labelledby='email'
                            />
                        </View>
                        <View className="gap-2">
                            <Label nativeID='employees'>Number of employees</Label>
                            <Input
                                placeholder="e.g. 11-50"
                                value={employees}
                                onChangeText={setEmployees}
                                aria-labelledby='employees'
                            />
                        </View>
                        <View className="gap-2">
                            <Label nativeID='country'>Country</Label>
                            <Input
                                placeholder="Enter country name"
                                value={country}
                                onChangeText={setCountry}
                                aria-labelledby='country'
                            />
                        </View>
                        <View className="gap-2">
                            <Label nativeID='role'>Your role</Label>
                            <Input
                                placeholder="Enter your role"
                                value={role}
                                onChangeText={setRole}
                                aria-labelledby='role'
                            />
                        </View>
                        <View className="gap-2">
                            <Label nativeID='website'>Website</Label>
                            <Input
                                placeholder="Enter website"
                                value={website}
                                onChangeText={setWebsite}
                                aria-labelledby='website'
                            />
                        </View>
                    </View>
                </ScrollView>
                <DialogFooter>
                    <Button onPress={handleSubmit} disabled={loading || !employees || !country || !role}>
                        <Text>Send request</Text>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default Soc2Modal;
