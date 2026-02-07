import * as React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { X } from "lucide-react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";

const DialogContext = React.createContext(null);

function Dialog({ children, open: openProp, onOpenChange }) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = onOpenChange || setOpenState;

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, className, ...props }) {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <Pressable
      onPress={() => setOpen(true)}
      className={cn(className)}
      {...props}
    >
      <View pointerEvents="none">{children}</View>
    </Pressable>
  );
}

function DialogPortal({ children }) {
  return <>{children}</>;
}

function DialogClose({ children, className, ...props }) {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <Pressable
      onPress={() => setOpen(false)}
      className={cn(className)}
      {...props}
    >
      <View pointerEvents="none">{children}</View>
    </Pressable>
  );
}

function DialogOverlay({ className, children, ...props }) {
  const { open, setOpen } = React.useContext(DialogContext);
  return (
    <Modal
      transparent
      visible={open}
      animationType="none"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => setOpen(false)}
        className="bg-black/50"
      />
      <View className="flex-1 items-center justify-center p-4">
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="w-full"
        >
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

function DialogContent({ className, children, ...props }) {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <DialogOverlay>
      <View
        className={cn(
          "bg-background border-border relative flex w-full flex-col gap-4 rounded-lg border p-6 shadow-lg",
          className,
        )}
        {...props}
      >
        {children}
        <Pressable
          onPress={() => setOpen(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 active:opacity-100"
          hitSlop={12}
        >
          <Icon as={X} className="text-muted-foreground size-4 shrink-0" />
          <Text className="sr-only">Close</Text>
        </Pressable>
      </View>
    </DialogOverlay>
  );
}

function DialogHeader({ className, ...props }) {
  return (
    <View
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <View
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <Text
      className={cn(
        "text-foreground text-lg font-semibold leading-none",
        className,
      )}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <Text
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
