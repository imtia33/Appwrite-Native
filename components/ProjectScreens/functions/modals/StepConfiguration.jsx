import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { useTheme } from "@/lib/theme-context";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

const StepConfiguration = ({ data, onCreate, onBack }) => {
  const { getThemeValue } = useTheme();
  const [buildCommand, setBuildCommand] = useState("");
  const [roles, setRoles] = useState(["any"]);

  const toggleRole = (role) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  return (
    <View className="gap-6">
      <View>
        <Text variant="p" className="text-muted-foreground mb-6">
          Configure your function settings and permissions.
        </Text>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="build">
            <AccordionTrigger>
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-foreground">
                  Build settings
                </Text>
                <View className="bg-muted px-2 py-0.5 rounded">
                  <Text className="text-[10px] text-muted-foreground uppercase">
                    Optional
                  </Text>
                </View>
              </View>
            </AccordionTrigger>
            <AccordionContent>
              <View className="gap-4 pt-2">
                <View className="gap-2">
                  <Label className="text-foreground">Build command</Label>
                  <Input
                    placeholder="npm install"
                    value={buildCommand}
                    onChangeText={setBuildCommand}
                    className="bg-card border-border text-foreground"
                  />
                </View>
              </View>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="permissions">
            <AccordionTrigger>
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-foreground">
                  Execute access
                </Text>
                <View className="bg-muted px-2 py-0.5 rounded">
                  <Text className="text-[10px] text-muted-foreground uppercase">
                    Optional
                  </Text>
                </View>
              </View>
            </AccordionTrigger>
            <AccordionContent>
              <View className="gap-4 pt-2">
                <Text className="text-sm text-muted-foreground">
                  Choose who can execute this function using the client API.
                </Text>

                <View className="gap-3">
                  {["any", "users", "guests"].map((role) => (
                    <TouchableOpacity
                      key={role}
                      onPress={() => toggleRole(role)}
                      className="flex-row items-center gap-3"
                    >
                      <Checkbox
                        checked={roles.includes(role)}
                        onCheckedChange={() => toggleRole(role)}
                      />
                      <Label className="capitalize text-sm text-foreground">
                        {role}
                      </Label>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </View>

      <View className="mt-8 flex-row gap-3">
        <Button
          variant="outline"
          onPress={onBack}
          className="flex-1 border-border bg-transparent"
        >
          <Text className="text-foreground">Back</Text>
        </Button>
        <Button
          onPress={() => onCreate({ buildCommand, roles })}
          className="flex-1 bg-primary"
        >
          <Text className="text-white font-bold">Create</Text>
        </Button>
      </View>
    </View>
  );
};

export default StepConfiguration;
