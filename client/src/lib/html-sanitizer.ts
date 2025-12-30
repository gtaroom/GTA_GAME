import DOMPurify from 'isomorphic-dompurify';
import type { Config as DomPurifyConfig } from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * 
 * This utility function uses DOMPurify to remove potentially dangerous
 * HTML/JavaScript from user-generated or API-provided content before
 * rendering it with dangerouslySetInnerHTML.
 * 
 * @param dirty - The potentially unsafe HTML string to sanitize
 * @param options - Optional DOMPurify configuration options
 * @returns A sanitized HTML string safe for rendering
 * 
 * @example
 * ```tsx
 * const sanitized = sanitizeHtml(userInput);
 * <div dangerouslySetInnerHTML={{ __html: sanitized }} />
 * ```
 */
export function sanitizeHtml(
    dirty: string,
    options?: DomPurifyConfig
): string {
    // Default configuration: allow common safe HTML tags and attributes
    const defaultOptions: DomPurifyConfig = {
        ALLOWED_TAGS: [
            'p',
            'br',
            'strong',
            'em',
            'u',
            'a',
            'ul',
            'ol',
            'li',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'span',
            'div',
            'blockquote',
            'code',
            'pre',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
        ALLOW_DATA_ATTR: false,
        ...options,
    };

    return DOMPurify.sanitize(dirty, defaultOptions);
}

