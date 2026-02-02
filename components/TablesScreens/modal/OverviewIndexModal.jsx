import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Entypo, FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

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

const OverviewIndexModal = ({ isOpen, onOpenChange, index, attributes = [] }) => {
    if (!index) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="min-w-[350px] w-[95%] p-0 overflow-hidden bg-background border-border max-h-[90vh]">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-xl font-bold">Index Details</DialogTitle>
                </DialogHeader>

                <ScrollView className="p-6 max-h-[60vh]" nestedScrollEnabled={true}>
                    <View className="gap-4">
                        <View className="gap-2">
                            <Label>Index Key</Label>
                            <Input value={index.key} editable={false} className="bg-muted/20 text-muted-foreground" />
                        </View>

                        <View className="gap-2">
                            <Label>Index Type</Label>
                            <Input value={index.type} editable={false} className="bg-muted/20 text-muted-foreground capitalize" />
                        </View>

                        <View className="mt-4 gap-4">
                            <Label>Attributes</Label>
                            {index.attributes && index.attributes.map((attr, i) => {
                                const attrObj = attributes.find(a => a.key === attr);
                                const icon = attrObj ? getIconByType(attrObj.type, attrObj.format) : null;
                                
                                return (
                                <View key={i} className="flex-row gap-2 border border-border p-2 rounded-md bg-muted/10">
                                    <View className="flex-1 gap-1">
                                        <Label className="text-xs">Column</Label>
                                        <View className="flex-row items-center gap-2 h-8 px-2 bg-muted/20 rounded-md border border-input">
                                            {icon && <View className="mr-1">{icon}</View>}
                                            <Text className="text-xs text-foreground font-medium">{attr}</Text>
                                        </View>
                                    </View>
                                    <View className="w-20 gap-1">
                                        <Label className="text-xs">Order</Label>
                                        <View className="h-8 justify-center px-2 bg-muted/20 rounded-md border border-input">
                                            <Text className="text-xs text-foreground font-medium">{index.orders?.[i] || '-'}</Text>
                                        </View>
                                    </View>
                                    {(index.type === 'key' || index.type === 'fulltext') && (
                                        <View className="w-20 gap-1">
                                            <Label className="text-xs">Length</Label>
                                            <View className="h-8 justify-center px-2 bg-muted/20 rounded-md border border-input">
                                                 <Text className="text-xs text-foreground font-medium">{index.lengths?.[i]?.toString() || '-'}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )})}
                        </View>
                    </View>
                </ScrollView>

                <DialogFooter className="p-6 border-t border-border">
                    <DialogClose asChild>
                        <Button style={{borderColor: '#3e3e3eff'}} variant="outline" className="w-full">
                            <Text>Close</Text>
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OverviewIndexModal;
