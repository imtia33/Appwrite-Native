import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableColumn, TableColumnHeader, TableColumnCell } from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Icon } from '../ui/icon';
import { Search, SlidersHorizontal, Trash2, X } from 'lucide-react-native';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { cn } from '../../lib/utils';
import { Card } from '../ui/card';

const DataTable = ({
    data,
    columns,
    onRowPress,
    searchPlaceholder = "Search...",
    filterKey = "name",
    pagination = true,
    itemsPerPage = 10,
    showSearch = false,
    showColumnSelector = false,
    onDeleteSelected,
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

    const ROW_HEIGHT = 60;

    return (
        <View className="w-full flex-1">
            {(showSearch || showColumnSelector) && (
                <View className="flex-row items-center py-4 px-1 gap-2">
                    {showSearch && (
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
                    )}

                    {showColumnSelector && (
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
                    )}
                </View>
            )}
            <Card className="flex-1">
            <View className="flex-1 overflow-hidden">
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={true}
                    nestedScrollEnabled={true}
                >
                    <View className="flex-row">
                        {displayedColumns.map((column) => (
                            <TableColumn
                                key={column.id || column.accessorKey}
                                className={cn(column.className)}
                                style={{ width: column.width || 150 }}
                            >
                                <TableColumnHeader>
                                    {column.id === 'select' ? (
                                        <Checkbox
                                        
                                            checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                                            onCheckedChange={toggleSelectAll}
                                        />
                                    ) : (
                                        column.header
                                    )}
                                </TableColumnHeader>

                                {paginatedData.length > 0 ? (
                                    paginatedData.map((item, index) => (
                                        <TableColumnCell
                                            key={item.$id || item.id || index}
                                            style={{ height: ROW_HEIGHT }}
                                            className={cn(index % 2 === 0 ? "bg-background" : "bg-muted/10")}
                                        >
                                            {column.id === 'select' ? (
                                                <Checkbox
                                                    checked={selectedRows.has(item.$id || item.id)}
                                                    onCheckedChange={() => toggleSelectRow(item.$id || item.id)}
                                                />
                                            ) : column.cell ? (
                                                column.cell({ row: { original: item } })
                                            ) : (
                                                <Text className="text-foreground text-sm" numberOfLines={1}>
                                                    {item[column.accessorKey]}
                                                </Text>
                                            )}
                                        </TableColumnCell>
                                    ))
                                ) : (
                                    <View className="h-32 items-center justify-center">
                                        {/* Show message only once if needed, but in column-based we might need a better empty state */}
                                    </View>
                                )}
                            </TableColumn>
                        ))}
                    </View>
                </ScrollView>
                {paginatedData.length === 0 && (
                    <View className="h-32 items-center justify-center p-4">
                        <Text className="text-muted-foreground italic">No results found.</Text>
                    </View>
                )}
            </View>
            </Card>

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
                                <Text className="text-lg text-white font-medium">Next</Text>
                            </Button>
                        </View>
                    </View>
                </View>
            )}

            {/* Selection Actions Toast */}
            {selectedRows.size > 0 && (
                <View 
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        alignSelf:'center',
                        backgroundColor: '#1C1C1E',
                        borderRadius: 12,
                        padding: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        elevation: 10,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        zIndex: 1000,
                        width:320
                    }}
                >
                    <View className="flex-row items-center gap-4">
                        
                        <Text className="text-white font-medium">
                            {selectedRows.size} {selectedRows.size === 1 ? 'item' : 'items'} selected
                        </Text>
                    </View>
                    
                    <View className="flex-row items-center gap-1 ml-2">
                        <TouchableOpacity 
                            onPress={() => {
                                if (onDeleteSelected) {
                                    onDeleteSelected(Array.from(selectedRows));
                                }
                                setSelectedRows(new Set());
                            }}
                            className="bg-destructive px-4 py-2 rounded-lg flex-row items-center gap-2"
                        >
                            <Icon as={Trash2} size={16} color="white" />
                            <Text className="text-white font-semibold">Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            onPress={() => setSelectedRows(new Set())}
                            className="bg-muted/20 px-3 py-1.5 rounded-lg"
                        >
                            <Text className="text-white text-xs font-medium uppercase">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};


export default DataTable;
