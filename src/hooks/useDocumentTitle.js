import { useEffect } from 'react';

/** Set the document title per page (accessibility + SEO). */
export function useDocumentTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} · TrustLend` : 'TrustLend';
    return () => {
      document.title = previous;
    };
  }, [title]);
}
