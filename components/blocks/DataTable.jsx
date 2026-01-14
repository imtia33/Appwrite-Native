import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Icon } from '../ui/icon';
import { Search, SlidersHorizontal } from 'lucide-react-native';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../lib/utils';

const DataTable = ({
    data,
    columns,
    onRowPress,
    searchPlaceholder = "Search...",
    filterKey = "name",
    pagination = true,
    itemsPerPage = 10,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(
        columns.filter(col => !col.hidden).map(col => col.id || col.accessorKey)
    );
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [page, setPage] = useState(0);

    // Filtering
    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        return data.filter(item => {
            const value = item[filterKey];
            return String(value).toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [data, searchQuery, filterKey]);

    // Pagination
    const paginatedData = useMemo(() => {
        if (!pagination) return filteredData;
        const start = page * itemsPerPage;
        return filteredData.slice(start, start + itemsPerPage);
    }, [filteredData, page, itemsPerPage, pagination]);



    const toggleColumn = (columnId) => {
        setVisibleColumns(prev =>
            prev.includes(columnId)
                ? prev.filter(id => id !== columnId)
                : [...prev, columnId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set());
        } else {
            setSelectedRows(new Set(paginatedData.map(item => item.$id || item.id)));
        }
    };

    const toggleSelectRow = (id) => {
        const newSelected = new Set(selectedRows);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRows(newSelected);
    };

    const displayedColumns = columns.filter(col =>
        visibleColumns.includes(col.id || col.accessorKey) || col.id === 'actions' || col.id === 'select'
    );

    return (
        <View className="w-full flex-1">
            <View className="flex-row items-center py-4 px-1 gap-2">
                <View className="flex-1 relative">
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        className="pl-10 h-10"
                    />
                    <View className="absolute left-3 top-2.5">
                        <Icon as={Search} size={18} className="text-muted-foreground" />
                    </View>
                </View>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="flex-row items-center gap-2">
                            <Icon as={SlidersHorizontal} size={16} color="gray" />
                            <Text className="text-sm font-medium text-foreground">Columns</Text>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {columns.filter(col => col.id !== 'actions' && col.id !== 'select').map((column) => {
                            const id = column.id || column.accessorKey;
                            return (
                                <DropdownMenuCheckboxItem
                                    key={id}
                                    checked={visibleColumns.includes(id)}
                                    onCheckedChange={() => toggleColumn(id)}
                                >
                                    <Text className="capitalize text-muted-foreground">{column.header || id}</Text>
                                </DropdownMenuCheckboxItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </View>

            <View className="flex-1 border border-border rounded-md overflow-hidden bg-card">
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View className="min-w-full">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    {displayedColumns.map((column) => (
                                        <TableHead
                                            key={column.id || column.accessorKey}
                                            className={cn("px-4", column.className)}
                                        >
                                            {column.id === 'select' ? (
                                                <Checkbox
                                                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                                    onCheckedChange={toggleSelectAll}
                                                />
                                            ) : (
                                                <Text className="text-muted-foreground font-medium text-xs uppercase tracking-wider">
                                                    {column.header}
                                                </Text>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => (
                                        <TableRow
                                            key={item.$id || item.id || index}
                                            className={cn(index % 2 === 0 ? "bg-background" : "bg-muted/20")}
                                            onPress={() => onRowPress?.(item)}
                                        >
                                            {displayedColumns.map((column) => (
                                                <TableCell
                                                    key={column.id || column.accessorKey}
                                                    className={cn("px-4 py-3", column.className)}
                                                >
                                                    {column.id === 'select' ? (
                                                        <Checkbox
                                                            checked={selectedRows.has(item.$id || item.id)}
                                                            onCheckedChange={() => toggleSelectRow(item.$id || item.id)}
                                                        />
                                                    ) : column.cell ? (
                                                        column.cell({ row: { original: item } })
                                                    ) : (
                                                        <Text className="text-foreground text-sm">
                                                            {item[column.accessorKey]}
                                                        </Text>
                                                    )}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={displayedColumns.length} className="h-32 items-center justify-center">
                                            <Text className="text-muted-foreground italic">No results found.</Text>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </View>
                </ScrollView>
            </View>

            {pagination && filteredData.length > itemsPerPage && (
                <View className="flex-row items-center justify-between py-4 px-1">
                    <Text className="text-muted-foreground text-xs">
                        {selectedRows.size > 0 ? `${selectedRows.size} row(s) selected` : `Total: ${filteredData.length} items`}
                    </Text>
                    <View className="flex-row items-center gap-4">
                        <View className="flex-row items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onPress={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <Text className="text-lg text-foreground font-medium">Previous</Text>
                            </Button>
                            <Button
                                variant="outline"
                                className='bg-primary'
                                size="sm"
                                disabled={(page + 1) * itemsPerPage >= filteredData.length}
                                onPress={() => setPage(p => p + 1)}
                            >
                                <Text className="text-lg text-foreground font-medium">Next</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

export default DataTable;
