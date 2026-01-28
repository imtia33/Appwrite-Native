import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Text } from '../ui/text';
import { SvgXml } from 'react-native-svg';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Icon } from '../ui/icon';
import { 
    Smartphone, 
    Globe, 
    ChevronRight, 
    ArrowLeft,
    CheckCircle2,
    Monitor,
    Watch,
    Tv
} from 'lucide-react-native';
import { cn } from '../../lib/utils';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { sdk } from '../../appwrite/appwrite';
import { useTheme } from '../../lib/theme-context';
import { FontAwesome5, FontAwesome6, Entypo, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';



const NEXTJS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="currentColor" d="M18.974,31.5c0,0.828-0.671,1.5-1.5,1.5s-1.5-0.672-1.5-1.5v-14c0-0.653,0.423-1.231,1.045-1.43 c0.625-0.198,1.302,0.03,1.679,0.563l16.777,23.704C40.617,36.709,44,30.735,44,24c0-11-9-20-20-20S4,13,4,24s9,20,20,20 c3.192,0,6.206-0.777,8.89-2.122L18.974,22.216V31.5z M28.974,16.5c0-0.828,0.671-1.5,1.5-1.5s1.5,0.672,1.5,1.5v13.84l-3-4.227 V16.5z"/></svg>`;

const SUB_PLATFORMS = {
    web: [
        { id: 'svelte', label: 'Svelte', type: 'image', source: require('../../assets/icons/svelte.png'), color: '#FF3E00' },
        { id: 'react', label: 'React', icon: FontAwesome5, name: 'react', color: '#61DAFB' },
        { id: 'nextjs', label: 'Next.js', type: 'svg', xml: NEXTJS_SVG, color: '#000000' },
        { id: 'vue', label: 'Vue', icon: FontAwesome5, name: 'vuejs', color: '#4FC08D' },
        { id: 'nuxt', label: 'Nuxt', icon: MaterialCommunityIcons, name: 'nuxt', color: '#00DC82' },
        { id: 'angular', label: 'Angular', icon: FontAwesome5, name: 'angular', color: '#DD0031' },
        { id: 'js', label: 'JavaScript', icon: FontAwesome5, name: 'js', color: '#F7DF1E' },
    ],
    flutter: [
        { id: 'flutter-android', label: 'Android', icon: FontAwesome5, name: 'android', color: '#3DDC84' },
        { id: 'flutter-ios', label: 'iOS', icon: AntDesign, name: 'apple', color: '#000000' },
        { id: 'flutter-macos', label: 'macOS', icon: Monitor, name: 'monitor', color: '#000000' },
        { id: 'flutter-windows', label: 'Windows', icon: FontAwesome5, name: 'windows', color: '#0078D6' },
        { id: 'flutter-linux', label: 'Linux', icon: FontAwesome5, name: 'linux', color: '#FCC624' },
        { id: 'flutter-web', label: 'Web', icon: Entypo, name: 'code', color: '#007AFF' },
    ],
    apple: [
        { id: 'apple-ios', label: 'iOS', icon: Smartphone, name: 'smartphone', color: '#000000' },
        { id: 'apple-macos', label: 'macOS', icon: Monitor, name: 'monitor', color: '#000000' },
        { id: 'apple-watchos', label: 'watchOS', icon: Watch, name: 'watch', color: '#000000' },
        { id: 'apple-tvos', label: 'tvOS', icon: Tv, name: 'tv', color: '#000000' },
    ],
    'react-native': [
        { id: 'react-native-android', label: 'Android', icon: FontAwesome5, name: 'android', color: '#3DDC84' },
        { id: 'react-native-ios', label: 'iOS', icon: AntDesign, name: 'apple', color: '#000000' },
        { id: 'react-native-web', label: 'Web', icon: Entypo, name: 'code', color: '#007AFF' },
    ],
};

const PLATFORM_TYPES = [
    { id: 'web', label: 'Web', icon: Globe, color: '#007AFF' },
    { id: 'android', label: 'Android', icon: Smartphone, color: '#3DDC84' },
    { id: 'apple', label: 'Apple', icon: AntDesign, name: 'apple', color: '#c3c3c3ff' },
    { id: 'flutter', label: 'Flutter', icon: FontAwesome6, name: 'flutter', color: '#02569B' },
    { id: 'react-native', label: 'React Native', icon: FontAwesome5, name: 'react', color: '#61DAFB' },
];

export const CreatePlatformModal = ({ isOpen, onOpenChange, projectId, onCreated, selectedType = null }) => {
    const { isDark } = useTheme();

    const [step, setStep] = useState(1); // 1: Type Select, 2: Sub-type Select, 3: Details, 4: Success
    const [mainType, setMainType] = useState(null);
    const [subType, setSubType] = useState(null);
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Update Apple icon colors based on theme
    const appleColor = isDark ? '#FFFFFF' : '#000000';

    const finalType = subType?.id || mainType?.id;
    const isWebMode = mainType?.id === 'web' || finalType === 'flutter-web' || finalType === 'react-native-web';
    const isAppleMode = finalType?.includes('ios') || finalType?.includes('apple') || finalType?.includes('macos') || finalType?.includes('watchos') || finalType?.includes('tvos');

    const identifierConfig = {
        label: isWebMode ? 'Hostname' : isAppleMode ? 'Bundle ID' : 'Package Name',
        placeholder: isWebMode ? 'localhost' : 'com.company.app',
        description: isWebMode 
            ? "The domain where your app will be hosted. No protocol or port number required." 
            : isAppleMode
                ? "A unique identifier for your Apple application (e.g. com.company.myapp)."
                : "A unique identifier for your application (e.g. com.company.myapp)."
    };

    useEffect(() => {
        if (isOpen) {
            if (selectedType) {
                const main = PLATFORM_TYPES.find(p => selectedType.id.startsWith(p.id));
                setMainType(main);
                
                setStep(2);
                if (SUB_PLATFORMS[main?.id]) {
                    const sub = SUB_PLATFORMS[main.id].find(s => s.id === selectedType.id) || SUB_PLATFORMS[main.id][0];
                    setSubType(sub);
                } else {
                    setSubType(null);
                }

                if (main?.id === 'web') {
                    setIdentifier('');
                } else {
                    setName('');
                    setIdentifier('');
                }
            } else {
                setStep(1);
            }
        }
    }, [isOpen, selectedType]);

    const reset = () => {
        setStep(1);
        setMainType(null);
        setSubType(null);
        setName('');
        setIdentifier('');
        setError(null);
    };

    const handleClose = () => {
        onOpenChange(false);
        setTimeout(reset, 300);
    };

    const handleCreate = async () => {
        setLoading(true);
        setError(null);
        try {
            const isWeb = finalType === 'web';
            const isFlutterWeb = finalType === 'flutter-web';
            const isRNWeb = finalType === 'react-native-web';
            
            const payload = {
                projectId,
                type: finalType,
                name: (isWeb || isFlutterWeb || isRNWeb) ? `${subType?.label || 'Web'} App` : name,
            };

            if (isWeb || isFlutterWeb || isRNWeb) {
                payload.hostname = identifier || (isWeb ? 'localhost' : '');
            } else {
                payload.key = identifier;
            }

            await sdk.forConsole.projects.createPlatform(payload);
            setStep(4);
            if (onCreated) onCreated();
        } catch (err) {
            setError(err.message || 'Failed to create platform');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] min-h-[680px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 && "Add Platform"}
                        {step === 2 && (mainType?.id === 'web' ? "Add Web Platform" : `Add ${mainType?.label} Platform`)}
                        {step === 4 && "Platform Created"}
                    </DialogTitle>
                </DialogHeader>

                <View className="py-2 flex-1">
                    {step === 1 && (
                        <View className="flex-1">
                            <View className="gap-2">
                                <Text className="text-muted-foreground text-sm mb-2">
                                    Choose a platform to get started with Appwrite.
                                </Text>
                                {PLATFORM_TYPES.map((p) => {
                                    const IconComp = p.icon;
                                    const iconColor = p.id === 'apple' ? appleColor : p.color;
                                    return (
                                        <TouchableOpacity
                                            key={p.id}
                                            onPress={() => {
                                                setMainType(p);
                                                setStep(2);
                                                if (SUB_PLATFORMS[p.id]) {
                                                    setSubType(SUB_PLATFORMS[p.id][0]);
                                                } else {
                                                    setSubType(null);
                                                }
                                                // Reset inputs
                                                setIdentifier(p.id === 'web' ? '' : '');
                                                setName('');
                                            }}
                                            className="flex-row items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border mt-2 active:bg-muted/30"
                                        >
                                            <View className="flex-row items-center gap-4">
                                                <View 
                                                    style={{ backgroundColor: iconColor + '15' }} 
                                                    className="p-2.5 rounded-xl border border-border"
                                                >
                                                    {p.name ? (
                                                        <IconComp name={p.name} size={22} color={iconColor} />
                                                    ) : (
                                                        <Icon as={IconComp} size={22} color={iconColor} />
                                                    )}
                                                </View>
                                                <View>
                                                    <Text className="text-foreground font-semibold text-base">{p.label}</Text>
                                                    <Text className="text-muted-foreground text-xs">Connect your {p.label} app</Text>
                                                </View>
                                            </View>
                                            <ChevronRight size={18} className="text-muted-foreground" />
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View className="flex-1">
                            {SUB_PLATFORMS[mainType?.id] && (
                                <View className="flex-row flex-wrap gap-3 justify-center py-2 mb-4">
                                    {SUB_PLATFORMS[mainType?.id]?.map((sub) => {
                                        const IconComp = sub.icon;
                                        const iconColor = sub.color === '#000000' && isDark ? '#FFFFFF' : sub.color;
                                        const isSelected = subType?.id === sub.id;
                                        return (
                                            <TouchableOpacity
                                                key={sub.id}
                                                onPress={() => setSubType(sub)}
                                                className={cn(
                                                    "w-[30%] aspect-[0.9] items-center justify-center p-3 bg-muted/20 rounded-2xl border border-border active:bg-muted/30",
                                                    isSelected && "border-primary bg-primary/10"
                                                )}
                                            >
                                                <View 
                                                    style={{ backgroundColor: iconColor + '10' }} 
                                                    className={cn(
                                                        "p-3 rounded-2xl mb-2 items-center justify-center border border-border",
                                                        isSelected && "border-primary"
                                                    )}
                                                >
                                                    {sub.type === 'image' ? (
                                                        <Image source={sub.source} style={{ width: 32, height: 32 }} resizeMode="contain" />
                                                    ) : sub.type === 'svg' ? (
                                                        <SvgXml xml={sub.xml} width={34} height={34} color={isDark ? '#FFFFFF' : '#000000'} />
                                                    ) : sub.name ? (
                                                        <IconComp name={sub.name} size={28} color={iconColor} />
                                                    ) : (
                                                        <Icon as={IconComp} size={28} color={iconColor} />
                                                    )}
                                                </View>
                                                <Text className={cn(
                                                    "text-foreground text-[11px] font-bold text-center",
                                                    isSelected && "text-primary"
                                                )} numberOfLines={1}>
                                                    {sub.label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            <View className="px-1 gap-4">
                                <View className="bg-muted/10 p-5 rounded-3xl border border-border gap-4">
                                    {mainType?.id !== 'web' && (
                                        <View className="gap-2">
                                            <Label nativeID="name" className="text-foreground font-semibold ml-1">App Name</Label>
                                            <Input
                                                placeholder="My App"
                                                value={name}
                                                onChangeText={setName}
                                                className="bg-background/50 border-border h-12 rounded-xl"
                                            />
                                        </View>
                                    )}

                                    <View className="gap-2">
                                        <Label nativeID="identifier" className="text-foreground font-semibold ml-1">
                                            {identifierConfig.label}
                                        </Label>
                                        <Input
                                            placeholder={identifierConfig.placeholder}
                                            value={identifier}
                                            onChangeText={setIdentifier}
                                            autoCapitalize="none"
                                            className="bg-background/50 border-border h-12 rounded-xl placeholder:text-muted-foreground "
                                        />
                                        <Text className="text-[10px] text-muted-foreground italic px-1">
                                            {identifierConfig.description}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {error && (
                                <View className="bg-destructive/10 p-3 mt-4 rounded-xl border border-destructive">
                                    <Text className="text-destructive text-sm font-medium text-center">{error}</Text>
                                </View>
                            )}
                        </View>
                    )}

                    {step === 4 && (
                        <View className="items-center py-6 gap-4">
                            <View className="bg-primary/10 p-4 rounded-full">
                                <CheckCircle2 size={48} color="#FD366E" />
                            </View>
                            <View className="items-center">
                                <Text className="text-foreground text-xl font-semibold">Success!</Text>
                                <Text className="text-muted-foreground text-center mt-1">
                                    Your {subType?.label || mainType?.label} platform has been added.
                                </Text>
                            </View>
                        </View>
                    )}
                </View>

                <DialogFooter>
                    {step === 2 && (
                        <Button 
                            className="w-full bg-primary h-12 rounded-xl" 
                            onPress={handleCreate}
                            disabled={
                                (mainType?.id !== 'web' && !name) || 
                                (!identifier && !isWebMode) || 
                                loading
                            }
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Create Platform</Text>}
                        </Button>
                    )}
                    {step === 4 && (
                        <Button className="w-full bg-primary h-12 rounded-xl" onPress={handleClose}>
                            <Text className="text-white font-bold">Done</Text>
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
