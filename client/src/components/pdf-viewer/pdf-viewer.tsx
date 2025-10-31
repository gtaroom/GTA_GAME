'use client';

import { cn } from '@/lib/utils';

interface PDFViewerProps {
    src: string;
    title: string;
    className?: string;
}

// Simpler, faster embed using <object>. Avoids iframe onLoad quirks with PDFs
export default function PDFViewer({ src, title, className }: PDFViewerProps) {
    return (
        <div
            className={cn(
                'relative w-full overflow-hidden rounded-lg bg-white shadow-sm',
                className
            )}
        >
            <object
                data={`${src}#toolbar=0&navpanes=0&view=FitH`}
                type='application/pdf'
                className='w-full'
                aria-label={title}
                style={{ height: '80vh', minHeight: '600px' }}
            >
                {/* Fallback if inline PDFs aren’t supported */}
                <div className='p-4 text-center text-sm text-gray-600'>
                    Unable to display PDF inline.
                    <a
                        href={src}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='ml-2 underline text-blue-600 hover:text-blue-700'
                    >
                        Open in a new tab
                    </a>
                </div>
            </object>
        </div>
    );
}
