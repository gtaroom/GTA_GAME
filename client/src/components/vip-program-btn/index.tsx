import { cn } from '@/lib/utils';
import Link from '@/rootnode_modules/next/link';

export default function VIPprogramBtn({ className }: { className?: string }) {
    return (
        <>
            <Link
                className={cn(
                    className,
                    "scale-effect inline-grid h-[42px]  place-items-center bg-[url('/header/vip-program.png')] bg-contain bg-center bg-no-repeat text-sm xl:text-base font-black text-[#11FF45] uppercase"
                )}
                href='/vip-program'
                title='VIP Program'
            >
                VIP Program
            </Link>
        </>
    );
}
