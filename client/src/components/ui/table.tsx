import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
function Table({ className, ...props }: React.ComponentProps<'table'>) {
    return (
        <ScrollArea type='always'>
            <table
                data-slot='table'
                className={cn('w-full caption-bottom text-sm', className)}
                {...props}
            />
            <ScrollBar orientation='horizontal' />
        </ScrollArea>
    );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
    return (
        <thead data-slot='table-header' className={cn(className)} {...props} />
    );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
    return (
        <tbody
            data-slot='table-body'
            className={cn('[&_tr:last-child]:border-0', className)}
            {...props}
        />
    );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
    return (
        <tfoot
            data-slot='table-footer'
            className={cn(
                'bg-muted/50 border-t font-medium [&>tr]:last:border-b-0',
                className
            )}
            {...props}
        />
    );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
    return (
        <tr
            data-slot='table-row'
            className={cn(
                'hover:bg-muted/10 data-[state=selected]:bg-muted border-b border-white/50 transition-colors',
                className
            )}
            {...props}
        />
    );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
    return (
        <th
            data-slot='table-head'
            className={cn(
                'bg-table-header h-12 px-[30px] text-left align-middle lg:text-lg text-base font-bold text-white has-[role=checkbox]:w-px [&:has([role=checkbox])]:pr-0',
                className
            )}
            {...props}
        />
    );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
    return (
        <td
            data-slot='table-cell'
            className={cn(
                'px-[30px] py-4 align-middle [&:has([role=checkbox])]:pr-0 ',
                className
            )}
            {...props}
        />
    );
}

function TableCaption({
    className,
    ...props
}: React.ComponentProps<'caption'>) {
    return (
        <caption
            data-slot='table-caption'
            className={cn('text-muted-foreground mt-4 text-sm', className)}
            {...props}
        />
    );
}

export {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
};
