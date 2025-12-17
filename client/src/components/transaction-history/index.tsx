'use client';
import NeonBox from '@/components/neon/neon-box';
import NeonText from '@/components/neon/neon-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useTransactions } from '@/hooks/useTransactions';
import { Icon } from '@iconify/react';
import { useTransitionRouter } from 'next-transition-router';
import { usePathname } from 'next/navigation';
import AccountPageTitle from '../../app/(account)/profile/components/account-page-title';

export default function TransactionHistory() {
    const { sm, xl } = useBreakPoint();
    const isTransactionPage = usePathname() === '/transaction-history';
    const router = useTransitionRouter();

    // Use optimized hook with caching
    const {
        transactions,
        loading,
        error,
        pagination,
        handleTypeFilter,
        handleStatusFilter,
        refresh,
    } = useTransactions({
        initialLimit: isTransactionPage ? 20 : 5,
        enableCache: true, // Enable caching for better performance
    });

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        }).format(date);
    };

    // Format amount
    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <section className='mb-5'>
            <div className='flex items-center justify-between max-lg:flex-col max-lg:items-center max-lg:text-center gap-8 mb-8'>
                <div className='flex items-center gap-4'>
                    <AccountPageTitle
                        as={isTransactionPage ? 'h1' : 'h2'}
                        className='mb-0'
                    >
                        Transaction History
                    </AccountPageTitle>

                    {/* Refresh Button */}
                    <button
                        onClick={refresh}
                        disabled={loading}
                        className='inline-flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors'
                        title='Refresh transactions'
                    >
                        <Icon
                            icon='lucide:refresh-cw'
                            className={`text-xl ${loading ? 'animate-spin' : ''}`}
                        />
                    </button>
                </div>

                <div className='flex items-center md:gap-6 gap-4'>
                    <div className='flex items-center gap-4'>
                        {sm && (
                            <NeonText
                                className='text-base font-bold text-nowrap'
                                glowSpread={0.4}
                            >
                                Filter By
                            </NeonText>
                        )}

                        {/* Type Filter */}
                        <Select
                            onValueChange={handleTypeFilter}
                            defaultValue='all'
                        >
                            <SelectTrigger showIcon={false}>
                                <NeonBox
                                    className='py-3 px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none w-[160px] flex-1 backdrop-blur-2xl'
                                    glowColor='--color-purple-500'
                                    backgroundColor='--color-purple-500'
                                    backgroundOpacity={0.2}
                                    glowSpread={sm ? 0.8 : 0.6}
                                    enableHover
                                >
                                    <SelectValue
                                        className='text-base font-bold capitalize'
                                        placeholder='Type'
                                    />

                                    <Icon
                                        icon='lucide:chevron-down'
                                        fontSize={24}
                                    />
                                </NeonBox>
                            </SelectTrigger>
                            <SelectContent sideOffset={5}>
                                <SelectItem value='all'>All Types</SelectItem>
                                <SelectItem value='deposit'>
                                    Purchases
                                </SelectItem>
                                <SelectItem value='withdrawal'>
                                    Redemptions
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Filter */}
                    <Select
                        onValueChange={handleStatusFilter}
                        defaultValue='all'
                    >
                        <SelectTrigger showIcon={false}>
                            <NeonBox
                                className='py-3 px-5 rounded-lg flex items-center justify-between gap-2 cursor-pointer select-none w-[160px] flex-1 backdrop-blur-2xl'
                                glowColor='--color-purple-500'
                                backgroundColor='--color-purple-500'
                                backgroundOpacity={0.2}
                                glowSpread={sm ? 0.8 : 0.6}
                                enableHover
                            >
                                <SelectValue
                                    className='text-base font-bold capitalize'
                                    placeholder='Status'
                                />

                                <Icon
                                    icon='lucide:chevron-down'
                                    fontSize={24}
                                />
                            </NeonBox>
                        </SelectTrigger>
                        <SelectContent sideOffset={5}>
                            <SelectItem value='all'>All Status</SelectItem>
                            <SelectItem value='completed'>Completed</SelectItem>
                            <SelectItem value='pending'>Pending</SelectItem>
                            <SelectItem value='failed'>Failed</SelectItem>
                            <SelectItem value='cancelled'>Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className='mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg'>
                    <NeonText className='text-red-400 text-sm'>
                        {error}
                    </NeonText>
                </div>
            )}

            <Table className='max-lg:w-full backdrop-blur-2xl'>
                <TableHeader>
                    <TableRow className='hover:bg-transparent [&>th]:py-4'>
                        {['Order', 'Date', 'Type', 'Amount', 'Status'].map(
                            (item, index) => (
                                <TableHead
                                    key={index}
                                    className='bg-table-header-2'
                                >
                                    <span className='inline-flex items-center gap-2'>
                                        {item}
                                        {item === 'Amount' && (
                                            <>
                                                <Tooltip>
                                                    <TooltipTrigger className='leading-none -mb-1'>
                                                        <Icon
                                                            icon='lucide:info'
                                                            className='-mt-1 lg:text-2xl text-xl'
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent
                                                        side='top'
                                                        sideOffset={10}
                                                        align='center'
                                                        className='max-w-[240px] text-white'
                                                    >
                                                        GC are for entertainment
                                                        only and cannot be
                                                        redeemed. Amount shown
                                                        reflects promotional
                                                        value.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </>
                                        )}
                                    </span>
                                </TableHead>
                            )
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        // Loading skeleton
                        Array.from({ length: 3 }).map((_, index) => (
                            <TableRow key={index} className='[&>td]:py-6'>
                                {[1, 2, 3, 4, 5].map(cell => (
                                    <TableCell key={cell}>
                                        <div className='h-6 bg-white/10 rounded animate-pulse' />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : transactions.length === 0 ? (
                        // Empty state
                        <TableRow>
                            <TableCell
                                colSpan={5}
                                className='text-center py-12'
                            >
                                <NeonText className='text-white/60'>
                                    No transactions found
                                </NeonText>
                            </TableCell>
                        </TableRow>
                    ) : (
                        // Transaction data
                        transactions.map(item => (
                            <TableRow
                                key={item._id}
                                className='[&>td]:py-6 [&>td]:font-bold [&>td]:text-base'
                            >
                                <TableCell>
                                    <span className='whitespace-nowrap'>
                                        {(item.gatewayInvoiceId ?? item._id)
                                            ? `${(item.gatewayInvoiceId ?? item._id).slice(0, 6)}...${(item.gatewayInvoiceId ?? item._id).slice(-4)}`
                                            : ''}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <span className='whitespace-nowrap'>
                                        {formatDate(item.createdAt)}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            item.type === 'coupon'
                                                ? 'coupon-redeemed'
                                                : item.type === 'deposit'
                                                  ? 'gc-purchased'
                                                  : 'sc-redeemed'
                                        }
                                        type='transaction'
                                        size='md'
                                    />
                                </TableCell>
                                <TableCell
                                    className={
                                        item.type === 'deposit'
                                            ? 'text-yellow-400'
                                            : 'text-green-400'
                                    }
                                >
                                    <span className='whitespace-nowrap'>
                                        {`${item.amount * 100} GC worth`} ($
                                        {formatAmount(item.amount)})
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className='inline-flex items-center gap-2.5'>
                                        <Badge
                                            variant={item.status}
                                            type='transaction'
                                            size='md'
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {!isTransactionPage && (
                <div className='flex items-center justify-center my-10'>
                    <Button
                        size={xl ? 'lg' : sm ? 'md' : 'sm'}
                        onClick={() => router.push('/transaction-history')}
                    >
                        See All Transactions
                    </Button>
                </div>
            )}
        </section>
    );
}
