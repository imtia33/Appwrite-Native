import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  ToastAndroid,
  Platform,
} from "react-native";
import { useProjectStore } from "../../../appwrite/store/projectStore";
import { sdk } from "../../../appwrite/appwrite";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "../../ui/card";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Icon } from "../../ui/icon";
import {
  Shield,
  Users,
  Clock,
  History,
  AlertTriangle,
  ShieldCheck,
  Mail,
  Info,
} from "lucide-react-native";
import { useTheme } from "../../../lib/theme-context";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { ChevronDown } from "lucide-react-native";

const SecurityScreen = () => {
  const { theme } = useTheme();
  const { currentProject } = useProjectStore();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState({});

  // Form States
  const [authLimitValue, setAuthLimitValue] = useState("unlimited");
  const [authLimit, setAuthLimit] = useState(100);

  const [sessionLength, setSessionLength] = useState(365);
  const [sessionUnit, setSessionUnit] = useState("days");

  const [sessionsLimit, setSessionsLimit] = useState(10);

  const [passwordHistoryEnabled, setPasswordHistoryEnabled] = useState(false);
  const [passwordHistory, setPasswordHistory] = useState(5);
  const [passwordDictionary, setPasswordDictionary] = useState(false);
  const [personalDataCheck, setPersonalDataCheck] = useState(false);

  const [sessionAlerts, setSessionAlerts] = useState(false);
  const [invalidateSessions, setInvalidateSessions] = useState(false);

  useEffect(() => {
    if (currentProject?.$id) {
      // Auth Limit
      setAuthLimitValue(
        currentProject.authLimit !== 0 ? "limited" : "unlimited",
      );
      setAuthLimit(currentProject.authLimit || 100);

      // Session Length (convert from seconds)
      const duration = currentProject.authDuration || 31536000;
      if (duration % 31536000 === 0) {
        setSessionLength(duration / 31536000);
        setSessionUnit("years");
      } else if (duration % 2592000 === 0) {
        setSessionLength(duration / 2592000);
        setSessionUnit("months");
      } else if (duration % 86400 === 0) {
        setSessionLength(duration / 86400);
        setSessionUnit("days");
      } else if (duration % 3600 === 0) {
        setSessionLength(duration / 3600);
        setSessionUnit("hours");
      } else if (duration % 60 === 0) {
        setSessionLength(duration / 60);
        setSessionUnit("minutes");
      } else {
        setSessionLength(duration);
        setSessionUnit("seconds");
      }

      // Sessions Limit
      setSessionsLimit(currentProject.authSessionsLimit || 10);

      // Password Policies
      const history = currentProject.authPasswordHistory || 0;
      setPasswordHistoryEnabled(history !== 0);
      setPasswordHistory(history || 5);
      setPasswordDictionary(currentProject.authPasswordDictionary || false);
      setPersonalDataCheck(currentProject.authPersonalDataCheck || false);

      // Session Security
      setSessionAlerts(currentProject.authSessionAlerts || false);
      setInvalidateSessions(currentProject.authInvalidateSessions || false);
    }
  }, [currentProject]);

  const showToast = (message, duration = ToastAndroid.LONG) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, duration);
    } else {
      Alert.alert("Info", message);
    }
  };

  const showError = (message) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.LONG);
    } else {
      Alert.alert("Error", message);
    }
  };

  const handleUpdate = async (type, updateFn) => {
    setUpdating((prev) => ({ ...prev, [type]: true }));
    try {
      await updateFn();
      // In a real app we'd refresh the project state here
      showToast("Settings updated successfully");
    } catch (error) {
      console.error(`Update ${type} Error:`, error);
      showError(error.message);
    } finally {
      setUpdating((prev) => ({ ...prev, [type]: false }));
    }
  };

  const updateAuthLimit = () => {
    if (!sdk || !sdk.forConsole || !currentProject?.$id) {
      showError("SDK not initialized or project not selected");
      return Promise.reject(
        new Error("SDK not initialized or project not selected"),
      );
    }
    return handleUpdate("authLimit", () =>
      sdk.forConsole.projects.updateAuthLimit({
        projectId: currentProject.$id,
        limit: authLimitValue === "limited" ? Number(authLimit) : 0,
      }),
    );
  };

  const updateSessionLength = () => {
    if (!sdk || !sdk.forConsole || !currentProject?.$id) {
      showError("SDK not initialized or project not selected");
      return Promise.reject(
        new Error("SDK not initialized or project not selected"),
      );
    }
    let duration = Number(sessionLength);
    switch (sessionUnit) {
      case "minutes":
        duration *= 60;
        break;
      case "hours":
        duration *= 3600;
        break;
      case "days":
        duration *= 86400;
        break;
      case "months":
        duration *= 2592000;
        break;
      case "years":
        duration *= 31536000;
        break;
    }
    return handleUpdate("sessionLength", () =>
      sdk.forConsole.projects.updateAuthDuration({
        projectId: currentProject.$id,
        duration,
      }),
    );
  };

  const updateSessionsLimit = () => {
    if (!sdk || !sdk.forConsole || !currentProject?.$id) {
      showError("SDK not initialized or project not selected");
      return Promise.reject(
        new Error("SDK not initialized or project not selected"),
      );
    }
    return handleUpdate("sessionsLimit", () =>
      sdk.forConsole.projects.updateAuthSessionsLimit({
        projectId: currentProject.$id,
        limit: Number(sessionsLimit),
      }),
    );
  };

  const updatePasswordPolicies = () => {
    if (!sdk || !sdk.forConsole || !currentProject?.$id) {
      showError("SDK not initialized or project not selected");
      return Promise.reject(
        new Error("SDK not initialized or project not selected"),
      );
    }
    return handleUpdate("passwordPolicies", async () => {
      await sdk.forConsole.projects.updateAuthPasswordHistory({
        projectId: currentProject.$id,
        limit: passwordHistoryEnabled ? Number(passwordHistory) : 0,
      });
      await sdk.forConsole.projects.updateAuthPasswordDictionary({
        projectId: currentProject.$id,
        enabled: passwordDictionary,
      });
      await sdk.forConsole.projects.updatePersonalDataCheck({
        projectId: currentProject.$id,
        enabled: personalDataCheck,
      });
    });
  };

  const updateSessionSecurity = () => {
    if (!sdk || !sdk.forConsole || !currentProject?.$id) {
      showError("SDK not initialized or project not selected");
      return Promise.reject(
        new Error("SDK not initialized or project not selected"),
      );
    }
    return handleUpdate("sessionSecurity", async () => {
      await sdk.forConsole.projects.updateSessionAlerts({
        projectId: currentProject.$id,
        alerts: sessionAlerts,
      });
      await sdk.forConsole.projects.updateSessionInvalidation({
        projectId: currentProject.$id,
        enabled: invalidateSessions,
      });
    });
  };

  if (!sdk || !sdk.forConsole) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">SDK not initialized</Text>
      </View>
    );
  }

  if (!currentProject?.$id) {
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-muted-foreground">
          Please select a project first
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-foreground">Security</Text>
        <Text className="text-muted-foreground text-sm">
          Configure your project authentication security settings
        </Text>
      </View>

      {/* Users Limit */}
      <Card className="mb-6 border-border  py-4">
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Icon as={Users} size={20} color="#FD366E" />
            <CardTitle>Users limit</CardTitle>
          </View>
          <CardDescription>
            Limit new users from signing up for your project. You can still
            create users manually from the console.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-4">
          <RadioGroup value={authLimitValue} onValueChange={setAuthLimitValue}>
            <View className="flex-row items-center gap-2 mb-2">
              <RadioGroupItem value="unlimited" id="unlimited" />
              <Label nativeID="unlimited">Unlimited (Recommended)</Label>
            </View>
            <View className="flex-row items-center gap-2">
              <RadioGroupItem value="limited" id="limited" />
              <Label nativeID="limited">Limited</Label>
            </View>
          </RadioGroup>

          {authLimitValue === "limited" && (
            <View className="flex-row items-center gap-2 mt-2">
              <Input
                className="w-32"
                keyboardType="numeric"
                value={String(authLimit)}
                onChangeText={(text) =>
                  setAuthLimit(text.replace(/[^0-9]/g, ""))
                }
              />
              <Text className="text-muted-foreground text-sm">
                Maximum users
              </Text>
            </View>
          )}
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            onPress={updateAuthLimit}
            disabled={updating.authLimit}
            size="sm"
          >
            {updating.authLimit ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Update</Text>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Session Length */}
      <Card className="mb-6 border-border  py-4">
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Icon as={Clock} size={20} color="#FD366E" />
            <CardTitle>Session length</CardTitle>
          </View>
          <CardDescription>
            Set how long a user session remains active. Reducing this will log
            out active users.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-row gap-4 items-end">
          <View className="flex-1 gap-2">
            <Label>Length</Label>
            <Input
              keyboardType="numeric"
              value={String(sessionLength)}
              onChangeText={(text) =>
                setSessionLength(text.replace(/[^0-9]/g, ""))
              }
            />
          </View>
          <View className="flex-1 gap-2">
            <Label>Time period</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-row items-center justify-between px-3 border-input"
                >
                  <Text
                    className={
                      !sessionUnit ? "text-muted-foreground" : "text-foreground"
                    }
                  >
                    {sessionUnit
                      ? sessionUnit.charAt(0).toUpperCase() +
                        sessionUnit.slice(1)
                      : "Select unit"}
                  </Text>
                  <Icon as={ChevronDown} size={14} color="gray" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px]">
                <ScrollView>
                  {[
                    "Seconds",
                    "Minutes",
                    "Hours",
                    "Days",
                    "Months",
                    "Years",
                  ].map((unit) => (
                    <DropdownMenuItem
                      key={unit}
                      onPress={() => setSessionUnit(unit.toLowerCase())}
                    >
                      <Text className="text-muted-foreground">{unit}</Text>
                    </DropdownMenuItem>
                  ))}
                </ScrollView>
              </DropdownMenuContent>
            </DropdownMenu>
          </View>
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            onPress={updateSessionLength}
            disabled={updating.sessionLength}
            size="sm"
          >
            {updating.sessionLength ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Update</Text>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Sessions Limit */}
      <Card className="mb-6 border-border  py-4">
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Icon as={AlertTriangle} size={20} color="#FD366E" />
            <CardTitle>Sessions limit</CardTitle>
          </View>
          <CardDescription>
            Limit the number of concurrent sessions a user can have active.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-2">
          <Label>Maximum active sessions</Label>
          <Input
            className="w-32"
            keyboardType="numeric"
            value={String(sessionsLimit)}
            onChangeText={(text) =>
              setSessionsLimit(text.replace(/[^0-9]/g, ""))
            }
          />
          <Text className="text-muted-foreground text-xs italic mt-1">
            Default is 10. Set to 0 for unlimited.
          </Text>
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            onPress={updateSessionsLimit}
            disabled={updating.sessionsLimit}
            size="sm"
          >
            {updating.sessionsLimit ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Update</Text>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Password Policies */}
      <Card className="mb-6 border-border  py-4 ">
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Icon as={ShieldCheck} size={20} color="#FD366E" />
            <CardTitle>Password policies</CardTitle>
          </View>
          <CardDescription>
            Set rules and requirements for user passwords to ensure account
            security.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium">
                Password history
              </Text>
              <Text className="text-muted-foreground text-xs">
                Prevent users from reusing recent passwords.
              </Text>
            </View>
            <Switch
              value={passwordHistoryEnabled}
              onValueChange={setPasswordHistoryEnabled}
              trackColor={{ false: "#3f3f46", true: "#FD366E" }}
            />
          </View>

          {passwordHistoryEnabled && (
            <View className="flex-row items-center gap-2 ml-4">
              <Input
                className="w-24"
                keyboardType="numeric"
                value={String(passwordHistory)}
                onChangeText={(text) =>
                  setPasswordHistory(text.replace(/[^0-9]/g, ""))
                }
              />
              <Text className="text-muted-foreground text-sm">
                Previous passwords
              </Text>
            </View>
          )}

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium">
                Password dictionary
              </Text>
              <Text className="text-muted-foreground text-xs">
                Prevent common or insecure passwords using a blacklist of 10k
                common passwords.
              </Text>
            </View>
            <Switch
              value={passwordDictionary}
              onValueChange={setPasswordDictionary}
              trackColor={{ false: "#3f3f46", true: "#FD366E" }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium">
                Disallow personal data
              </Text>
              <Text className="text-muted-foreground text-xs">
                Don't allow passwords that contain the user's name, email, or
                phone.
              </Text>
            </View>
            <Switch
              value={personalDataCheck}
              onValueChange={setPersonalDataCheck}
              trackColor={{ false: "#3f3f46", true: "#FD366E" }}
            />
          </View>
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            onPress={updatePasswordPolicies}
            disabled={updating.passwordPolicies}
            size="sm"
          >
            {updating.passwordPolicies ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Update</Text>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Session Security */}
      <Card className="mb-6 border-border py-4 ">
        <CardHeader>
          <View className="flex-row items-center gap-2">
            <Icon as={Shield} size={20} color="#FD366E" />
            <CardTitle>Session security</CardTitle>
          </View>
          <CardDescription>
            Additional settings to protect user sessions and account access.
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium">
                Session alerts
              </Text>
              <Text className="text-muted-foreground text-xs">
                Email users when a new session is created on their account.
              </Text>
            </View>
            <Switch
              value={sessionAlerts}
              onValueChange={setSessionAlerts}
              trackColor={{ false: "#3f3f46", true: "#FD366E" }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <Text className="text-foreground font-medium">
                Invalidate sessions
              </Text>
              <Text className="text-muted-foreground text-xs">
                Clear all existing sessions when a user changes their password.
              </Text>
            </View>
            <Switch
              value={invalidateSessions}
              onValueChange={setInvalidateSessions}
              trackColor={{ false: "#3f3f46", true: "#FD366E" }}
            />
          </View>
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            onPress={updateSessionSecurity}
            disabled={updating.sessionSecurity}
            size="sm"
          >
            {updating.sessionSecurity ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-medium">Update</Text>
            )}
          </Button>
        </CardFooter>
      </Card>
    </ScrollView>
  );
};

export default SecurityScreen;
