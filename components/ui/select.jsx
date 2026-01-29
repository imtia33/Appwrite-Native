import { Icon } from './icon';
import { NativeOnlyAnimatedView } from './native-only-animated-view';
import { TextClassContext } from './text';
import { cn } from '../../lib/utils';
import * as SelectPrimitive from '@rn-primitives/select';
import { Check, ChevronDown, ChevronDownIcon, ChevronUpIcon } from 'lucide-react-native';
import * as React from 'react';
import { Platform, ScrollView, StyleSheet, View, Text } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';
import { useTheme } from '../../lib/theme-context';

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

function SelectValue(props) {
  const { value } = SelectPrimitive.useRootContext();
  const { className, ...rest } = props;
  return (
    <SelectPrimitive.Value
      className={cn('text-foreground line-clamp-1 flex flex-row items-center gap-2 text-sm', !value && 'text-muted-foreground', className)}
      {...rest}
    >
      <Text className={cn('text-sm', className)}>{value ? (value.label || value) : (rest.placeholder || rest.children)}</Text>
    </SelectPrimitive.Value>
  );
}

function SelectTrigger(props) {
  const { className, children, size = 'default', ...rest } = props;
  const { theme } = useTheme();

  // Determine color based on theme
  const iconColor = theme === 'dark' ? '#9CA3AF' : '#6B7280'; // text-muted-foreground colors

  return (
    <SelectPrimitive.Trigger
      className={cn('border-input dark:bg-input/30 dark:active:bg-input/50 bg-background flex h-10 flex-row items-center justify-between gap-2 rounded-md border px-3 py-2 shadow-sm shadow-black/5 sm:h-9 text-foreground dark:text-white', Platform.select({
        web: 'focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:hover:bg-input/50 w-fit whitespace-nowrap text-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0'
      }), rest.disabled && 'opacity-50', size === 'sm' && 'h-8 py-2 sm:py-1.5', className)}
      {...rest}
    >
      {children}
      <Icon
        as={ChevronDown}
        aria-hidden="true"
        size={20}
        color={iconColor}
      />
    </SelectPrimitive.Trigger>
  );
}

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function SelectContent(props) {
  const { className, children, position = 'popper', portalHost, ...rest } = props;
  return /*#__PURE__*/React.createElement(SelectPrimitive.Portal, {
    hostName: portalHost
  }, /*#__PURE__*/React.createElement(FullWindowOverlay, null, /*#__PURE__*/React.createElement(SelectPrimitive.Overlay, {
    style: Platform.select({
      native: [StyleSheet.absoluteFill, { zIndex: 1000, elevation: 1000 }]
    })
  }, /*#__PURE__*/React.createElement(TextClassContext.Provider, {
    value: "text-popover-foreground"
  }, /*#__PURE__*/React.createElement(NativeOnlyAnimatedView, {
    className: "z-[1000]",
    entering: FadeIn,
    exiting: FadeOut
  }, /*#__PURE__*/React.createElement(SelectPrimitive.Content, {
    className: cn('bg-popover border-border relative z-[1000] min-w-[8rem] rounded-md border shadow-md shadow-black/5', Platform.select({
      web: cn('animate-in fade-in-0 zoom-in-95 origin-(--radix-select-content-transform-origin) max-h-52 overflow-y-auto overflow-x-hidden', rest.side === 'bottom' && 'slide-in-from-top-2', rest.side === 'top' && 'slide-in-from-bottom-2'),
      native: 'p-1'
    }), position === 'popper' && Platform.select({
      web: cn(rest.side === 'bottom' && 'translate-y-1', rest.side === 'top' && '-translate-y-1')
    }), className),
    position: position,
    ...rest
  }, /*#__PURE__*/React.createElement(SelectScrollUpButton, null), /*#__PURE__*/React.createElement(SelectPrimitive.Viewport, {
    className: cn('p-1', position === 'popper' && cn('w-full', Platform.select({
      web: 'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]'
    })))
  }, children), /*#__PURE__*/React.createElement(SelectScrollDownButton, null)))))));
}

function SelectLabel(props) {
  const { className, children, ...rest } = props;
  return (
    <SelectPrimitive.Label
      className={cn('text-white px-2 py-2 text-xs sm:py-1.5', className)}
      {...rest}
    >
      {typeof children === 'string' ? <Text className={cn('text-xs font-semibold', className)}>{children}</Text> : children}
    </SelectPrimitive.Label>
  );
}

function SelectItem(props) {
  const { className, children, label, ...rest } = props;
  return (
    <SelectPrimitive.Item
      className={cn('active:bg-accent group relative flex w-full flex-row items-center gap-2 rounded-sm py-3 pl-3 pr-10', Platform.select({
        web: 'focus:bg-accent focus:text-accent-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 cursor-default outline-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none'
      }), rest.disabled && 'opacity-50', className)}
      label={label}
      {...rest}
    > 
      <View className="flex-1">
        {typeof children === 'string' ? (
          <Text className="text-foreground text-sm">{children}</Text>
        ) : (
          children || <Text className="text-foreground text-sm">{label}</Text>
        )}
      </View>
      <View className="absolute right-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon as={Check} size={18} color="#FD366E" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="hidden" />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator(props) {
  const { className, ...rest } = props;
  return /*#__PURE__*/React.createElement(SelectPrimitive.Separator, {
    className: cn('bg-border -mx-1 my-1 h-px', Platform.select({
      web: 'pointer-events-none'
    }), className),
    ...rest
  });
}

/**
 * @platform Web only
 * Returns null on native platforms
 */
function SelectScrollUpButton(props) {
  const { className, ...rest } = props;
  if (Platform.OS !== 'web') {
    return null;
  }
  return /*#__PURE__*/React.createElement(SelectPrimitive.ScrollUpButton, {
    className: cn('flex cursor-default items-center justify-center py-1', className),
    ...rest
  }, /*#__PURE__*/React.createElement(Icon, {
    as: ChevronUpIcon,
    className: "size-4"
  }));
}

/**
 * @platform Web only
 * Returns null on native platforms
 */
function SelectScrollDownButton(props) {
  const { className, ...rest } = props;
  if (Platform.OS !== 'web') {
    return null;
  }
  return /*#__PURE__*/React.createElement(SelectPrimitive.ScrollDownButton, {
    className: cn('flex cursor-default items-center justify-center py-1', className),
    ...rest
  }, /*#__PURE__*/React.createElement(Icon, {
    as: ChevronDownIcon,
    className: "size-4"
  }));
}

/**
 * @platform Native only
 * Returns the children on the web
 */
function NativeSelectScrollView(props) {
  const { className, ...rest } = props;
  if (Platform.OS === 'web') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, rest.children);
  }
  return /*#__PURE__*/React.createElement(ScrollView, {
    style: { maxHeight: 350 },
    contentContainerStyle: { paddingVertical: 8 },
    className: className,
    keyboardShouldPersistTaps: "handled",
    showsVerticalScrollIndicator: true,
    nestedScrollEnabled: true,
    ...rest
  });
}

export {
  NativeSelectScrollView,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue
};
