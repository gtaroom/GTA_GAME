interface Transaction {
    orderId: string;
    date: string;
    type: 'gc-purchased' | 'sc-redeemed' | 'redemption-paid';
    amount: string;
    promotionalValue?: string;
    status: 'pending' | 'completed' | 'failed';
    linkAvailable: boolean;
}

export const transactions: Transaction[] = [
    {
        orderId: 'chk_7iyd',
        date: 'Jul 02, 2025 4:03 PM',
        type: 'gc-purchased',
        amount: '500 GC',
        promotionalValue: '$5.00',
        status: 'pending',
        linkAvailable: true,
    },
    {
        orderId: 'chk_7iyd',
        date: 'Jul 02, 2025 4:03 PM',
        type: 'sc-redeemed',
        amount: '500 SC',
        promotionalValue: '$5.00',
        status: 'failed',
        linkAvailable: false,
    },
    {
        orderId: 'c20f54cb',
        date: 'May 09, 2025 11:28 PM',
        type: 'gc-purchased',
        amount: '500 GC',
        promotionalValue: '$5.00',
        status: 'pending',
        linkAvailable: false,
    },
    {
        orderId: 'chk_L2wR',
        date: 'Apr 29, 2025 9:51 PM',
        type: 'redemption-paid',
        amount: '$15.00',
        status: 'pending',
        linkAvailable: false,
    },
    {
        orderId: 'chk_7iyd',
        date: 'Jul 02, 2025 4:03 PM',
        type: 'redemption-paid',
        amount: '$15.00',
        status: 'pending',
        linkAvailable: false,
    },
    {
        orderId: 'd4f9a2b1',
        date: 'Aug 15, 2025 2:17 PM',
        type: 'gc-purchased',
        amount: '1,000 GC',
        promotionalValue: '$10.00',
        status: 'completed',
        linkAvailable: true,
    },
    {
        orderId: 'e7c3d8f4',
        date: 'Aug 20, 2025 10:05 AM',
        type: 'sc-redeemed',
        amount: '250 SC',
        promotionalValue: '$2.50',
        status: 'completed',
        linkAvailable: false,
    },
    {
        orderId: 'f1b2c3d4',
        date: 'Sep 01, 2025 8:45 PM',
        type: 'redemption-paid',
        amount: '$20.00',
        status: 'completed',
        linkAvailable: false,
    },
    {
        orderId: 'a9e8f7d6',
        date: 'Sep 05, 2025 11:30 AM',
        type: 'gc-purchased',
        amount: '750 GC',
        promotionalValue: '$7.50',
        status: 'pending',
        linkAvailable: true,
    },
    {
        orderId: 'b2d4f6h8',
        date: 'Sep 10, 2025 6:22 PM',
        type: 'sc-redeemed',
        amount: '1,200 SC',
        promotionalValue: '$12.00',
        status: 'pending',
        linkAvailable: false,
    },
];
