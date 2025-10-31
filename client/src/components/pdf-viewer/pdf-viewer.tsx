'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PDFViewerProps {
    src: string;
    title: string;
    className?: string;
}

// Detect if user is on mobile or iOS device
function isMobileOrIOS() {
  if (typeof window === 'undefined') return false;
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  return isMobile || isIOS;
}

export default function PDFViewer({ src, title, className }: PDFViewerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(isMobileOrIOS());
  }, []);

  // For mobile devices (especially iOS), provide direct link to open PDF
  // This ensures all content is accessible and avoids browser compatibility issues
  if (isMobile) {
    return (
      <div className={cn('relative w-full rounded-lg bg-white shadow-sm p-6', className)}>
        <div className="text-center space-y-4">
          <svg
            className="mx-auto h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">
            For the best viewing experience on mobile devices, please open the PDF in your device's native viewer.
          </p>
          <div className="flex flex-col gap-3 mt-4">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Open PDF
            </a>
            {/* <a
              href={src}
              download
              className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download PDF
            </a> */}
          </div>
        </div>
      </div>
    );
  }

  // For desktop browsers, use object embed
  return (
    <div className={cn('relative w-full overflow-hidden rounded-lg bg-white shadow-sm', className)}>
      <object
        data={`${src}#toolbar=0&navpanes=0&view=FitH`}
        type="application/pdf"
        className="w-full"
        aria-label={title}
        style={{ height: '80vh', minHeight: '600px' }}
      >
        {/* Fallback if inline PDFs aren't supported */}
        <div className="p-6 text-center space-y-4">
          <p className="text-sm text-gray-600">
            Unable to display PDF inline in your browser.
          </p>
          <div className="flex flex-col gap-3 items-center">
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              Open in new tab
            </a>
            {/* <a
              href={src}
              download
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 underline"
            >
              Download PDF
            </a> */}
          </div>
        </div>
      </object>
    </div>
  );
}
