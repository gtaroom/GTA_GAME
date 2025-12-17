import Image from 'next/image';

import NeonBox from '@/components/neon/neon-box';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { latestWinnersData } from '@/data/latest-winners';
import { cn } from '@/lib/utils';

const LatestWinners = () => {
    return (
        <section className='pb-[180px] sm:pb-[220px]'>
            <div className='container-xl'>
                <NeonBox
                    className='w-full rounded-[20px] px-4 md:px-8 lg:px-16 py-10 md:pt-14 lg:pt-16 lg:pb-13 backdrop-blur-xl'
                    backgroundColor='--color-purple-500'
                    backgroundOpacity={0.1}
                >
                    <div className='mt-[calc(-70px-52*(100vw-320px)/447)] md:-mt-36 lg:-mt-39 mb-8 flex justify-center'>
                        <Image
                            src='/home-page-logged-out/latest-winners-title.png'
                            alt='Latest Winners'
                            width={800}
                            height={600}
                            className='float-y float-y-fast float-y-xs'
                        />
                    </div>
                    <Table className='max-lg:min-w-[600px] max-lg:w-full'>
                        <TableHeader>
                            <TableRow className='hover:bg-transparent'>
                                <TableHead className='min-w-[250px]'>
                                    Game
                                </TableHead>
                                <TableHead>User name</TableHead>
                                <TableHead>Win amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {latestWinnersData.map(
                                (info, index) =>
                                    index < 6 && (
                                        <TableRow key={index}>
                                            <TableCell className='flex items-center max-sm:px-4'>
                                                <div className='inline-flex items-center gap-3'>
                                                    <Image
                                                        src={info.thumbnail}
                                                        height={100}
                                                        width={100}
                                                        alt={info.userName}
                                                        className='aspect-square w-20 rounded-sm border border-white/50 object-cover object-center'
                                                    />
                                                    <div className='flex flex-col items-start'>
                                                        <span className='text-lg font-bold whitespace-nowrap'>
                                                            {info.title}{' '}
                                                        </span>
                                                        <span className='text-base text-white/80 whitespace-nowrap'>
                                                            {info.gameType}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className='w-100'>
                                                <div className='flex flex-col items-start'>
                                                    <span className='text-lg font-bold'>
                                                        {info.userName}{' '}
                                                    </span>
                                                    <span className='text-base text-white/80'>
                                                        {info.userType}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className='flex flex-col items-start'>
                                                    <span
                                                        className={cn(
                                                            'text-lg font-bold',
                                                            info.coinType ===
                                                                'sweep-coin'
                                                                ? 'text-green-400'
                                                                : info.coinType ===
                                                                    'gold-coin'
                                                                  ? 'text-yellow-300'
                                                                  : ''
                                                        )}
                                                    >
                                                        +{info.winAmmount}{' '}
                                                    </span>
                                                    <span className='text-base text-white/80'>
                                                        {info.coinType ===
                                                        'sweep-coin'
                                                            ? 'Sweep Coin'
                                                            : info.coinType ===
                                                                'gold-coin'
                                                              ? 'Gold Coin'
                                                              : ''}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                            )}
                        </TableBody>
                    </Table>
                </NeonBox>
            </div>
        </section>
    );
};

export default LatestWinners;
