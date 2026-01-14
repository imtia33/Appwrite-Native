import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Linking, Alert } from 'react-native';
import CardGrid from '../blocks/CardGrid';
import DataTable from '../blocks/DataTable';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Icon } from '../ui/icon';
import { MoreHorizontal, Download, ExternalLink, RefreshCw, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { sdk } from '../../appwrite/appwrite';
import { Query } from '@appwrite.io/console';
import { formatCurrency, toLocaleDate } from '../../appwrite/billing-helpers';
import { useTheme } from '@/lib/theme-context';
const BillingHistory = ({ currentOrganization }) => {
    const [limit] = useState(5);
    const [offset, setOffset] = useState(0);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
    const { theme } = useTheme();
    const [invoiceList, setInvoiceList] = useState({
        invoices: [],
        total: 0
    });

    // Console URL for external links
    const consoleUrl = 'https://cloud.appwrite.io/console';

    const request = async () => {
        if (!currentOrganization?.$id) return;

        setIsLoadingInvoices(true);
        try {
            // As per Damodar's note in Svelte code: "first page extra must have an extra limit"
            // We implement similar logic if needed, but for now sticking to straightforward pagination
            // to ensure React Native stability first. 
            // Svelte logic: Query.limit(patchQuery ? limit + 1 : limit)
            // We will stick to standard limit for now.

            const response = await sdk.forConsole.billing.listInvoices(
                currentOrganization.$id,
                [
                    Query.orderDesc('$createdAt'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
            setInvoiceList(response);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setIsLoadingInvoices(false);
        }
    };

    useEffect(() => {
        request();
    }, [currentOrganization?.$id, offset]);

    const retryPayment = async (invoice) => {
        // Placeholder for retry logic
        Alert.alert("Retry Payment", "Payment retry functionality coming soon.");
    };

    const columns = useMemo(() => [
        {
            accessorKey: 'dueAt',
            header: 'Due date',
            className: 'py-2',
            cell: ({ row }) => (
                <Text className="text-foreground text-sm">
                    {toLocaleDate(row.original.dueAt)}
                </Text>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            className: 'py-2',
            cell: ({ row }) => {
                const status = row.original.status;
                const isDanger = status === 'overdue' || status === 'requires_authentication';
                const isSuccess = status === 'paid' || status === 'succeeded';
                const isWarning = status === 'pending';

                let variant = 'default';
                if (status === 'overdue' || status === 'requires_authentication') variant = 'destructive';
                if (status === 'failed' || status === 'abandoned' || status === 'cancelled') variant = 'secondary';
                if (isSuccess) variant = 'success';
                if (isWarning) variant = 'secondary'; // Pending is also grey/secondary

                return (
                    <View className="flex-row items-center gap-2">
                        <Badge variant={variant}>
                            <Text style={{ fontSize: 16 }} className={`capitalize font-medium  ${isSuccess ? 'text-green-100' : 'text-muted-foreground'}`}>
                                {status === 'requires_authentication' ? 'failed' : status}
                            </Text>
                        </Badge>
                        {row.original.lastError && (
                            <Icon as={AlertCircle} size={16} className="text-destructive" />
                        )}
                    </View>
                );
            },
        },
        {
            accessorKey: 'grossAmount',
            header: 'Amount due',
            className: 'py-2',
            cell: ({ row }) => (
                <Text className="text-foreground text-sm">
                    {formatCurrency(row.original.grossAmount)}
                </Text>
            ),
        },
        {
            id: 'actions',
            className: 'py-2',
            cell: ({ row }) => {
                const invoice = row.original;
                const status = invoice.status;
                const isRetryable = status === 'overdue' || status === 'failed' || status === 'abandoned';

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Icon as={MoreHorizontal} size={16} className="text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onPress={() => {
                                const url = `${consoleUrl}/organization-${currentOrganization.$id}/invoices/${invoice.$id}/view`;
                                Linking.openURL(url);
                            }}>
                                <Icon as={ExternalLink} size={16} className="mr-2" color='grey' />
                                <Text className='font-medium text-foreground'>View invoice</Text>
                            </DropdownMenuItem>
                            <DropdownMenuItem onPress={() => {
                                const url = `${consoleUrl}/organization-${currentOrganization.$id}/invoices/${invoice.$id}/download`;
                                Linking.openURL(url);
                            }}>
                                <Icon as={Download} size={16} className="mr-2" color='grey' />
                                <Text className='font-medium text-foreground'>ViewDownload PDF</Text>
                            </DropdownMenuItem>
                            {isRetryable && (
                                <DropdownMenuItem onPress={() => retryPayment(invoice)}>
                                    <Icon as={RefreshCw} size={16} className="mr-2" />
                                    <Text>Retry payment</Text>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ], [currentOrganization?.$id]);

    const handlePageChange = (direction) => {
        if (direction === 'next') {
            setOffset(prev => prev + limit);
        } else {
            setOffset(prev => Math.max(0, prev - limit));
        }
    };

    return (
        <CardGrid
            title="Payment history"
            description="Transaction history for this organization. Download invoices for more details about your payments."
            aside={
                <View className="gap-4">
                    <DataTable
                        data={invoiceList.invoices}
                        columns={columns}
                        pagination={false}
                        filterKey="status"
                        searchPlaceholder="Search invoices"
                    />

                    {invoiceList.total >= limit && (
                        <View className="flex-row items-center justify-between px-2 mb-2">
                            <Text className="text-muted-foreground text-xs">
                                Total results: {invoiceList.total}
                            </Text>
                            <View className="flex-row items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={offset === 0}
                                    className='bg-transparent border border-0 '
                                    onPress={() => handlePageChange('prev')}
                                >
                                    <ChevronLeft className='mt-0.5' size={28} color={theme === 'dark' ? '#fff' : '#000'} />
                                    <Text style={{ fontSize: 16 }} className="text-lg text-foreground font-regular">Previous</Text>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={offset + limit >= invoiceList.total}
                                    className='bg-transparent border border-0 '
                                    onPress={() => handlePageChange('next')}
                                >
                                    <Text style={{ fontSize: 16 }} className=" text-foreground font-regular">Next</Text>
                                    <ChevronRight className='mt-0.5' size={28} color={theme === 'dark' ? '#fff' : '#000'} />
                                </Button>
                            </View>
                        </View>
                    )}
                </View>
            }
        />
    );
};

export default BillingHistory;
