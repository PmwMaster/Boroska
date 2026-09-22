import { post, request } from './api.js';

const VAPID_PUBLIC_KEY =
  import.meta.env.VITE_VAPID_PUBLIC_KEY ||
  'BGlLDavCLPP0nR1ONVrwJkdSsJf9hnEGHABAhstYfIA3LckPjYKtv6COn3BNTvpb3iEUbvSQlO3S8_bpDBwQAeY';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

export function isPushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function getPushSubscription() {
  if (!isPushSupported()) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function enablePush() {
  if (!isPushSupported()) throw new Error('Notificações push não são suportadas neste navegador.');

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Permissão de notificação negada.');

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  await post('/api/push?action=subscribe', subscription.toJSON());
  return subscription;
}

export async function disablePush() {
  const subscription = await getPushSubscription();
  if (!subscription) return;
  await request('/api/push?action=unsubscribe', {
    method: 'DELETE',
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  });
  await subscription.unsubscribe();
}
