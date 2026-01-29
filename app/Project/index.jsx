import React, { useState, useEffect } from 'react';
import { View, Text, Animated, Dimensions, Pressable, TouchableOpacity, Easing, StyleSheet } from 'react-native';
import { X, ChevronLeft } from 'lucide-react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../../lib/theme-context';
import ProjectSidebar from '../../components/Project/ProjectSidebar';
import ProjectScreenList, { SCREEN_MAP } from '../../components/Project/ProjectScreenList';
import { ProjectPicker } from '../../components/Project/ProjectPicker';
import { OrganizationPicker } from '../../components/Organization/OrgPicker';
import { UserMenu } from '../../components/blocks/userMenu';
import { useProjectStore } from '../../appwrite/store/projectStore';
import { useOrganizationStore } from '../../appwrite/store/organizationStore';
import { useUsageStore } from '../../appwrite/store/usageStore';
import useAuthStore from '../../appwrite/data-services/authService';
import useDatabaseStore from '../../appwrite/data-services/databaseService';
import useFunctionStore from '../../appwrite/data-services/functionService';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/button';

// Screen imports
import OverviewUsage from '@/components/ProjectScreens/overview/usage';
import OverviewIntegrations from '@/components/ProjectScreens/overview/integrations';
import AuthUsers from '@/components/ProjectScreens/auth/users';
import AuthTeams from '@/components/ProjectScreens/auth/teams';
import AuthSecurity from '@/components/ProjectScreens/auth/security';
import AuthTemplates from '@/components/ProjectScreens/auth/templates';
import AuthSettings from '@/components/ProjectScreens/auth/settings';
import Databases from '@/components/ProjectScreens/databases/databases';
import Functions from '@/components/ProjectScreens/functions/functions';
import FunctionTemplates from '@/components/ProjectScreens/functions/function-templates';
import Messages from '@/components/ProjectScreens/messaging/messages';
import Providers from '@/components/ProjectScreens/messaging/providers';
import Topic from '@/components/ProjectScreens/messaging/topic';
import Sites from '@/components/ProjectScreens/sites/sites';
import Buckets from '@/components/ProjectScreens/storage/buckets';

