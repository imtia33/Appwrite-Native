import * as TablePrimitive from '@rn-primitives/table';
import * as React from 'react';
import { View, Text as RNText, ScrollView, Platform } from 'react-native';
import { cn } from '../../lib/utils';
import { TextClassContext } from './text';

const Table = React.forwardRef(({ className, ...props }, ref) => (
    <TablePrimitive.Root
        ref={ref}
        className={cn('w-full caption-bottom text-sm', className)}
        {...props}
    />
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
    <TablePrimitive.Header
        ref={ref}
        className={cn('border-b border-border', className)}
        {...props}
    />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
    <TablePrimitive.Body
        ref={ref}
        className={cn('', className)}
        {...props}
    />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef(({ className, ...props }, ref) => (
    <TablePrimitive.Footer
        ref={ref}
        className={cn(
            'bg-muted/50 border-t border-border font-medium',
            className
        )}
        {...props}
    />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
    <TablePrimitive.Row
        ref={ref}
        className={cn(
            'flex-row border-b border-border transition-colors',
            className
        )}
        {...props}
    />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef(({ className, children, ...props }, ref) => {
    const content = typeof children === 'string' || typeof children === 'number'
        ? <RNText>{children}</RNText>
        : children;

    return (
        <TablePrimitive.Head
            ref={ref}
            className={cn(
                'text-muted-foreground h-10 px-2 flex-1 items-center justify-center font-medium',
                className
            )}
            {...props}
        >
            <TextClassContext.Provider value="text-muted-foreground font-medium text-sm">
                {content}
            </TextClassContext.Provider>
        </TablePrimitive.Head>
    );
});
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef(({ className, children, ...props }, ref) => {
    const content = typeof children === 'string' || typeof children === 'number'
        ? <RNText>{children}</RNText>
        : children;

    return (
        <TablePrimitive.Cell
            ref={ref}
            className={cn(
                'p-2 flex-1 items-center justify-center',
                className
            )}
            {...props}
        >
            <TextClassContext.Provider value="text-foreground text-sm">
                {content}
            </TextClassContext.Provider>
        </TablePrimitive.Cell>
    );
});
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
    <TablePrimitive.Caption
        ref={ref}
        className={cn('text-muted-foreground mt-4 text-sm text-center', className)}
        {...props}
    />
));
TableCaption.displayName = 'TableCaption';

const TableColumn = React.forwardRef(({ className, ...props }, ref) => (
    <View
        ref={ref}
        className={cn('flex-column', className)}
        {...props}
    />
));
TableColumn.displayName = 'TableColumn';

const TableColumnHeader = React.forwardRef(({ className, children, ...props }, ref) => (
    <View
        ref={ref}
        className={cn('h-10 px-4 justify-center bg-muted/30 border-b border-border', className)}
        {...props}
    >
        {typeof children === 'string' || typeof children === 'number' ? (
            <RNText className="text-xs font-semibold text-muted-foreground uppercase">{children}</RNText>
        ) : (
            children
        )}
    </View>
));
TableColumnHeader.displayName = 'TableColumnHeader';

const TableColumnCell = React.forwardRef(({ className, children, ...props }, ref) => (
    <View
        ref={ref}
        className={cn('px-4 border-b border-border justify-center', className)}
        {...props}
    >
        {typeof children === 'string' || typeof children === 'number' ? (
            <RNText className="text-sm text-foreground">{children}</RNText>
        ) : (
            children
        )}
    </View>
));
TableColumnCell.displayName = 'TableColumnCell';

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
    TableColumn,
    TableColumnHeader,
    TableColumnCell,
};

