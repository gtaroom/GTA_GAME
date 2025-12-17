interface weeklyRewardsProps {
    day: number;
    SC: string;
    GC: string;
    claimed: boolean;
    message?: string;
}

export const weeklyRewards: weeklyRewardsProps[] = [
    {
        day: 1,
        SC: '0.2',
        GC: '3,000',
        claimed: true,
    },
    {
        day: 2,
        SC: '0.2',
        GC: '3,000',
        claimed: false,
    },
    {
        day: 3,
        SC: '0.2',
        GC: '3,000',
        claimed: false,
    },
    {
        day: 4,
        SC: '0.2',
        GC: '3,000',
        claimed: false,
    },
    {
        day: 5,
        SC: '0.2',
        GC: '5,000',
        claimed: false,
    },
    {
        day: 6,
        SC: '0.2',
        GC: '5,000',
        claimed: false,
    },
    {
        day: 7,
        SC: '0.2',
        GC: '5,000',
        claimed: false,
        message: 'Thanks For Playing All Week!',
    },
];
