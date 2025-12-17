/**
 * Game Pagination Component
 * Optimized pagination with proper state management
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useGames } from '@/contexts/game-context';

interface GamePaginationProps {
  className?: string;
  onPageChange?: (page: number) => void;
}

const GamePagination: React.FC<GamePaginationProps> = ({ 
  className = '', 
  onPageChange 
}) => {
  const { pagination, filters, setFilters, loading } = useGames();

  // Memoize pagination info
  const paginationInfo = useMemo(() => {
    const { page, limit, total, totalPages } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);
    
    return {
      startItem,
      endItem,
      total,
      totalPages,
      currentPage: page,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }, [pagination]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > paginationInfo.totalPages || loading) return;
    
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    onPageChange?.(newPage);
  }, [filters, setFilters, paginationInfo.totalPages, loading, onPageChange]);

  // Generate page numbers
  const pageNumbers = useMemo(() => {
    const { currentPage, totalPages } = paginationInfo;
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [paginationInfo]);

  // Don't render if only one page
  if (paginationInfo.totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 ${className}`}>
      {/* Results Info */}
      <div className="text-sm text-gray-400">
        Showing {paginationInfo.startItem}-{paginationInfo.endItem} of {paginationInfo.total} games
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
          disabled={!paginationInfo.hasPrev || loading}
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <div className="px-2 py-1">
                  <MoreHorizontal className="w-4 h-4 text-gray-400" />
                </div>
              ) : (
                <Button
                  variant={page === paginationInfo.currentPage ? "primary" : "neon"}
                  size="sm"
                  onClick={() => handlePageChange(page as number)}
                  disabled={loading}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
          disabled={!paginationInfo.hasNext || loading}
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default GamePagination;
