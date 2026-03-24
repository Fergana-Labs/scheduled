import { api } from './api';

export function track(event: string, properties?: Record<string, unknown>) {
  api('/web/api/v1/events/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, properties: properties || {} }),
  }).catch(() => {}); // fire-and-forget
}
