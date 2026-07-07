import { useEffect } from 'react';

// Per-route document title + meta description. The site is a client-rendered
// SPA (no prerender step in /scripts), so runtime tags are the source of truth.
export default function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute('content', description);
  }, [title, description]);
}