const SCREEN_COMPONENTS = {
    'usage': OverviewUsage,
    'integrations': OverviewIntegrations,
    'users': AuthUsers,
    'teams': AuthTeams,
    'security': AuthSecurity,
    'templates': AuthTemplates,
    'settings': AuthSettings,
    'databases': Databases,
    'functions': Functions,
    'function-templates': FunctionTemplates,
    'messages': Messages,
    'providers': Providers,
    'topic': Topic,
    'sites': Sites,
    'buckets': Buckets,
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProjectDashboard = () => {
    const { theme } = useTheme();
    const { projects, currentProject, setCurrentProject, fetchProjects } = useProjectStore();
    const { organizations, currentOrganization, setCurrentOrganization } = useOrganizationStore();
    
    const [activeCategory, setActiveCategory] = useState('overview');
    const [activeScreen, setActiveScreen] = useState(null);
    const [visitedScreens, setVisitedScreens] = useState(new Set());
    const [recentScreens, setRecentScreens] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Animation values
    const sidebarX = React.useRef(new Animated.Value(SCREEN_WIDTH)).current;
    const dragX = React.useRef(new Animated.Value(0)).current;

    // Combined value for transformation
    const translateX = React.useMemo(() => Animated.add(sidebarX, dragX).interpolate({
        inputRange: [0, SCREEN_WIDTH],
        outputRange: [0, SCREEN_WIDTH],
        extrapolate: 'clamp',
    }), [sidebarX, dragX]);

    const onGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: dragX } }],
        { useNativeDriver: true }
    );

    const onOpenGestureStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;
            
            // Swiping left to open (negative translationX)
            if (translationX < -SCREEN_WIDTH / 6 || velocityX < -500) {
                const currentPos = Math.max(0, SCREEN_WIDTH + translationX);
                sidebarX.setValue(currentPos);
                dragX.setValue(0);
                
                const duration = Math.max(150, (currentPos / SCREEN_WIDTH) * 300);
                
                Animated.timing(sidebarX, {
                    toValue: 0,
                    duration: duration,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start(() => {
                    setIsSidebarOpen(true);
                    // Auto-select first screen if none selected
                    if (!activeScreen) {
                        const categoryScreens = SCREEN_MAP[activeCategory]?.screens;
                        if (categoryScreens && categoryScreens.length > 0) {
                            const firstScreenId = categoryScreens[0].id;
                            setActiveScreen(firstScreenId);
                            setVisitedScreens(prev => new Set(prev).add(firstScreenId));
                            setRecentScreens(prev => ({
                                ...prev,
                                [activeCategory]: firstScreenId
                            }));
                        }
                    }
                });
            } else {
                const currentPos = Math.min(SCREEN_WIDTH, SCREEN_WIDTH + translationX);
                sidebarX.setValue(currentPos);
                dragX.setValue(0);
                
                const duration = Math.max(150, ((SCREEN_WIDTH - currentPos) / SCREEN_WIDTH) * 300);
                
                Animated.timing(sidebarX, {
                    toValue: SCREEN_WIDTH,
                    duration: duration,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start(() => {
                });
            }
        }
    };

    const onCloseGestureStateChange = (event) => {
        if (event.nativeEvent.state === State.END) {
            const { translationX, velocityX } = event.nativeEvent;
            
            // Swiping right to close (positive translationX)
            if (translationX > SCREEN_WIDTH / 6 || velocityX > 500) {
                const currentPos = Math.min(SCREEN_WIDTH, translationX);
                sidebarX.setValue(currentPos);
                dragX.setValue(0);
                
                const duration = Math.max(150, ((SCREEN_WIDTH - currentPos) / SCREEN_WIDTH) * 300);
                
                Animated.timing(sidebarX, {
                    toValue: SCREEN_WIDTH,
                    duration: duration,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start(() => {
                    setIsSidebarOpen(false);
                });
            } else {
                const currentPos = Math.max(0, translationX);
                sidebarX.setValue(currentPos);
                dragX.setValue(0);
                
                const duration = Math.max(150, (currentPos / SCREEN_WIDTH) * 300);
                
                Animated.timing(sidebarX, {
                    toValue: 0,
                    duration: duration,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }).start();
            }
        }
    };

    const { clearCache } = useUsageStore();
    
    useEffect(() => {
        if (currentProject?.$id) {
            clearCache();
            // Clear other caches as well
            useAuthStore.getState().clearCache();
            useDatabaseStore.getState().clearCache();
            useFunctionStore.getState().clearCache();
        }
    }, [currentProject?.$id]);

    useEffect(() => {
        if (currentOrganization?.$id) {
            fetchProjects(currentOrganization.$id);
        }
    }, [currentOrganization?.$id]);

    const openSidebar = (screenId = null) => {
        // If no screenId provided and no active screen, auto-select first screen
        let finalScreenId = screenId;
        if (!finalScreenId && !activeScreen) {
            const categoryScreens = SCREEN_MAP[activeCategory]?.screens;
            if (categoryScreens && categoryScreens.length > 0) {
                finalScreenId = categoryScreens[0].id;
            }
        }
        
        // Set the screen before opening sidebar
        if (finalScreenId && finalScreenId !== activeScreen) {
            setActiveScreen(finalScreenId);
            setVisitedScreens(prev => new Set(prev).add(finalScreenId));
            setRecentScreens(prev => ({
                ...prev,
                [activeCategory]: finalScreenId
            }));
        }
        
        dragX.setValue(0);
        Animated.timing(sidebarX, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setIsSidebarOpen(true);
        });
    };

    const closeSidebar = () => {
        dragX.setValue(0);
        Animated.timing(sidebarX, {
            toValue: SCREEN_WIDTH,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setIsSidebarOpen(false);
        });
    };

    const handleCategoryChange = (category) => {
        setActiveCategory(category);
        setActiveScreen(null);
    };

    const handleScreenSelect = (screenId) => {
        // Unmount current screen and render new screen immediately
        setActiveScreen(screenId);
        setVisitedScreens(prev => new Set(prev).add(screenId));
        setRecentScreens(prev => ({
            ...prev,
            [activeCategory]: screenId
        }));
        // Open sidebar with the selected screen
        openSidebar(screenId);
    };

    const ActiveComponent = activeScreen ? SCREEN_COMPONENTS[activeScreen] : null;

    return (
        <View style={{ flex: 1, backgroundColor: theme === 'dark' ? '#19191D' : '#EDEDF0' }}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
            
            <View className="flex-row justify-between items-center px-4 h-12  bg-background">
                <View className="flex-row items-center gap-1">
                    <OrganizationPicker 
                        organizations={organizations} 
                        selectedOrganization={currentOrganization} 
                        setSelectedOrganization={setCurrentOrganization} 
                    />
                    <Text className="text-muted-foreground">/</Text>
                    <ProjectPicker 
                        projects={projects} 
                        selectedProject={currentProject} 
                        setSelectedProject={setCurrentProject} 
                    />
                </View>
                <UserMenu />
            </View>

            <View className="flex-1 flex-row relative overflow-hidden">
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onOpenGestureStateChange}
                    activeOffsetX={[-20, 999]}
                    failOffsetY={[-40, 40]}
                    enabled={!isSidebarOpen}
                >
                    <Animated.View style={{ flex: 1, flexDirection: 'row' }}>
                        {/* Level 1: Sidebar (Icons) */}
                        <ProjectSidebar 
                            activeCategory={activeCategory} 
                            onCategoryChange={handleCategoryChange} 
                        />

                        {/* Level 2: Screen List (Text Labels) */}
                        <ProjectScreenList 
                            activeCategory={activeCategory}
                            activeScreen={activeScreen}
                            onScreenChange={handleScreenSelect}
                        />
                    </Animated.View>
                </PanGestureHandler>

                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onCloseGestureStateChange}
                    activeOffsetX={[-999, 20]}
                    failOffsetY={[-40, 40]}
                    enabled={isSidebarOpen}
                >
                    <Animated.View 
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width: SCREEN_WIDTH,
                            backgroundColor: theme === 'dark' ? '#19191D' : '#FFFFFF',
                            transform: [{ translateX: translateX }],
                            zIndex: 100,
                            elevation: 5,
                            shadowColor: '#000',
                            shadowOffset: { width: -2, height: 0 },
                            shadowOpacity: 0.1,
                            shadowRadius: 10,
                        }}
                    >
                    <View className="flex-1">
                        {/* Sidebar Header */}
                        <View className="flex-row items-center px-4 h-12 border-b border-t border-border">
                            <TouchableOpacity 
                                onPress={closeSidebar}
                                className="mr-4 p-2 rounded-full active:bg-secondary/50"
                            >
                                <ChevronLeft size={24} color={theme === 'dark' ? '#FFFFFF' : '#000000'} />
                            </TouchableOpacity>
                            <Text className="text-foreground text-xl font-regular">
                                {activeScreen ? SCREEN_MAP[activeCategory]?.screens.find(s => s.id === activeScreen)?.label : ''}
                            </Text>
                        </View>
                    
                        {/* Sidebar Content (Active Screen Only) */}
                        <View className="flex-1">
                            {activeScreen && SCREEN_COMPONENTS[activeScreen] && (() => {
                                const ActiveComponent = SCREEN_COMPONENTS[activeScreen];
                                return (
                                    <View 
                                        style={{
                                            ...StyleSheet.absoluteFillObject,
                                            opacity: 1,
                                            zIndex: 1,
                                        }}
                                        pointerEvents={'auto'}
                                    >
                                        <ActiveComponent />
                                    </View>
                                );
                            })()}
                        </View>
                    </View>
                    </Animated.View>
                </PanGestureHandler>

                
            </View>
            </View>
    );
};

export default ProjectDashboard;