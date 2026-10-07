import DOMPurify from 'dompurify';

/**
 * Sanitize rich-text HTML (e.g. product descriptions) before rendering it
 * with dangerouslySetInnerHTML.
 */
export function safeHtml(html: string | null | undefined): string {
    return DOMPurify.sanitize(html ?? '');
}
