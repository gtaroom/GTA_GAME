import { cn } from '@/lib/utils';

const SidebarSeprator = ({ className }: { className?: string }) => {
    return <div className={cn('h-[1px] w-full bg-white/20', className)}></div>;
};

export default SidebarSeprator;
