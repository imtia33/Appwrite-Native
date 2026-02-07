import React, { useState } from "react";
import {
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useTheme } from "@/lib/theme-context";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { X, ChevronLeft } from "lucide-react-native";
import StepSelection from "./StepSelection";
import StepDetails from "./StepDetails";
import StepConfiguration from "./StepConfiguration";

const CreateFunctions = ({ visible, onClose, onCreate }) => {
  const { theme, getThemeValue, isDark } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    id: "",
    runtime: "",
    repository: null,
    installationId: null,
    entrypoint: "",
    buildCommand: "",
    roles: [],
  });

  const handleNext = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleFinalCreate = async (finalData) => {
    const completeData = { ...formData, ...finalData };
    await onCreate(
      completeData.name,
      completeData.runtime,
      completeData.id,
      completeData.template,
    );
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep(1);
    setFormData({
      name: "",
      id: "",
      runtime: "",
      repository: null,
      installationId: null,
      entrypoint: "",
      buildCommand: "",
      roles: [],
    });
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepSelection onNext={handleNext} />;
      case 2:
        return (
          <StepDetails
            data={formData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepConfiguration
            data={formData}
            onCreate={handleFinalCreate}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={resetAndClose}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: getThemeValue("#ffffff", "#000000") }}
      >
        <View className="flex-1">
          {/* Header */}
          <View className="px-4 py-4 border-b border-border flex-row items-center justify-between">
            <View className="flex-row items-center">
              {step > 1 && (
                <TouchableOpacity onPress={handleBack} className="mr-3 p-1">
                  <Icon
                    as={ChevronLeft}
                    size={20}
                    color={getThemeValue("#000000", "#ffffff")}
                  />
                </TouchableOpacity>
              )}
              <Text variant="h3" className="text-foreground">
                Create function
              </Text>
            </View>
            <TouchableOpacity onPress={resetAndClose} className="p-1">
              <Icon
                as={X}
                size={20}
                color={getThemeValue("#000000", "#ffffff")}
              />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 16 }}
          >
            {renderStep()}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateFunctions;
