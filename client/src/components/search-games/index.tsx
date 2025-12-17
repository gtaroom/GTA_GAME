import { Icon } from '@iconify/react';

import { cn } from '@/lib/utils';

import { useBreakPoint } from '@/hooks/useBreakpoint';
import { useGameSearchModal } from '@/hooks/useGameSearchModal';
import { Button } from '../ui/button';

const SearchGames = ({ className }: { className?: string }) => {
    const { lg } = useBreakPoint();
    const { openGameSearch } = useGameSearchModal();

    const handleOpenSearch = () => {
        openGameSearch(selectedGame => {
            console.log('Selected game:', selectedGame);
        });
    };

    return (
        <Button
            neon
            variant='neon'
            size={lg ? 'md' : 'sm'}
            neonBoxClass='backdrop-blur-lg rounded-sm'
            btnInnerClass='flex items-center justify-between w-full'
            className={cn(
                'xl:w-[340px] lg:w-[240px] w-[180px] select-none',
                className
            )}
            backgroundColor='--color-purple-500'
            backgroundOpacity={0.1}
            glowSpread={0.6}
            onClick={handleOpenSearch}
        >
            <span className='lg:text-base text-sm font-bold'>
                Search Games...
            </span>
            <Icon icon='lucide:search' className='lg:text-2xl text-xl' />
        </Button>
    );
};

export default SearchGames;
