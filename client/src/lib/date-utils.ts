/**
 * Date utility functions
 * Simple date formatting utilities without external dependencies
 */

/**
 * Format a date as "X time ago"
 * @param date - The date to format
 * @returns A string like "5 minutes ago", "2 hours ago", etc.
 */
export function formatDistanceToNow(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffYear > 0) {
        return `${diffYear} year${diffYear > 1 ? 's' : ''} ago`;
    } else if (diffMonth > 0) {
        return `${diffMonth} month${diffMonth > 1 ? 's' : ''} ago`;
    } else if (diffWeek > 0) {
        return `${diffWeek} week${diffWeek > 1 ? 's' : ''} ago`;
    } else if (diffDay > 0) {
        return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    } else if (diffHour > 0) {
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else if (diffMin > 0) {
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
        return 'just now';
    }
}

