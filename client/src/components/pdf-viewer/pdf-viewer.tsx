'use client';
import { useEffect, useState } from 'react';

interface PDFViewerProps {
    src: string;
    title: string;
    className?: string;
}

const PDFViewer = ({ src, title, className = '' }: PDFViewerProps) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (isMobile) {
        // For mobile - show PDF inside iframe (no download)
        return (
            <div className={`${className} flex flex-col gap-4`}>
                <div className='w-full overflow-auto'>
                    <iframe
                        src={`${src}#toolbar=0&navpanes=0&scrollbar=1`}
                        title={title}
                        className='w-full border-0 rounded-lg'
                        style={{ minHeight: '600px', height: '80vh' }}
                    />
                </div>
                <p className='text-white/60 text-sm text-center'>
                    Scroll to view all pages
                </p>
            </div>
        );
    }

    // For desktop - show PDF inside page
    return (
        <div className={className}>
            <iframe
                src={`${src}#toolbar=0&navpanes=0&scrollbar=1`}
                title={title}
                className='w-full border-0 rounded-lg shadow-lg'
                style={{ minHeight: '800px', height: '100vh' }}
            />
        </div>
    );
};

export default PDFViewer;
