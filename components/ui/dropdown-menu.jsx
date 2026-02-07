import * as React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { Check, ChevronRight } from "lucide-react-native";
import { cn } from "../../lib/utils";
import { Icon } from "./icon";
import { TextClassContext } from "./text";

const DropdownMenuContext = React.createContext(null);

function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);
  const [triggerLayout, setTriggerLayout] = React.useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const triggerRef = React.useRef(null);

  return (
    <DropdownMenuContext.Provider
      value={{ open, setOpen, triggerLayout, setTriggerLayout, triggerRef }}
    >
      {children}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuTrigger({ children, className, ...props }) {
  const { open, setOpen, triggerRef, setTriggerLayout } =
    React.useContext(DropdownMenuContext);

  const handlePress = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setTriggerLayout({ x, y, width, height });
      setOpen(!open);
    });
  };

  return (
    <Pressable
      ref={triggerRef}
      onPress={handlePress}
      className={cn(className)}
      {...props}
    >
      <View pointerEvents="none">{children}</View>
    </Pressable>
  );
}

function DropdownMenuContent({
  children,
  className,
  sideOffset = 4,
  ...props
}) {
  const { open, setOpen, triggerLayout } =
    React.useContext(DropdownMenuContext);
  const [contentLayout, setContentLayout] = React.useState({
    width: 0,
    height: 0,
  });

  if (!open) return null;

  const onContentLayout = (event) => {
    const { width, height } = event.nativeEvent.layout;
    if (width > 0) setContentLayout({ width, height });
  };

  const menuWidth = contentLayout.width || 128; // min-w-[8rem] is 128px
  const screenWidth = Dimensions.get("window").width;

  let left = triggerLayout.x;
  // If it goes off screen right, align to right of trigger
  if (left + menuWidth > screenWidth - 8) {
    left = triggerLayout.x + triggerLayout.width - menuWidth;
  }
  // Hard clamp
  left = Math.max(8, Math.min(left, screenWidth - menuWidth - 8));

  const contentStyle = {
    top: triggerLayout.y + triggerLayout.height + sideOffset,
    left: left,
  };

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
        className="bg-black/5"
      />
      <View
        style={[contentStyle, { position: "absolute" }]}
        className="z-50"
        onLayout={onContentLayout}
      >
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className={cn(
            "bg-popover border-border min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-xl shadow-black/30",
            className,
          )}
        >
          <TextClassContext.Provider value="text-popover-foreground">
            {children}
          </TextClassContext.Provider>
        </Animated.View>
      </View>
    </Modal>
  );
}

function DropdownMenuItem({
  children,
  className,
  variant,
  inset,
  onPress,
  closeOnSelect = true,
  ...props
}) {
  const { setOpen } = React.useContext(DropdownMenuContext);

  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        if (closeOnSelect) {
          setOpen(false);
        }
      }}
      className={cn(
        "active:bg-accent group relative flex flex-row items-center gap-2 rounded-sm px-2 py-2 sm:py-1.5",
        props.disabled && "opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      <TextClassContext.Provider
        value={cn(
          "select-none text-sm text-popover-foreground",
          variant === "destructive" && "text-destructive",
        )}
      >
        {children}
      </TextClassContext.Provider>
    </Pressable>
  );
}

function DropdownMenuCheckboxItem({
  children,
  className,
  checked,
  onCheckedChange,
  closeOnSelect = true,
  ...props
}) {
  const { setOpen } = React.useContext(DropdownMenuContext);

  return (
    <Pressable
      onPress={() => {
        onCheckedChange?.(!checked);
        if (closeOnSelect) {
          setOpen(false);
        }
      }}
      className={cn(
        "active:bg-accent group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 sm:py-1.5",
        props.disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {checked && (
          <Icon as={Check} className="text-foreground size-4 shrink-0" />
        )}
      </View>
      <TextClassContext.Provider value="text-sm text-popover-foreground">
        {children}
      </TextClassContext.Provider>
    </Pressable>
  );
}

function DropdownMenuRadioItem({
  children,
  className,
  value,
  onPress,
  closeOnSelect = true,
  ...props
}) {
  const { setOpen } = React.useContext(DropdownMenuContext);
  // Note: RadioGroup logic should ideally be handled by parent,
  // but for simplicity we assume the caller handles value logic.

  return (
    <Pressable
      onPress={(e) => {
        onPress?.(e);
        if (closeOnSelect) {
          setOpen(false);
        }
      }}
      className={cn(
        "active:bg-accent group relative flex flex-row items-center gap-2 rounded-sm py-2 pl-8 pr-2 sm:py-1.5",
        props.disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <View className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {/* Placeholder logic for radio indicator */}
        <View className="bg-foreground h-2 w-2 rounded-full opacity-0" />
      </View>
      <TextClassContext.Provider value="text-sm text-popover-foreground">
        {children}
      </TextClassContext.Provider>
    </Pressable>
  );
}

function DropdownMenuLabel({ children, className, inset, ...props }) {
  return (
    <Text
      className={cn(
        "text-foreground px-2 py-2 text-sm font-medium sm:py-1.5",
        inset && "pl-8",
        className,
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

function DropdownMenuSeparator({ className, ...props }) {
  return (
    <View className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />
  );
}

function DropdownMenuGroup({ children }) {
  return <View>{children}</View>;
}

function DropdownMenuPortal({ children }) {
  return <>{children}</>;
}

function DropdownMenuSub({ children }) {
  return <View>{children}</View>;
}

function DropdownMenuRadioGroup({ children }) {
  return <View>{children}</View>;
}

function DropdownMenuShortcut({ className, ...props }) {
  return (
    <Text
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className,
      )}
      {...props}
    />
  );
}

// SubTriggers and SubContent are complex for a simple Modal approach
// because they require nested modals or dynamic portals.
// For now, we'll keep them as placeholders or simple views.

function DropdownMenuSubTrigger({ children, className, inset, ...props }) {
  return (
    <View
      className={cn(
        "group flex flex-row items-center rounded-sm px-2 py-2 sm:py-1.5",
        inset && "pl-8",
        className,
      )}
    >
      <Text className="text-sm text-popover-foreground">{children}</Text>
      <Icon
        as={ChevronRight}
        className="text-foreground ml-auto size-4 shrink-0"
      />
    </View>
  );
}

function DropdownMenuSubContent({ children, className, ...props }) {
  return null; // Nested subs not supported in this simple refactor yet
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
