import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert as NativeAlert } from 'react-native';
import { useProjectStore } from '../../../appwrite/store/projectStore';
import { sdk } from '../../../appwrite/appwrite';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Icon } from '../../ui/icon';
import { Mail, AlertTriangle, Save, RefreshCw } from 'lucide-react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../ui/accordion';
import { Alert, AlertTitle, AlertDescription } from '../../ui/alert';
import { EmailTemplateType, EmailTemplateLocale } from '@appwrite.io/console';
import { useTheme } from '../../../lib/theme-context';

const TEMPLATES = [
    {
        key: 'verification', // EmailTemplateType.Verification
        title: 'Verification',
        description: 'Send a verification email to users that sign in with their email and password.'
    },
    {
        key: 'magicSession', // EmailTemplateType.Magicsession
        title: 'Magic URL',
        description: 'Send an email to users that sign in with a magic URL.'
    },
    {
        key: 'otpSession', // EmailTemplateType.Otpsession
        title: 'OTP session',
        description: 'Send an email to users that sign in with a email OTP.'
    },
    {
        key: 'recovery', // EmailTemplateType.Recovery
        title: 'Reset password',
        description: 'Send a recovery email to users that forget their password.'
    },
    {
        key: 'invitation', // EmailTemplateType.Invitation
        title: 'Invite user',
        description: 'Send an invitation email to become a member of your project.'
    },
    {
        key: 'mfaChallenge', // EmailTemplateType.Mfachallenge
        title: '2FA verification',
        description: 'Send a two-factor authentication email to a user.'
    },
    {
        key: 'sessionAlert', // EmailTemplateType.Sessionalert
        title: 'Session alert',
        description: 'Send an email to users when a new session is created.'
    }
];

const TemplateEditor = ({ type, projectId, locale = 'en', smtpEnabled }) => {
    const [template, setTemplate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        senderName: '',
        senderEmail: '',
        replyTo: '',
        subject: '',
        message: ''
    });

    const fetchTemplate = async () => {
        setLoading(true);
        try {
            const response = await sdk.forConsole.projects.getEmailTemplate({
                projectId,
                type,
                locale
            });
            setTemplate(response);
            setFormData({
                senderName: response.senderName || '',
                senderEmail: response.senderEmail || '',
                replyTo: response.replyTo || '',
                subject: response.subject || '',
                message: response.message || ''
            });
        } catch (error) {
            console.error('Fetch Template Error:', error);
            NativeAlert.alert('Error', 'Failed to load template');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplate();
    }, [type, projectId]);

    const handleSave = async () => {
        if (!smtpEnabled) {
            NativeAlert.alert('SMTP Required', 'Please configure a custom SMTP server to customize email templates.');
            return;
        }

        setSaving(true);
        try {
            const updated = await sdk.forConsole.projects.updateEmailTemplate({
                projectId,
                type,
                locale,
                subject: formData.subject,
                message: formData.message,
                senderName: formData.senderName || undefined,
                senderEmail: formData.senderEmail || undefined,
                replyTo: formData.replyTo || undefined
            });
            setTemplate(updated);
            NativeAlert.alert('Success', 'Template updated successfully');
        } catch (error) {
            console.error('Update Template Error:', error);
            NativeAlert.alert('Error', error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        // Implementing reset logic if needed, or just re-fetch default
        NativeAlert.alert('Reset', 'Are you sure you want to reset this template to default?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Reset', 
                style: 'destructive',
                onPress: async () => {
                    try {
                        setLoading(true);
                        await sdk.forConsole.projects.deleteEmailTemplate({
                            projectId,
                            type,
                            locale
                        });
                        await fetchTemplate(); // Fetching again should return default
                    } catch (error) {
                        console.error('Reset Error:', error);
                        // If delete fails because it's already default, just re-fetch
                        fetchTemplate();
                    }
                }
            }
        ]);
    };

    if (loading) {
        return (
            <View className="py-8 items-center justify-center">
                <ActivityIndicator size="small" color="#FD366E" />
            </View>
        );
    }

    return (
        <View className="gap-4 py-2">
            {!smtpEnabled && (
                <View className="bg-card p-3 rounded-lg border border-orange-500 mb-2">
                    <Text className="text-orange-500 text-xs">
                        Custom SMTP server is required for customizing emails. Setup SMTP in Settings.
                    </Text>
                </View>
            )}

            <View className="gap-2">
                <Label>Sender Name</Label>
                <Input 
                    value={formData.senderName} 
                    onChangeText={t => setFormData(prev => ({ ...prev, senderName: t }))}
                    placeholder={template?.senderName || "Enter sender name"}
                    editable={smtpEnabled}
                />
            </View>

            <View className="gap-2">
                <Label>Sender Email</Label>
                <Input 
                    value={formData.senderEmail} 
                    onChangeText={t => setFormData(prev => ({ ...prev, senderEmail: t }))}
                    placeholder={template?.senderEmail || "noreply@appwrite.io"}
                    editable={smtpEnabled}
                />
            </View>

            <View className="gap-2">
                <Label>Reply To</Label>
                <Input 
                    value={formData.replyTo} 
                    onChangeText={t => setFormData(prev => ({ ...prev, replyTo: t }))}
                    placeholder="email@example.com"
                    editable={smtpEnabled}
                />
            </View>

            <View className="gap-2">
                <Label>Subject</Label>
                <Input 
                    value={formData.subject} 
                    onChangeText={t => setFormData(prev => ({ ...prev, subject: t }))}
                    placeholder="Subject line"
                    editable={smtpEnabled}
                />
            </View>

            <View className="gap-2">
                <Label>Message</Label>
                <Textarea 
                    value={formData.message} 
                    onChangeText={t => setFormData(prev => ({ ...prev, message: t }))}
                    placeholder="HTML body of the email..."
                    className="min-h-[150px] font-mono text-xs"
                    editable={smtpEnabled}
                />
                <Text className="text-muted-foreground text-[10px]">
                    Use standard HTML for your email body. You can use variables like {'{{name}}'} and {'{{url}}'}.
                </Text>
            </View>

            <View className="flex-row gap-2 justify-end mt-2">
                <Button variant="outline" onPress={handleReset} disabled={!smtpEnabled || saving}>
                    <Icon as={RefreshCw} size={16} className="mr-2 text-foreground" />
                    <Text>Reset</Text>
                </Button>
                <Button onPress={handleSave} disabled={!smtpEnabled || saving}>
                    {saving ? <ActivityIndicator color="white" size="small" /> : (
                        <>
                            <Icon as={Save} size={16} color="white" className="mr-2" />
                            <Text>Update</Text>
                        </>
                    )}
                </Button>
            </View>
        </View>
    );
};

