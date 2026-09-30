import { useEffect } from 'react';

const BASE_TITLE = 'Baghewala Digital Twin';

export interface DocumentTitleOptions {
  title: string;
  description?: string;
}

/**
 * Sets the document title (suffixed with the app name) and the meta description.
 * Call once at the top of each routed page component.
 */
export function useDocumentTitle({ title, description }: DocumentTitleOptions): void {
  useEffect(() => {
    document.title = title.includes(BASE_TITLE) ? title : `${title} · ${BASE_TITLE}`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', description);
    }
  }, [title, description]);
}