const AuthTemplates = () => {
    const { currentProject } = useProjectStore();
    const [smtpEnabled, setSmtpEnabled] = useState(false);

    useEffect(() => {
        if (currentProject) {
            // Check if SMTP is enabled. Usually this is a property on the project or separate check.
            // Based on +page.svelte: data.project.smtpEnabled
            // The project object in store usually has this.
            setSmtpEnabled(currentProject.smtpEnabled || false);
        }
    }, [currentProject]);

    if (!currentProject) return null;

    return (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            <View className="mb-6">
                <Text className="text-2xl font-bold text-foreground">Email Templates</Text>
                <Text className="text-muted-foreground text-sm">Customize the emails sent to your users</Text>
            </View>

            {!smtpEnabled && (
                <Alert className="mb-6 border-card bg-card">
                    <Icon as={AlertTriangle} size={20} color="orange" />
                    <View className="flex-1 ml-3">
                        <AlertTitle className="text-orange-500">SMTP Configuration Required</AlertTitle>
                        <AlertDescription className="text-orange-500/80">
                            You must configure a custom SMTP server in Settings to customize these email templates.
                        </AlertDescription>
                    </View>
                </Alert>
            )}

            <Card className="border-border">
                <CardContent className="p-0">
                    <Accordion type="single" collapsible>
                        {TEMPLATES.map((item, index) => (
                            <AccordionItem key={item.key} value={item.key} className={index === TEMPLATES.length - 1 ? 'border-b-0' : ''}>
                                <AccordionTrigger className="px-4 hover:no-underline">
                                    <View className="flex-1 text-left">
                                        <Text className="font-medium text-foreground">{item.title}</Text>
                                        <Text className="text-muted-foreground text-xs">{item.description}</Text>
                                    </View>
                                </AccordionTrigger>
                                <AccordionContent className="px-4">
                                    <TemplateEditor 
                                        type={item.key} 
                                        projectId={currentProject.$id} 
                                        smtpEnabled={smtpEnabled}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </ScrollView>
    );
};

export default AuthTemplates;